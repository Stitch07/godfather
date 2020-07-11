import json
from typing import Callable, List, Optional

from discord import Member

from godfather.game.player import Player
from godfather.utils import alive_or_recent_jester


class PlayerManager:
    def __init__(self, game):
        self.game = game
        self.players: List[Player] = list()
        self.replacements: List[Member] = list()

    def add(self, member: Member, replacement=False):
        if replacement:
            self.replacements.append(member)
        else:
            player = Player(member)
            self.players.append(player)
            self.game.votes[member.id] = []

    def get(self, user_or_player):
        if isinstance(user_or_player, Player):
            return next(player for player in self.players if player == user_or_player)
        elif isinstance(user_or_player, Member):
            return next(player for player in self.players if player.user.id == user_or_player.id)
        elif isinstance(user_or_player, int):
            return self.players[user_or_player]

    def remove(self, user_or_player):
        if isinstance(user_or_player, Player):
            self.players.remove(user_or_player)
        elif isinstance(user_or_player, Member):
            self.players = [
                player for player in self.players if player.user != user_or_player]
        elif isinstance(user_or_player, Callable[Player]):
            self.players = [
                player for player in self.players if not user_or_player(player)]
        else:
            raise TypeError(
                'PlayerManager.remove must be called with a discord.Member, Player or Callable<Player>')

    def filter(self,
               role: Optional[str] = None,
               faction: Optional[str] = None,
               action: Optional[str] = None,
               has_vote_on: Optional[Member] = None,
               is_voted_by: Optional[Member] = None,
               votecount: Optional[Callable] = None,
               pl_id: Optional[int] = None,
               action_only: bool = False,
               alive: bool = False):
        # pylint: disable=too-many-arguments
        plist = self.players

        def action_only_filter(player):
            if not alive_or_recent_jester(player, self):
                return False
            can_do, _ = player.role.can_do_action(self)
            return can_do

        if role:
            plist = [*filter(lambda pl: pl.role.name == role, plist)]
        if faction:
            plist = [*filter(lambda pl: pl.faction.id == faction, plist)]
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
        if alive:
            plist = [*filter(lambda pl: pl.alive, plist)]
        if pl_id:
            plist = [*filter(lambda pl: pl.user.id == pl_id, plist)]

        return plist

    def show(self, codeblock=False, show_replacements=False):
        players = []
        for num, player in enumerate(self.players, 1):
            # codeblock friendly formatting. green for alive, red for dead
            usrname = ''
            if codeblock:
                if player.alive:
                    usrname += f'+ {num}. {player.user}'
                else:
                    usrname += f'- {num}. {player.user} ({player.display_role}; {player.death_reason})'
            else:
                if player.alive:
                    usrname += f'{num}. {player.user}'
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
        elif isinstance(user_or_player, Member):
            return any([player for player in self.players if player.user.id == user_or_player.id])
        else:
            raise TypeError(
                'PlayerManager.__contains__ must be called with a discord.Member or Player instance.')

    def __len__(self):
        return len(self.players)

    def __iter__(self):
        return self.players.__iter__()

    @staticmethod
    def check_if_lobby_full(self):
        with open('rolesets.json', 'r') as rs_file:
            rolesets = json.load(rs_file)

        max_num = max(len(rs_dict['roles']) for rs_dict in rolesets)

        if len(self.players) >= max_num:
            return True
        return False
