from roles.mixins import SingleAction

DESCRIPTION = 'You may heal someone every night, and self-heal once.'


class Doctor(SingleAction):
    def __init__(self):
        super().__init__(name='Doctor', role_id='doctor', description=DESCRIPTION)
        self.action = 'heal'
        self.action_gerund = 'healing'
        self.action_priority = 2
        self.action_text = 'heal a player'
        self.can_self_target = True  # one self-heal allowed

    def run_action(self, night_record, player, target):
        pl_record = night_record[target.user.id]
        if pl_record['nightkill']['result']:
            pl_record['nightkill']['result'] = False
            pl_record['nightkill']['by'] = []
            pl_record['heal']['result'] = True
            pl_record['heal']['by'].append(player.user.id)

    async def after_action(self, player, target, night_record):
        record = night_record[target.user.id].get('heal')
        success = record['result'] and player.user.id in record['by']

        if success:
            await target.user.send('You were attacked but nursed back to health!')
