import importlib.util
from pathlib import Path

_path = Path(__file__).parents[1] / "scripts" / "fix_shebangs.py"
_spec = importlib.util.spec_from_file_location("fix_shebangs", _path)
assert _spec is not None and _spec.loader is not None
fix_shebangs = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(fix_shebangs)

BODY = "# -*- coding: utf-8 -*-\nimport sys\n"


def test_path_with_space():
    text = "#!/bin/sh\n'''exec' '/Users/me/zero to Shipped/.venv/bin/python' \"$0\" \"$@\"\n' '''\n" + BODY
    assert fix_shebangs.fix(text) == "#!/usr/bin/env python3\n" + BODY


def test_plain_path():
    assert fix_shebangs.fix("#!/home/me/.venv/bin/python\n" + BODY) == "#!/usr/bin/env python3\n" + BODY


def test_leave_others():
    assert fix_shebangs.fix("#!/bin/bash\necho hi\n") is None
    assert fix_shebangs.fix("#!/usr/bin/env python3\n" + BODY) is None
