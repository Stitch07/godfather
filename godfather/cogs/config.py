from discord.ext import commands
from godfather.cogs.mafia import host_only, game_only


class Config(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['conf'])
    @host_only()
    @game_only()
    async def config(self, ctx, key: str, *, value: str):
        game = ctx.bot.games[ctx.channel.id]
        game.config[key] = value

    @commands.command()
    @host_only()
    @game_only()
    async def get_config(self, ctx, key: str):
        """Get the value of a config key.

        NOTE
        ----
        For testing purposes only.
        This should be deleted once the bot gets released.
        """
        game = ctx.bot.games[ctx.channel.id]
        await ctx.send(game.config[key])


def setup(bot):
    bot.add_cog(Config(bot))
