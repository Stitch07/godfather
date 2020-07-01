# All roles need to follow a common method pattern, but not all roles need the required parameters
from pathlib import Path
from importlib import import_module
from .role import Role

all_roles = {}


def filter_func(path: Path):
    return path.is_file() and path.name not in ['roles.py', '__init__.py']


# automatically loads all Role classes in this directory to a dict of roles
for file in filter(filter_func, Path('godfather/roles/').iterdir()):
    role_mod = import_module(f'godfather.roles.{file.stem}')
    # role_name files have RoleName classes
    CLS_NAME = ''.join(map(str.title, file.stem.split('_')))
    all_roles[file.stem] = getattr(role_mod, CLS_NAME)
