from godfather.game import Game
from .base import Faction

# all factions that oppose the mafia, including town and competing evil
OPPOSING_FACTIONS = ['town', 'neutral.serialkiller']


class Mafia(Faction):
    # pylint: disable=too-few-public-methods
    name = 'Mafia'
    id = 'mafia'
    win_con = 'Kill all townies and competing evil factions.'
    informed = True

    def has_won(self, game: Game):
        def filter_opposing_power_roles(player):
            can_do, _ = player.role.can_do_action(game)
            return player.faction.id in OPPOSING_FACTIONS \
                and can_do \
                and player.alive

        # mafia win when they have majority and no opposing factions can disturb that
        # that is, 2 mafiosos should automatically win against 2 vanilla townies,
        # but the game should continue against a vigilante and a veteran
        alive_maf = len(game.filter_players(faction='mafia', alive=True))
        alive_opposing = len(
            [*filter(lambda pl: pl.faction.id in OPPOSING_FACTIONS and pl.alive, game.players)])
        alive_opposing_prs = len(
            [*filter(filter_opposing_power_roles, game.players)])
        return alive_maf > 0 \
            and alive_maf >= alive_opposing \
            and alive_opposing_prs == 0
