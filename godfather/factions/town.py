from godfather.game import Game
from .base import Faction

OPPOSING_FACTIONS = ['mafia', 'neutral.serialkiller', 'neutral.arsonist']


class Town(Faction):
    # pylint: disable=too-few-public-methods
    name = 'Town'
    id = 'town'
    win_con = 'Lynch every evildoer.'

    def has_won(self, game: Game):
        alive_townies = len(game.filter_players(faction='town'))
        alive_opposing = len(
            [*filter(lambda pl: pl.faction.id in OPPOSING_FACTIONS and pl.alive, game.players)])
        return alive_townies > 0 and alive_opposing == 0
