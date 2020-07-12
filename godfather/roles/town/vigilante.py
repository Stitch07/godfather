from godfather.roles.mixins import SingleAction, Shooter
from godfather.game.types import Priority

DESCRIPTION = 'You may shoot someone every night. If you shoot a townie, you will die of guilt the next night.'


class Vigilante(Shooter, SingleAction):
    def __init__(self):
        super().__init__(name='Vigilante', role_id='vig', description=DESCRIPTION)
        self.guilty = False
        self.bullets = 3  # vigs only get 3 shots

    async def on_night(self, bot, player, game):
        if self.guilty:
            await player.user.send('You threw away your gun in guilt.')
            game.night_actions.add_action({
                'action': self.action,
                'player': player,
                'target': player,
                'priority': Priority.VIGI_SUICIDE,
                'can_block': False,
                'can_transport': False
            })
        else:
            await super().on_night(bot, player, game)

    def can_do_action(self, _game):
        if self.guilty:
            return False, ''
        if self.bullets <= 0:
            return False, 'You ran out of bullets!'
        return True, ''

    async def tear_down(self, actions, player, target):
        record = actions.record[target.user.id]['nightkill']
        success = record['result'] and player in record['by']

        if success and target.faction.id == 'town':
            self.guilty = True
        if not success:
            return await player.user.send('Your target was too strong to kill!')
        await target.user.send('You were shot by a Vigilante. You have died!')
