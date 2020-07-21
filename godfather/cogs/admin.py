from discord.ext import commands

ADMINS = [292571834770128906, 244275194070433795,
          278094147901194242, 255449278808457218]


def staff_only():
    async def predicate(ctx):
        if ctx.author.id not in ADMINS:
            raise commands.CheckFailure('This command is staff only.')
        return True
    return commands.check(predicate)


class Admin(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    @staff_only()
    async def approve(self, ctx, guild_id: int):
        with self.bot.db.conn.cursor() as cur:
            try:
                cur.execute(
                    'INSERT INTO approved_guilds VALUES (%s)', [guild_id])
            except Exception:
                self.bot.db.conn.rollback()
                return await ctx.send('Guild {} already approved.'.format(guild_id))
        self.bot.db.conn.commit()
        return await ctx.send('Approved the server {}'.format(guild_id))


def setup(bot):
    bot.add_cog(Admin(bot))
