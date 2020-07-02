from discord.ext.commands import CommandError

class PhaseChangeError(CommandError):
    """Raised when there's an error incrementing the phase."""
