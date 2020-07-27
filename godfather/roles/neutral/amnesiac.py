import copy
from godfather.roles.mixins import SingleAction
from godfather.factions import AmnesiacNeutral
from godfather.game.types import Priority
from godfather.roles import all_roles

DESCRIPTION = 'You may remember who you were by selecting a dead player.'


class Amnesiac(SingleAction):
    """
    A trauma patient that does not remember who he was.

    - Win Condition: Remember who you were and complete that role's win condition.

    + Abilities:
    + When you choose a role it will be revealed to all players in the game.
    """
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

    async def set_up(self, actions, player, target):
        # if 2 amnesiacs remember a unique role at the same time, the first person to send actions actually remembers
        def filter_other_amne(action):
            return action['player'].role.name == 'Amnesiac' \
                and action['target'].role.unique \
                and action['player'].user.id != player.user.id

        if any(other_amnes := filter(filter_other_amne, actions)):
            for other_amne in other_amnes:
                actions.remove(other_amne)

    async def tear_down(self, actions, player, target):
        new_role = all_roles.get(target.role.name)
        player.previous_roles.append(player.role)
        player.role = new_role()
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
        if target.role.cleaned:
            return False, 'You cannot remember cleaned roles.'
        if target.role.unique and target.role.faction.name == 'Town':
            return False, 'You cannot remember unique town roles.'
        if target.user.id == player.user.id:
            return False, f'As a {self.display_role()}, you cannot self target.'
        return True, ''
