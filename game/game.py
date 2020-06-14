import discord
from enum import Enum, auto

class Phase(Enum):
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
