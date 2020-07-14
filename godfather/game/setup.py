from io import TextIOBase
import typing
import re
import yaml
from godfather.roles import all_roles

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
    def parse_setuplist(cls, file: TextIOBase) -> typing.Dict[str, Setup]:
        """Parse a YAML file and return a list of Setups"""
        try:
            setupdict = yaml.safe_load(file)
        except yaml.YAMLError as exc:
            raise SetupLoadError(f"Error while parsing setup list file:\n{exc}")
        setups: typing.Dict[str, Setup] = {}

        if not isinstance(setupdict, dict):
            raise SetupLoadError("Invalid data-type for setup dict.\n"
                                 f"Expected 'dict' but got '{type(setupdict).__name__}'")

        for setup_name in setupdict:
            try:
                setup_obj = cls(setup_name,
                                yaml.safe_dump(setupdict[setup_name]))
                setups[setup_name] = setup_obj
            except SetupLoadError as exc:
                raise SetupLoadError(f"While parsing setup '{setup_name}':\n{exc}")

    def to_yaml(self) -> str:
        """Convert setup to YAML format and return the string value of it"""
        return yaml.safe_dump({
            **{"roles": self.roles},
            **{key: val for key, val in self.flags.items()
               if Setup.all_flags[key] != val} # only non-default flag values
        })

    def __init__(self, name: str, setup_str: str):
        """Read a YAML string and create a setup object from it"""
        self.name = name
        self.total_players: int = 0
        self.flags: typing.Dict[str, bool] = {}
        self.roles: typing.List[str] = []

        try:
            setup_dict: dict = yaml.safe_load(setup_str)
        except yaml.YAMLError as exc:
            raise SetupLoadError(f"Error while parsing setup string:\n{exc}")

        if not isinstance(setup_dict, dict):
            raise SetupLoadError("Invalid data-type for setup.\n"
                                 f"Expected 'dict' but got '{type(setup_dict).__name__}'")

        try:
            role_list = setup_dict["roles"]
        except KeyError as exc:
            # KeyError contains the name of key not found as its string value
            raise SetupLoadError(f"Required key {exc} doesn't exist.")

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
            if role_name not in all_roles:
                raise SetupLoadError(f"Role '{role_name}' not found.")

            self.roles.extend([role_name] * role_quantity)

        self.total_players = len(self.roles)

        if self.total_players < 3:
            raise SetupLoadError("Setup must have at least 3 players.")
