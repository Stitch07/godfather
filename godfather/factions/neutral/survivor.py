from godfather.game import Player
from godfather.factions.base import Faction


class SurvivorNeutral(Faction):
    name = 'Survivor'
    id = 'neutral.survivor'
    win_con = 'Live until the end of the game.'

    @property
    def category_name(self):
        return 'Neutral'

    def has_won_independent(self, player: Player):
        return player.is_alive
