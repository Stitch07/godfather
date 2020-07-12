from godfather.game import Game
from godfather.factions.base import Faction


class ArsonistNeutral(Faction):
    name = 'Arsonist'
    id = 'neutral.arsonist'
    win_con = 'Watch everyone burn.'

    def has_won(self, game: Game):
        alive_arsos = game.players.filter(
            faction='neutral.arsonist', is_alive=True)
        alive_players = game.players.filter(is_alive=True)
        return len(alive_arsos) == len(alive_players)
