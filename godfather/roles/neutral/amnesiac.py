import copy
from godfather.roles.mixins import SingleAction
from godfather.factions import AmnesiacNeutral
from godfather.game.types import Priority

DESCRIPTION = 'You may remember who you were by selecting a dead player.'


class Amnesiac(SingleAction):
    name = 'Amnesiac'
    description = DESCRIPTION

    def __init__(self):
        super().__init__()
        self.faction = AmnesiacNeutral()
        self.action = 'remember'
        self.action_gerund = 'remembering'
        self.action_priority = Priority.SURVIVOR
        self.action_text = 'remember your role.'
        self.categories.append('Neutral Benign')

    async def tear_down(self, actions, player, target):
        new_role = copy.deepcopy(target.role)
        player.previous_roles.append(player.role)
        player.role = new_role
        await player.user.send('You have remembered that you were a {}!'.format(new_role))
        if player.role.faction.informed:
            teammates = actions.game.players.filter(
                faction=player.role.faction.id)
            if len(teammates) > 1:
                await player.user.send(
                    f'Your team consists of: {", ".join(map(lambda pl: pl.user.name, teammates))}'
                )
        await actions.game.channel.send('An Amnesiac has remembered that they were a **{}**'.format(new_role))

    def can_target(self, player, target):
        if target.is_alive:
            return False, 'You can only remember dead roles.'
        if target.user.id == player.user.id:
            return False, f'As a {self.display_role()}, you cannot self target.'
        return True, ''
