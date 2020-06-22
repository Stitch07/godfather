class MafiaMember:

    async def on_death(self, game, player):
        # mafioso becomes new gf and stuff here
        if player.role.name == 'Godfather':
            # find a mafioso/goon
            if len(game.filter_players(role='Goon')) == 0:
                return
            goon = game.filter_players(role='Goon')[0]
            # goon becomes the new Godfather
            goon.role = player.role
            await goon.user.send('You have been promoted to a Godfather!')
            await goon.user.send(goon.role_pm)
