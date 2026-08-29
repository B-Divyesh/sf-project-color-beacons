$ErrorActionPreference = "Stop"
$repo = "B-Divyesh/sf-project-color-beacons"
$release = Invoke-RestMethod "https://api.github.com/repos/$repo/releases/latest"
if ($release.body -notmatch '^Signed and notarized desktop builds\.') { throw "A signed and notarized release is not published yet." }
$asset = $release.assets | Where-Object { $_.name -match '\.(msi|exe)$' } | Select-Object -First 1
$sums = $release.assets | Where-Object { $_.name -eq 'SHA256SUMS' } | Select-Object -First 1
if (-not $asset -or -not $sums) { throw "A Windows release is not published yet." }
$target = Join-Path $env:TEMP $asset.name
$sumFile = Join-Path $env:TEMP "project-color-beacons-SHA256SUMS"
Invoke-WebRequest $asset.browser_download_url -OutFile $target
Invoke-WebRequest $sums.browser_download_url -OutFile $sumFile
$expected = ((Get-Content $sumFile | Where-Object { $_ -match [regex]::Escape($asset.name) }) -split ' ')[0]
$actual = (Get-FileHash $target -Algorithm SHA256).Hash.ToLower()
if ($expected.ToLower() -ne $actual) { Remove-Item $target; throw "Checksum failed. The download was removed." }
Start-Process $target
Write-Output "Verified and opened $target"
