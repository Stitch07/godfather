from godfather.roles.mixins import SingleAction

DESCRIPTION = 'You may check one person for their exact role each night'


class Consigliere(SingleAction):
    def __init__(self):
        super().__init__(name='Consigliere', role_id='consigliere', description=DESCRIPTION)
        self.action = 'check'
        self.action_gerund = 'checking'
        self.action_priority = 2
        self.action_text = 'check a player'

    async def tear_down(self, actions, player, target):
        await player.user.send(f'Your target must be a **{target.role.name}**.')
