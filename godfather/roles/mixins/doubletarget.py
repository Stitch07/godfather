from godfather.roles.base import Role
from godfather.errors import PhaseChangeError
from godfather.game import Phase


class DoubleTarget(Role):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.can_block = True
        self.can_transport = True
        self.can_self_target = False
        self.can_visit = True

    async def on_night(self, bot, player, game):
        output = f'It is now night {game.cycle}. Use the {bot.global_prefix}{self.action} command to {self.action_text}. ' \
            + f'Use {bot.global_prefix}noaction to stay home.\n'
        output += f'```diff\n{game.players.show(codeblock=True)}```'
        await player.user.send(output)

    async def on_pm_command(self, ctx, game, player, args):
        command = args.pop(0)

        can_do, reason = self.can_do_action(game)
        if not can_do:
            return await ctx.send(f'You cannot use your action today. {reason}')

        if command == 'noaction':
            for action in game.night_actions:
                if action['player'].user.id == player.user.id:
                    game.night_actions.remove(action)

            game.night_actions.add_action({
                'action': None,
                'player': player,
                'priority': 0
            })
            if len(game.players.filter(action_only=True)) == len(game.night_actions):
                if not game.phase == Phase.STANDBY:
                    await game.increment_phase()
            return await ctx.send('You decided to stay home tonight.')

        targets = []
        if len(args) < 2:
            return await ctx.send('You have to specifiy 2 targets.')

        for arg in args[0:2]:
            if not arg.isdigit():
                return await ctx.send('Pick a valid number from the playerlist.')
            num = int(arg)
            if num > len(game.players):
                return await ctx.send(f'There are only {len(game.players)} playing.')
            target = game.players[num - 1]
            targets.append(target)

        for target in targets:
            can_target, reason = self.can_target(player, target)
            if not can_target:
                return await ctx.send(reason)

        target1, target2 = targets
        if target1 == target2:
            return await ctx.send('Pick 2 distinct targets.')

        for action in game.night_actions:
            if action['player'].user.id == player.user.id:
                game.night_actions.remove(action)

        game.night_actions.add_action({
            'action': self.action,
            'player': player,
            'target': targets,
            'priority': self.action_priority,
            'can_block': self.can_block,
            'can_transport': self.can_transport,
            'can_visit': self.can_visit
        })
        await ctx.send(f'You are {self.action_gerund} {" and ".join(map(lambda p: p.user.name, targets))} tonight.')

        if len(game.players.filter(action_only=True)) == len(game.night_actions):
            try:
                if not game.phase == Phase.STANDBY:
                    await game.increment_phase()
            except Exception as exc:
                raise PhaseChangeError(None, *exc.args)

    async def set_up(self, actions, player, target):
        pass

    async def run_action(self, actions, player, target):
        pass

    async def tear_down(self, actions, player, target):
        pass

    def can_do_action(self, _game):
        return True, ''

    def can_target(self, player, target):
        if not target.is_alive:
            return False, 'You cannot target dead players.'
        if target.user.id == player.user.id and not self.can_self_target:
            return False, f'As a {self.display_role()}, you cannot self target.'
        return True, ''
