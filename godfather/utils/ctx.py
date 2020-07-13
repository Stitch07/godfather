from discord.ext.commands import Context


class CustomContext(Context):

    @property
    def game(self):
        return self.bot.games.get(self.guild.id, None)
