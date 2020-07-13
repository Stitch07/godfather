from godfather.roles.town.cop import Cop


class ParanoidCop(Cop):
    name = 'Paranoid Cop'

    def result_modifier(self, _innocence):
        return False
