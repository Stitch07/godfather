import json
import discord
from discord.ext import commands
from godfather.game import Player


class Admin(commands.Cog):

    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['addp'])
    @commands.is_owner()
    async def add_player(self, ctx, targets: commands.Greedy[discord.Member]):
        game = self.bot.games[ctx.guild.id]

        if game.has_started:
            return await ctx.send('Signup phase for the game has ended')

        rolesets = json.load(open('rolesets/rolesets.json'))
        rolesets.sort(key=lambda rl: len(rl['roles']), reverse=True)

        for target in targets:
            if game.has_player(target):
                await ctx.send(f'{target.name} has already joined this game')
            elif len(game.players) >= len(rolesets[0].get('roles')):
                await ctx.send('Maximum amount of players reached')
            else:
                game.players.append(Player(target))
                await ctx.send(f'Added {target.name}')

    @commands.command(aliases=['rmvp'])
    @commands.is_owner()
    async def remove_player(self, ctx, targets: commands.Greedy[discord.Member]):
        game = self.bot.games[ctx.guild.id]

        if game.has_started:
            return await ctx.send('Cannot remove from game after signup phase has ended')

        for target in targets:
            if not game.has_player(target):
                await ctx.send(f'{target.name} has not joined this game')
            elif game.host_id == target.id:
                await ctx.send('The host cannot be removed from the game.')
            else:
                game.players.remove(game.get_player(target))
                await ctx.send(f'Removed {target.name}')

    @commands.command(aliases=['vtap'])
    @commands.is_owner()
    async def voteas_player(self, ctx, members: commands.Greedy[discord.Member]):
        game = self.bot.games[ctx.guild.id]
        members = list(members)
        voted = members[-1]

        if not game.has_player(voted):
            return await ctx.send(f'Player {voted.name} not found in game.')

        if not game.get_player(voted).alive:
            return await ctx.send('You can\'t vote a dead player')

        # Iterate through all elements except last one
        for voter in members[:-1]:
            if game.get_player(voted).has_vote(voter):
                return await ctx.send(f'{voter.name} has already voted {voted.name}')
            if voter == voted:
                return await ctx.send('Self-voting is not allowed.')

            for voted_by in game.filter_players(is_voted_by=voter):
                voted_by.remove_vote(voter)

            game.get_player(voted).votes.append(game.get_player(voter))
            await ctx.send(f'Voted {voted.name} as {voter.name}')
            votes_on_target = len(game.get_player(voted).votes)

            if votes_on_target >= game.majority_votes:
                await game.lynch(game.get_player(voted))
                game_ended, winning_faction, independent_wins = game.check_endgame()

                if game_ended:
                    await game.end(self.bot, winning_faction, independent_wins)
                    break

                # change phase after this.
                await game.increment_phase(self.bot)
                break


def setup(bot):
    bot.add_cog(Admin(bot))
