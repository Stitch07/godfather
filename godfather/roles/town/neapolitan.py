from godfather.roles.mixins import SingleAction, Townie
from godfather.game.types import Priority

DESCRIPTION = 'You may investigate one person each night to determine whether or not they are a Town Vanilla.'


class Neapolitan(Townie, SingleAction):
    """
    Like a cop, but with less powerful investigations.

    - Win Condition: Lynch every criminal and evildoer

    + Abilities: Check if a target is or is not a Vanilla Town.
    + Your check cannot be modified by framing.
    """
    name = 'Neapolitan'
    description = DESCRIPTION

    def __init__(self):
        super().__init__()
        self.action = 'check'
        self.action_gerund = 'checking'
        self.action_priority = Priority.COP
        self.action_text = 'check a player'
        self.categories.remove('Random Town')

    async def tear_down(self, actions, player, target):
        await player.user.send(f"Your target is{' ' if target.display_role == 'Town Vanilla' else ' not '}a Town Vanilla.")
