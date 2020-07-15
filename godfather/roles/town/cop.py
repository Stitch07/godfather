from godfather.roles.mixins import SingleAction, Townie
from godfather.game.types import Priority

DESCRIPTION = 'You may interrogate one person each night for suspicious activity.'


class Cop(Townie, SingleAction):
    name = 'Cop'
    description = DESCRIPTION

    def __init__(self):
        super().__init__()
        self.action = 'check'
        self.action_gerund = 'checking'
        self.action_priority = Priority.COP
        self.action_text = 'check a player'

    # this ensures all cop modifiers show up as regular Cops
    def display_role(self):
        return 'Cop'

    async def tear_down(self, actions, player, target):
        innocence = self.result_modifier(target.innocent)
        if target in actions.framed_players:
            innocence = False
        await player.user.send(f"Your target is {'innocent' if innocence else 'suspicious'}.")

    def result_modifier(self, innocence):
        return innocence
