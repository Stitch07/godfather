from godfather.roles.town.cop import Cop


class InsaneCop(Cop):
    name = 'Insane Cop'

    def result_modifier(self, innocence):
        return not innocence
