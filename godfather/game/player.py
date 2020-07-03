import typing
import discord
from discord.ext import commands
from discord.ext.commands import errors

conv = commands.MemberConverter()


class Player:
    def __init__(self, user: discord.Member):
        self.user = user
        self.role = None
        self.faction = None
        self.alive = True
        self.votes: typing.List[Player] = []
        self.death_reason = ''
        self.visitors = []

    # generates the role's PM
    @property
    def role_pm(self):
        return (
            f'Hello {self.user}, you are a **{self.display_role}**. '
            f'{self.role.description}'  # This follows the previous line.
            f'\nWin Condition: {self.faction.win_con}'
        )

    @property
    def innocent(self):
        if hasattr(self.role, 'innocence_modifier'):
            return self.role.innocence_modifier()
        if self.faction.id == 'town':
            return True
        return False

    @property
    def full_role(self):
        if self.faction.id.startswith('neutral'):
            return self.role
        return f'{self.faction} {self.role}'

    @property
    def display_role(self):
        if self.faction.id.startswith('neutral'):
            return self.role.display_role()
        return f'{self.faction} {self.role.display_role()}'

    async def visit(self, visitor, record):
        self.visitors.append(visitor)
        if hasattr(self.role, 'visited'):
            await self.role.visited(self, visitor, record)

    # remove vote by 'user' from player
    def remove_vote(self, user: discord.Member):
        self.votes = [*filter(lambda p: p.user.id != user.id, self.votes)]

    # check if player is voted by 'user'
    def has_vote(self, user: discord.Member):
        return any(player.user.id == user.id for player in self.votes)

    # remove a player from the game
    async def remove(self, game, reason, modkill=False):
        self.alive = False
        self.votes = []
        self.death_reason = reason
        if hasattr(self.role, 'on_death') and not modkill:
            await self.role.on_death(game, self)

    @classmethod
    async def convert(cls, ctx, argument):
        # follow the strategy: numbers, names, standard discord.py conversions
        game = ctx.bot.games[ctx.guild.id]
        if argument.isdigit() and \
                int(argument) > 0 and \
                int(argument) <= len(game.players):
            return game.players[int(argument) - 1]

        found_member = None
        # case sensitive username search
        for member in ctx.guild.members:
            if member.name.lower() == argument.lower():
                found_member = member

        if found_member is None:
            found_member = await conv.convert(ctx, argument)
        if found_member is None or not game.has_player(found_member):
            raise errors.BadArgument('Player {} not found'.format(argument))
        return game.get_player(found_member)
