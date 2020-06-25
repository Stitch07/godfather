from discord.ext import commands


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
        if not game.phase == 2:  # this is Phase.DAY, can't have circular imports
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
