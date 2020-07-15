import typing
from discord import Member
from .types import night_record


class NightActions(list):
    """This class resolves and accepts night actions, abstracting all logic from Games.
    Night actions are first accepted in a list. Each action has the following attributes:

    1. action: The action text sent
    2. player: The player performing the action
    3. target: The target, if any
    4. priority: An integer determining which actions are processed first.

    During action resolution, a dictionary of player "records" is kept, and continously
    updated as every action is processed. A record is a dictionary with the attributes:

    1. result: Whether the action was successful.
    2. by: An array of roles that were responsible for this action.
    """

    def __init__(self, game):
        super().__init__()
        self.game = game
        self.record = night_record
        self.framed_players = []
        self.record.clear()

    def reset(self):
        self.clear()
        self.framed_players.clear()
        self.record.clear()

    def add_action(self, action):
        self.append(action)

    async def resolve(self) -> typing.List[Member]:
        # sort by ascending priorities
        self.sort(key=lambda action: action['priority'])

        # run setUp for every role first
        for action in self:
            # noaction, ignore
            if action['action'] is None:
                self.remove(action)
                continue
            player = action['player']
            # NoTarget mixin sets target to None
            target = action.get('target', None)
            await player.role.set_up(self, player, target)

        # run_action runs the actual logic of the role's action (eg: Vig shooting a player)
        for action in self:
            player = action['player']
            target = action.get('target', None)
            if action['action'] is None:
                self.remove(action)
                continue
            if not target.user.id == player.user.id:
                await target.visit(player, self)
            await player.role.run_action(self, player, target)

         # tear_down is for roles to reset states initialized in set_up, report action success/failure
        for action in self:
            player = action['player']
            target = action.get('target', None)
            if action['action'] is None:
                self.remove(action)
                continue
            await player.role.tear_down(self, player, target)

        # figure out which players died
        dead_players = []
        for pl_id, record in self.record.items():
            if record['nightkill']['result']:
                nked_pl = self.game.players.filter(pl_id=pl_id)[0]
                await nked_pl.remove(self.game, f'killed N{self.game.cycle}')
                dead_players.append(nked_pl)

        return dead_players
