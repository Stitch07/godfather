import discord
import typing


class Player:
    def __init__(self, user: discord.Member):
        self.user = user
        self.role = None
        self.faction = None
        self.alive = True
        self.votes: typing.List[Player] = []
        self.death_reason = ''

    # generates the role's PM
    def role_pm(self, game):
        teammate_info = ''
        if self.faction.aware:
            teammates = game.filter_players(faction=self.faction.id)
            if len(teammates) > 0:
                teammate_info += f'Your teammates are: {", ".join(map(lambda pl: pl.user.name, teammates))}'
        return (f'Hello {self.user}, you are a **{self.full_role}**. {self.role.description}'
                f'\n{teammate_info}'
                f'\nWin Condition: {self.faction.win_con}')

    @property
    def innocent(self):
        if hasattr(self.role, 'innocence_modifier'):
            return self.role.innocence_modifier()
        if self.faction.id == 'town':
            return True
        return False

    @ property
    def full_role(self):
        if self.faction.id.startswith('neutral'):
            return self.role
        return f'{self.faction} {self.role}'

    # remove vote by 'user' from player
    def remove_vote(self, user: discord.Member):
        self.votes = [*filter(lambda p: p.user.id != user.id, self.votes)]

    # check if player is voted by 'user'
    def has_vote(self, user: discord.Member):
        return any(player.user.id == user.id for player in self.votes)

    # remove a player from the game
    async def remove(self, game, reason):
        self.alive = False
        self.votes = []
        self.death_reason = reason
        if hasattr(self.role, 'on_death'):
            await self.role.on_death(game, self)
