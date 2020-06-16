import discord
from discord.ext import commands
from game import Game, Player, Phase
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

def player_only():
    async def predicate(ctx):
        if not ctx.bot.games[ctx.guild.id].has_player(ctx.author):
            await ctx.send('Only players can use this command.')
            return False
        elif not ctx.bot.games[ctx.guild.id].get_player(ctx.author).alive:
            await ctx.send('Dead players can\'t use this command')
            return False
        return True
    return commands.check(predicate)

def game_started_only():
    async def predicate(ctx):
        game = ctx.bot.games[ctx.guild.id]
        if not game.has_started:
            await ctx.send('The game hasn\'t started yet!')
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
        await ctx.send('Sent all role PMs!')
        game.phase = Phase.DAY

    @commands.command()
    @game_only()
    @game_started_only()
    @player_only()
    async def vote(self, ctx: commands.Context, target: discord.Member):
        game = self.bot.games[ctx.guild.id]
        target = game.get_player(target)

        if not game.has_player(target.user):
            return await ctx.send(f'Player {target.mention} not found in game.')
        elif not game.get_player(target.user).alive:
            return await ctx.send('You can\'t vote a dead player')
        if target.user == ctx.author:
            return await ctx.send('Self-voting is not allowed.')

        game.filter_players(is_voted_by=ctx.author)[0].remove_vote(ctx.author)

        target.votes.append(game.get_player(ctx.author))
        await ctx.send(f'Voted {target.user.name}')

        votes_on_target = len(target.votes)

        if votes_on_target >= game.majority_votes:
            await game.lynch(target)

            game_ended, winning_faction = game.check_endgame()
            if game_ended:
                game.end()
            else:
                # change phase after this.
                pass

    # TODO Finish this
    @commands.command()
    @game_only()
    @game_started_only()
    @player_only()
    async def unvote(self, ctx: commands.Context, target: discord.Member):
        game = self.bot.games[ctx.guild.id]

        if not game.has_player(target.user):
            return await ctx.send(f'Player {target.mention} not found in game.')
        if not game.get_player(target).has_vote(ctx.author):
            return await ctx.send(f'You haven\'t voted {target.user.name}')

        game.get_player(target).remove_vote(ctx.author)
        await ctx.send(f'Unvoted {target.user.name}')

    async def votecount(self, ctx: commands.Context):
        game = self.bot.games[ctx.guild.id]
        num_alive = len(game.filter_players(alive=True))

        msg : str = '**Vote Count:\n'
        msg += ''.join([(f'{pl.user.name} ({len(pl.votes)}) - ' + ', '.join(pl.votes) + '\n') for pl in game.players])
        msg += f'With {num_alive} alive, it takes {game.majority_votes} to lynch.'

        return await ctx.send(msg)

def setup(bot):
    bot.add_cog(Mafia(bot))
