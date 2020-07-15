from godfather.roles.mixins import SingleAction, Townie
from godfather.game.types import Attack, Priority

DESCRIPTION = 'You may heal guard someone every night.'


class Bodyguard(Townie, SingleAction):
    """
    An ex-army soldier who now protects people for a living.

    - Win Condition: lynch every criminal and evildoer

    + Abilities: Protect a player from direct attacks at night.
    + If your target is attacked, then you and the visitor will fight to the death, if you successfully protect someone you can still be healed.
    """
    name = 'Bodyguard'
    description = DESCRIPTION

    def __init__(self):
        super().__init__()
        self.action = 'guard'
        self.action_gerund = 'guarding'
        self.action_priority = Priority.BODYGUARD
        self.action_text = 'guard a player'
        self.can_self_target = True  # one self-heal allowed
        self.categories.append('Town Protective')

    async def run_action(self, actions, player, target):
        pl_record = actions.record[target.user.id]
        # BG defenses are Powerful
        if pl_record['nightkill']['result'] and pl_record['nightkill']['type'] < Attack.UNSTOPPABLE:
            # kill the attacker
            attacker = pl_record['nightkill']['by'].pop()
            await attacker.user.send('You were killed by a bodyguard. You have died!')
            actions.record[attacker.user.id]['nightkill']['result'] = True
            actions.record[attacker.user.id]['nightkill']['type'] = Attack.POWERFUL
            actions.record[attacker.user.id]['nightkill']['by'].append(player)

            # kill the bg
            actions.record[player.user.id]['nightkill']['result'] = True

            pl_record['nightkill']['result'] = False
            pl_record['nightkill']['by'] = []
            pl_record['guard']['result'] = True
            pl_record['guard']['by'].append(player.user.id)

    async def tear_down(self, actions, player, target):
        record = actions.record[target.user.id]['guard']
        success = record['result'] and player.user.id in record['by']

        if success:
            await target.user.send('You were attacked but somebody fought off your attacker!')
