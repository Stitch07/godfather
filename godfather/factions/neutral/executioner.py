from godfather.game import Player
from godfather.factions.base import Faction


class ExecutionerNeutral(Faction):
    name = 'Executioner'
    id = 'neutral.executioner'
    win_con = 'Get your target lynched at any cost.'

    @property
    def category_name(self):
        return 'Neutral'

    def has_won_independent(self, player: Player):
        if player.is_alive and not player.target.is_alive and player.target.death_reason.startswith('lynched'):
            return True
        return False
