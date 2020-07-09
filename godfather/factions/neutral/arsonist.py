from godfather.game import Game
from godfather.factions.base import Faction


class ArsonistNeutral(Faction):
    name = 'Arsonist'
    id = 'neutral.arsonist'
    win_con = 'Watch everyone burn.'

    def has_won(self, game: Game):
        alive_arsos = game.filter_players(
            faction='neutral.arsonist', alive=True)
        alive_players = game.filter_players(alive=True)
        return len(alive_arsos) == len(alive_players)
