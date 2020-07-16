# All roles need to follow a common method pattern, but not all roles need the required parameters
from collections import defaultdict
from pathlib import Path
from importlib import import_module

all_roles = {}
role_categories = defaultdict(list)


def filter_func(path: Path):
    return path.is_file() and path.name not in ['base.py', '__init__.py']


# automatically loads all Role classes in this directory to a dict of roles
for file in Path('godfather/roles').iterdir():
    if file.stem in ['__pycache__', 'mixins', '__init__', 'base']:
        continue
    if file.is_file():
        role_mod = import_module(f'godfather.roles.{file.stem}')
        # role_name files have RoleName classes
        CLS_NAME = ''.join(map(str.title, file.stem.split('_')))
        role_cls = getattr(role_mod, CLS_NAME)
        all_roles[role_cls.name] = role_cls
        role_instance = role_cls()
        for category in role_instance.categories:
            role_categories[category].append(role_cls)

    else:
        for nested_file in filter(filter_func, Path(f'godfather/roles/{file.stem}').iterdir()):
            role_mod = import_module(
                f'godfather.roles.{file.stem}.{nested_file.stem}')
            CLS_NAME = ''.join(map(str.title, nested_file.stem.split('_')))
            role_cls = getattr(role_mod, CLS_NAME)
            all_roles[role_cls.name] = role_cls
            role_instance = role_cls()
            for category in role_instance.categories:
                role_categories[category].append(role_cls)
