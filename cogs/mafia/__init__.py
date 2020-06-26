from .checks import *
from .mafia import Mafia


def setup(bot):
    bot.add_cog(Mafia(bot))
