from discord.ext import commands
from godfather.cogs.mafia import host_only, game_only


class Config(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['conf'])
    @host_only()
    @game_only()
    async def config(self, ctx, key: str, *, value: str):
        if key == 'phase_duration':
            game = ctx.bot.games[ctx.guild.id]
            if not value.isdigit():
                return await ctx.send('Invalid input: send a valid positive integer')
            value = int(value)
            if value > 30 * 60 or value < 30:
                return await ctx.send('Phases must last 30 minutes at most'
                                      ' and 30 seconds at least.')
            game.config['phase_time'] = value
            await ctx.send(f'Phases will now last {round(value / 60, 1)} minutes.')


def setup(bot):
    bot.add_cog(Config(bot))
