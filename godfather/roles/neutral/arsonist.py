from godfather.roles.base import Role
from godfather.errors import PhaseChangeError

DESCRIPTION = 'You may douse someone every night, and then ignite all your doused targets.'


class Arsonist(Role):
    def __init__(self):
        super().__init__(name='Arsonist', role_id='arsonist', description=DESCRIPTION)
        self.action = ['douse', 'ignite']
        self.doused = set()
        self.ignited = False

    def can_do_action(self, command):
        if command == 'ignite' and len(self.doused) == 0:
            return False, "You haven't doused anyone to ignite yet!"
        return True, ''

    def can_target(self, player, target):
        if target in self.doused:
            return False, 'You have already doused {}'.format(target.user)
        return True, ''

    async def on_night(self, bot, player, game):
        output = f'It is now night {game.cycle}. Use the {bot.command_prefix}douse command to douse a player. ' \
            + f'Use {bot.command_prefix}ignite to douse all ignited targets.\n'
        output += f'```diff\n{game.show_players(codeblock=True)}```'
        await player.user.send(output)

    async def on_pm_command(self, ctx, game, player, args):
        if self.ignited:
            # already ignited last time, let's remove everything now
            self.doused.clear()
            self.ignited = False
        command = args.pop(0)
        can_do, reason = self.can_do_action(command)
        if not can_do:
            return await ctx.send(f'You cannot use your action today. {reason}')

        args = ' '.join(args)

        if command == 'noaction':
            for action in game.night_actions.actions:
                if action['player'].user.id == player.user.id:
                    game.night_actions.actions.remove(action)

            for action in game.night_actions.actions:
                if action['player'].user.id == player.user.id:
                    game.night_actions.actions.remove(action)

            game.night_actions.add_action({
                'action': None,
                'player': player,
                'priority': 0
            })
            if len(game.filter_players(action_only=True)) == len(game.night_actions.actions):
                await game.increment_phase(ctx.bot)
            return await ctx.send('You decided to stay home tonight.')

        if command == 'ignite':
            for target in self.doused:
                if not target.alive:
                    continue
                game.night_actions.add_action({
                    'action': 'ignite',
                    'player': player,
                    'target': target,
                    'priority': 3,
                    'can_block': False,
                    'can_transport': False
                })
            self.ignited = True
            await ctx.send('You are igniting your doused targets today.')
            total_actions = len(game.filter_players(action_only=True))
            expected_total = total_actions + len(self.doused) - 1
            if expected_total == len(game.night_actions.actions):
                try:
                    await game.increment_phase(ctx.bot)
                except Exception as exc:
                    raise PhaseChangeError(None, *exc.args)
            return

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

        for action in game.night_actions.actions:
            if action['player'].user.id == player.user.id:
                game.night_actions.actions.remove(action)

        game.night_actions.add_action({
            'action': 'douse',
            'player': player,
            'target': target_pl,
            'priority': 1,
            'can_block': True,
            'can_transport': True
        })
        await ctx.send(f'You are dousing {target} tonight.')

        if len(game.filter_players(action_only=True)) == len(game.night_actions.actions):
            try:
                await game.increment_phase(ctx.bot)
            except Exception as exc:
                raise PhaseChangeError(None, *exc.args)

    async def run_action(self, _game, night_record, player, target):
        if not self.ignited:
            # just dousing here
            self.doused.add(target)
            return

        # igniting everyone here
        pl_record = night_record[target.user.id]
        pl_record['nightkill']['result'] = True
        pl_record['nightkill']['by'].append(player)

    async def after_action(self, player, target, night_record):
        # nothing for dousing
        if not self.ignited:
            return
        record = night_record[target.user.id]['nightkill']
        success = record['result'] and player in record['by']

        if success:
            await target.user.send('You were ignited by an arsonist. You have died!')
