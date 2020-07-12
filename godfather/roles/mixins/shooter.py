from godfather.game.types import Attack, Defense, Priority


class Shooter:
    def __init__(self, *args, **kwargs):
        self.action = 'shoot'
        self.action_gerund = 'shooting'
        self.action_priority = Priority.SHOOTER
        self.action_text = 'shoot a player'
        super().__init__(*args, **kwargs)

    async def run_action(self, actions, player, target):
        if hasattr(player.role, 'bullets'):
            player.role.bullets -= 1
        if target.role.defense() > Defense.NONE:
            return
        pl_record = actions.record[target.user.id]
        pl_record['nightkill']['result'] = True
        pl_record['nightkill']['type'] = Attack.BASIC
        pl_record['nightkill']['by'].append(player)
