from enum import IntEnum, auto
from collections import defaultdict
import typing
import json
import math
import copy
from datetime import datetime, timedelta
import discord
import utils
from .player import Player
from .night_actions import NightActions

rolesets = json.load(open('rolesets/rolesets.json'))


class Phase(IntEnum):
    PREGAME = auto()
    DAY = auto()
    NIGHT = auto()
    STANDBY = auto()


class Game:
    def __init__(self, channel: discord.channel.TextChannel):
        self.channel = channel
        self.guild = channel.guild
        self.players = []
        self.phase = Phase.PREGAME
        self.cycle = 0
        self.host_id = None  # assigned to the user creating the game
        # time at which the current phase ends
        self.phase_end_at: datetime = None
        self.night_actions = NightActions(self)
        self.setup_id = None  # the setup used
        # host-configurable stuff
        self.config = {
            'phase_time': 5 * 60  # in seconds
        }

    # finds a setup for the current player-size. if no setup is found, raises an Exception
    def find_setup(self, setup: str = None):
        num_players = len(self.players)
        if setup:
            found_setup = [
                *filter(lambda rs: rs['name'] == setup.lower(), rolesets)]
            if len(found_setup) == 0:
                raise Exception('Setup not found.')
            elif not len(found_setup[0]['roles']) == num_players:
                raise Exception(
                    f'Chosen setup needs {len(found_setup[0]["roles"])} players.')
            return found_setup[0]
        possibles = list(filter(lambda s: len(
            s['roles']) == num_players, rolesets))
        if len(possibles) == 0:
            # wip: custom exception types?
            raise Exception('No rolelists found.')
        return possibles.pop(0)

    # checks whether the game has ended, returns whether the game has ended and the winning faction
    def check_endgame(self):
        winning_faction = None
        individual_wins = []

        for player in self.players:
            win_check = player.faction.has_won(self)
            if win_check:
                winning_faction = player.faction.name
            if hasattr(player.faction, 'has_won_individual'):
                individual_check = player.faction.has_won_individual(player)
                if individual_check:
                    individual_wins.append(
                        f'{player.user.name} ({player.full_role})')

        if winning_faction:
            return (True, winning_faction, individual_wins)
        return (False, None, None)

    async def increment_phase(self, bot):
        phase_t = round(self.config['phase_time'] / 60, 1)

        # cycle 0 check
        if self.cycle == 0 or self.phase == Phase.NIGHT:
            # go to the next day
            self.cycle = self.cycle + 1
            self.phase = Phase.DAY
            # resolve night actions
            self.phase = Phase.STANDBY  # so the event loop doesn't mess things up here
            announcement = await self.night_actions.resolve()
            if announcement != '':
                await self.channel.send(announcement)
                game_ended, winning_faction, individual_wins = self.check_endgame()
                if game_ended:
                    return await self.end(bot, winning_faction, individual_wins)
            # voting starts
            self.night_actions.reset()
            self.phase = Phase.DAY
            alive_players = len(self.filter_players(alive=True))
            # TODO: make limits configurable
            await self.channel.send(f'Day **{self.cycle}** will last {phase_t} minutes. With {alive_players} alive, it takes {self.majority_votes} to lynch.')
        else:
            self.phase = Phase.STANDBY
            await self.channel.send(f'Night **{self.cycle}** will last {phase_t} minutes. Send in those actions quickly!')

            # recently lynched jesters and alive players are allowed to send in actions
            for player in filter(lambda p: utils.alive_or_recent_jester(p, self), self.players):
                if hasattr(player.role, 'on_night'):
                    await player.role.on_night(bot, player, self)

            self.phase = Phase.NIGHT

        self.phase_end_at = datetime.now() \
            + timedelta(seconds=self.config['phase_time'])

    # Filter players by:
    # Their Role
    # Their Faction
    # Their Night Action
    # Whether they have a vote on someone
    # Whether someone voted them
    # By applying a lambda on their votecount
    # By their Discord ID
    # Checking if they have a Night Action
    # Checking if they are alive
    def filter_players(self,
                       role: typing.Optional[str] = None,
                       faction: typing.Optional[str] = None,
                       action: typing.Optional[str] = None,
                       has_vote_on: typing.Optional[discord.Member] = None,
                       is_voted_by: typing.Optional[discord.Member] = None,
                       votecount: typing.Optional[typing.Callable] = None,
                       pl_id: typing.Optional[int] = None,
                       action_only: bool = False,
                       alive: bool = False):
        plist = self.players

        def action_only_filter(pl):
            if not utils.alive_or_recent_jester(pl, self):
                return False
            can_do, _ = pl.role.can_do_action()
            return can_do

        if role:
            plist = [*filter(lambda pl: pl.role.name == role, plist)]
        if faction:
            plist = [*filter(lambda pl: pl.faction.id == faction, plist)]
        if action:
            plist = [*filter(lambda pl: pl.role.action == action
                             if hasattr(pl.role, 'action') else False)]
        if has_vote_on:
            plist = copy.deepcopy(self.get_player(has_vote_on).votes)
        if is_voted_by:
            plist = [*filter(lambda pl: pl.has_vote(is_voted_by), plist)]
        if votecount:
            plist = [*filter(lambda pl: votecount(len(pl.votes)), plist)]
        if action_only:
            plist = [*filter(action_only_filter, plist)]
        if alive:
            plist = [*filter(lambda pl: pl.alive, plist)]
        if pl_id:
            plist = [*filter(lambda pl: pl.user.id == pl_id, plist)]

        return plist

    def get_player(self, user):
        plist = [*filter(lambda p: p.user.id == user.id, self.players)]
        return plist[0] if plist else None

    def has_player(self, user: discord.Member):
        return self.get_player(user) is not None

    # lynch a player
    async def lynch(self, target: Player):
        async with self.channel.typing():
            await self.channel.send(f'{target.user.name} was lynched. He was a *{target.full_role}*.')
            await target.role.on_lynch(self, target)

        for player in self.players:
            player.votes = []

        await target.remove(self, f'lynched D{self.cycle}')

    # since this is needed in a couple of places
    def show_players(self, codeblock=False):
        players = []
        for n, player in enumerate(self.players, 1):
            # codeblock friendly formatting. green for alive, red for dead
            usrname = ''
            if codeblock:
                if player.alive:
                    usrname += f'+ {n}. {player.user}'
                else:
                    usrname += f'- {n}. {player.user} ({player.full_role}; {player.death_reason})'
            else:
                if player.alive:
                    usrname += f'{n}. {player.user}'
                else:
                    usrname += f'{n}. ~~{player.user}~~ ({player.full_role}; {player.death_reason})'

            players.append(usrname)
        return '\n'.join(players)

    # WIP: End the game
    # If a winning faction is not provided, game is ended
    # as if host ended the game without letting it finish
    async def end(self, bot, winning_faction, individual_wins):
        if winning_faction:
            async with self.channel.typing():
                await self.channel.send(f'The game is over. {winning_faction} wins! 🎉')
                if len(individual_wins) > 0:
                    await self.channel.send(f'Individual wins: {", ".join(individual_wins)}')
        full_rolelist = '\n'.join(
            [f'{i+1}. {player.user.name} ({player.full_role})' for i, player in enumerate(self.players)])

        await self.channel.send(f'**Final Rolelist**: ```{full_rolelist}```')
        # update player stats
        if bot.db:
            with bot.db.conn.cursor() as cur:
                cur.execute("INSERT INTO games (setup, winning_faction) VALUES (%s, %s) RETURNING id;",
                            (self.setup_id, winning_faction))
                game_id, = cur.fetchone()
                with bot.db.conn.cursor() as cur2:
                    values = []
                    for player in self.players:
                        win = player.user.name in individual_wins or player.faction.name == winning_faction
                        values.append(cur2.mogrify('(%s, %s, %s, %s, %s)',
                                                   (player.user.id, player.faction.name, player.role.name, game_id, win)).decode('utf-8'))
                    query = "INSERT INTO players (player_id, faction, role_name, game_id, result) VALUES " + \
                        ",".join(values) + ";"
                    cur2.execute(query)

            bot.db.conn.commit()
            bot.logger.debug(
                'Added stats for {} players.'.format(len(self.players)))

        del bot.games[self.guild.id]

    @ property
    def has_started(self):  # this might be useful
        return not self.phase == Phase.PREGAME

    @ property
    def majority_votes(self):
        return math.floor(len(self.filter_players(alive=True)) / 2) + 1
