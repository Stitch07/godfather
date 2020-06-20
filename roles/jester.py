import asyncio
import random
from .role import Role

DESCRIPTION = 'You can haunt one of the people voting you.'


class Jester(Role):
    def __init__(self):
        super().__init__(name='Jester', role_id='jester', description=DESCRIPTION)
        self.can_haunt = False
        self.voted = None

    async def on_night(self, bot, player, game):
        if not self.can_haunt:
            return

        txt = [
            'You can now haunt one player on your wagon! Type a number corresponding to a player:'
        ] + [f'{i+1}. {voter.user.name}' for i, voter in enumerate(player.votes)]
        await player.user.send('\n'.join(txt))

        def check(msg):
            return msg.content.isdigit() \
                and int(msg.content) >= 1 \
                and int(msg.content) <= len(self.voted) \
                and msg.author.id == player.user.id

        try:
            msg = await bot.wait_for('message', check=check, timeout=30.0)
            target = self.voted[int(msg.content) - 1]
        except asyncio.TimeoutError:
            target = self.voted[random.randint(0, len(self.voted) - 1)]
        await player.user.send(f'You have decided to haunt {target.user}.')

        game.night_actions.add_action({
            'action': 'nightkill',
            'player': player,
            'target': target,
            'priority': 3
        })

    def run_action(self, night_record, player, target):
        pl_record = night_record[target.user.id]
        pl_record['nightkill']['result'] = True
        pl_record['nightkill']['by'].append(player.user.id)

    async def on_lynch(self, game, player):
        self.action = 'haunt'
        self.can_haunt = True
        self.voted = player.votes
        await game.channel.send('The jester will get revenge from his grave!')

    async def after_action(self, player, target, night_record):
        await target.user.send('You were haunted by a Jester! You have died!')
