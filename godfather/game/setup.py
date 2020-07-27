import copy
from io import TextIOBase
import typing
import random
import re

import discord
import yaml

from godfather.roles import all_roles, role_categories
from godfather.utils import get_random_sequence


class SetupLoadError(Exception):
    pass


class Setup:
    # Pattern to get parse name and quantity from string
    role_pattern = re.compile(r"(.*?)\s*(?:x\s*(\d+))?\s*$")

    # Define all flags along with their default values here
    all_flags: typing.Dict[str, bool] = {
        "night_start": False
    }

    @staticmethod
    def parse_role_str(role_str: str):
        """Parse role information from string"""
        match = Setup.role_pattern.match(role_str)

        if not match:
            raise ValueError(f'Invalid role string: {role_str}')

        if match.lastindex > 1:
            quantity = int(match.group(2))
        else:
            quantity = 1

        role_name = str(match.group(1))
        return role_name, quantity

    @classmethod
    def parse_setuplist(cls, file: TextIOBase):
        """Parse a YAML file and return a list of Setups"""
        try:
            setuplist = yaml.safe_load(file)
        except yaml.YAMLError as exc:
            raise SetupLoadError(
                f"Error while parsing setup list file:\n{exc}")
        setups: typing.Dict[str, Setup] = {}

        for setup in setuplist:
            setup_name = setup.get('name', 'unnamed')
            try:
                setup_obj = cls(
                    yaml.safe_dump(setup))
                setups[setup_name] = setup_obj
            except SetupLoadError as exc:
                raise SetupLoadError(
                    f"While parsing setup '{setup_name}':\n{exc}")

        return setups

    def to_yaml(self) -> str:
        """Convert setup to YAML format and return the string value of it"""
        return yaml.safe_dump({
            **{"roles": self.roles, 'name': self.name},
            **{key: val for key, val in self.flags.items()
               if Setup.all_flags[key] != val}  # only non-default flag values
        })

    def __init__(self, setup_str: str):
        """Read a YAML string and create a setup object from it"""
        self.total_players: int = 0
        self.flags: typing.Dict[str, bool] = {}
        self.roles: typing.List[str] = []

        try:
            setup_dict: dict = yaml.safe_load(setup_str)
        except yaml.YAMLError as exc:
            raise SetupLoadError(f"Error while parsing setup string:\n{exc}")

        if isinstance(setup_dict, str) and ',' in setup_dict:
            setup_dict = {'roles': list(map(str.strip, setup_dict.split(',')))}

        if isinstance(setup_dict, list):
            # convert list to dict, assuming a list of roles has been provided
            setup_dict = {'roles': setup_dict}

        if not isinstance(setup_dict, dict):
            raise SetupLoadError("Invalid data-type for setup.\n"
                                 f"Expected 'dict' but got '{type(setup_dict).__name__}'")

        try:
            role_list = setup_dict["roles"]
        except KeyError as exc:
            # KeyError contains the name of key not found as its string value
            raise SetupLoadError(f"Required key {exc} doesn't exist.")

        self.name = setup_dict.get('name', 'unnamed')

        for flag_name in Setup.all_flags:
            flag_value = setup_dict.get(flag_name, Setup.all_flags[flag_name])

            if not isinstance(flag_value, bool):
                raise SetupLoadError(
                    f"Invalid data-type for flag: '{flag_name}'.\n"
                    f"Expected 'bool' but got '{type(flag_value).__name__}'"
                )

            self.flags[flag_name] = flag_value

        if not isinstance(role_list, list):
            raise SetupLoadError("Invalid data-type for 'roles'.\n"
                                 f"Expected 'list' but got '{type(role_list).__name__}'")

        for role_str in role_list:
            role_name, role_quantity = Setup.parse_role_str(role_str)
            if role_name not in all_roles and role_name not in role_categories:
                raise SetupLoadError(f"Role '{role_name}' not found.")

            self.roles.extend([role_name] * role_quantity)

        self.total_players = len(self.roles)

        if self.total_players < 3:
            raise SetupLoadError("Setups must have at least 3 players.")
        if self.total_players > 18:
            raise SetupLoadError('Setups can have at most 18 players.')

    async def assign_roles(self, game):
        roles = copy.deepcopy(self.roles)
        # convert categories to roles
        # contains all unique roles already used in the setup
        unique_roles = set()
        for n, role in enumerate(roles):
            if role in role_categories:
                category_roles = role_categories.get(role)

                def filter_unique(role):
                    return role.name not in unique_roles

                random_role = random.choice(
                    list(filter(filter_unique, category_roles)))
                if random_role.unique:
                    unique_roles.add(random_role.name)
                roles[n] = random_role.name

        # Create a random sequence of role indexes, enumerate the player list.
        # And assign the nth number in the random sequence to the nth player.
        # Then use the resulting number as index for the role.
        role_sequence = get_random_sequence(0, len(roles)-1)

        # people the bot couldn't dm
        no_dms = []
        async with game.channel.typing():
            for num, player in enumerate(game.players):
                player_role = roles[role_sequence[num]]

                # assign role and faction to the player
                player.role = all_roles.get(player_role)()

                # send role PMs
                try:
                    await player.user.send(player.role_pm)
                except discord.Forbidden:
                    no_dms.append(player.user)

            for player in filter(lambda pl: pl.role.faction.informed, game.players):
                teammates = game.players.filter(faction=player.role.faction.id)
                if len(teammates) > 1:
                    await player.user.send(
                        f'Your team consists of: {", ".join(map(lambda pl: pl.user.name, teammates))}'
                    )

            for player in game.players.filter(role='Executioner'):
                targets = list(filter(lambda pl: pl.role.faction.name == 'Town' and pl.role.name not in [
                    'Jailor', 'Mayor'], game.players))
                target = random.choice(targets)
                player.target = target
                await player.user.send('Your target is {}'.format(target.user))

        return no_dms
