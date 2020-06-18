from .base import Faction
from .town import Town
from .mafia import Mafia
from factions.neutral.jester import JesterNeutral

factions = {
    'town': Town,
    'mafia': Mafia,
    'neutral.jester': JesterNeutral
}
