import asyncio

from godfather.utils.utils import convert_code_syntax_to_formal


designated_messages = {
    'day_duration': (
        lambda k, val: f'Days will now last {round(val / 60, 1)} minutes.'
    ),
    'night_duration': (
        lambda k, val: f'Nights will now last {round(val / 60, 1)} minutes.'
    )
}


class GameConfig(dict):
    """A dictionary that stores and updates game state variables.

    You may treat this class like a python dictionary that
    has the capacity to perform checks before updating the values,
    and to respond to user requests.

    Therefore, all magic methods (such as `len()`) that are normally used in
    python dictionaries are also available for this class.

    NOTE
    ----
    You cannot set new values for the dictionary, you may only ammend.
    A dictionary with default values must be passed into the instance first.
    """
    def __init__(self, *arg, **kwargs):
        super(GameConfig, self).__init__(*arg, **kwargs)
        self.__dict__ = self
        self.loop = asyncio.get_event_loop()

    def __setitem__(self, key, value):
        """Run when a value of the dictionary is updated.

        The values of the keys will only be changed if
        the key already exists in the dictionary.

        NOTE
        ----
        The three main attributes used by the class to operate
        are blocked out to prevent injection.
        """
        forbidden_keys = ['__dict__', 'loop', 'channel']

        if key in forbidden_keys:
            pass
        elif key in self:
            return asyncio.run_coroutine_threadsafe(
                self.configure_setting(key, value),
                self.loop
            )

        asyncio.run_coroutine_threadsafe(
            self.channel.send('That is not a recognised key.'),
            self.loop
        )

    async def configure_setting(self, key, value):
        # Checks & overrides  NOTE: Separate from func??
        if key == 'day_duration' or key == 'night_duration':
            if await self.check_phase_duration(value) is False:
                return
            value = int(value)  # Convert to int after check

        # Changes variable
        super(GameConfig, self).__setitem__(key, value)

        # Responds to user
        return await self.send_designated_msg(key, value)

    async def send_designated_msg(self, key, value):
        """Send a default or an already set up message for a specified key.

        The `designated_messages` dict will be used to store messages that
        accept the key and values as parameters.
        If the key does not have a message already set up,
        the default will be used instead.
        """
        if key in designated_messages:
            return await self.channel.send(
                designated_messages[key](key, value)
            )

        # Default message
        formal_key = convert_code_syntax_to_formal(key)
        await self.channel.send(
            f'**{formal_key}** has been changed to **{value}**.'
        )

    async def check_phase_duration(self, value):
        """Ensure `value` is a digit and within specified margin."""
        if not value.isdigit():
            await self.channel.send(
                'Invalid input: send a valid positive integer.'
            )
            return False

        value = int(value)
        if value > 30 * 60 or value < 30:
            await self.channel.send('Phases must last 30 minutes at most '
                                    'and 30 seconds at least.')
            return False

    def __del__(self):
        self.loop.close()
