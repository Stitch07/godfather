class Shooter:
    def __init__(self, *args, **kwargs):
        self.action = 'shoot'
        self.action_gerund = 'shooting'
        self.action_priority = 1  # placeholder
        self.action_text = 'shoot a player'
        super().__init__(*args, **kwargs)

    async def run_action(self, game, night_record, player, target):
        if hasattr(player.role, 'bullets'):
            player.role.bullets -= 1
        if hasattr(target.role, 'bulletproof') and target.role.bulletproof():
            return
        pl_record = night_record[target.user.id]
        pl_record['nightkill']['result'] = True
        pl_record['nightkill']['by'].append(player)
