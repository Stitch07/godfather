class MafiaMember:

    async def on_death(self, game, player):
        # mafioso becomes new gf and stuff here
        if player.role.name == 'Godfather':
            # find a mafioso/goon
            if len(game.filter_players(role='Goon', alive=True)) == 0:
                return
            goon = game.filter_players(role='Goon')[0]
            # goon becomes the new Godfather
            goon.role = player.role
            await goon.user.send('You have been promoted to a Godfather!')
            await goon.user.send(goon.role_pm)

        # other roles become new mafioso
        if player.role.name == 'Goon':
            def filter_func(player):
                return player.faction.id == 'mafia' \
                    and player.alive \
                    and player.role.name not in ['Godfather', 'Goon']

            other_mafia = list(filter(filter_func, game.players))
            if len(other_mafia) == 0:
                return
            new_goon = other_mafia[0]
            new_goon.role = player.role
            await new_goon.user.send('You have been promoted to a Goon!')
            await new_goon.user.send(new_goon.role_pm)
