from game import Game, Player
from factions import Faction


class SurvivorNeutral(Faction):
    name = 'Survivor'
    id = 'neutral.survivor'
    win_con = 'Live until the end of the game.'

    def has_won_individual(self, player: Player):
        return player.alive
