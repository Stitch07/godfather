from roles.mixins import SingleAction

DESCRIPTION = 'You may shoot someone every night. If you shoot a townie, you will die of guilt the next night.'


class Vigilante(SingleAction):
    def __init__(self):
        super().__init__(name='Vigilante', role_id='vig', description=DESCRIPTION)
        self.action = 'shoot'
        self.action_gerund = 'shooting'
        self.action_priority = 1  # placeholder
        self.action_text = 'shoot a player'
        self.guilty = False
        self.bullets = 3  # vigs only get 3 shots

    async def on_night(self, bot, player, game):
        if self.guilty:
            await player.user.send('You threw away your gun in guilt.')
            game.night_actions.append({
                'action': self.action,
                'player': player,
                'target': player,
                'priority': 2
            })
        else:
            await super().on_night(bot, player, game)

    async def on_pm_command(self, ctx, game, player, args):
        if self.guilty:
            await player.user.send('You cannot shoot.')
        else:
            if self.bullets <= 0:
                return await ctx.send("You're out of bullets!")
            await super().on_pm_command(ctx, game, player, args)

    def run_action(self, night_record, target):
        pl_record = night_record[target.user.id]
        pl_record.update({'nightkill': True})

    async def after_action(self, player, success, target):
        if success and target.faction == 'Town':
            self.guilty = True
        if not success:
            await player.user.send('Your target was too strong to kill!')
        await target.user.send('You were shot by a Vigilante. You have died!')
