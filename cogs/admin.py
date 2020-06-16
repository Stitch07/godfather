import discord
from discord.ext import commands
from game import Player  # pylint: disable=import-error


class Admin(commands.Cog):

    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['addp'])
    @commands.is_owner()
    async def add_player(self, ctx, target: discord.Member):
        self.bot.games[ctx.guild.id].players.append(Player(target))
        return await ctx.send(f'Added {target}')


def setup(bot):
    bot.add_cog(Admin(bot))
