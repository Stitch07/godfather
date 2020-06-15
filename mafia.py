from discord.ext import commands
from game import Game, Player
import json

def game_only():
    async def predicate(ctx):
        if ctx.guild.id not in ctx.bot.games:
            await ctx.send('No game is currently running in this server.')
            return False
        return True
    return commands.check(predicate)

class Mafia(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def creategame(self, ctx: commands.Context):
        if ctx.guild.id in self.bot.games:
            return await ctx.send('A game of mafia is already running in this server.')
        new_game = Game(ctx.channel)
        new_game.host_id = ctx.message.author.id
        new_game.players.append(Player(ctx.author))
        self.bot.games[ctx.guild.id] = new_game
        return await ctx.send(f'Started a game of mafia in {ctx.message.channel.mention}, hosted by **{ctx.message.author}**')

    @commands.command()
    @game_only()
    async def join(self, ctx: commands.Context):
        if self.bot.games[ctx.guild.id].has_started:
            return await ctx.send('Signup phase for the game has ended')
        elif self.bot.games[ctx.guild.id].has_player(ctx.author):
            return await ctx.send('You have already joined this game')

        rolesets = json.load(open('rolesets/rolesets.json'))
        rolesets.sort(key=lambda rl: len(rl['roles']), reverse=True)

        if len(self.bot.games[ctx.guild.id].players) >= len(rolesets[0].get('roles')):
            return await ctx.send(f'Maximum amount of players reached')
        else:
            self.bot.games[ctx.guild.id].players.append(Player(ctx.message.author))
            return await ctx.send('✅ Game joined successfully')

    @commands.command()
    @game_only()
    async def leave(self, ctx: commands.Context):
        if self.bot.games[ctx.guild.id].has_started:
            return await ctx.send('Cannot leave game after signup phase has ended')
        elif not self.bot.games[ctx.guild.id].has_player(ctx.author):
            return await ctx.send('You have not joined this game')
        elif self.bot.games[ctx.guild.id].host_id == ctx.author.id:
            return await ctx.send('The host cannot leave the game.')
        else:
            players = self.bot.games[ctx.guild.id].players
            players = [pl for pl in players if not (pl.user.id == ctx.author.id)]
            self.bot.games[ctx.guild.id].players = players
            return await ctx.send('✅ Game left successfully')

    @commands.command()
    @game_only()
    async def playerlist(self, ctx: commands.Context):
        if not self.bot.games[ctx.guild.id].has_started:
            return await ctx.send(f'**Players: {len(self.bot.games[ctx.guild.id].players)}**\n'
                    + ('\n'.join([f'{i+1}. {pl.user}' for (i, pl) in
                    enumerate(self.bot.games[ctx.guild.id].players)])))

def setup(bot):
    bot.add_cog(Mafia(bot))
