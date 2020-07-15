import ast
import importlib
import typing
import discord
from discord.ext import flags, commands


def insert_returns(body):
    # insert return stmt if the last expression is a expression statement
    if isinstance(body[-1], ast.Expr):
        body[-1] = ast.Return(body[-1].value)
        ast.fix_missing_locations(body[-1])

    # for if statements, we insert returns into the body and the orelse
    if isinstance(body[-1], ast.If):
        insert_returns(body[-1].body)
        insert_returns(body[-1].orelse)

    # for with blocks, again we insert returns into the body
    if isinstance(body[-1], ast.With):
        insert_returns(body[-1].body)


class Misc(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def ping(self, ctx):
        resp = await ctx.send('Pinging...')
        diff = resp.created_at - ctx.message.created_at
        await resp.edit(content=f'Pong! That took {1000*diff.total_seconds():.1f}ms.')

    @commands.command()
    async def invite(self, ctx):
        embed = discord.Embed()
        embed.set_author(name=self.bot.user.name,
                         icon_url=self.bot.user.avatar_url)
        embed.description = '[Invite]({}) | [Support Server](https://discord.gg/gFhvChy)'.format(
            self.bot.invite)
        return await ctx.send(embed=embed)

    # just a basic proof of concept
    @flags.add_flag('--role', type=str, default='')
    @flags.add_flag('--faction', type=str, default='')
    @flags.command()
    async def userstats(self, ctx, member: typing.Optional[discord.Member] = None, **flags):
        if member is None:
            member = ctx.author
        clauses = []
        role_filter = flags.get('role').title()
        faction_filter = flags.get('faction').title()

        with self.bot.db.conn.cursor() as cur:

            clauses.append(cur.mogrify(
                'player_id=%s', (str(member.id), )).decode('utf-8'))
            if role_filter != '':
                clauses.append(cur.mogrify(
                    'rolename=%s', (role_filter, )).decode('utf-8'))
            if faction_filter != '':
                clauses.append(cur.mogrify(
                    'faction=%s', (faction_filter, )).decode('utf-8'))
            clauses = ' AND '.join(clauses)

            query = ('SELECT result, COUNT(RESULT) FROM players'
                     ' WHERE {} GROUP BY result ORDER BY result DESC;'.format(clauses))
            cur.execute(query)
            results = cur.fetchall()
            wins = next((result[1]
                         for result in results if result[0]), 0)
            losses = next((result[1]
                           for result in results if not result[0]), 0)
            total = wins + losses

            if total == 0:
                return await ctx.send('No games played!')
            await ctx.send(f'Games: {total}\nWins: {wins}\nWinrate: {round(100 * wins/total)}%')

    @commands.command()
    @commands.is_owner()
    async def eval(self, ctx, *, cmd):
        fn_name = "_eval_expr"

        cmd = cmd.strip("` ")

        # add a layer of indentation
        cmd = "\n".join(f"    {i}" for i in cmd.splitlines())

        # wrap in async def body
        body = f"async def {fn_name}():\n{cmd}"

        parsed = ast.parse(body)
        body = parsed.body[0].body

        insert_returns(body)

        env = {
            'bot': ctx.bot,
            'discord': discord,
            'commands': commands,
            'ctx': ctx,
            'importlib': importlib
        }
        exec(compile(parsed, filename="<ast>", mode="exec"),  # pylint: disable=exec-used
             env)

        result = (await eval(f"{fn_name}()", env))  # pylint: disable=eval-used
        await ctx.send(f'```python\n{result}```')

    @eval.error
    async def eval_error(self, ctx, error):
        await ctx.send(f'❌ **A error occurred**: ```python\n{error}```')
        self.bot.logger.exception(error, exc_info=True, stack_info=True)


def setup(bot):
    bot.add_cog(Misc(bot))
