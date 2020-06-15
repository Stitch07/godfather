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
        self.channel_id = channel.id
        self.guild_id = channel.guild.id
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
        num_town = len(filter(lambda p: p.alive == True and p.faction == 'Town'))
        num_maf = len(filter(lambda p: p.alive == True and p.faction == 'Mafia'))
        # very primitive endgame check; if mafia and town have equal members, town don't have
        # the majority and cannot lynch mafia. in the future, this method should account for
        # town's potential to nightkill mafia members.
        if num_maf == 0: # all mafia are killed, town wins
            return True, 'Town'
        elif num_town <= num_maf: # town cannot majority lynch the mafia
            return True, 'Mafia'
        return False, None

    def has_player(self, user: discord.User):
        return any(player.user.id == user.id for player in self.players)

    @property
    def has_started(self): # this might be useful
        return not self.phase == Phase.PREGAME

    @property
    def majority_votes(self):
        alive_players = len([*filter(lambda p: p.alive, self.players)])
        return math.floor(alive_players / 2) + 1
