from discord.ext import commands


class Admin(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    @commands.is_owner()
    async def approve(self, ctx, guild_id: int):
        with self.bot.db.conn.cursor() as cur:
            cur.execute('INSERT INTO approved_guilds VALUES (%s)', [guild_id])
        self.bot.db.conn.commit()
        return await ctx.send('Approved the server {}'.format(guild_id))


def setup(bot):
    bot.add_cog(Admin(bot))
