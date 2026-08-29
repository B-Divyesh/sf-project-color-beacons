$ErrorActionPreference = "Stop"
$repo = "B-Divyesh/sf-project-color-beacons"
$release = Invoke-RestMethod "https://api.github.com/repos/$repo/releases/latest"
if ($release.body -notmatch '^Source-signed desktop candidate\.') { throw "A source-signed desktop release is not published yet." }
$asset = $release.assets | Where-Object { $_.name -match '\.(msi|exe)$' } | Select-Object -First 1
$sums = $release.assets | Where-Object { $_.name -eq 'SHA256SUMS' } | Select-Object -First 1
$provenance = $release.assets | Where-Object { $_.name -eq 'BUILD-PROVENANCE.sigstore.json' } | Select-Object -First 1
if (-not $asset -or -not $sums -or -not $provenance) { throw "A source-signed Windows release is not published yet." }
$target = Join-Path $env:TEMP $asset.name
$sumFile = Join-Path $env:TEMP "project-color-beacons-SHA256SUMS"
$provenanceFile = Join-Path $env:TEMP "project-color-beacons-provenance.json"
Invoke-WebRequest $asset.browser_download_url -OutFile $target
Invoke-WebRequest $sums.browser_download_url -OutFile $sumFile
Invoke-WebRequest $provenance.browser_download_url -OutFile $provenanceFile
$expected = ((Get-Content $sumFile | Where-Object { $_ -match [regex]::Escape($asset.name) }) -split ' ')[0]
$actual = (Get-FileHash $target -Algorithm SHA256).Hash.ToLower()
if ($expected.ToLower() -ne $actual) { Remove-Item $target; throw "Checksum failed. The download was removed." }
if (Get-Command gh -ErrorAction SilentlyContinue) {
  gh attestation verify $target --repo $repo --bundle $provenanceFile | Out-Null
  Write-Output "Verified GitHub source identity."
} else {
  Write-Output "Checksum verified. Install GitHub CLI to verify the included source attestation."
}
Start-Process $target
Write-Output "Verified and opened $target"
