import json
import typing
import random
import copy
import discord
from discord.ext import commands
from factions import factions
from game import Game, Player, Phase  # pylint: disable=import-error
from roles import all_roles  # pylint: disable=import-error
from utils import get_random_sequence


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


def day_only():
    async def predicate(ctx):
        game = ctx.bot.games[ctx.guild.id]
        if game.phase != Phase.DAY:
            await ctx.send('This command can only be used during the day.')
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

    @commands.command(aliases=['create', 'create-game'])
    async def creategame(self, ctx: commands.Context):
        if ctx.guild.id in self.bot.games:
            return await ctx.send('A game of mafia is already running '
                                  'in this server.')
        new_game = Game(ctx.channel)
        new_game.host_id = ctx.message.author.id
        new_game.players.append(Player(ctx.author))
        self.bot.games[ctx.guild.id] = new_game
        return await ctx.send('Started a game of mafia in '
                              f'{ctx.message.channel.mention}, '
                              f'hosted by **{ctx.message.author}**')

    @commands.command()
    @game_only()
    async def join(self, ctx: commands.Context):
        game = self.bot.games[ctx.guild.id]

        if game.has_started:
            return await ctx.send('Signup phase for the game has ended')
        elif game.has_player(ctx.author):
            return await ctx.send('You have already joined this game')

        rolesets = json.load(open('rolesets/rolesets.json'))
        rolesets.sort(key=lambda rl: len(rl['roles']), reverse=True)

        if len(game.players) >= len(rolesets[0].get('roles')):
            return await ctx.send('Maximum amount of players reached')
        else:
            game.players.append(Player(ctx.message.author))
            return await ctx.send('✅ Game joined successfully')

    @commands.command()
    @game_only()
    async def leave(self, ctx: commands.Context):
        game = self.bot.games[ctx.guild.id]

        if game.has_started:
            return await ctx.send('Cannot leave game after '
                                  'signup phase has ended')
        elif not game.has_player(ctx.author):
            return await ctx.send('You have not joined this game')
        elif game.host_id == ctx.author.id:
            return await ctx.send('The host cannot leave the game.')
        else:
            game.players.remove(game.get_player(ctx.author))
            return await ctx.send('✅ Game left successfully')

    @commands.command()
    @game_only()
    async def playerlist(self, ctx: commands.Context):
        game = self.bot.games[ctx.guild.id]
        msg = f'**Players: {len(game.players)}**\n'

        msg += '\n'.join([f'{i+1}. {pl.user}'
                          for (i, pl) in enumerate(game.players)])

        return await ctx.send(msg)

    @commands.command()
    async def setupinfo(self, ctx: commands.Context, roleset: typing.Optional[str] = None):
        rolesets = json.load(open('rolesets/rolesets.json'))
        if roleset is None:
            txt = ('**All available setups:** (to view a specific setup, use '
                   f'{ctx.prefix}setupinfo <name>)')
            txt += '```\n'
            for _roleset in rolesets:
                txt += f'{_roleset["name"]} ({len(_roleset["roles"])} players)\n'
            txt += '```'
            return await ctx.send(txt)
        found_setup = next(
            (rs for rs in rolesets if rs['name'] == roleset.lower()), None)
        if found_setup is None:
            return await ctx.send(f"Couldn't find {roleset}, use {ctx.prefix}setupinfo to view all setups.")
        txt = [f'**{roleset}** ({len(found_setup["roles"])} players)', '```\n']
        for i, role in enumerate(found_setup['roles']):
            txt.append(
                f'{i+1}. {role["faction"].title()} {role["id"].title()}')
        txt.append('```')
        await ctx.send('\n'.join(txt))

    @ commands.command()
    @ game_only()
    @ game_started_only()
    async def rolepm(self, ctx: commands.Context):
        game = self.bot.games[ctx.guild.id]
        player = game.get_player(ctx.author)
        try:
            await player.user.send(player.role_pm)
            await ctx.message.add_reaction('✅')
        except discord.Forbidden:
            await ctx.send('Cannot send you your role PM. Make sure your DMs are enabled!')

    @ commands.command(aliases=['start'])
    @ host_only()
    @ game_only()
    async def startgame(self, ctx: commands.Context,
                        r_setup: typing.Optional[str] = None):
        game = self.bot.games[ctx.guild.id]

        if game.has_started:
            await ctx.send("Game has already started!")
            return

        try:
            found_setup = game.find_setup(r_setup)
        except Exception as err:  # pylint: disable=broad-except
            return await ctx.send(err)
        await ctx.send(f'Chose the setup **{found_setup["name"]}**. '
                       'Randing roles...')
        roles = copy.deepcopy(found_setup['roles'])

        # Create a random sequence of role indexes, enumerate the player list.
        # And assign the nth number in the random sequence to the nth player.
        # Then use the resulting number as index for the role.
        role_sequence = get_random_sequence(0, len(roles)-1)

        # people the bot couldn't dm
        no_dms = []
        async with ctx.channel.typing():
            for num, player in enumerate(game.players):
                player_role = roles[role_sequence[num]]

                # assign role and faction to the player
                player.role = all_roles.get(player_role['id'])()
                player.faction = factions.get(player_role['faction'])()
  
                # send role PMs
                try:
                    await player.user.send(player.role_pm)
                except discord.Forbidden:
                    no_dms.append(player.user)

        await ctx.send('Sent all role PMs!')

        if len(no_dms) > 0:
            no_dms = [*map(lambda usr: usr.name, no_dms)]
            await ctx.send(f"I couldn't DM {', '.join(no_dms)}. Use the {ctx.prefix}rolepm command to receive your PM.")
        await game.increment_phase(self.bot)

    @ commands.command()
    @day_only()
    @ game_started_only()
    @ player_only()
    @ game_only()
    async def vote(self, ctx: commands.Context, target: discord.Member):
        game = self.bot.games[ctx.guild.id]

        if not game.has_player(target):
            return await ctx.send(f'Player {target.name} not found in game.')
        elif not game.get_player(target).alive:
            return await ctx.send('You can\'t vote a dead player')
        elif game.get_player(target).has_vote(ctx.author):
            return await ctx.send(f'You have already voted {target.name}')
        if target == ctx.author:
            return await ctx.send('Self-voting is not allowed.')
        for voted in game.filter_players(is_voted_by=ctx.author):
            voted.remove_vote(ctx.author)

        game.get_player(target).votes.append(game.get_player(ctx.author))
        await ctx.send(f'Voted {target.name}')
        votes_on_target = len(game.get_player(target).votes)

        if votes_on_target >= game.majority_votes:
            await game.lynch(game.get_player(target))
            game_ended, winning_faction, individual_wins = game.check_endgame()
            if game_ended:
                await game.end(self.bot, winning_faction, individual_wins)
            else:
                await game.increment_phase(self.bot)
                # change phase after this.

    @ commands.command()
    @day_only()
    @ game_started_only()
    @ player_only()
    @ game_only()
    async def unvote(self, ctx: commands.Context):
        game = self.bot.games[ctx.guild.id]
        for voted in game.filter_players(is_voted_by=ctx.author):
            voted.remove_vote(ctx.author)
            return await ctx.send(f'Unvoted {voted.user.name}')
        await ctx.send('No votes to remove.')

    @ commands.command()
    @day_only()
    @ game_started_only()
    @ player_only()
    @ game_only()
    async def votecount(self, ctx: commands.Context):
        game = self.bot.games[ctx.guild.id]
        num_alive = len(game.filter_players(alive=True))
        msg = '**Vote Count**:\n'

        for player in game.players:
            if player.votes:
                msg += f'{player.user.name} ({len(player.votes)}) - ' + \
                    ', '.join(
                        [voter.user.name for voter in player.votes]) + '\n'

        msg += f'With {num_alive} alive, it takes {game.majority_votes} to lynch.'
        return await ctx.send(msg)


def setup(bot):
    bot.add_cog(Mafia(bot))
