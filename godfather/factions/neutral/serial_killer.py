from godfather.game import Game
from godfather.factions.base import Faction

OPPOSING_FACTIONS = ['neutral.arsonist', 'mafia', 'town']


class SerialKillerNeutral(Faction):
    name = 'Serial Killer'
    id = 'neutral.serialkiller'
    win_con = 'Be the last player standing.'

    @property
    def category_name(self):
        return 'Neutral'

    def has_won(self, game: Game):
        alive_sks = len(game.players.filter(
            faction='neutral.serialkiller', is_alive=True))
        alive_opposing = len(
            [*filter(lambda pl: pl.role.faction.id in OPPOSING_FACTIONS and pl.is_alive, game.players)])
        return alive_sks > 0 and alive_opposing == 0
