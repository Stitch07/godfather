import discord
from enum import IntEnum, auto
import typing
import json
import roles
from .player import Player
import math

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
        self.phase = Phase.PREGAME
        self.cycle = 0
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
        num_town = len([*filter(lambda p: p.alive == True and p.faction == 'Town', self.players)])
        num_maf = len([*filter(lambda p: p.alive == True and p.faction == 'Mafia', self.players)])
        # very primitive endgame check; if mafia and town have equal members, town don't have
        # the majority and cannot lynch mafia. in the future, this method should account for
        # town's potential to nightkill mafia members.
        if num_maf == 0: # all mafia are killed, town wins
            return True, 'Town'
        elif num_town <= num_maf: # town cannot majority lynch the mafia
            return True, 'Mafia'
        return False, None

    async def increment_phase(self):
        # cycle 0 check
        if self.cycle == 0 or self.phase == Phase.NIGHT:
            # go to the next day
            self.cycle = self.cycle + 1
            self.phase = Phase.DAY
            # voting starts
            alive_players = len([*filter(lambda p: p.alive, self.players)])
            # TODO: make limits configurable
            await self.channel.send(f'Day **{self.cycle}** will last 5 minutes. With {alive_players} alive, it takes {self.majority_votes} to lynch.')
        else:
            self.phase = Phase.NIGHT
            await self.channel.send(f'Night **{self.cycle}** will last 5 minutes. Send in those actions quickly!')

    def has_player(self, user: discord.User):
        return any(player.user.id == user.id for player in self.players)

    @property
    def has_started(self): # this might be useful
        return not self.phase == Phase.PREGAME

    @property
    def majority_votes(self):
        alive_players = len([*filter(lambda p: p.alive, self.players)])
        return math.floor(alive_players / 2) + 1 
