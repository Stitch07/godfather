from discord.ext import commands
from roles import Role

conv = commands.MemberConverter()


class SingleAction(Role):
    async def on_night(self, bot, player, game):
        output = f'It is now night {game.cycle}. Use the {bot.command_prefix}{self.action} command to {self.action_text}. ' \
            + f'Use {bot.command_prefix}cancel to cancel.\n'
        output += f'```{game.playerlist()}```'
        await player.user.send(output)

    async def on_pm_command(self, ctx, game, player, args):
        can_do_nightaction = self.can_do_action(
            self, ctx, args) if hasattr(self, 'can_do_action') else True
        if can_do_nightaction:
            args = ' '.join(args)
            if args.isdigit():
                num = int(args)
                if num > len(game.players):
                    return await ctx.send(f'There are only {len(game.players)} playing.')
                target_pl = game.players[num - 1]
                target = target_pl.user
            else:
                try:
                    target = await conv.convert(ctx, args)
                    target_pl = game.get_player(target)
                except commands.BadArgument:
                    return await ctx.send('invalid input')

            if target_pl is None or not target_pl.alive:
                return await ctx.send('Invalid target')
            if target.id == player.user.id and not self.can_self_target:
                return await ctx.send(f'As a {self.name}, you cannot self target.')
            for action in game.night_actions.actions:
                if action['player'].user.id == player.user.id:
                    game.night_actions.actions.remove(action)
            game.night_actions.add_action({
                'action': self.action,
                'player': player,
                'target': target_pl,
                'priority': self.action_priority
            })
            await ctx.send(f'You are {self.action_gerund} {target} tonight.')

            if len(game.filter_players(action_only=True, alive=True)) == len(game.night_actions.actions):
                await game.increment_phase(ctx.bot)

    async def after_action(self, player, target, night_record):
        pass
