class Shooter:
    def __init__(self, *args, **kwargs):
        self.action = 'shoot'
        self.action_gerund = 'shooting'
        self.action_priority = 1  # placeholder
        self.action_text = 'shoot a player'
        super().__init__(*args, **kwargs)

    def run_action(self, night_record, player, target):
        pl_record = night_record[target.user.id]
        pl_record['nightkill']['result'] = True
        pl_record['nightkill']['by'].append(player.user.id)
