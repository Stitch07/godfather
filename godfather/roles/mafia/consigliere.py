from godfather.roles.mixins import SingleAction, MafiaMember
from godfather.game.types import Priority

DESCRIPTION = 'You may check one person for their exact role each night'


class Consigliere(MafiaMember, SingleAction):
    name = 'Consigliere'
    description = DESCRIPTION

    def __init__(self):
        super().__init__()
        self.action = 'check'
        self.action_gerund = 'checking'
        self.action_priority = Priority.CONSIG
        self.action_text = 'check a player'

    async def tear_down(self, actions, player, target):
        await player.user.send(f'Your target must be a **{target.role.name}**.')
