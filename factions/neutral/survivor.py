from game import Game, Player
from factions import Faction


class SurvivorNeutral(Faction):
    name = 'Survivor'
    id = 'neutral.survivor'
    win_con = 'Live until the end of the game.'

    def has_won_independent(self, player: Player):
        return player.alive
