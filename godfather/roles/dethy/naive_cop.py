from godfather.roles.town.cop import Cop


class NaiveCop(Cop):
    """
    The law enforcer of town, believes he’s the best cop and nothing bad would ever happen to the town.

    - Win Condition: Lynch every criminal and evildoer

    + Abilities: Interrogate one person each night for suspicious activity
    + You will know if your target is suspicious or innocent

    Special Interactions: A naive cop will always show innocent results regardless of the roles]
    """
    name = 'Naive Cop'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.categories.remove('Town Investigative')

    def result_modifier(self, _innocence):
        return True
