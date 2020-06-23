from .night_record import night_record


class NightActions:
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
        self.game = game
        self.actions = []
        self.record = night_record
        self.record.clear()

    def add_action(self, action):
        self.actions.append(action)

    def reset(self):
        self.actions = []
        self.record.clear()

    async def resolve(self) -> str:
        # handle roleblocks
        for rb in filter(lambda action: action['action'] == 'block', self.actions):
            target = rb['target']
            roleblocker = rb['player']
            for action in self.actions:
                if action['player'].user.id == target.user.id:
                    if 'rb_immune' in action and action['rb_immune']:
                        continue
                    # remove the action, getting roleblocked
                    self.actions.remove(action)
                    self.record[target.user.id]['roleblock']['result'] = True
                    self.record[target.user.id]['roleblock']['by'].append(
                        roleblocker.user.id)

        # sort by ascending priorities
        self.actions.sort(key=lambda action: action['priority'])
        for action in self.actions:
            player = action['player']
            target = action['target']
            await action['player'].role.run_action(self.game, self.record, player, target)

        # figure out which players died
        dead_players = []
        for pl_id, record in self.record.items():
            if record['nightkill']['result']:
                nked_pl = self.game.filter_players(pl_id=pl_id)[0]
                # TODO: check for bulletproof here?
                await nked_pl.remove(self.game, f'killed N{self.game.cycle}')
                dead_players.append(nked_pl)

         # after action clean-up
        for action in self.actions:
            player = action['player']
            target = action['target']
            await player.role.after_action(player, target, self.record)

        announcement = ''
        for player in dead_players:
            announcement = announcement + \
                f'{player.user.name} died last night. They were a {player.full_role}\n'
        return announcement
