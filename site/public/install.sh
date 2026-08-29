#!/bin/sh
set -eu

repo="B-Divyesh/sf-project-color-beacons"
case "$(uname -s)" in
  Linux) pattern='AppImage' ;;
  Darwin) pattern='.dmg' ;;
  *) printf '%s\n' 'Use install.ps1 on Windows.' >&2; exit 1 ;;
esac

release_json="$(mktemp)"
checksums="$(mktemp)"
provenance="$(mktemp "${TMPDIR:-/tmp}/project-color-beacons-provenance.XXXXXX.json")"
platform_signatures="$(mktemp "${TMPDIR:-/tmp}/project-color-beacons-platform-signatures.XXXXXX.json")"
trap 'rm -f "$release_json" "$checksums" "$provenance" "$platform_signatures"' EXIT
curl -fsSL "https://api.github.com/repos/$repo/releases/latest" -o "$release_json"
grep -q '"body": "Verified desktop release\.' "$release_json" || {
  printf '%s\n' 'A verified desktop release is not published yet.' >&2
  exit 1
}
asset_url="$(sed -n 's/.*"browser_download_url": "\([^"]*\)".*/\1/p' "$release_json" | grep "$pattern" | head -n 1)"
checksum_url="$(sed -n 's/.*"browser_download_url": "\([^"]*SHA256SUMS\)".*/\1/p' "$release_json" | head -n 1)"
provenance_url="$(sed -n 's/.*"browser_download_url": "\([^"]*BUILD-PROVENANCE.sigstore.json\)".*/\1/p' "$release_json" | head -n 1)"
platform_signatures_url="$(sed -n 's/.*"browser_download_url": "\([^"]*platform-signatures.json\)".*/\1/p' "$release_json" | head -n 1)"
[ -n "$asset_url" ] && [ -n "$checksum_url" ] && [ -n "$provenance_url" ] && [ -n "$platform_signatures_url" ] || { printf '%s\n' 'A matching verified desktop release is not published yet.' >&2; exit 1; }
filename="${asset_url##*/}"
destination="${TMPDIR:-/tmp}/$filename"
curl -fsSL "$asset_url" -o "$destination"
curl -fsSL "$checksum_url" -o "$checksums"
curl -fsSL "$provenance_url" -o "$provenance"
curl -fsSL "$platform_signatures_url" -o "$platform_signatures"
expected="$(grep " $filename\$" "$checksums" | cut -d ' ' -f 1)"
if command -v sha256sum >/dev/null 2>&1; then
  actual="$(sha256sum "$destination" | cut -d ' ' -f 1)"
else
  actual="$(shasum -a 256 "$destination" | cut -d ' ' -f 1)"
fi
[ "$expected" = "$actual" ] || { printf '%s\n' 'Checksum failed. The download was not installed.' >&2; exit 1; }
if command -v gh >/dev/null 2>&1; then
  gh attestation verify "$destination" --repo "$repo" --bundle "$provenance" >/dev/null
  printf '%s\n' 'Verified GitHub package record.'
else
  printf '%s\n' 'Checksum verified. Install GitHub CLI to verify the included GitHub package record.'
fi
if [ "$(uname -s)" = "Linux" ]; then
  install_dir="${XDG_BIN_HOME:-$HOME/.local/bin}"
  mkdir -p "$install_dir"
  install -m 755 "$destination" "$install_dir/project-color-beacons"
  printf 'Installed Project Color Beacons at %s\n' "$install_dir/project-color-beacons"
else
  spctl --assess --type open --context context:primary-signature --verbose "$destination"
  final="$HOME/Downloads/$filename"
  mv "$destination" "$final"
  open "$final"
  printf 'Verified and opened %s\n' "$final"
fi
