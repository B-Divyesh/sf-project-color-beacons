$ErrorActionPreference = "Stop"
$repo = "B-Divyesh/sf-project-color-beacons"
$release = Invoke-RestMethod "https://api.github.com/repos/$repo/releases/latest"
if ($release.body -notmatch '^Source-verified desktop release\.') { throw "A source-verified desktop release is not published yet." }
$requiredPatterns = @{
  "Intel macOS package" = 'x64\.dmg$'
  "Apple-silicon macOS package" = 'aarch64\.dmg$'
  "Windows MSI package" = '\.msi$'
  "Windows executable package" = '-setup\.exe$'
  "Linux AppImage package" = '\.AppImage$'
  "Linux Debian package" = '\.deb$'
}
foreach ($entry in $requiredPatterns.GetEnumerator()) {
  if (-not ($release.assets | Where-Object { $_.name -match $entry.Value })) {
    throw "The release is incomplete: missing $($entry.Key). Nothing was installed."
  }
}
$asset = $release.assets | Where-Object { $_.name -match '\.msi$' } | Select-Object -First 1
$sums = $release.assets | Where-Object { $_.name -eq 'SHA256SUMS' } | Select-Object -First 1
$manifest = $release.assets | Where-Object { $_.name -eq 'latest.json' } | Select-Object -First 1
$provenance = $release.assets | Where-Object { $_.name -eq 'BUILD-PROVENANCE.sigstore.json' } | Select-Object -First 1
$platformSignatures = $release.assets | Where-Object { $_.name -eq 'platform-signatures.json' } | Select-Object -First 1
if (-not $asset -or -not $sums -or -not $manifest -or -not $provenance -or -not $platformSignatures) { throw "A verified Windows release is not published yet." }
$target = Join-Path $env:TEMP $asset.name
$sumFile = Join-Path $env:TEMP "project-color-beacons-SHA256SUMS"
$provenanceFile = Join-Path $env:TEMP "project-color-beacons-provenance.json"
$platformSignaturesFile = Join-Path $env:TEMP "project-color-beacons-platform-signatures.json"
Invoke-WebRequest $sums.browser_download_url -OutFile $sumFile
Invoke-WebRequest $provenance.browser_download_url -OutFile $provenanceFile
Invoke-WebRequest $platformSignatures.browser_download_url -OutFile $platformSignaturesFile
$platformStatus = Get-Content $platformSignaturesFile -Raw | ConvertFrom-Json
if ($platformStatus.tag -ne $release.tag_name -or -not $platformStatus.githubProvenanceVerified) {
  throw "The Windows package origin record is invalid. Nothing was installed."
}
if (-not $platformStatus.platforms.windows.provenanceVerified -or $asset.name -notin $platformStatus.platforms.windows.assets) {
  throw "The Windows package origin is not verified. Nothing was installed."
}
Invoke-WebRequest $asset.browser_download_url -OutFile $target
$expected = ((Get-Content $sumFile | Where-Object { $_ -match [regex]::Escape($asset.name) }) -split ' ')[0]
$actual = (Get-FileHash $target -Algorithm SHA256).Hash.ToLower()
if ($expected.ToLower() -ne $actual) { Remove-Item $target; throw "Checksum failed. The download was removed." }
$signature = Get-AuthenticodeSignature -FilePath $target
if ($platformStatus.platforms.windows.authenticodeVerified -and $signature.Status -ne 'Valid') {
  Remove-Item $target
  throw "Windows signature verification failed: $($signature.Status). The download was removed."
}
if (Get-Command gh -ErrorAction SilentlyContinue) {
  gh attestation verify $target --repo $repo --bundle $provenanceFile | Out-Null
  Write-Output "Verified GitHub package origin."
} else {
  Write-Output "Checksum verified. Install GitHub CLI to verify the included GitHub package record."
}
if (-not $platformStatus.platforms.windows.authenticodeVerified) {
  Write-Output "This build is unsigned. Windows may show a publisher warning."
}
Start-Process $target
Write-Output "Verified and opened $target"
