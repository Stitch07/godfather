class VoteError(Exception):
    pass


class VoteManager(dict):
    def __init__(self, game):
        self.game = game
        # votes holds a dict of player IDs mapped to the player objects voting them
        # it includes a special notvoting and nolynch key for players not voting, and players voting to no-lynch
        super().__init__([('notvoting', []), ('nolynch', [])])
        # vote histories here
        self.vote_history = []

    def vote(self, voter, target=None) -> bool:
        if not target.is_alive:
            raise VoteError('You can\'t vote a dead player.')
        elif voter in self[target.user.id]:
            raise VoteError(
                'You have already voted for {}'.format(target.user))
        elif voter.user == target.user:
            raise VoteError('Self-voting is not allowed.')

        # clear any other possible votes
        for votes in self.values():
            if voter in votes:
                votes.remove(voter)

        self[target.user.id].append(voter)
        votes_on_target = len(self[target.user.id])
        return votes_on_target >= self.game.majority_votes

    def no_lynch(self, voter) -> bool:
        if voter in self['nolynch']:
            raise VoteError('You have already voted to no-lynch.')

         # clear any other possible votes
        for votes in self.values():
            if voter in votes:
                votes.remove(voter)

        self['nolynch'].append(voter)
        votes_on_target = len(self['nolynch'])
        return votes_on_target >= self.game.majority_votes

    def unvote(self, voter) -> bool:
        for target, votes in self.items():
            if target == 'notvoting' or voter not in votes:
                continue
            votes.remove(voter)
            self['notvoting'].append(voter)
            return True

        return False

    def show(self):
        num_alive = len(self.game.players.filter(is_alive=True))
        text = ['**Vote Count**']

        for target, voters in self.items():
            if target in ['notvoting', 'nolynch']:
                continue
            player = self.game.players.filter(pl_id=target)[0]
            if len(voters) > 0:
                text.append(f'{player.user.name} ({len(voters)}) - ' +
                            ', '.join(
                                [voter.user.name for voter in voters]))

        nolynchers = self['nolynch']
        if len(nolynchers) > 0:
            text.append(f'No-lynch ({len(nolynchers)}) - ' +
                        ', '.join(
                            [voter.user.name for voter in nolynchers]))

        notvoting = self['notvoting']
        text.append(f'Not Voting ({len(notvoting)}) - ' +
                    ', '.join(
                        [voter.user.name for voter in notvoting]))

        text.append(
            f'With {num_alive} is_alive, it takes {self.game.majority_votes} to lynch.')

        return '\n'.join(text)
