from .role import Role
import asyncio

description = 'You will blow up the last person to lynch you!'

class SuperSaint(Role):
    def __init__(self):
        super().__init__(name='Super Saint', id='super_saint', description=description)

    async def on_lynch(self, game, player):
        last_voted = player.votes[-1]
        last_voted.alive = False
        async with game.channel.typing():
            await game.channel.send('💣 **BOOOOOOOOOOOOOOM!!!**')
            await asyncio.sleep(2)
            await game.channel.send(f'{last_voted.user} hammered the super saint and was blown up! He was a *{last_voted.full_role}*')
        pass
