# Running Tests

Tests are essential to ensuring that the bot does not break. Often times, programmers are not dumbfounded by problems that are too difficult to solve, but by problems that they do not know where it occured. Tests mark a giant spotlight on issues that you would otherwise not have known, thus saving you time.

The time that it takes to write tests is a lot less than the time it takes to fix the problems that the tests would have otherwise warn you about. So, write tests!

## Tools

The following modules and packages are used for the project:

- [unittest](https://docs.python.org/3/library/unittest.html) (standard library)
- [unittest.mock](https://docs.python.org/3/library/unittest.mock.html) (standard library)
- [coverage.py](https://coverage.readthedocs.io/en/coverage-5.1)

Please ensure that you have a virtual environment set up, and that you have installed all the required dependencies in the [requirements.txt](/requirements.txt) file.

## Get The Test Results

You can run a test with:
- `coverage run -m unittest`

If you would like to get a detailed report on your tests, you can do so with:
- `coverage report`

For more information, please see [coverage.py's official documentation](https://coverage.readthedocs.io/en/coverage-5.1).
