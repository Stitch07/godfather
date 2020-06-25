import asyncio
import random
from .role import Role
from roles.mixins import SingleAction

DESCRIPTION = 'You can haunt one of the people voting you.'


class Jester(SingleAction):
    def __init__(self):
        super().__init__(name='Jester', role_id='jester', description=DESCRIPTION)
        self.can_haunt = False
        self.voted = None
        self.can_block = False
        self.can_transport = False
        self.action = 'haunt'
        self.action_gerund = 'haunting'
        self.action_priority = 3
        self.action_text = 'haunt a player'

    async def on_night(self, bot, player, game):
        if not self.can_haunt:
            return
        await super().on_night(bot, player, game)

    async def run_action(self, game, night_record, player, target):
        pl_record = night_record[target.user.id]
        pl_record['nightkill']['result'] = True
        pl_record['nightkill']['by'].append(player)

    async def on_lynch(self, game, player):
        self.action = 'haunt'
        self.can_haunt = True
        self.voted = player.votes
        await game.channel.send('The jester will get revenge from his grave!')

    async def after_action(self, player, target, night_record):
        await target.user.send('You were haunted by a Jester! You have died!')
