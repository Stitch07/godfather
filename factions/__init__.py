from .base import Faction
from .town import Town
from .mafia import Mafia
from factions.neutral.jester import JesterNeutral
from factions.neutral.serial_killer import SerialKillerNeutral

factions = {
    'town': Town,
    'mafia': Mafia,
    'neutral.jester': JesterNeutral,
    'neutral.serialkiller': SerialKillerNeutral
}
