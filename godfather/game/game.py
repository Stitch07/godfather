from enum import IntEnum, auto
import typing
import json
import math
import copy
from datetime import datetime, timedelta
import discord
from godfather.utils import alive_or_recent_jester
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
        self.replacements: typing.List[discord.Member] = []
        self.phase = Phase.PREGAME
        self.cycle = 0
        self.host_id = None  # assigned to the user creating the game
        # time at which the current phase ends
        self.phase_end_at: datetime = None
        self.night_actions = NightActions(self)
        self.setup = dict()  # the setup used
        # host-configurable stuff
        self.config = {
            'phase_time': 5 * 60  # in seconds
        }
        # votes holds a dict of player IDs mapped to the player objects voting them
        # it includes a special notvoting and nolynch key for players not voting, and players voting to no-lynch
        self.votes = {
            'notvoting': [],
            'nolynch': []
        }

    # finds a setup for the current player-size. if no setup is found, raises an Exception
    def find_setup(self, setup: str = None):
        num_players = len(self.players)
        if setup:
            found_setup = [
                *filter(lambda rs: rs['name'] == setup.lower(), rolesets)]
            if len(found_setup) == 0:
                raise Exception('Setup not found.')

            if not len(found_setup[0]['roles']) == num_players:
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
        independent_wins = []

        for player in self.players:
            win_check = player.faction.has_won(self)
            if win_check:
                winning_faction = player.faction.name

            if hasattr(player.faction, 'has_won_independent'):
                independent_check = player.faction.has_won_independent(player)
                if independent_check:
                    independent_wins.append(player)

        if winning_faction:
            return (True, winning_faction, independent_wins)
        return (False, None, None)

    async def increment_phase(self, bot):
        phase_t = round(self.config['phase_time'] / 60, 1)

        # night loop is the same as the pregame loop
        if self.cycle == 0 or self.phase == Phase.NIGHT:
            # resolve night actions
            self.phase = Phase.STANDBY  # so the event loop doesn't mess things up here
            dead_players = await self.night_actions.resolve()

            for player in dead_players:
                await self.channel.send(f'{player.user.name} died last night. They were a {player.display_role}\n')

            game_ended, winning_faction, independent_wins = self.check_endgame()
            if game_ended:
                return await self.end(bot, winning_faction, independent_wins)

            # clear visits
            for player in self.players:
                player.visitors.clear()

            # voting starts
            self.night_actions.reset()
            self.phase = Phase.DAY
            self.cycle = self.cycle + 1
            alive_players = self.filter_players(alive=True)
            # populate voting cache
            self.votes['nolynch'] = []
            self.votes['notvoting'] = []
            for player in alive_players:
                self.votes[player.user.id] = []
                self.votes['notvoting'].append(player.user)

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
        # pylint: disable=too-many-arguments
        plist = self.players

        def action_only_filter(player):
            if not alive_or_recent_jester(player, self):
                return False
            can_do, _ = player.role.can_do_action(self)
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
            await self.channel.send(f'{target.user.name} was lynched. He was a *{target.display_role}*.')
            await target.role.on_lynch(self, target)

        await target.remove(self, f'lynched D{self.cycle}')

    # since this is needed in a couple of places
    def show_players(self, codeblock=False, show_replacements=False):
        players = []
        for num, player in enumerate(self.players, 1):
            # codeblock friendly formatting. green for alive, red for dead
            usrname = ''
            if codeblock:
                if player.alive:
                    usrname += f'+ {num}. {player.user}'
                else:
                    usrname += f'- {num}. {player.user} ({player.display_role}; {player.death_reason})'
            else:
                if player.alive:
                    usrname += f'{num}. {player.user}'
                else:
                    usrname += f'{num}. ~~{player.user}~~ ({player.display_role}; {player.death_reason})'

            players.append(usrname)
        if show_replacements and len(self.replacements) > 0:
            replacements = ', '.join(map(str, self.replacements))
            players.append('\nReplacements: {}'.format(replacements))
        return '\n'.join(players)

    # WIP: End the game
    # If a winning faction is not provided, game is ended
    # as if host ended the game without letting it finish
    async def end(self, bot, winning_faction, independent_wins):
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
                            (self.setup['name'], winning_faction, independent_win_roles))
                game_id, = cur.fetchone()
                with bot.db.conn.cursor() as cur2:
                    values = []
                    for player in self.players:
                        win = player in independent_wins or player.faction.name == winning_faction
                        values.append(cur2.mogrify('(%s, %s, %s, %s, %s)',
                                                   (player.user.id, player.faction.name, player.role.name, game_id, win)).decode('utf-8'))
                    query = "INSERT INTO players (player_id, faction, rolename, game_id, result) VALUES " + \
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
