from discord.ext.commands import Context
from godfather.game import Game


class CustomContext(Context):

    @property
    def game(self) -> Game:
        return self.bot.games.get(self.channel.id, None)
