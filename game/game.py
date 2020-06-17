from enum import IntEnum, auto
from collections import defaultdict
import typing
import json
import math
import copy
import time
import discord
from .player import Player

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
        self.phase_end_at: time.struct_time = None
        self.night_actions = []

    # finds a setup for the current player-size. if no setup is found, raises an Exception
    def find_setup(self, setup: str = None):
        num_players = len(self.players)
        if not setup is None:
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
    def check_endgame(self) -> typing.Tuple[bool, str]:
        num_town = len(self.filter_players(faction='Town', alive=True))
        num_maf = len(self.filter_players(faction='Mafia', alive=True))
        # very primitive endgame check; if mafia and town have equal members, town don't have
        # the majority and cannot lynch mafia. in the future, this method should account for
        # town's potential to nightkill mafia members.
        if num_maf == 0:  # all mafia are killed, town wins
            return True, 'Town'
        elif num_town <= num_maf:  # town cannot majority lynch the mafia
            return True, 'Mafia'
        return False, None

    async def increment_phase(self, bot):
        # cycle 0 check
        if self.cycle == 0 or self.phase == Phase.NIGHT:
            # go to the next day
            self.cycle = self.cycle + 1
            self.phase = Phase.DAY
            # resolve night actions
            self.phase = Phase.STANDBY  # so the event loop doesn't mess things up here
            announcement = await self.resolve_night_actions()
            if announcement != '':
                await self.channel.send(announcement)
                game_ended, winning_faction = self.check_endgame()
                if game_ended:
                    return await self.end(bot, winning_faction)
            # voting starts
            self.phase = Phase.DAY
            alive_players = len(self.filter_players(alive=True))
            # TODO: make limits configurable
            await self.channel.send(f'Day **{self.cycle}** will last 5 minutes. With {alive_players} alive, it takes {self.majority_votes} to lynch.')
        else:
            self.phase = Phase.NIGHT
            await self.channel.send(f'Night **{self.cycle}** will last 5 minutes. Send in those actions quickly!')
            for player in self.filter_players(alive=True):
                if hasattr(player.role, 'on_night'):
                    await player.role.on_night(bot, player, self)
        self.phase_end_at = time.localtime(time.time() + 120)  # 5 minutes

    async def resolve_night_actions(self):
        # sort them into ascending priorities. priorities determine if the action can be reversed.
        self.night_actions.sort(key=lambda na: na['priority'])

        def def_record():
            return {
                'nightkill': False
            }
        # night record is a map of player_ids to actions performed on them
        night_record = defaultdict(def_record)
        for action in self.night_actions:
            action['player'].role.run_action(night_record, action['target'])
        # now figure out which players have died
        dead_players = []
        for pl_id, record in night_record.items():
            if record['nightkill']:
                nked_pl = self.filter_players(pl_id=pl_id)[0]
                nked_pl.remove()  # TODO: check for bulletproof here?
                dead_players.append(nked_pl)
        announcement = ''
        for player in dead_players:
            announcement = announcement + \
                f'{player.user.name} died last night. They were a {player.full_role}\n'
        return announcement

    # Filter players by:
    # Their Role
    # Their Faction
    # Whether they have a vote on someone
    # Whether someone voted them
    # By applying a lambda on their votecount
    # Checking if they are alive

    def filter_players(self,
                       role: typing.Optional[str] = None,
                       faction: typing.Optional[str] = None,
                       has_vote_on: typing.Optional[discord.Member] = None,
                       is_voted_by: typing.Optional[discord.Member] = None,
                       votecount: typing.Optional[typing.Callable] = None,
                       pl_id: typing.Optional[int] = None,
                       alive: bool = False):
        plist = self.players

        if role:
            plist = [*filter(lambda pl: pl.role.name == role, plist)]
        if faction:
            plist = [*filter(lambda pl: pl.faction == faction, plist)]
        if has_vote_on:
            plist = copy.deepcopy(self.get_player(has_vote_on).votes)
        if is_voted_by:
            plist = [*filter(lambda pl: pl.has_vote(is_voted_by), plist)]
        if votecount:
            plist = [*filter(lambda pl: votecount(len(pl.votes)), plist)]
        if alive:
            plist = [*filter(lambda pl: pl.alive, plist)]
        if pl_id:
            plist = [*filter(lambda pl: pl.user.id == pl_id, plist)]

        return plist

    def get_player(self, user: discord.Member):
        plist = [*filter(lambda p: p.user.id == user.id, self.players)]
        return plist[0] if plist else None

    def has_player(self, user: discord.Member):
        return self.get_player(user) is not None

    # lynch a player
    async def lynch(self, target: Player):
        async with self.channel.typing():
            await self.channel.send(f'{target.user.name} was lynched. He was a *{target.faction} {target.role}*.')
            await target.role.on_lynch(self, target)

        for player in self.players:
            player.votes = []

        target.remove()

    # WIP: End the game
    # If a winning faction is not provided, game is ended
    # as if host ended the game without letting it finish
    async def end(self, bot, winning_faction: typing.Optional[str] = None):
        if winning_faction:
            async with self.channel.typing():
                await self.channel.send(f'The game is over. {winning_faction} wins! 🎉')
        full_rolelist = '\n'.join(
            [f'{i+1}. {player.user.name} ({player.full_role})' for i, player in enumerate(self.players)])
        await self.channel.send(f'**Final Rolelist**: ```{full_rolelist}```')
        del bot.games[self.guild.id]

    @property
    def has_started(self):  # this might be useful
        return not self.phase == Phase.PREGAME

    @property
    def majority_votes(self):
        return math.floor(len(self.filter_players(alive=True)) / 2) + 1
