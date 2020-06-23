from roles.mixins import SingleAction

DESCRIPTION = 'You may heal guard someone every night.'


class Bodyguard(SingleAction):
    def __init__(self):
        super().__init__(name='Bodyguard', role_id='bodyguard', description=DESCRIPTION)
        self.action = 'guard'
        self.action_gerund = 'guarding'
        self.action_priority = 2
        self.action_text = 'guard a player'
        self.can_self_target = True  # one self-heal allowed

    async def run_action(self, game, night_record, player, target):
        pl_record = night_record[target.user.id]
        if pl_record['nightkill']['result']:
            # kill the attacker
            attacker = pl_record['nightkill']['by'].pop()
            await attacker.user.send('You were killed by a bodyguard. You have died!')
            night_record[attacker.user.id]['nightkill']['result'] = True
            night_record[attacker.user.id]['nightkill']['by'].append(player)

            # kill the bg
            night_record[player.user.id]['nightkill']['result'] = True

            pl_record['nightkill']['result'] = False
            pl_record['nightkill']['by'] = []
            pl_record['guard']['result'] = True
            pl_record['guard']['by'].append(player.user.id)

    async def after_action(self, player, target, night_record):
        record = night_record[target.user.id]['guard']
        success = record['result'] and player.user.id in record['by']

        if success:
            await target.user.send('You were attacked but somebody fought off your attacker!')
