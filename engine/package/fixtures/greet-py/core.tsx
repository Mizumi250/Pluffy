/* @arkzen:meta
name: greet-py
version: 1.0.0
description: Greeting helpers for Python
auth: false
*/

/* @arkzen:pkg:project
name: greet
kind: library
license: MIT
author: Ana
targets: [pypi]
*/

/* @arkzen:pkg:target:pypi
name: demo-greet
requires_python: ">=3.9"
typed: true
*/

/* @arkzen:pkg:source:py:index
entry: true
*/
"""Greeting helpers."""
from .text import shout

__version__ = "1.0.0"


def greet(name: str) -> str:
    return f"Hello, {name}"


__all__ = ["greet", "shout", "__version__"]
/* @arkzen:pkg:source:py:index:end */

/* @arkzen:pkg:source:py:text
*/
def shout(text: str) -> str:
    return text.upper() + "!"
/* @arkzen:pkg:source:py:text:end */

/* @arkzen:pkg:test:py:greet
*/
import unittest

import demo_greet


class GreetTests(unittest.TestCase):
    def test_greet(self):
        self.assertEqual(demo_greet.greet("Ana"), "Hello, Ana")

    def test_shout(self):
        self.assertEqual(demo_greet.shout("hi"), "HI!")


if __name__ == "__main__":
    unittest.main()
/* @arkzen:pkg:test:py:greet:end */

/* @arkzen:pkg:exports
entries:
  ".": index
*/

/* @arkzen:pkg:verify
import: [greet, shout]
*/
