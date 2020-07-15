from godfather.roles.mixins import SingleAction, MafiaMember
from godfather.game.types import Priority

DESCRIPTION = 'You may frame a player and make them appear suspicious.'


class Framer(MafiaMember, SingleAction):
    """
    A skilled counterfeiter who manipulates information.

    - Win condition: Kill anyone who will not submit to the mafia.

    + Abilities: If your target is investigated, they will appear as suspicious to the town investigators.
    + choose one person at night to frame them as a suspicious townie.
    + If there are no mafia roles left who are capable of killing then you will become the goon.
    """
    name = 'Framer'
    description = DESCRIPTION

    def __init__(self):
        super().__init__()
        self.action = 'frame'
        self.action_gerund = 'framing'
        self.action_priority = Priority.FRAMER
        self.action_text = 'frame a player'
        self.categories.append('Mafia Deception')

    async def run_action(self, actions, player, target):
        actions.framed_players.append(target)
