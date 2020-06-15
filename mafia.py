from discord.ext import commands
from game import Game, Player
from roles import all_roles
import json
import typing
import random
import copy

def game_only():
    async def predicate(ctx):
        if ctx.guild.id not in ctx.bot.games:
            await ctx.send('No game is currently running in this server.')
            return False
        return True
    return commands.check(predicate)

def host_only():
    async def predicate(ctx):
        game = ctx.bot.games[ctx.guild.id]
        if not game.host_id == ctx.author.id:
            await ctx.send('Only hosts can use this command.')
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

    @commands.command()
    @game_only()
    @host_only()
    async def startgame(self, ctx: commands.Context, setup: typing.Optional[str] = None):
        game = self.bot.games[ctx.guild.id]
        try:
            setup = game.find_setup(setup)
        except Exception as err:
            return await ctx.send(err)
        await ctx.send(f'Chose the setup **{setup["name"]}**. Randing roles...')
        roles = copy.deepcopy(setup['roles'])
        # shuffle roles in place and assign the nth (shuffled) role to the nth player
        random.shuffle(roles)
        async with ctx.channel.typing():
            for n, player in enumerate(game.players):
                player_role = roles[n]
                # assign role and faction to the player
                player.role = all_roles.get(player_role['id'])()
                player.faction = player_role['faction']
                # send role PMs; wip: check if the message was successfully sent
                await player.user.send(player.role_pm)
        await ctx.channel.send('Sent all role PMs!')


def setup(bot):
    bot.add_cog(Mafia(bot))
