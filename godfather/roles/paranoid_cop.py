from .cop import Cop


class ParanoidCop(Cop):
    def __init__(self):
        super().__init__()
        self.name = 'Paranoid Cop'

    def result_modifier(self, _innocence):
        return False
