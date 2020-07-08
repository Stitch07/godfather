from discord.ext import commands
from discord.ext.commands import CheckFailure
from godfather.game import Phase


def game_only():
    async def predicate(ctx):
        if ctx.guild.id not in ctx.bot.games:
            raise CheckFailure('No game is currently running in this server.')
        return True
    return commands.check(predicate)


def host_only():
    async def predicate(ctx):
        game = ctx.bot.games[ctx.guild.id]
        if not game.host.id == ctx.author.id:
            raise CheckFailure('Only hosts can use this command.')
        return True
    return commands.check(predicate)


def day_only():
    async def predicate(ctx):
        game = ctx.bot.games[ctx.guild.id]
        if not game.phase == Phase.DAY:  # this is Phase.DAY, can't have circular imports
            raise CheckFailure('This command can only be used during the day.')
        return True
    return commands.check(predicate)


def player_only():
    async def predicate(ctx):
        if not ctx.bot.games[ctx.guild.id].has_player(ctx.author):
            raise CheckFailure('Only players can use this command.')
        if not ctx.bot.games[ctx.guild.id].get_player(ctx.author).alive:
            raise CheckFailure('Dead players can\'t use this command')
        return True
    return commands.check(predicate)


def game_started_only():
    async def predicate(ctx):
        game = ctx.bot.games[ctx.guild.id]
        if not game.has_started:
            raise CheckFailure('The game hasn\'t started yet!')
        return True
    return commands.check(predicate)
