class Faction():
    name: str = ''
    id: str = ''
    win_con: str = ''
    informed = False

    def has_won(self, game) -> bool:
        pass

    def __str__(self):
        return self.name
