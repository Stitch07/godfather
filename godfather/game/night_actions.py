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
        for roleblock in filter(lambda action: action['action'] == 'block', self.actions):
            target = roleblock['target']
            roleblocker = roleblock['player']
            for action in self.actions:
                if action['player'].user.id == target.user.id:
                    if 'can_block' in action and not action['can_block']:
                        continue
                    # escort blocking serial-killers gets killed instead
                    if target.role.name == 'Serial Killer':
                        action['target'] = roleblocker
                        continue
                    # remove the action, getting roleblocked
                    self.actions.remove(action)
                    self.record[target.user.id]['roleblock']['result'] = True
                    self.record[target.user.id]['roleblock']['by'].append(
                        roleblocker.user.id)

        # if the mafioso isn't roleblocked, remove GF action
        if any(filter(lambda action: action['player'].role.name == 'Goon', self.actions)):
            for action in self.actions:
                if action['player'].role.name == 'Godfather':
                    self.actions.remove(action)

        # sort by ascending priorities
        self.actions.sort(key=lambda action: action['priority'])
        for action in self.actions:
            # noaction, just ignore
            if action['action'] is None:
                continue
            player = action['player']
            target = action['target']
            if not target.user.id == player.user.id:
                await target.visit(player, self.record)
            await action['player'].role.run_action(self.game, self.record, player, target)

         # after action clean-up
        for action in self.actions:
            if action['action'] is None:
                continue
            player = action['player']
            target = action['target']
            await player.role.after_action(player, target, self.record)

        # figure out which players died
        dead_players = []
        for pl_id, record in self.record.items():
            if record['nightkill']['result']:
                nked_pl = self.game.filter_players(pl_id=pl_id)[0]
                await nked_pl.remove(self.game, f'killed N{self.game.cycle}')
                dead_players.append(nked_pl)

        return dead_players
