class Faction():
    name: str = None
    id: str = None
    win_con: str = None
    informed = False

    def has_won(self, game) -> bool:
        pass

    def __str__(self):
        return self.name
