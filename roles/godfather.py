from roles.mixins import SingleAction, Shooter, MafiaMember

DESCRIPTION = 'You can order the mafioso to shoot someone every night.'


class Godfather(SingleAction, Shooter, MafiaMember):
    def __init__(self):
        super().__init__(name='Godfather', role_id='godfather', description=DESCRIPTION)
        self.action = 'shoot'
        self.action_gerund = 'shooting'
        self.action_priority = 1
        self.action_text = 'shoot a player'

    def bulletproof(self):
        return True

    def innocence_modifier(self):
        return True

    async def run_action(self, game, night_record, player, target):
        def filter_mafioso(action):
            return action['player'].role.name == 'Goon'
        mafioso_action = filter(filter_mafioso, game.night_actions.actions)
        if any(mafioso_action):
            return
        await super().run_action(game, night_record, player, target)

    async def after_action(self, player, target, night_record):
        record = night_record[target.user.id].get('nightkill')
        success = record['result'] and player in record['by']

        if not success:
            return await player.user.send('Your target was too strong to kill!')
        await target.user.send('You were shot by the Godfather. You have died!')
