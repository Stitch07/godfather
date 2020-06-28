import unittest
from unittest.mock import AsyncMock, Mock

from tests.helpers import MockRole
from roles.mixins.mafia_member import MafiaMember


class GodfatherOnDeathTestCase(unittest.IsolatedAsyncioTestCase):
    @classmethod
    def setUpClass(cls):
        cls.player = AsyncMock()  # helpers.MockPlayer
        cls.mafia_member = MafiaMember()

        cls.player.role = MockRole(name='Godfather')

        cls.game = Mock()

    async def test_gf_replacement(self):
        player1 = AsyncMock()
        player1.role = MockRole(name='Goon')

        self.game.filter_players.return_value = [player1]
        await self.mafia_member.on_death(self.game, self.player)
        self.assertEqual(player1.role.name, 'Godfather')
        self.assertEqual(player1.user.send.call_count, 2)
