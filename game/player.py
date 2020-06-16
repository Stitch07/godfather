import discord

class Player:
    def __init__(self, user: discord.User):
        self.user = user
        self.role = None
        self.faction = None
        self.alive = True
        self.votes = []

    # generates the role's PM
    @property
    def role_pm(self):
        return f'Hello {self.user}, you are a {self.faction} **{self.role}**. {self.role.description}'

    @property
    def full_role(self):
        return f'{self.faction} {self.role}'

    # check if player is voted by 'user'
    def has_vote(self, user: discord.User):
        return any(player.user.id == user.id for player in self.votes)
