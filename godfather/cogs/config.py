import asyncio

from discord.ext import commands
from godfather.cogs.mafia import host_only, game_only
from godfather.game import Game, Player, Phase
from godfather.game.game_config import GameConfigException


class Config(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['conf'])
    @host_only()
    @game_only()
    async def config(self, ctx, key: str, *, value: str):
        game = ctx.game
        if key not in game.config:
            return await ctx.send('Key "{} does not exist.'.format(key))
        try:
            await ctx.send(game.config.set(key, value))
        except GameConfigException as err:
            return await ctx.send(*err.args)

    @commands.command()
    @host_only()
    @game_only()
    async def close(self, ctx):
        game = ctx.game
        if ctx.game.has_started:
            return await ctx.send('The lobby cannot be closed once the game has started.')
        try:
            game.config.set('max_players', str(len(game.players)))
        except GameConfigException as err:
            return await ctx.send(*err.args)
        return await ctx.send('✅ The lobby has been locked to {} players.'.format(len(game.players)))

    @commands.command()
    @host_only()
    @game_only()
    async def open(self, ctx):
        game = ctx.game
        if ctx.game.has_started:
            return await ctx.send('The lobby cannot be reopened once the game has started.')
        game.config.set('max_players', 'reset')
        return await ctx.send('✅ The lobby has been unlocked again.')

    @commands.command()
    @host_only()
    @game_only()
    async def remove(self, ctx, player: Player):
        game: Game = ctx.game
        if player.user == game.host:
            return await ctx.send('You cannot remove the host. Use the `changehost` command instead.')
        if not game.has_started:
            # no checks needed if the game hasn't started
            game.players.remove(player)
            return await ctx.send('✅ Succesfully removed {}'.format(player.user))
        # give the player 45 seconds to confirm they're active before removing
        confirmation = await ctx.send('{}, you still around?'.format(player.user.mention))
        await confirmation.add_reaction('✅')

        def check(reaction, user):
            return user == player.user and str(reaction.emoji) == '✅' and reaction.message.id == confirmation.id
        to_remove = True

        try:
            _, _ = await self.bot.wait_for(
                'reaction_add', timeout=45.0, check=check)
            to_remove = False
            await ctx.message.add_reaction('❌')
            await confirmation.delete()
        except asyncio.TimeoutError:
            to_remove = True

        if to_remove:
            if len(game.players.replacements) == 0:
                phase_str = 'd' if game.phase == Phase.DAY else 'n'
                async with game.channel.typing():
                    await game.channel.send(f'{player.user.name} was modkilled. They were a *{player.display_role}*.')
                    await player.remove(game, f'modkilled {phase_str}{game.cycle}')
                    game_ended, winning_faction, independent_wins = game.check_endgame()
                    if game_ended:
                        await game.end(winning_faction, independent_wins)
                    return

            else:
                replacement = game.players.replacements.popleft()
                player.user = replacement
                await ctx.send(f'{replacement} has replaced {ctx.author}.')
                await player.send_pm(game)
                return


def setup(bot):
    bot.add_cog(Config(bot))
