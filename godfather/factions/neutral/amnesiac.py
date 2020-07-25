from godfather.game import Player
from godfather.factions.base import Faction


class AmnesiacNeutral(Faction):
    name = 'Amnesiac'
    id = 'neutral.amnesiac'
    win_con = 'Remember a role and satisfy its win condition.'

    @property
    def category_name(self):
        return 'Neutral'

    def has_won_independent(self, _player: Player):
        return False
