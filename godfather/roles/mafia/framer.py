from godfather.roles.mixins import SingleAction, MafiaMember
from godfather.game.types import Priority

DESCRIPTION = 'You may frame a player and make them appear suspicious.'


class Framer(MafiaMember, SingleAction):
    name = 'Framer'
    description = DESCRIPTION

    def __init__(self):
        super().__init__()
        self.action = 'frame'
        self.action_gerund = 'framing'
        self.action_priority = Priority.FRAMER
        self.action_text = 'frame a player'

    async def run_action(self, actions, player, target):
        actions.framed_players.append(target)
