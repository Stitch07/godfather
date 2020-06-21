from game import Game
from .base import Faction


class Town(Faction):
    name = 'Town'
    id = 'town'
    win_con = 'Lynch every evildoer.'

    def has_won(self, game: Game):
        alive_players = len(game.filter_players(alive=True))
        alive_townies = len(game.filter_players(alive=True, faction='town'))
        return alive_townies > 0 and alive_players == alive_townies
