from collections import defaultdict
from enum import IntEnum, auto


class NightRecord(defaultdict):
    def __init__(self):
        super().__init__(lambda: defaultdict(
            lambda: {'result': False, 'by': []}))


class Defense(IntEnum):
    NONE = auto()
    BASIC = auto()
    POWERFUL = auto()
    INVINCIBLE = auto()


class Attack(IntEnum):
    BASIC = auto()
    POWERFUL = auto()
    UNSTOPPABLE = auto()


class Priority(IntEnum):
    # special cases that can never be transported/blocked/healed
    VETERAN = 0
    JESTER_HAUNT = 0
    VIGI_SUICIDE = 0
    SURVIVOR = 0
    # modify night actions directly
    ESCORT = 1
    TRANSPORTER = 1
    SHOOTER = 2  # godfather/goon/vigilante
    SERIAL_KILLER = 2
    # healers always act after shooters
    DOCTOR = 3
    BODYGUARD = 3
    # these roles deal Powerful attacks that cannot be healed
    ARSONIST = 4
    # investigative roles usually only rely on tear_down(), so they can safely go last
    COP = 5
    LOOKOUT = 5
    CONSIG = 5
    TRACKER = 5
    FRAMER = 5
    # janitor cleans after killing roles have already cleaned them
    JANITOR = 6
