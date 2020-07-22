from godfather.factions import Mafia
from godfather.roles import all_roles


def filter_func(player):
    return player.role.faction.id == 'mafia' \
        and player.is_alive \
        and player.role.name not in ['Godfather', 'Goon']


class MafiaMember:

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.faction = Mafia()
        # this only works when MafiaMember is mixin'd with Role
        if hasattr(self, 'categories'):
            self.categories.append('Random Mafia')

    async def on_death(self, game, player):
        # mafioso becomes new gf and stuff here
        if player.role.name == 'Godfather':
            # find a mafioso/goon
            if len(game.players.filter(role='Goon', is_alive=True)) == 0:
                # if there isn't a goon, promote the next mafia member
                if any(other_maf := list(filter(filter_func, game.players))):
                    goon = other_maf[0]
                    goon.role = all_roles['Goon']()
                    await goon.user.send('You have been promoted to a Goon!')
                    await goon.user.send(goon.role_pm)
                    return

            goon = game.players.filter(role='Goon')[0]
            # goon becomes the new Godfather
            goon.role = player.role
            await goon.user.send('You have been promoted to a Godfather!')
            await goon.user.send(goon.role_pm)

        # other roles become new mafioso
        if player.role.name == 'Goon':
            other_mafia = list(filter(filter_func, game.players))
            if len(other_mafia) == 0:
                return
            new_goon = other_mafia[0]
            new_goon.role = player.role
            await new_goon.user.send('You have been promoted to a Goon!')
            await new_goon.user.send(new_goon.role_pm)
