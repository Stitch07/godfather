import json
import logging
import pathlib
from discord.ext import commands
from godfather.database import DB
from godfather.utils import ColoredFormatter, getlogger


config = json.load(open('config.json'))

bot = commands.Bot(command_prefix=config.get(
    'prefix'), help_command=commands.DefaultHelpCommand(verify_checks=False))
bot.logger = getlogger(config.get('logging', dict()))


# set Discord.py's logger to our custom one
discord_logger = logging.getLogger('discord')
discord_logger.addHandler(
    logging.StreamHandler().setFormatter(ColoredFormatter()))

if __name__ == '__main__':
    for file in pathlib.Path('godfather/cogs/').iterdir():
        if file.stem in ['__pycache__', '__init__']:
            continue
        try:
            if file.is_file():
                # load files normally using load_ext()
                bot.load_extension('godfather.cogs.{}'.format(file.stem))
            elif file.is_dir():
                # load from dir/__init__.py
                bot.load_extension(
                    'godfather.cogs.{}.__init__'.format(file.stem))
            bot.logger.info('Loaded cog %s', file.stem)
        except commands.ExtensionError as err:
            bot.logger.error('Error loading extension %s', file.stem)
            bot.logger.exception(err)

# setup Postgres
if 'postgres' in config:
    bot.db = DB(**config.get('postgres'))

bot.run(config.get('token'))
