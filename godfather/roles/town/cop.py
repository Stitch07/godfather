from godfather.roles.mixins import SingleAction

DESCRIPTION = 'You may interrogate one person each night for suspicious activity.'


class Cop(SingleAction):
    def __init__(self):
        super().__init__(name='Cop', role_id='cop', description=DESCRIPTION)
        self.action = 'check'
        self.action_gerund = 'checking'
        self.action_priority = 2
        self.action_text = 'check a player'

    # this ensures all cop modifiers show up as regular Cops
    def display_role(self):
        return 'Cop'

    async def tear_down(self, actions, player, target):
        # TODO: framer check here
        innocence = self.result_modifier(target.innocent)
        await player.user.send(f"Your target is {'innocent' if innocence else 'suspicious'}.")

    def result_modifier(self, innocence):
        return innocence
