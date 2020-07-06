from godfather.factions.neutral.jester import JesterNeutral
from godfather.factions.neutral.serial_killer import SerialKillerNeutral
from godfather.factions.neutral.survivor import SurvivorNeutral
from godfather.factions.neutral.arsonist import ArsonistNeutral
from .base import Faction
from .town import Town
from .mafia import Mafia

factions = {
    'town': Town,
    'mafia': Mafia,
    'neutral.jester': JesterNeutral,
    'neutral.serialkiller': SerialKillerNeutral,
    'neutral.survivor': SurvivorNeutral,
    'neutral.arsonist': ArsonistNeutral
}
