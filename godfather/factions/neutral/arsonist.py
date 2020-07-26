from godfather.game import Game
from godfather.factions.base import Faction

OPPOSING_FACTIONS = ['neutral.serialkiller', 'mafia', 'town']


class ArsonistNeutral(Faction):
    name = 'Arsonist'
    id = 'neutral.arsonist'
    win_con = 'Watch everyone burn.'

    @property
    def category_name(self):
        return 'Neutral'

    def has_won(self, game: Game):
        alive_arsos = len(game.players.filter(
            faction='neutral.arsonist', is_alive=True))
        alive_opposing = len(
            [*filter(lambda pl: pl.role.faction.id in OPPOSING_FACTIONS and pl.is_alive, game.players)])
        return alive_arsos > 0 and alive_opposing == 0
