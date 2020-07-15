class Faction():
    name: str = ''
    id: str = ''
    win_con: str = ''
    informed = False

    def has_won(self, game) -> bool:
        pass

    @property
    def category_name(self):
        return self.name

    def __str__(self):
        return self.name
