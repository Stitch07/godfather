from discord.ext import tasks, commands
import logging
logger = logging.getLogger('godfather')


class EventLoop(commands.Cog):
    # the event loop ends pending days/nights
    def __init__(self, bot):
        self.bot = bot
        self.event_loop.start()

    def cog_unload(self):
        self.event_loop.cancel()  # pylint: disable=no-member

    @tasks.loop(seconds=10.0)
    async def event_loop(self):
        for game in self.bot.games.values():
            await game.update()

    @event_loop.before_loop
    async def before_loop(self):
        await self.bot.wait_until_ready()

    @event_loop.after_loop
    async def loop_error(self):
        self.event_loop.restart()


def setup(bot):
    bot.add_cog(EventLoop(bot))
