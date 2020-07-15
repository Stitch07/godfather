from godfather.roles.town.cop import Cop


class InsaneCop(Cop):
    """
    The law enforcer of town, on the hunt to find the mafia, always constantly in the danger of being killed.  But he acts so furious and insane that he always messes up.

    - Win Condition: Lynch every criminal and evildoer

    + Abilities: Interrogate one person each night for suspicious activity
    + You will know if your target is suspicious or innocent

    Special Interactions: An insane cop will always show the opposite results for suspicion, showing innocent roles as suspicious and suspicious roles as innocent
    """
    name = 'Insane Cop'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.categories.remove('Town Investigative')

    def result_modifier(self, innocence):
        return not innocence
