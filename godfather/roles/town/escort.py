from godfather.roles.mixins import SingleAction

DESCRIPTION = 'You may roleblock somebody each night.'


class Escort(SingleAction):
    def __init__(self):
        super().__init__(name='Escort', role_id='escort', description=DESCRIPTION)
        self.action = 'block'
        self.action_gerund = 'blocking'
        self.action_priority = 3  # doesn't matter here
        self.action_text = 'roleblock a player'

    async def run_action(self, game, night_record, player, target):
        # night actions specially resolve roleblocks, so we don't do anything here
        pass

    async def after_action(self, player, target, night_record):
        record = night_record[target.user.id]['roleblock']
        success = record['result'] and player.user.id in record['by']

        if success:
            await target.user.send('Somebody occupied your night. You were roleblocked!')
