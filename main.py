import json
import os
import glob
from discord.ext import commands


config = json.load(open('config.json'))

bot = commands.Bot(command_prefix=config.get(
    'prefix'), help_command=commands.DefaultHelpCommand(verify_checks=False))

if __name__ == '__main__':
    cogs = glob.glob('cogs/*.py')
    for cog in cogs:
        bot.load_extension(
            f'cogs.{os.path.basename(os.path.splitext(cog)[0])}')

bot.run(config.get('token'))
