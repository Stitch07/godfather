import unittest
from unittest.mock import AsyncMock, Mock

from tests.helpers import MockRole
from tests.bot.game import MockFaction
from godfather.roles.mixins.mafia_member import MafiaMember


class GodfatherOnDeathTestCase(unittest.IsolatedAsyncioTestCase):
    @classmethod
    def setUpClass(cls):
        cls.player = AsyncMock()  # helpers.MockPlayer
        cls.mafia_member = MafiaMember()
        cls.godfather = MafiaMember()
        cls.goon = MafiaMember()

        cls.godfather.role = MockRole(name='Godfather')
        cls.goon.role = MockRole(name='Goon')

        cls.game = Mock()

    async def test_gf_replacement(self):
        player1 = AsyncMock()
        player1.role = MockRole(name='Goon')

        self.game.players.filter.return_value = [player1]
        await self.mafia_member.on_death(self.game, self.godfather)
        self.assertEqual(player1.role.name, 'Godfather')
        self.assertEqual(player1.user.send.call_count, 2)

    async def test_consort_replacement(self):
        player1 = AsyncMock()
        player1.role = MockRole(name='Consort')
        player1.is_alive = True
        player1.faction = MockFaction(spec=['id'])
        player1.faction.id = 'mafia'
        self.game.players = [player1]

        await self.mafia_member.on_death(self.game, self.goon)
        self.assertEqual(player1.role.name, 'Goon')
        self.assertEqual(player1.user.send.call_count, 2)
