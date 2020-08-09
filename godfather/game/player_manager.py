import json
from collections import deque
from typing import Callable, Deque, List, Optional

from discord.abc import User

from godfather.game.player import Player
from godfather.utils import alive_or_recent_jester


class PlayerManager:
    def __init__(self, game):
        self.game = game
        self.players: List[Player] = list()
        self.replacements: Deque[User] = deque()
        # used for vote-kicking the host
        self.vote_kicks = set()

    def add(self, member: User, replacement=False):
        if replacement:
            self.replacements.append(member)
        else:
            player = Player(member)
            self.players.append(player)
            self.game.votes[member.id] = []

    def get(self, user_or_index):
        if isinstance(user_or_index, User):
            return next(
                player for player in self.players
                if player.user.id == user_or_index.id
            )
        elif isinstance(user_or_index, int):
            return self.players[user_or_index]

    def remove(self, user_or_player):
        if isinstance(user_or_player, Player):
            self.players.remove(user_or_player)
        elif isinstance(user_or_player, User):
            self.players = [
                player for player in self.players if player.user != user_or_player]
        elif isinstance(user_or_player, Callable[Player]):
            self.players = [
                player for player in self.players if not user_or_player(player)]
        else:
            raise TypeError(
                'PlayerManager.remove must be called with a discord.User, Player or Callable<Player>')

    def filter(self,
               role: Optional[str] = None,
               faction: Optional[str] = None,
               action: Optional[str] = None,
               has_vote_on: Optional[User] = None,
               is_voted_by: Optional[User] = None,
               votecount: Optional[Callable] = None,
               pl_id: Optional[int] = None,
               action_only: bool = False,
               is_alive: bool = False):
        # pylint: disable=too-many-arguments
        plist = self.players

        def action_only_filter(player):
            if not alive_or_recent_jester(player, self.game):
                return False
            can_do, _ = player.role.can_do_action(self.game)
            return can_do

        if role:
            plist = [*filter(lambda pl: pl.role.name == role, plist)]
        if faction:
            plist = [*filter(lambda pl: pl.role.faction.id == faction, plist)]
        if action:
            plist = [*filter(lambda pl: pl.role.action == action
                             if hasattr(pl.role, 'action') else False)]
        if has_vote_on:
            plist = self.game.votes[has_vote_on.id]
        if is_voted_by:
            plist = [*filter(lambda pl: pl.has_vote(is_voted_by), plist)]
        if votecount:
            plist = [*filter(lambda pl: votecount(len(pl.votes)), plist)]
        if action_only:
            plist = [*filter(action_only_filter, plist)]
        if is_alive:
            plist = [*filter(lambda pl: pl.is_alive, plist)]
        if pl_id:
            plist = [*filter(lambda pl: pl.user.id == pl_id, plist)]

        return plist

    def show(self, codeblock=False, show_replacements=False):
        players = []
        for num, player in enumerate(self.players, 1):
            # codeblock friendly formatting. green for is_alive, red for dead
            usrname = ''
            if codeblock:
                if player.is_alive:
                    usrname += f'+ {num}. {player.user}'
                    if player.is_revived:
                        usrname += '({}; revived D{})'.format(player.role.name,
                                                              player.revived_on)
                else:
                    usrname += f'- {num}. {player.user} ({player.display_role}; {player.death_reason})'
            else:
                if player.is_alive:
                    usrname += f'{num}. {player.user}'
                    if player.is_revived:
                        usrname += '({}; revived N{})'.format(
                            player.role.name, player.revived_on)
                else:
                    usrname += f'{num}. ~~{player.user}~~ ({player.display_role}; {player.death_reason})'

            players.append(usrname)
        if show_replacements and len(self.replacements) > 0:
            replacements = ', '.join(map(str, self.replacements))
            players.append('\nReplacements: {}'.format(replacements))
        return '\n'.join(players)

    # syntactical sugar that eliminates the need for a Game#has_player method
    def __contains__(self, user_or_player):
        if isinstance(user_or_player, Player):
            return user_or_player in self.players
        elif isinstance(user_or_player, User):
            return any([player for player in self.players if player.user.id == user_or_player.id])
        else:
            raise TypeError(
                'PlayerManager.__contains__ must be called with a discord.abc.User or Player instance.')
    
    def __len__(self):
        return len(self.players)

    def __iter__(self):
        return self.players.__iter__()

    def __getitem__(self, key):
        return self.get(key)
