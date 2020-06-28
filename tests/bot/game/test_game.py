import unittest
from unittest.mock import AsyncMock, MagicMock, Mock, patch

from game.game import Game


class MockFaction(Mock):
    name: str


class MockPlayer(Mock):
    user: str
    full_role: str
    alive: bool
    death_reason: str


class GameSyncTestCase(unittest.TestCase):
    def setUp(self):
        self.game = Game(Mock())

    def test_check_endgame_noone_wins(self):
        """If `has_won` is not True, then no one had won yet."""
        for _ in range(5):
            player = Mock()
            player.faction.has_won.return_value = False
            self.game.players.append(player)

        results = self.game.check_endgame()

        self.assertEqual(results, (False, None, None))

    def test_endgame_town_wins(self):
        players = []
        town_faction_mock = MockFaction(name='Town')
        mafia_faction_mock = MockFaction(name='Mafia')

        # Town
        for i in range(3):
            player = Mock()
            player.user.name = ''.join(['Player', str(i)])
            player.full_role = 'Town'
            player.faction = town_faction_mock
            player.faction.has_won.return_value = True
            player.faction.has_won_individual = True
            players.append(player)

        # Mafia
        for i in range(3, 6):
            player = Mock()
            player.user.name = ''.join(['Player', str(i)])
            player.full_role = 'Mafia'
            player.faction = mafia_faction_mock
            player.faction.has_won.return_value = False
            player.faction.has_won_individual = False
            players.append(player)

        expected_results = (
            True,
            'Town',
            [
                'Player0 (Town)',
                'Player1 (Town)',
                'Player2 (Town)'
            ]
        )

        self.assertTrue(self.game.check_endgame, expected_results)

    def test_show_players_with_codeblock(self):
        # Mock user have: user, full_role, alive, death_reason (if dead)
        players = []

        # Half alive, half dead
        for i in range(6):
            alive_bool = True
            if i >= (6/2):
                alive_bool = False

            user = ''.join(['Player', str(i)])
            player = MockPlayer(user=user, full_role='Role', alive=alive_bool)
            if player.alive is False:
                player.death_reason = "Eaten by lemons."
            players.append(player)

        expected_str = "+ 1. Player0\n+ 2. Player1\n+ 3. Player2\n" \
                       "- 4. Player3 (Role; Eaten by lemons.)\n" \
                       "- 5. Player4 (Role; Eaten by lemons.)\n" \
                       "- 6. Player5 (Role; Eaten by lemons.)"

        self.game.players = players
        self.assertEqual(
            self.game.show_players(codeblock=True), expected_str
        )

    def test_show_players_without_codeblock(self):
        # Mock user have: user, full_role, alive, death_reason (if dead)
        players = []

        # Half alive, half dead
        for i in range(6):
            alive_bool = True
            if i >= (6/2):
                alive_bool = False

            user = ''.join(['Player', str(i)])
            player = MockPlayer(user=user, full_role='Role', alive=alive_bool)
            if player.alive is False:
                player.death_reason = "Eaten by lemons."
            players.append(player)

        expected_str = "1. Player0\n2. Player1\n3. Player2\n" \
                       "4. ~~Player3~~ (Role; Eaten by lemons.)\n" \
                       "5. ~~Player4~~ (Role; Eaten by lemons.)\n" \
                       "6. ~~Player5~~ (Role; Eaten by lemons.)"

        self.game.players = players
        self.assertEqual(
            self.game.show_players(codeblock=False), expected_str
        )

    def test_get_player_return_player(self):
        players = [Mock(**{'user.id': i}) for i in range(10)]

        test_values = (
            Mock(**{'user.id': 112233}),
            Mock(**{'user.id': 332211}),
            Mock(**{'user.id': 101000}),
            Mock(**{'user.id': 123456})
        )

        for target_player in test_values:
            with self.subTest(target_player=target_player):
                players.append(target_player)
                self.game.players = players
                self.assertEqual(
                    self.game.get_player(target_player.user), target_player
                )

    def test_get_player_return_none(self):
        players = [
            Mock(**{'user.id': i}) for i in range(100000, 900000, 100000)
        ]

        test_values = (
            Mock(**{'user.id': 112233}),
            Mock(**{'user.id': 332211}),
            Mock(**{'user.id': 101000}),
            Mock(**{'user.id': 123456})
        )

        for target_player in test_values:
            with self.subTest(target_player=target_player):
                self.game.players = players
                self.assertIsNone(self.game.get_player(target_player))

    def test_majority_votes(self):
        test_values = (
            ([Mock(alive=True) for _ in range(5)], 3),
            ([Mock(alive=True) for _ in range(6)], 4),
            ([Mock(alive=True) for _ in range(8)], 5),
            ([Mock(alive=True) for _ in range(9)], 5),
            ([Mock(alive=True) for _ in range(10)], 6)
        )

        for players, expected_num in test_values:
            self.game.players = players
            self.assertEqual(self.game.majority_votes, expected_num)


class GameAsyncTestCase(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.game = Game(Mock())

    async def test_lynch(self):
        players = []
        target = AsyncMock(**{
            'user.name': 'Target', 'full_role': 'Joker', 'role': AsyncMock()
        })
        players.append(target)
        for _ in range(3):
            player = Mock(votes=[Mock()])
            players.append(player)

        self.game.channel = MagicMock()

        # monkey patch MagicMock to allow await in async functions
        async def async_magic():
            pass

        MagicMock.__await__ = lambda x: async_magic().__await__()
        mock_channel = self.game.channel

        self.game.players = players
        await self.game.lynch(target)

        mock_channel.send.assert_called_with(
            'Target was lynched. He was a *Joker*.'
        )
        target.role.on_lynch.assert_called_with(self.game, target)

        for player in self.game.players:
            self.assertEqual(player.votes, [])

        target.remove.assert_called_once()
