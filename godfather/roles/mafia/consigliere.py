from godfather.roles.mixins import SingleAction, MafiaMember
from godfather.game.types import Priority

DESCRIPTION = 'You may check one person for their exact role each night'


class Consigliere(MafiaMember, SingleAction):
    """
    A corrupted investigator who has been bribed to gather information for Mafia.

    - Win Condition: Kill anyone who will not submit to the Mafia.

    + Abilities: Check one person for their exact role each night.
    + If there are no mafia roles left who are capable of killing then you will become the goon.
    + You can talk with other mafia members.
    """
    name = 'Consigliere'
    description = DESCRIPTION

    def __init__(self):
        super().__init__()
        self.action = 'check'
        self.action_gerund = 'checking'
        self.action_priority = Priority.CONSIG
        self.action_text = 'check a player'
        self.categories.append('Mafia Support')

    async def tear_down(self, actions, player, target):
        await player.user.send(f'Your target must be a **{target.role.name}**.')
