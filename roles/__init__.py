from pathlib import Path
from importlib import import_module
from .role import Role

all_roles = {}


def filter_func(p: Path):
    return p.is_file() and p.name not in ['roles.py', '__init__.py']


# automatically loads all Role classes in this directory to a dict of roles
for file in filter(filter_func, Path('roles/').iterdir()):
    role_mod = import_module(f'roles.{file.stem}')
    # role_name files have RoleName classes
    cls_name = ''.join(map(str.title, file.stem.split('_')))
    all_roles[file.stem] = getattr(role_mod, cls_name)
