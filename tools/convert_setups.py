"""Utility to convert old JSON setup format into new YAML setup format"""

from io import TextIOBase
import argparse
import json
import yaml
from godfather.game.setup import Setup

def setup_json_to_yaml(json_form: dict) -> str:
    # Typehints don't check if variable is of that type
    # So a separate check is necessary
    if not isinstance(json_form, dict):
        raise ValueError(
            "JSON_TO_YAML: Invalid data-type for Setup.\n"
            f"Expected 'dict' but got '{type(json_form).__name__}'"
            )
    if "name" not in json_form:
        raise ValueError(
            f"JSON_TO_YAML: Required key 'name' not found in setup:\n{json_form}"
            )
    if "roles" not in json_form:
        raise ValueError(
            f"JSON_TO_YAML: Required key 'roles' not found in setup:\n{json_form}"
            )
    if not isinstance(json_form["roles"], list):
        raise ValueError(
            "JSON_TO_YAML: Invalid data-type for key: 'roles'.\n"
            f"Expected 'list' but got '{type(json_form['roles']).__name__}'"
            )

    name = json_form["name"]
    roles = json_form["roles"]
    non_default_flags = {}
    role_names = []

    for role in roles:
        if not isinstance(role, dict):
            raise ValueError(
                "JSON_TO_YAML: Invalid data-type for role.\n"
                f"Expected 'dict' but got '{type(role).__name__}'"
                )

        if "name" not in role:
            raise ValueError(
                f"JSON_TO_YAML: Role name not found in role:\n{role}"
                )

        role_names.append(role["name"])

    for flag_name in Setup.all_flags:
        if flag_name not in json_form:
            continue

        flag_value = json_form[flag_name]

        if not isinstance(flag_value, bool):
            raise ValueError(
                f"Invalid data-type for flag: '{flag_name}'.\n"
                f"Expected 'bool' but got '{type(flag_value).__name__}'"
                )

        if flag_value != Setup.all_flags[flag_name]:
            non_default_flags[flag_name] = flag_value

    return {name: {**{"roles": role_names}, **non_default_flags}}

def convert_setups(input_file: TextIOBase, output_file: TextIOBase):
    if not input_file.readable():
        raise ValueError("Non-readable file provided as input stream")
    if not output_file.writable():
        raise ValueError("Non-writable file provided as output stream")

    setups_json = json.load(input_file)
    setups_yaml = {}

    if not isinstance(setups_json, list):
        raise ValueError(
            "convert_setups: Invalid data-type for setup list.\n"
            f"Expected 'list' but got '{type(setups_json).__name__}'"
            )

    for setup_json in setups_json:
        setups_yaml.update(setup_json_to_yaml(setup_json))

    yaml.safe_dump(setups_yaml, output_file)

def main():
    parser = argparse.ArgumentParser(
        description='Convert old style JSON setup-list to new YAML format',
        epilog='May overwrite a file. Use at your own risk!'
        )
    parser.add_argument('input_file', help='Path to JSON file to read')
    parser.add_argument('output_file', help='Path to YAML file to write')

    args = parser.parse_args()
    convert_setups(open(args.input_file), open(args.output_file, "w"))

if __name__ == "__main__":
    main()
