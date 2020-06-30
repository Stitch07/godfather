from godfather.roles.mixins import SingleAction, Shooter, MafiaMember

DESCRIPTION = 'You may shoot someone every night.'


class Goon(SingleAction, Shooter, MafiaMember):
    def __init__(self):
        super().__init__(name='Goon', role_id='goon', description=DESCRIPTION)

    async def after_action(self, player, target, night_record):
        record = night_record[target.user.id]['nightkill']
        success = record['result'] and player in record['by']

        if not success:
            return await player.user.send('Your target was too strong to kill!')
        await target.user.send('You were shot by a Goon. You have died!')

    def can_do_action(self, game):
        if game.setup['name'] == 'dethy' and game.cycle == 1:
            return False, 'You cannot shoot N1 in Dethy.'
        return super().can_do_action(game)
