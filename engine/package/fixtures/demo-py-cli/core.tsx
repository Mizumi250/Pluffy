/* @arkzen:meta
name: demo-py-cli
version: 1.0.0
description: A tiny Python command line tool
auth: false
*/

/* @arkzen:pkg:project
name: demo-py-cli
kind: cli
license: MIT
targets: [pypi]
*/

/* @arkzen:pkg:target:pypi
name: demo-py-cli
*/

/* @arkzen:pkg:source:py:cli
*/
import sys


def main(argv=None):
    args = list(sys.argv[1:] if argv is None else argv)
    if "--version" in args:
        print("1.0.0")
    elif not args or "--help" in args:
        print("Usage: demo-py [--version] [--help] [name]")
    else:
        print(f"Hello, {args[0]}")
    return 0
/* @arkzen:pkg:source:py:cli:end */

/* @arkzen:pkg:exports
bin:
  demo-py: cli:main
*/

/* @arkzen:pkg:verify
run:
  - args: ["--version"]
    contains: "1.0.0"
  - args: ["--help"]
    contains: "Usage"
  - args: ["Ana"]
    contains: "Hello, Ana"
*/
