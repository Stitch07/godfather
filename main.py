import json
from discord.ext import commands


config = json.load(open('config.json'))

bot = commands.Bot(command_prefix=config.get('prefix'))

if __name__ == '__main__':
    for extension in ['misc', 'mafia']:
        bot.load_extension(extension)

bot.run(config.get('token'))
