from game import Game, Player
from factions import Faction


class JesterNeutral(Faction):
    name = 'Neutral'
    id = 'neutral.jester'
    win_con = 'Get lynched.'

    def has_won_individual(self, player: Player):
        if not player.alive and player.death_reason.startswith('Lynched'):
            return True
        return False
