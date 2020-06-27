from roles import Role


class NoTarget(Role):

    async def on_night(self, bot, player, game):
        output = f'It is now night {game.cycle}. Use the {bot.command_prefix}{self.action} command to {self.action_text}. ' \
            + f'Use {bot.command_prefix}cancel to cancel.\n'
        await player.user.send(output)

    async def on_pm_command_notarget(self, ctx, game, player, command):
        can_do, reason = self.can_do_action(game)
        if not can_do:
            return await ctx.send(f'You cannot use your action today. {reason}')

        if command == 'noaction':
            for action in game.night_actions.actions:
                if action['player'].user.id == player.user.id:
                    game.night_actions.actions.remove(action)

            game.night_actions.add_action({
                'action': None,
                'player': player,
                'priority': 0
            })
            return await ctx.send('You decided to stay home tonight.')
