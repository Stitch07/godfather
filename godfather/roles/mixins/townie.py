from godfather.factions import Town


class Townie:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.faction = Town()
