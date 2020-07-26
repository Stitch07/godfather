from godfather.roles.mixins import Townie, SingleAction
from godfather.game.types import Priority

DESCRIPTION = 'You may revive one dead townie.'


class Retributionist(Townie, SingleAction):
    """
    A powerful mystic that can revive the dead.

    - Win Condition: Lynch every evildoer

    + Abilities:
    + You may revive one dead townie per game. 
    """
    name = 'Retributionist'
    description = DESCRIPTION
    unique = False

    def __init__(self):
        super().__init__()
        self.action = 'revive'
        self.action_gerund = 'reviving'
        self.action_priority = Priority.RETRIBUTIONIST
        self.action_text = 'revive a dead townie'
        self.has_revived = False
        self.categories.append('Town Support')

    async def tear_down(self, actions, _player, target):
        target.is_alive = True
        target.death_reason = ''
        target.is_revived = True
        target.revived_on = actions.game.cycle
        self.has_revived = True
        await actions.game.channel.send('**{}** was resurrected back to life!'.format(target.user))
        await target.user.send('You were revived by a Retributionist!')

    def can_do_action(self, _game):
        if self.has_revived:
            return False, 'You can only revive one player.'
        return True, ''

    def can_target(self, player, target):
        if target.is_alive or target.role.faction.name != 'Town':
            return False, 'You can only revive dead townies.'
        if target.role.cleaned:
            return False, 'You cannot revive cleaned players.'
        return True, ''
