import json
import logging
import pathlib
from discord.ext import commands
import database
import utils


config = json.load(open('config.json'))

bot = commands.Bot(command_prefix=config.get(
    'prefix'), help_command=commands.DefaultHelpCommand(verify_checks=False))
bot.logger = utils.getlogger(config.get('logging', dict()))


# set Discord.py's logger to our custom one
discord_logger = logging.getLogger('discord')
discord_logger.addHandler(
    logging.StreamHandler().setFormatter(utils.ColoredFormatter()))

if __name__ == '__main__':
    for file in pathlib.Path('cogs/').iterdir():
        if file.stem == '__pycache__':
            continue
        try:
            if file.is_file():
                # load files normally using load_ext()
                bot.load_extension('cogs.{}'.format(file.stem))
            elif file.is_dir():
                # load from dir/__init__.py
                bot.load_extension('cogs.{}.__init__'.format(file.stem))
            bot.logger.info('Loaded cog {}'.format(file.stem))
        except commands.ExtensionError as err:
            bot.logger.error('Error loading extension {}'.format(file.stem))
            bot.logger.exception(err)

# setup Postgres
if 'postgres' in config:
    bot.db = database.DB(**config.get('postgres'))

bot.run(config.get('token'))
