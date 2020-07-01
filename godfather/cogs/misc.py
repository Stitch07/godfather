import ast
import discord
from discord.ext import commands
import godfather.roles as roles
import godfather.game as game
from godfather.utils import alive_or_recent_jester


def remove_prefix(text, prefix):
    return text[text.startswith(prefix) and len(prefix):]


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

    @commands.Cog.listener()
    async def on_ready(self):
        # initialize games map
        self.bot.games = {}
        self.bot.get_cog('EventLoop').event_loop.start()
        self.bot.logger.info(
            'Ready to serve {} guilds!'.format(len(self.bot.guilds)))

    @commands.Cog.listener()
    async def on_command_error(self, ctx, error):
        # pylint: disable=too-many-return-statements
        if hasattr(ctx.command, 'on_error'):
            return
        if isinstance(error, commands.CommandNotFound):
            if not isinstance(ctx.channel, discord.DMChannel):
                return
            command, * \
                args = remove_prefix(ctx.message.content,
                                     ctx.prefix).split(' ')
            games = [
                *filter(lambda g: g.has_player(ctx.author), ctx.bot.games.values())]
            if len(games) == 0:
                return
            pl_game = games[0]
            player = pl_game.get_player(ctx.author)

            if not alive_or_recent_jester(player, pl_game) \
                    or not hasattr(player.role, 'action'):
                return
            if command.lower() not in [player.role.action, 'noaction']:
                return
            if command.lower() == 'noaction':
                args = ['noaction']
            await player.role.on_pm_command(ctx, pl_game, player, args)

            return  # ignore invalid commands

        elif isinstance(error, commands.MissingRequiredArgument):
            return await ctx.send(f'Missing required argument {error.param}')
        elif isinstance(error, commands.ArgumentParsingError):
            return await ctx.send('Invalid input')
        elif isinstance(error, commands.BadArgument):
            return await ctx.send('Invalid input')
        elif isinstance(error, commands.CheckFailure):
            # checks are handled in the predicates
            return
        await ctx.send(f'Uncaught exception: ```{error}```')
        self.bot.logger.exception(error)

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
            'game': game,
            'roles': roles,
            '   __import__': __import__
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
