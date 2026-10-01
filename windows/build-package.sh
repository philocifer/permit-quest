#!/bin/bash
# Build dist/PermitQuest-Windows.zip from the files the app needs to run.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT

dest="$stage/Permit Quest"
mkdir -p "$dest"

cp "$root/index.html" "$root/style.css" "$root/manifest.json" "$root/sw.js" "$dest/"
cp "$root/INSTRUCTIONS.md" "$root/README.md" "$dest/"
cp -r "$root/icons" "$root/js" "$dest/"
cp "$root/windows/Install.bat" "$root/windows/Install.ps1" \
   "$root/windows/Uninstall.bat" "$root/windows/Uninstall.ps1" \
   "$root/windows/Start Permit Quest.bat" "$dest/"

# cmd.exe wants CRLF in batch files.
python3 - "$dest" <<'PY'
import pathlib, sys
folder = pathlib.Path(sys.argv[1])
for path in folder.glob("*.bat"):
    text = path.read_bytes().replace(b"\r\n", b"\n").replace(b"\n", b"\r\n")
    path.write_bytes(text)
PY

mkdir -p "$root/dist"
out="$root/dist/PermitQuest-Windows.zip"
rm -f "$out"
python3 - "$stage" "$out" <<'PY'
import pathlib, sys, zipfile
stage, out = sys.argv[1:]
root = pathlib.Path(stage)
with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(root.rglob("*")):
        if path.is_file():
            archive.write(path, path.relative_to(root).as_posix())
print(out)
PY
