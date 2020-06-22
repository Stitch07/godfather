import random
import requests


def get_random_sequence(low: int, high: int):
    """Generate (pseudo-)random number sequence of all numbers in 
    a closed interval. Uses random.org, falls back to standard
    random.sample() if an error occurs.

    Arguments:
        low: int, high: int

    Returns:
        A random sequence of all numbers in [low, high].
        (eg: low <= number <= high).

    Return Type:
        list[int]"""

    # Send HTTP request to random.org
    resp = requests.get('https://www.random.org/sequences/'
                        f'?min={low}&max={high}&col=1&'
                        'format=plain&rnd=new')

    # Check if status is OK
    # If so, read through each line, form a sequence by turning
    # everything into an int, and return it
    if resp.status_code == 200:
        return list(map(int, resp.iter_lines()))

    # If an error is shown, fallback to standard random
    return random.sample(range(low, high + 1), high - low + 1)
