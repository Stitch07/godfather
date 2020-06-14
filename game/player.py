import discord

class Player:
    def __init__(self, user: discord.User):
        self.user = user
        self.role = None
        self.faction = None
