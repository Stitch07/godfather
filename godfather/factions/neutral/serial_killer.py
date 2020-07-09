from godfather.game import Game
from godfather.factions.base import Faction


class SerialKillerNeutral(Faction):
    name = 'Serial Killer'
    id = 'neutral.serialkiller'
    win_con = 'Be the last player standing.'

    def has_won(self, game: Game):
        alive_sks = game.players.filter(
            faction='neutral.serialkiller', alive=True)
        alive_players = game.players.filter(alive=True)
        if len(alive_sks) == 1 and len(alive_players) == 2:  # SK always wins in 1v1s
            return True
        return len(alive_sks) == len(alive_players)
