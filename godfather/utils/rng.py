import random
import secrets


def get_random_sequence(low: int, high: int):
    """Generate (pseudo-)random number sequence of all numbers in a closed interval.

    Uses `secrets.SystemRandom` to generate cryptographically secure pseudo-random number
    sequence. If a source of randomness can't be accessed from the operating system,
    `random` module is used to generate a pseudo-random number sequence.

    Arguments:
        low: int, high: int

    Returns:
        A random sequence of all numbers in [low, high].
        (eg: low <= number <= high).

    Return Type:
        list[int]
    """

    # Use `secrets.SystemRandom()` to generate random sample.
    # `secrets.SystemRandom` is the same as `random.SystemRandom`
    # but methods in `random` module use `random.Random` instead of
    # `randon.SystemRandom`.
    # On some operating systems, the source of randomness may not be accessible
    # or even exist. We need to fallback to the random module in such cases.
    try:
        # We need to use an instance of `SystemRandom` as `secrets` doesn't have a
        # high level `sample` function.
        return secrets.SystemRandom().sample(range(low, high + 1), high - low + 1)
    except NotImplementedError:
        return random.sample(range(low, high + 1), high - low + 1)
