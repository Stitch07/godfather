import math
from datetime import datetime, timedelta
from enum import IntEnum, auto

import discord

from godfather.errors import PhaseChangeError
from godfather.game.game_config import GameConfig
from godfather.game.player_manager import PlayerManager
from godfather.game.vote_manager import VoteManager
from godfather.utils import alive_or_recent_jester, choice

from .night_actions import NightActions
from .player import Player


default_game_config = {
    'day_duration': 5 * 60,  # In seconds
    'night_duration': 2 * 60  # In seconds
}


class Phase(IntEnum):
    PREGAME = auto()
    DAY = auto()
    NIGHT = auto()
    STANDBY = auto()


class Game:
    def __init__(self, channel: discord.channel.TextChannel, bot):
        self.channel = channel
        self.bot = bot
        self.guild = channel.guild
        self.players = PlayerManager(self)
        self.phase = Phase.PREGAME
        self.cycle = 0
        self.host = None  # assigned to the user creating the game
        # time at which the current phase ends
        self.phase_end_at: datetime = None
        self.night_actions = NightActions(self)
        self.setup = None  # the setup used
        # host-configurable stuff
        self.config = GameConfig(default_game_config, channel=channel)
        self.votes = VoteManager(self)

    @classmethod
    def create(cls, ctx, bot):
        new_game = cls(ctx.channel, bot)
        new_game.host = ctx.author
        new_game.players.add(ctx.author)
        return new_game

    async def update(self):
        if not self.has_started or self.phase == Phase.STANDBY:
            return

        curr_t = datetime.now()
        phase_end = self.phase_end_at
        if phase_end is not None and curr_t > phase_end:
            if self.phase == Phase.DAY:
                # no lynch achieved
                await self.channel.send('Nobody was lynched')
            try:
                await self.increment_phase()
            except Exception as exc:
                raise PhaseChangeError(None, *exc.args)

    # finds a setup for the current player-size. if no setup is found, raises an Exception
    async def find_setup(self, setup_name: str = None):
        num_players = len(self.players)

        if setup_name:
            setup = self.bot.setups.get(setup_name)

            if not setup:
                raise ValueError('Setup not found.')

            if not setup.total_players == num_players:
                raise ValueError(
                    f'Chosen setup needs {setup.total_players} players, '
                    f'you currently have {num_players}'
                )

            return setup

        possible_setups = dict(filter(lambda s: s[1].total_players == num_players,
                                      self.bot.setups.items()))
        if len(possible_setups) == 0:
            # wip: custom exception types?
            raise ValueError('No possible setups found.')

        setup = await choice(
            self.bot, self.bot.get_user(self.host.id), self.channel,
            "Multiple setups found.\n"
            "Please choose one of the following:",
            list(possible_setups.keys())
        )
        if setup is None:
            raise ValueError('Prompt timed out.')
        return possible_setups.get(setup)

    # checks whether the game has ended, returns whether the game has ended and the winning faction
    def check_endgame(self):
        winning_faction = None
        independent_wins = []

        for player in self.players:
            win_check = player.role.faction.has_won(self)
            if win_check:
                winning_faction = player.role.faction.name

            if hasattr(player.role.faction, 'has_won_independent'):
                independent_check = player.role.faction.has_won_independent(
                    player)
                if independent_check:
                    independent_wins.append(player)

        if winning_faction:
            return (True, winning_faction, independent_wins)
        return (False, None, None)

    async def increment_phase(self):
        # If it is day, `phase_t` should be equal to night_duration and vice versa.
        # `phase_duration` is used at the end of the function.
        # `phase_t` is used in day/night starting messages.
        if self.phase == Phase.DAY:
            phase_duration = self.config['night_duration']
            phase_t = round(phase_duration / 60, 1)
        else:
            # Set it to day duration for all other phases.
            # Note that it should almost always be `Phase.NIGHT`.
            phase_duration = self.config['day_duration']
            phase_t = round(phase_duration / 60, 1)

        # night loop is the same as the pregame loop
        if self.cycle == 0 or self.phase == Phase.NIGHT:
            # resolve night actions
            self.phase = Phase.STANDBY  # so the event loop doesn't mess things up here
            dead_players = await self.night_actions.resolve()

            for player in dead_players:
                role_text = 'We could not determine their role.' if player.role.cleaned else f'They were a {player.display_role}.'
                await self.channel.send(f'{player.user.name} died last night. {role_text}\n')

            game_ended, winning_faction, independent_wins = self.check_endgame()
            if game_ended:
                return await self.end(winning_faction, independent_wins)

            # clear visits
            for player in self.players:
                player.visitors.clear()

            # voting starts
            self.night_actions.reset()
            self.phase = Phase.DAY
            self.cycle = self.cycle + 1
            alive_players = self.players.filter(is_alive=True)
            # populate voting cache
            self.votes['nolynch'] = []
            self.votes['notvoting'] = []
            for player in alive_players:
                self.votes[player.user.id] = []
                self.votes['notvoting'].append(player)

            await self.channel.send(f'Day **{self.cycle}** will last {phase_t} minutes.'
                                    f' With {len(alive_players)} alive, it takes {self.majority_votes} to lynch.')
        else:
            self.phase = Phase.STANDBY
            # remove all votes from every player
            self.votes.clear()
            await self.channel.send(f'Night **{self.cycle}** will last {phase_t} minutes. '
                                    'Send in those actions quickly!')

            # recently lynched jesters and alive players are allowed to send in actions
            for player in filter(lambda p: alive_or_recent_jester(p, self), self.players):
                if hasattr(player.role, 'on_night'):
                    await player.role.on_night(self.bot, player, self)

            self.phase = Phase.NIGHT

        self.phase_end_at = datetime.now() \
            + timedelta(seconds=phase_duration)

    # lynch a player
    async def lynch(self, target: Player):
        async with self.channel.typing():
            await self.channel.send(f'{target.user.name} was lynched. He was a *{target.display_role}*.')
            await target.role.on_lynch(self, target)

        await target.remove(self, f'lynched D{self.cycle}')

    # WIP: End the game
    # If a winning faction is not provided, game is ended
    # as if host ended the game without letting it finish
    async def end(self, winning_faction, independent_wins):
        bot = self.bot  # TODO: Move db stuff to separate func

        if winning_faction:
            async with self.channel.typing():
                await self.channel.send(f'The game is over. {winning_faction} wins! 🎉')
                if len(independent_wins) > 0:
                    ind_win_strings = [
                        f'{player.user.name} ({player.role.name})' for player in independent_wins]
                    await self.channel.send(f'Independent wins: {", ".join(ind_win_strings)}')

        full_rolelist = '\n'.join(
            [f'{i+1}. {player.user.name} ({player.full_role})' for i, player in enumerate(self.players)])

        await self.channel.send(f'**Final Rolelist**: ```{full_rolelist}```')
        # update player stats
        if bot.db:
            with bot.db.conn.cursor() as cur:
                independent_win_roles = [
                    *map(lambda player: player.role.name, independent_wins)]
                cur.execute("INSERT INTO games (setup, winning_faction, independent_wins) VALUES (%s, %s, %s) RETURNING id;",
                            (self.setup.name, winning_faction, independent_win_roles))
                game_id, = cur.fetchone()
                with bot.db.conn.cursor() as cur2:
                    values = []
                    for player in self.players:
                        win = player in independent_wins or player.role.faction.name == winning_faction
                        values.append(cur2.mogrify('(%s, %s, %s, %s, %s)',
                                                   (player.user.id, player.role.faction.name, player.role.name, game_id, win)).decode('utf-8'))
                    query = "INSERT INTO players (player_id, faction, rolename, game_id, result) VALUES " + \
                        ",".join(values) + ";"
                    cur2.execute(query)

            bot.db.conn.commit()
            bot.logger.debug(
                'Added stats for {} players.'.format(len(self.players)))

        del bot.games[self.guild.id]

    @property
    def has_started(self):  # this might be useful
        return not self.phase == Phase.PREGAME

    @property
    def majority_votes(self):
        return math.floor(len(self.players.filter(is_alive=True)) / 2) + 1
