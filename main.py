import json
import os
import pathlib
from discord.ext import commands
import database


config = json.load(open('config.json'))

bot = commands.Bot(command_prefix=config.get(
    'prefix'), help_command=commands.DefaultHelpCommand(verify_checks=False))

if __name__ == '__main__':
    for file in pathlib.Path('cogs/').iterdir():
        if file.stem == '__pycache__':
            continue
        if file.is_file():
            # load files normally using load_ext()
            bot.load_extension('cogs.{}'.format(file.stem))
        elif file.is_dir():
            # load from dir/__init__.py
            bot.load_extension('cogs.{}.__init__'.format(file.stem))

# setup Postgres
if 'postgres' in config:
    bot.db = database.DB(**config.get('postgres'))

bot.run(config.get('token'))
