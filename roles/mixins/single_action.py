from discord.ext import commands
from roles import Role

conv = commands.MemberConverter()


class SingleAction(Role):
    async def on_night(self, bot, player, game):
        output = f'It is now night {game.cycle}. Use the {bot.command_prefix}{self.action} command to {self.action_text}. ' \
            + f'Use {bot.command_prefix}cancel to cancel.'
        await player.user.send(output)

    async def on_pm_command(self, ctx, game, player, args):
        can_do_nightaction = self.can_do_action(
            self, ctx, args) if hasattr(self, 'can_do_action') else True
        if can_do_nightaction:
            print(1)
            try:
                target = await conv.convert(ctx, ' '.join(args))
            except commands.BadArgument:
                return await ctx.send('invalid input')
            target_pl = game.get_player(target)
            if target_pl is None or not target_pl.alive:
                return await ctx.send('Invalid target')
            if target.id == player.user.id and not self.can_self_target:
                return await ctx.send(f'As a {self.name}, you cannot self target.')
            for action in game.night_actions:
                if action['player'].user.id == player.user.id:
                    game.night_actions.remove(action)
            game.night_actions.append({
                'action': self.action,
                'player': player,
                'target': target_pl,
                'priority': self.action_priority
            })
            return await ctx.send(f'You are {self.action_gerund} {target} tonight.')
