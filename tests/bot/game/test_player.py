import unittest
from unittest.mock import Mock, patch, PropertyMock

from godfather.game import Player


class MockFaction(Mock):
    name: str
    id: str

    def __str__(self):
        return self.name


class PlayerTestCase(unittest.TestCase):
    def test_role_pm(self):
        mock_user = Mock()
        mock_user.return_value = 'LemonGrass#3333'
        mock_role = Mock(description='Eats a lot of lemons.')
        mock_faction = Mock(win_con='Gets rid of lemons.')

        with patch(
            'godfather.game.player.Player.display_role', new_callable=PropertyMock
        ) as mock_display_role:
            mock_display_role.return_value = 'Neutral Role'
            player = Player(user=mock_user)
            player.user = 'LemonGrass#3333'
            player.role = mock_role
            player.faction = mock_faction

            expected_str = 'Hello LemonGrass#3333, you are a ' \
                '**Neutral Role**. ' \
                'Eats a lot of lemons.\nWin Condition: ' \
                'Gets rid of lemons.'
            self.assertEqual(player.role_pm, expected_str)

    def test_innocent(self):
        test_values = (
            (True, 'town', True),
            (True, 'not town', True),
            (False, 'town', False),
            (False, 'not town', False),
            (None, 'town', True),
            (None, 'not town', False)
        )

        for innocent_modifier, role_id, expected_bool in test_values:
            with self.subTest(innocent_modifier=innocent_modifier,
                              role_id=role_id, expected_bool=expected_bool):
                mock_user = Mock()
                if innocent_modifier is None:
                    mock_role = Mock(spec=False)
                else:
                    mock_role = Mock(**{
                        'innocence_modifier.return_value': innocent_modifier
                    })
                mock_faction = Mock(**{'id': role_id})
                player = Player(mock_user)
                player.role = mock_role
                player.faction = mock_faction
                self.assertIs(player.innocent, expected_bool)

    def test_full_role(self):
        # Mock faction (id, rv=name), role
        test_values = (
            ('neutral', 'Joker'),
            ('town', 'Town Joker'),
            ('mafia', 'Mafia Joker')
        )

        for faction_id, expected_str in test_values:
            with self.subTest(faction_id=faction_id, expected_str=expected_str):
                mock_faction = MockFaction()
                mock_faction.id = faction_id
                mock_faction.name = faction_id.capitalize()
                player = Player(Mock())
                player.faction = mock_faction
                player.role = 'Joker'
                self.assertEqual(player.full_role, expected_str)
