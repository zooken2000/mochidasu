"""配布物の bin/ にあるスクリプトの先頭行を、AgentCore 上の Python を指すように書き換える。

`uv pip install --target` は、手元の仮想環境の Python（例: /Users/.../.venv/bin/python）を
先頭行に書き込む。パスに空白があると `#!/bin/sh` から始まる形になる。
どちらも AgentCore の中には存在しないので、起動時に
「/var/task/bin/opentelemetry-instrument: ... No such file or directory」で落ちる。
"""

import sys
from pathlib import Path

SHEBANG = "#!/usr/bin/env python3\n"


def fix(text: str) -> str | None:
    lines = text.splitlines(keepends=True)
    if not lines:
        return None
    # 空白を含むパスのとき: #!/bin/sh / '''exec' '<python>' "$0" "$@" / ' '''
    if lines[0].startswith("#!/bin/sh") and len(lines) >= 3 and lines[1].startswith("'''exec'"):
        return SHEBANG + "".join(lines[3:])
    if lines[0].startswith("#!") and "python" in lines[0] and lines[0] != SHEBANG:
        return SHEBANG + "".join(lines[1:])
    return None


def main(bin_dir: str) -> None:
    changed = 0
    for path in sorted(Path(bin_dir).glob("*")):
        if not path.is_file():
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        fixed = fix(text)
        if fixed is not None:
            path.write_text(fixed, encoding="utf-8")
            changed += 1
    print(f"fix_shebangs: {changed} files in {bin_dir}")


if __name__ == "__main__":
    main(sys.argv[1])
