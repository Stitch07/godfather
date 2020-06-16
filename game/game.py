import discord
from enum import IntEnum, auto
import typing
import json
import roles
from .player import Player
import math
import copy

rolesets = json.load(open('rolesets/rolesets.json'))

class Phase(IntEnum):
    PREGAME = auto()
    DAY = auto()
    NIGHT = auto()

class Game:
    def __init__(self, channel: discord.channel.TextChannel):
        self.channel = channel
        self.guild = channel.guild
        self.players = []
        self.votes = [] # votes of the current day
        self.phase = Phase.PREGAME
        self.phase_number = 0
        self.host_id = None # assigned to the user creating the game

    # finds a setup for the current player-size. if no setup is found, raises an Exception
    def find_setup(self, setup: str=None):
        num_players = len(self.players)
        if not setup == None:
            found_setup = [*filter(lambda rs: rs['name'] == setup.lower(), rolesets)]
            if len(found_setup) == 0:
                raise Exception('Setup not found.')
            elif not len(found_setup[0]['roles']) == num_players:
                raise Exception(f'Chosen setup needs {len(found_setup[0]["roles"])} players.')
            return found_setup[0]
        possibles = list(filter(lambda s: len(s['roles']) == num_players, rolesets))
        if len(possibles) == 0:
            raise Exception('No rolelists found.') # wip: custom exception types?
        return possibles.pop(0)

    # checks whether the game has ended, returns whether the game has ended and the winning faction
    def check_endgame(self) -> typing.Tuple[bool, str]:
        num_town = len(self.filter_players(faction='Town', alive=True))
        num_maf = len(self.filter_players(faction='Mafia', alive=True))
        # very primitive endgame check; if mafia and town have equal members, town don't have
        # the majority and cannot lynch mafia. in the future, this method should account for
        # town's potential to nightkill mafia members.
        if num_maf == 0: # all mafia are killed, town wins
            return True, 'Town'
        elif num_town <= num_maf: # town cannot majority lynch the mafia
            return True, 'Mafia'
        return False, None

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
                   alive : bool = False):
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

        return plist

    def get_player(self, user: discord.Member):
        plist = [*filter(lambda p: p.user.id == user.id, self.players)]
        return plist[0] if plist else None

    def has_player(self, user: discord.Member):
        return self.get_player(user) != None

    # lynch a player
    async def lynch(self, target : Player):
        async with self.channel.typing():
            await self.channel.send(f'{target.user.name} was lynched. He was a *{target.faction} {target.role}*.')
            await target.role.on_lynch(self, target)

        for player in self.players:
            player.votes = []

        target.remove()

    # WIP: End the game
    # If a winning faction is not provided, game is ended
    # as if host ended the game without letting it finish
    async def end(self, bot, winning_faction : typing.Optional[str] = None):
        if winning_faction:
            async with self.channel.typing():
                await self.channel.send(f'The game is over. {winning_faction} wins! 🎉')

        del bot.games[self.guild.id]

    @property
    def has_started(self): # this might be useful
        return not self.phase == Phase.PREGAME

    @property
    def majority_votes(self):
        return math.floor(len(self.filter_players(alive=True)) / 2) + 1
