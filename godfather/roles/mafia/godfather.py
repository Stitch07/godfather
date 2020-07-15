from godfather.roles.mixins import SingleAction, Shooter, MafiaMember
from godfather.game.types import Defense

DESCRIPTION = 'You can order the mafioso to shoot someone every night.'


class Godfather(MafiaMember, Shooter, SingleAction):
    """
    The leader of organized crime.

    - Win Condition: Kill anyone that will not submit to the Mafia.

    + Abilities:
    + You may order the Goon to attack your target.
    + If there is no Goon/the Goon is roleblocked, you will attack the target instead.
    + You have a Basic Defense, and will appear as innocent to the Cop.
    """
    name = 'Godfather'
    description = DESCRIPTION
    unique = True

    def __init__(self):
        super().__init__()
        self.action = 'shoot'
        self.action_gerund = 'shooting'
        self.action_text = 'shoot a player'
        self.categories.append('Mafia Killing')

    def defense(self):
        return Defense.BASIC

    def innocence_modifier(self):
        return True

    async def set_up(self, actions, player, target):
        # if the goon hasn't been roleblocked, we could safely remove GFs kill
        if any(filter(lambda action: action['player'].role.name == 'Goon', actions)):
            for action in actions:
                if action['player'].user.id == player.user.id:
                    actions.remove(action)

    async def tear_down(self, actions, player, target):
        record = actions.record[target.user.id]['nightkill']
        success = record['result'] and player in record['by']

        if not success:
            return await player.user.send('Your target was too strong to kill!')
        await target.user.send('You were shot by the Godfather. You have died!')
