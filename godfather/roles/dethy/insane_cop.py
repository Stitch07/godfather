from godfather.roles.town.cop import Cop


class InsaneCop(Cop):
    def __init__(self):
        super().__init__()
        self.name = 'Insane Cop'

    def result_modifier(self, innocence):
        return not innocence
