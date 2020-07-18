import ast
import importlib
import os
import typing

import discord
from discord.ext import flags, commands
import psutil

from godfather.utils import from_now

proc = psutil.Process(os.getpid())
proc.cpu_percent(interval=None)


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
        await resp.edit(content='Pong! That took {:.0f}ms. (Latency: {:.0f}ms)'.format(1000*diff.total_seconds(), self.bot.latency*1000))

    @commands.command()
    async def info(self, ctx):
        version = '{}-{}'.format('.'.join(map(str, self.bot.__version__)),
                                 self.bot.__release__)
        info_text = [
            '{} v{} is a Discord bot that hosts games of Werewolf/Mafia, with 24/7 uptime and intuitive commands.'.format(
                self.bot.user.name, version),
            '',
            '{} features:'.format(self.bot.user.name),
            '• Automatically hosted games of Mafia, with over 20 roles and different factions.',
            '• Addable custom setups (with 10+ preloaded)',
            '• Player and game statistics.',
            'and much more!',
            '',
            'To add {} to your Discord server, use the `{}invite` command.'.format(
                self.bot.user.name, ctx.prefix
            )
        ]
        return await ctx.send('\n'.join(info_text))

    @commands.command()
    async def invite(self, ctx):
        app = await self.bot.application_info()
        if not app.bot_public:
            return await ctx.send('{} isn\'t public yet...'.format(self.bot.user.name))

        embed = discord.Embed()
        embed.set_author(name=self.bot.user.name,
                         icon_url=self.bot.user.avatar_url)
        embed.description = '[Invite]({}) | [Support Server](https://discord.gg/gFhvChy)'.format(
            self.bot.invite)

        if self.bot.__release__ == 'beta':
            embed.description += ('\n{0} is currently semi-public. Use the `apply` command to apply for approval. {0} will automatically leave servers that aren\'t approved.').format(self.bot.user.name)

        return await ctx.send(embed=embed)

    @commands.command()
    @commands.cooldown(1, 5.0, commands.BucketType.user)
    async def stats(self, ctx):
        proc_memory_used = round(proc.memory_info().rss / 1e6, 2)
        proc_memory_used_percentage = round(proc.memory_percent(), 2)
        proc_cpu_usage = round(proc.cpu_percent(interval=None), 2)

        connected_guilds = len(self.bot.guilds)
        connected_users = len(self.bot.users)
        connected_channels = len(list(self.bot.get_all_channels()))
        uptime = from_now(self.bot.connected_at, show_in=False)

        version = '{}-{}'.format('.'.join(map(str, self.bot.__version__)),
                                 self.bot.__release__)
        invite_header = 'To add {} to your Discord server, use the `{}invite` command.'.format(
            self.bot.user.name, ctx.prefix)
        footer_text = 'Running {} v{}'.format(
            self.bot.user.name, version)

        connected_to_field = '\n'.join([
            '**Guilds**: {}'.format(connected_guilds),
            '**Users**: {}'.format(connected_users),
            '**Channels**: {}'.format(connected_channels)
        ])
        server_stats_field = '\n'.join([
            '**RAM**: {}MB ({}%)'.format(proc_memory_used,
                                         proc_memory_used_percentage),
            '**CPU**: {}%'.format(proc_cpu_usage),
            '**Uptime**: {}'.format(uptime)
        ])

        embed = discord.Embed()
        embed.color = 0x000000
        embed.description = invite_header
        embed.add_field(name='Connected to:', value=connected_to_field)
        embed.add_field(name='Server stats:', value=server_stats_field)
        embed.set_footer(text=footer_text, icon_url=self.bot.user.avatar_url)
        return await ctx.send(embed=embed)

    @commands.command()
    @commands.cooldown(5, 60.0, commands.BucketType.user)
    async def apply(self, ctx, guild_id: int):
        if self.bot.__release__ != 'beta':
            return await ctx.send('Beta release hasn\'t started yet. Stay tuned... 👀')
        # TODO: don't hardcode this
        app_channel = self.bot.get_channel(732899498983948359)
        await ctx.message.add_reaction('✅')
        return await app_channel.send('{} is applying for the server **{}**'.format(ctx.author, guild_id))

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

    @userstats.error
    async def userstats_error(self, ctx, error):
        if isinstance(error, flags.ArgumentParsingError):
            return await ctx.send('Couldn\'t find that user. Try mentioning them!')

    @commands.command(hidden=True)
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
