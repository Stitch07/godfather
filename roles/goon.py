from roles.mixins import SingleAction

DESCRIPTION = 'You may shoot someone every night.'


class Goon(SingleAction):
    def __init__(self):
        super().__init__(name='Goon', role_id='goon', description=DESCRIPTION)
        self.action = 'shoot'
        self.action_gerund = 'shooting'
        self.action_priority = 1  # placeholder
        self.action_text = 'shoot a player'

    def run_action(self, night_record, player, target):
        pl_record = night_record[target.user.id]
        pl_record['nightkill']['result'] = True
        pl_record['nightkill']['by'].append(player.user.id)

    async def after_action(self, player, target, night_record):
        record = night_record[target.user.id].get('nightkill')
        success = record['result'] and player.user.id in record['by']

        if not success:
            return await player.user.send('Your target was too strong to kill!')
        await target.user.send('You were shot by a Goon. You have died!')
