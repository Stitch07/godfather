import discord
from discord.ext import commands
import json

config = json.load(open('config.json'))

bot = commands.Bot(command_prefix='=')

if __name__ == '__main__':
    print('Hello')
    for extension in ['misc']:
        bot.load_extension(extension)
    print(bot.extensions)

bot.run(config.get('token'))
