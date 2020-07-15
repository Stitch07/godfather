from godfather.roles.mixins import SingleAction
from godfather.game.types import Attack, Defense, Priority
from godfather.factions import SerialKillerNeutral

DESCRIPTION = 'You may stab someone every night.'


class SerialKiller(SingleAction):
    name = 'Serial Killer'
    description = DESCRIPTION

    def __init__(self):
        super().__init__()
        self.faction = SerialKillerNeutral()
        self.action = 'stab'
        self.action_gerund = 'stabbing'
        self.action_priority = Priority.SERIAL_KILLER
        self.action_text = 'stab a player'

    def defense(self):
        return Defense.BASIC

    async def run_action(self, actions, player, target):
        if target.role.defense() >= Defense.BASIC:
            return
        pl_record = actions.record[target.user.id]
        pl_record['nightkill']['result'] = True
        pl_record['nightkill']['type'] = Attack.BASIC
        pl_record['nightkill']['by'].append(player)

    async def tear_down(self, actions, player, target):
        record = actions.record[target.user.id]['nightkill']
        success = record['result'] and player in record['by']

        if not success:
            return await player.user.send('Your target was too strong to kill!')
        await target.user.send('You were stabbed by a Serial Killer. You have died!')
