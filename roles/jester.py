from roles.mixins import SingleAction

DESCRIPTION = 'You can haunt one of the people voting you.'


class Jester(SingleAction):
    """
    A crazed lunatic whose life goal is to be publicly executed.

    - Abilities: Trick the Town into voting against you.
    - Win Condition: Get yourself lynched by any means necessary.

    + If you are lynched you will attack one of your guilty voters the following night with an Unstoppable attack.
    """

    def __init__(self):
        super().__init__(name='Jester', role_id='jester', description=DESCRIPTION)
        self.can_haunt = False
        self.voted = None
        self.can_block = False
        self.can_transport = False
        self.action = 'haunt'
        self.action_gerund = 'haunting'
        self.action_priority = 3
        self.action_text = 'haunt a player'

    async def on_night(self, bot, player, game):
        if not self.can_haunt:
            return
        await super().on_night(bot, player, game)

    async def run_action(self, game, night_record, player, target):
        pl_record = night_record[target.user.id]
        pl_record['nightkill']['result'] = True
        pl_record['nightkill']['by'].append(player)

    async def on_lynch(self, game, player):
        self.action = 'haunt'
        self.can_haunt = True
        self.voted = player.votes
        await game.channel.send('The jester will get revenge from his grave!')

    async def after_action(self, player, target, night_record):
        await target.user.send('You were haunted by a Jester! You have died!')

    def can_do_action(self):
        if self.can_haunt:
            return True, ''
        return False, ''

    def can_target(self, player, target):
        if not target in self.voted:
            return False, 'You can only lynch players hammering you.'
        return super().can_target(player, target)
