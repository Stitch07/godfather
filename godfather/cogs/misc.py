import ast
import importlib
import discord
from discord.ext import commands


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
        await ctx.send('Pong!')

    # just a basic proof of concept
    @commands.command()
    @commands.is_owner()
    async def userstats(self, ctx):
        with self.bot.db.conn.cursor() as cur:
            cur.execute(
                'SELECT result, COUNT(result) FROM players'
                ' WHERE player_id=%s GROUP BY result ORDER BY result DESC;',
                [str(ctx.author.id)])
            win_res, loss_res = cur.fetchall()
            wins = win_res[1]
            losses = loss_res[1]
            total = wins + losses
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
        self.bot.logger.exception(error)


def setup(bot):
    bot.add_cog(Misc(bot))
