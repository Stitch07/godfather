from godfather.roles.town.cop import Cop


class ParanoidCop(Cop):
    """
    The law enforcer of town, on the hunt to find the mafia, always constantly in the danger of being killed.

    - Win Condition: Lynch every criminal and evildoer

    + Abilities: Interrogate one person each night for suspicious activity
    + You will know if your target is suspicious or innocent
    + A paranoid cop will always show suspicious results regardless of the roles
    """
    name = 'Paranoid Cop'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.categories.remove('Town Investigative')

    def result_modifier(self, _innocence):
        return False
