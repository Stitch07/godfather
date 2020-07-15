from godfather.roles.mixins import SingleAction, Townie
from godfather.game.types import Priority

DESCRIPTION = 'You may track one person at night to find out who they visited.'


class Tracker(Townie, SingleAction):
    """
    Belongs to a very respected tribe, he follows his prey to any destination.


    - Win Condition: lynch every criminal and evildoer

    + Abilities: Choose one person to track them at night, to see who they visit.
    + You will exactly know who your target visited at night, giving their exact name.
    """
    name = 'Tracker'
    description = DESCRIPTION

    def __init__(self):
        super().__init__()
        self.action = 'track'
        self.action_gerund = 'tracking'
        self.action_priority = Priority.TRACKER
        self.action_text = 'track a player'
        self.categories.append('Town Investigative')

    async def tear_down(self, actions, player, target):
        visited_players = [
            visited.user.name for visited in actions.game.players if target in visited.visitors]
        if len(visited_players) >= 0:
            await player.user.send('Your target visited {}.'.format(', '.join(visited_players)))
