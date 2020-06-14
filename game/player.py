import discord

class Player:
    def __init__(self, user: discord.User):
        self.user = user
        self.role = None
        self.faction = None

    # generates the role's PM
    @property
    def role_pm(self):
        return f'Hello {self.user}, you are a {self.faction} **{self.role}**. {self.role.description}'
