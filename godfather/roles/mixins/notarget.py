from godfather.roles.base import Role
from godfather.errors import PhaseChangeError


class NoTarget(Role):
    action = ''
    action_text = ''
    can_block = True
    can_transport = True

    async def on_night(self, bot, player, game):
        output = f'It is now night {game.cycle}. Use the {bot.command_prefix}{self.action} command to {self.action_text}. ' \
            + f'Use {bot.command_prefix}noaction to stay home.\n'
        await player.user.send(output)

    async def set_up(self, actions, player, target):
        pass

    async def run_action(self, actions, player, target):
        pass

    async def tear_down(self, actions, player, target):
        pass

    async def on_pm_command(self, ctx, game, player, args):
        command = args[0]
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
            return await ctx.send('You decided to stay home tonight.')

        game.night_actions.add_action({
            'action': self.action,
            'player': player,
            'priority': self.action_priority,
            'target': player,
            'can_block': self.can_block,
            'can_transport': self.can_transport
        })
        await ctx.send('You have decided to {} tonight.'.format(self.action))

        if len(game.players.filter(action_only=True)) == len(game.night_actions):
            try:
                await game.increment_phase()
            except Exception as exc:
                raise PhaseChangeError(None, *exc.args)
