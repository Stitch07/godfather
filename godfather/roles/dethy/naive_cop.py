from godfather.roles.town.cop import Cop


class NaiveCop(Cop):
    name = 'Naive Cop'

    def result_modifier(self, _innocence):
        return True
