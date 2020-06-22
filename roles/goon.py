from roles.mixins import SingleAction, Shooter

DESCRIPTION = 'You may shoot someone every night.'


class Goon(SingleAction, Shooter):
    def __init__(self):
        super().__init__(name='Goon', role_id='goon', description=DESCRIPTION)

    async def after_action(self, player, target, night_record):
        record = night_record[target.user.id].get('nightkill')
        success = record['result'] and player.user.id in record['by']

        if not success:
            return await player.user.send('Your target was too strong to kill!')
        await target.user.send('You were shot by a Goon. You have died!')
