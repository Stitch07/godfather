from godfather.roles.mixins import SingleAction
from godfather.game.types import Attack

DESCRIPTION = 'You may heal someone every night, and self-heal once.'


class Doctor(SingleAction):
    def __init__(self):
        super().__init__(name='Doctor', role_id='doctor', description=DESCRIPTION)
        self.action = 'heal'
        self.action_gerund = 'healing'
        self.action_priority = 2
        self.action_text = 'heal a player'
        self.can_self_target = True  # one self-heal allowed

    async def run_action(self, actions, player, target):
        pl_record = actions.record[target.user.id]
        if pl_record['nightkill']['result'] and pl_record['nightkill']['type'] < Attack.UNSTOPPABLE:
            pl_record['nightkill']['result'] = False
            pl_record['nightkill']['by'] = []
            pl_record['heal']['result'] = True
            pl_record['heal']['by'].append(player.user.id)

    async def tear_down(self, actions, player, target):
        record = actions.record[target.user.id]['heal']
        success = record['result'] and player.user.id in record['by']

        if success:
            await target.user.send('You were attacked but nursed back to health!')
