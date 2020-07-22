from discord.ext import commands
from godfather.roles.base import Role
from godfather.errors import PhaseChangeError

conv = commands.MemberConverter()


class SingleAction(Role):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.can_block = True
        self.can_transport = True
        self.can_self_target = False

    async def on_night(self, bot, player, game):
        output = f'It is now night {game.cycle}. Use the {bot.command_prefix}{self.action} command to {self.action_text}. ' \
            + f'Use {bot.command_prefix}noaction to stay home.\n'
        output += f'```diff\n{game.players.show(codeblock=True)}```'
        await player.user.send(output)

    async def on_pm_command(self, ctx, game, player, args):
        command = args.pop(0)
        can_do, reason = self.can_do_action(game)
        if not can_do:
            return await ctx.send(f'You cannot use your action today. {reason}')

        args = ' '.join(args)

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
                await game.increment_phase()
            return await ctx.send('You decided to stay home tonight.')

        if not args.isdigit():
            return await ctx.send('Pick a valid number from the playerlist.')

        num = int(args)
        if num > len(game.players):
            return await ctx.send(f'There are only {len(game.players)} playing.')
        target_pl = game.players[num - 1]
        target = target_pl.user

        if target_pl is None:
            return await ctx.send('Invalid input')
        can_target, reason = self.can_target(player, target_pl)
        if not can_target:
            return await ctx.send(reason)

        for action in game.night_actions:
            if action['player'].user.id == player.user.id:
                game.night_actions.remove(action)

        # special godfather stuff
        if self.name == 'Godfather' and len(game.players.filter(role='Goon', is_alive=True)) > 0:
            goon = game.players.filter(role='Goon')[0]
            for action in game.night_actions:
                if action['player'].role.name == 'Goon':
                    game.night_actions.remove(action)

            game.night_actions.add_action({
                'action': self.action,
                'player': goon,
                'target': target_pl,
                'priority': self.action_priority,
                'can_block': self.can_block,
                'can_transport': self.can_transport
            })

        game.night_actions.add_action({
            'action': self.action,
            'player': player,
            'target': target_pl,
            'priority': self.action_priority,
            'can_block': self.can_block,
            'can_transport': self.can_transport
        })
        await ctx.send(f'You are {self.action_gerund} {target} tonight.')

        if len(game.players.filter(action_only=True)) == len(game.night_actions):
            try:
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
