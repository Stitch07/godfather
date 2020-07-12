from godfather.roles.mixins import SingleAction

DESCRIPTION = 'You may roleblock somebody each night.'


class Escort(SingleAction):
    def __init__(self):
        super().__init__(name='Escort', role_id='escort', description=DESCRIPTION)
        self.action = 'block'
        self.action_gerund = 'blocking'
        self.action_priority = 1
        self.action_text = 'roleblock a player'

    async def set_up(self, actions, player, target):
        for action in filter(lambda act: act['player'] == target, actions):
            target = action['player']
            # special cases such as vigilante committing suicide with guilt cannot be roleblocked
            if 'can_block' in action and not action['can_block']:
                continue
            # escorts blocking SKs get killed instead
            if target.role.name == 'Serial Killer':
                action['target'] = player
                continue
            # remove the action, getting roleblocked
            actions.remove(action)
            actions.record[target.user.id]['roleblock']['result'] = True
            actions.record[target.user.id]['roleblock']['by'].append(
                player.user.id)

    async def tear_down(self, actions, player, target):
        record = actions.record[target.user.id]['roleblock']
        success = record['result'] and player.user.id in record['by']

        if success:
            await target.user.send('Somebody occupied your night. You were roleblocked!')
