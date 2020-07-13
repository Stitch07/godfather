import unittest
from unittest.mock import AsyncMock, MagicMock, Mock

from godfather.game import Game


class MockFaction(Mock):
    name: str
    id: str


class MockPlayer(Mock):
    user: str
    display_role: str
    is_alive: bool
    death_reason: str


class ShowPlayersTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.game = Game(Mock(), Mock())

    def setUp(self):
        # Generate players, half alive, half dead
        def generate_players(num):
            for i in range(num):
                alive_bool = False if i >= (num/2) else True

                user = ''.join(['Player', str(i)])
                player = MockPlayer(
                    user=user, display_role='Role', is_alive=alive_bool
                )
                if player.is_alive is False:
                    player.death_reason = "Eaten by lemons."
                yield player

        self.game.players = [player for player in generate_players(6)]

    def test_show_players_with_codeblock(self):
        expected_str = "+ 1. Player0\n+ 2. Player1\n+ 3. Player2\n" \
                       "- 4. Player3 (Role; Eaten by lemons.)\n" \
                       "- 5. Player4 (Role; Eaten by lemons.)\n" \
                       "- 6. Player5 (Role; Eaten by lemons.)"

        self.assertEqual(
            self.game.players.show(codeblock=True), expected_str
        )

    def test_show_players_without_codeblock(self):
        expected_str = "1. Player0\n2. Player1\n3. Player2\n" \
                       "4. ~~Player3~~ (Role; Eaten by lemons.)\n" \
                       "5. ~~Player4~~ (Role; Eaten by lemons.)\n" \
                       "6. ~~Player5~~ (Role; Eaten by lemons.)"

        self.assertEqual(
            self.game.players.show(codeblock=False), expected_str
        )

    def test_show_players_with_replacements(self):
        expected_str = "1. Player0\n2. Player1\n3. Player2\n" \
            "4. ~~Player3~~ (Role; Eaten by lemons.)\n" \
            "5. ~~Player4~~ (Role; Eaten by lemons.)\n" \
            "6. ~~Player5~~ (Role; Eaten by lemons.)\n" \
            "\nReplacements: Replacement0, Replacement1, Replacement2"
        # generate 3 replacements
        for num in range(3):
            replacement = MagicMock()
            replacement.__str__.return_value = 'Replacement{}'.format(num)
            self.game.players.replacements.append(replacement)

        self.assertEqual(
            self.game.players.show(show_replacements=True), expected_str
        )


class GetPlayerTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.game = Game(Mock(), Mock())

    def setUp(self):
        self.game.players = [
            Mock(**{'user.id': i}) for i in range(100000, 900000, 100000)
        ]

        self.test_values = (
            Mock(**{'user.id': 112233}),
            Mock(**{'user.id': 332211}),
            Mock(**{'user.id': 101000}),
            Mock(**{'user.id': 123456})
        )

    def test_get_player_return_player(self):
        for target_player in self.test_values:
            with self.subTest(target_player=target_player):
                self.game.players.append(target_player)
                self.assertEqual(
                    self.game.players.get(target_player.user), target_player
                )

    def test_get_player_return_none(self):
        for target_player in self.test_values:
            with self.subTest(target_player=target_player):
                self.assertIsNone(self.game.players.get(target_player))


class GameSyncTestCase(unittest.TestCase):
    def setUp(self):
        self.game = Game(Mock(), Mock())

    def test_majority_votes(self):
        test_values = (
            ([Mock(is_alive=True) for _ in range(5)], 3),
            ([Mock(is_alive=True) for _ in range(6)], 4),
            ([Mock(is_alive=True) for _ in range(8)], 5),
            ([Mock(is_alive=True) for _ in range(9)], 5),
            ([Mock(is_alive=True) for _ in range(10)], 6)
        )

        for players, expected_num in test_values:
            self.game.players = players
            self.assertEqual(self.game.majority_votes, expected_num)


class CheckEndgameTestCase(unittest.TestCase):
    def setUp(self):
        self.game = Game(Mock(), Mock())

    def test_mafia_and_town_only(self):
        players = []
        town_fac_mock = MockFaction(spec=["name", "has_won"])
        town_fac_mock.name = 'Town'
        mafia_fac_mock = MockFaction(spec=["name", "has_won"])
        mafia_fac_mock.name = 'Mafia'

        # Generate 10 players, half mafia, half town
        for i in range(1, 11):
            if i > 5:
                display_role = 'Town'
                faction = mafia_fac_mock
            else:
                display_role = 'Mafia'
                faction = town_fac_mock
            player = Mock()
            player.user.name = ''.join(['Player', str(i)])
            player.display_role = display_role
            player.faction = faction
            players.append(player)

        self.game.players = players

        test_values = (
            ((True, False), (True, 'Town', [])),
            ((False, True), (True, 'Mafia', [])),
            ((False, False), (False, None, None))
        )

        for win_fac_set, expected_rv in test_values:
            with self.subTest(win_fac_set=win_fac_set, expected_rv=expected_rv):
                town_fac_mock.has_won.return_value = win_fac_set[0]
                mafia_fac_mock.has_won.return_value = win_fac_set[1]
                self.assertEqual(self.game.check_endgame(), expected_rv)


class GameAsyncTestCase(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.game = Game(Mock(), Mock())

    async def test_lynch(self):
        # Should not have so many asserts, need further refactoring
        players = []
        target = AsyncMock(**{
            'user.name': 'Target', 'display_role': 'Joker', 'role': AsyncMock()
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

        target.remove.assert_called_once()
