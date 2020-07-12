from godfather.roles.mixins import SingleAction
from godfather.game.types import Defense

DESCRIPTION = 'You may stab someone every night.'


class SerialKiller(SingleAction):
    def __init__(self):
        super().__init__(name='Serial Killer', role_id='serial_killer', description=DESCRIPTION)
        self.action = 'stab'
        self.action_gerund = 'stabbing'
        self.action_priority = 1  # placeholder
        self.action_text = 'stab a player'

    def bulletproof(self):
        return True

    async def run_action(self, actions, player, target):
        if target.defense() >= Defense.BASIC:
            return
        pl_record = actions[target.user.id]
        pl_record['nightkill']['result'] = True
        pl_record['nightkill']['by'].append(player)

    async def tear_down(self, actions, player, target):
        record = actions.record[target.user.id]['nightkill']
        success = record['result'] and player in record['by']

        if not success:
            return await player.user.send('Your target was too strong to kill!')
        await target.user.send('You were stabbed by a Serial Killer. You have died!')
