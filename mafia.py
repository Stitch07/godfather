from discord.ext import commands
from game import Game
import json

class Mafia(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def creategame(self, ctx: commands.Context):
        if ctx.guild.id in self.bot.games:
            return await ctx.send('A game of mafia is already running in this server.')
        new_game = Game(ctx.channel)
        new_game.host_id = ctx.message.author.id
        self.bot.games[ctx.guild.id] = new_game
        return await ctx.send(f'Started a game of mafia in {ctx.message.channel.mention}, hosted by **{ctx.message.author}**')

    @commands.command()
    async def join(self, ctx: commands.Context):
        if not ctx.guild.id in self.bot.games:
            return await ctx.send(f'No game is currently running in this server')
        elif self.bot.games[ctx.guild.id].has_started:
            return await ctx.send(f'Signup phase for the game has ended')
        elif Player(ctx.message.author) in self.bot.games[ctx.guild.id].players:
            return await ctx.send(f'You have already joined this game')

        rolesets = json.load(open("rolesets/rolesets.json"))
        rolesets.sort(lambda x,y: cmp(len(x), len(y)))

        if len(self.bot.games[ctx.guild.id].players) >= len(rolesets[0]):
            return await ctx.send(f'Maximum amount of players reached')
        else:
            self.bot.games[ctx.guild.id].players.append(Player(ctx.message.author))
            return await ctx.send(f'✅ Game joined successfully')

    @commands.command()
    async def leave(self, ctx: commands.Context):
        if not ctx.guild.id in self.bot.games:
            return await ctx.send(f'No game is currently running in this server')
        elif self.bot.games[ctx.guild.id].has_started:
            return await ctx.send(f'Cannot leave game after signup phase has ended')
        elif Player(ctx.message.author) not in self.bot.games[ctx.guild.id].players:
            return await ctx.send(f'You have not joined this game')
        else:
            self.bot.games[ctx.guild.id].players.remove(Player(ctx.message.author))
            return await ctx.send(f'✅ Game left successfully')

def setup(bot):
    bot.add_cog(Mafia(bot))
