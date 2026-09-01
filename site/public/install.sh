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
grep -q '"body": "Source-verified desktop release\.' "$release_json" || {
  printf '%s\n' 'A source-verified desktop release is not published yet.' >&2
  exit 1
}
asset_names="$(sed -n 's/^[[:space:]]*"name": "\([^"]*\)",*$/\1/p' "$release_json")"
require_asset() {
  printf '%s\n' "$asset_names" | grep -Eqi "$1" || {
    printf 'The release is incomplete: missing %s. Nothing was installed.\n' "$2" >&2
    exit 1
  }
}
require_asset 'x64\.dmg$' 'Intel macOS package'
require_asset 'aarch64\.dmg$' 'Apple-silicon macOS package'
require_asset '\.msi$' 'Windows MSI package'
require_asset '\-setup\.exe$' 'Windows executable package'
require_asset '\.AppImage$' 'Linux AppImage package'
require_asset '\.deb$' 'Linux Debian package'
require_asset '^SHA256SUMS$' 'checksum file'
require_asset '^latest\.json$' 'download manifest'
require_asset '^BUILD-PROVENANCE\.sigstore\.json$' 'source provenance file'
require_asset '^platform-signatures\.json$' 'platform trust record'
asset_url="$(sed -n 's/.*"browser_download_url": "\([^"]*\)".*/\1/p' "$release_json" | grep "$pattern" | head -n 1)"
checksum_url="$(sed -n 's/.*"browser_download_url": "\([^"]*SHA256SUMS\)".*/\1/p' "$release_json" | head -n 1)"
provenance_url="$(sed -n 's/.*"browser_download_url": "\([^"]*BUILD-PROVENANCE.sigstore.json\)".*/\1/p' "$release_json" | head -n 1)"
platform_signatures_url="$(sed -n 's/.*"browser_download_url": "\([^"]*platform-signatures.json\)".*/\1/p' "$release_json" | head -n 1)"
[ -n "$asset_url" ] && [ -n "$checksum_url" ] && [ -n "$provenance_url" ] && [ -n "$platform_signatures_url" ] || { printf '%s\n' 'A matching verified desktop release is not published yet.' >&2; exit 1; }
filename="${asset_url##*/}"
destination="${TMPDIR:-/tmp}/$filename"
curl -fsSL "$checksum_url" -o "$checksums"
curl -fsSL "$provenance_url" -o "$provenance"
curl -fsSL "$platform_signatures_url" -o "$platform_signatures"
compact_status="$(tr -d '[:space:]' < "$platform_signatures")"
release_tag="$(sed -n 's/^[[:space:]]*"tag_name": "\([^"]*\)",*$/\1/p' "$release_json" | head -n 1)"
printf '%s' "$compact_status" | grep -Fq "\"tag\":\"$release_tag\"" || {
  printf '%s\n' 'The package record names a different release. Nothing was installed.' >&2
  exit 1
}
printf '%s' "$compact_status" | grep -q '"githubProvenanceVerified":true' || {
  printf '%s\n' 'The package source is not verified. Nothing was installed.' >&2
  exit 1
}
printf '%s' "$compact_status" | grep -Fq "\"$filename\"" || {
  printf '%s\n' 'The selected package is absent from its platform record. Nothing was installed.' >&2
  exit 1
}
case "$(uname -s)" in
  Linux)
    printf '%s' "$compact_status" | grep -q '"linux":{[^}]*"provenanceVerified":true' || {
      printf '%s\n' 'The Linux package origin is not verified. Nothing was installed.' >&2
      exit 1
    }
    ;;
  Darwin)
    printf '%s' "$compact_status" | grep -q '"macOS":{[^}]*"provenanceVerified":true' || {
      printf '%s\n' 'The macOS package origin is not verified. Nothing was installed.' >&2
      exit 1
    }
    printf '%s' "$compact_status" | grep -q '"macOS":{[^}]*"codeSigned":true,"notarized":true' || {
      printf '%s\n' 'A signed and notarized macOS package is not published yet. Nothing was downloaded.' >&2
      exit 1
    }
    ;;
esac
curl -fsSL "$asset_url" -o "$destination"
expected="$(grep " $filename\$" "$checksums" | cut -d ' ' -f 1)"
if command -v sha256sum >/dev/null 2>&1; then
  actual="$(sha256sum "$destination" | cut -d ' ' -f 1)"
else
  actual="$(shasum -a 256 "$destination" | cut -d ' ' -f 1)"
fi
[ "$expected" = "$actual" ] || { printf '%s\n' 'Checksum failed. The download was not installed.' >&2; exit 1; }
if command -v gh >/dev/null 2>&1; then
  gh attestation verify "$destination" --repo "$repo" --bundle "$provenance" >/dev/null
  printf '%s\n' 'Verified GitHub package origin.'
else
  printf '%s\n' 'Checksum verified. Install GitHub CLI to verify the included GitHub package record.'
fi
if [ "$(uname -s)" = "Linux" ]; then
  install_dir="${XDG_BIN_HOME:-$HOME/.local/bin}"
  mkdir -p "$install_dir"
  install -m 755 "$destination" "$install_dir/project-color-beacons"
  printf 'Installed Project Color Beacons at %s\n' "$install_dir/project-color-beacons"
else
  final="$HOME/Downloads/$filename"
  mv "$destination" "$final"
  spctl --assess --type open --context context:primary-signature --verbose "$final"
  open "$final"
  printf 'Verified and opened %s\n' "$final"
fi
