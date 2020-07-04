import json
import logging
import pathlib
import discord
from discord.ext import commands
from godfather.database import DB
from godfather.errors import PhaseChangeError
from godfather.utils import ColoredFormatter, getlogger, alive_or_recent_jester


config = json.load(open('config.json'))


def remove_prefix(text, prefix):
    return text[text.startswith(prefix) and len(prefix):]


class Godfather(commands.Bot):
    def __init__(self):
        super().__init__(
            command_prefix=config.get('prefix'),
            help_command=commands.DefaultHelpCommand(verify_checks=False)
        )

        self.games = {}

        # set logger
        self.logger = getlogger(config.get('logging', dict()))

        # set Discord.py's logger to our custom one
        discord_logger = logging.getLogger('discord')
        handler = logging.StreamHandler()
        # setFormatter returns `None`, so it can't be used while chaining
        handler.setFormatter(ColoredFormatter())
        discord_logger.addHandler(handler)

        # Load all extensions.
        self.load_extensions()

        # setup Postgres
        if 'postgres' in config:
            self.db = DB(**config.get('postgres')
                         )  # pylint: disable=invalid-name

    async def on_ready(self):
        # initialize games map
        self.get_cog('EventLoop').event_loop.start()
        self.logger.info('Ready to serve %s guilds!', len(self.guilds))

    async def on_command_error(self, ctx, error):
        # pylint: disable=too-many-return-statements, arguments-differ
        if hasattr(ctx.command, 'on_error'):
            return
        if isinstance(error, commands.CommandNotFound):
            if not isinstance(ctx.channel, discord.DMChannel):
                return
            command, * \
                args = remove_prefix(ctx.message.content,
                                     ctx.prefix).split(' ')
            games = [
                *filter(lambda g: g.has_player(ctx.author), self.games.values())]
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
            if hasattr(player.role, 'on_pm_command_notarget'):
                return await player.role.on_pm_command_notarget(ctx, pl_game, player, command)
            await player.role.on_pm_command(ctx, pl_game, player, args)

            return  # ignore invalid commands

        elif isinstance(error, commands.MissingRequiredArgument):
            return await ctx.send(f'Missing required argument {error.param}')
        elif isinstance(error, commands.ArgumentParsingError):
            return await ctx.send('Invalid input')
        elif isinstance(error, commands.BadArgument):
            return await ctx.send('Invalid input')
        elif isinstance(error, commands.CheckFailure):
            return await ctx.send(error)

        elif isinstance(error, PhaseChangeError):
            # Inform users that game has ended and remove guild id from `self.games`.
            await ctx.send('There was an error incrementing the phase. The game has ended.')
            self.games.pop(ctx.guild.id, None)
            return self.logger.exception(error)

        await ctx.send(f'Uncaught exception: ```{error}```')

        if config.get('ENV', '') == "production":
            # End game only if `env` is set to 'production'.
            await ctx.send('\nThe game has ended.')
            self.games.pop(ctx.guild.id, None)

        self.logger.exception(error)

    def load_extensions(self):
        for file in pathlib.Path('godfather/cogs/').iterdir():
            if file.stem in ['__pycache__', '__init__']:
                continue
            try:
                if file.is_file():
                    # load files normally using load_ext()
                    self.load_extension('godfather.cogs.{}'.format(file.stem))
                elif file.is_dir():
                    # load from dir/__init__.py
                    self.load_extension(
                        'godfather.cogs.{}.__init__'.format(file.stem))
                self.logger.info('Loaded cog %s', file.stem)
            except commands.ExtensionError as err:
                self.logger.error('Error loading extension %s', file.stem)
                self.logger.exception(err)


if __name__ == "__main__":
    # Run the bot
    Godfather().run(config.get('token'), reconnect=True)
