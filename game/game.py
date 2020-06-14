import discord
from enum import IntEnum, auto
from typing import Tuple
import json
import roles

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
    def find_setup(self):
        num_players = len(self.players)
        possibles = list(filter(lambda s: len(s.roles == num_players)))
        if len(possibles) == 0:
            raise Exception('No rolelists found.') # wip: custom exception types?
        return possibles.pop(0)

    # checks whether the game has ended, returns whether the game has ended and the winning faction
    def check_endgame(self) -> Tuple[bool, str]:
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

    @property
    def has_started(self): # this might be useful
        return not self.phase == Phase.PREGAME
