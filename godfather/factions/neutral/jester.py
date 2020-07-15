from godfather.game import Player
from godfather.factions.base import Faction


class JesterNeutral(Faction):
    name = 'Neutral'
    id = 'neutral.jester'
    win_con = 'Get lynched.'

    @property
    def category_name(self):
        return 'Neutral'

    def has_won_independent(self, player: Player):
        if not player.is_alive and player.death_reason.startswith('lynched'):
            return True
        return False
