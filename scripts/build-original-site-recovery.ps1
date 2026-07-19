param(
  [string]$BackupRoot = 'C:\Users\salex\OneDrive\Desktop\Hostinger\wattsunified-ghl-live-download-20260710',
  [string]$OutputRoot = (Join-Path $PSScriptRoot '..\original-site-recovery\public')
)

$ErrorActionPreference = 'Stop'
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$outputFull = [IO.Path]::GetFullPath($OutputRoot)

if (-not $outputFull.StartsWith($repoRoot, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to replace output outside the repository: $outputFull"
}

if (Test-Path -LiteralPath $outputFull) {
  Remove-Item -LiteralPath $outputFull -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $outputFull | Out-Null

$manifest = Get-Content -Raw -LiteralPath (Join-Path $BackupRoot 'manifest.json') | ConvertFrom-Json
$replacements = [ordered]@{}
$currentPublic = Join-Path $repoRoot 'tools\main-site\public'
$currentShell = Get-Content -Raw -LiteralPath (Join-Path $currentPublic 'index.html')

Get-ChildItem -LiteralPath $currentPublic -File | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $outputFull $_.Name) -Force
}
Copy-Item -LiteralPath (Join-Path $currentPublic 'assets') -Destination (Join-Path $outputFull 'assets') -Recurse -Force

foreach ($asset in $manifest.assets) {
  if ($asset.status -ne 'OK' -or -not (Test-Path -LiteralPath $asset.file)) { continue }
  $uri = [uri]$asset.url
  if ($uri.Host -eq 'wattsunified.com' -and $uri.AbsolutePath.StartsWith('/assets/')) {
    $relative = $uri.AbsolutePath.TrimStart('/')
  } else {
    $relative = 'media/' + [IO.Path]::GetFileName($asset.file)
  }

  $destination = Join-Path $outputFull ($relative -replace '/', [IO.Path]::DirectorySeparatorChar)
  New-Item -ItemType Directory -Force -Path ([IO.Path]::GetDirectoryName($destination)) | Out-Null
  Copy-Item -LiteralPath $asset.file -Destination $destination -Force
  $replacements[$asset.url] = '/' + ($relative -replace '\\', '/')
}

$spaShellPath = Join-Path $BackupRoot 'pages\solutions.html'
$spaShell = Get-Content -Raw -LiteralPath $spaShellPath
foreach ($entry in $replacements.GetEnumerator()) {
  $spaShell = $spaShell.Replace([string]$entry.Key, [string]$entry.Value)
}

$exactOriginalRoutes = @(
  '/',
  '/opportunity',
  '/opportunity/legalshield-independent-associate',
  '/resources',
  '/protected-growth'
)

foreach ($page in $manifest.pages) {
  if ($page.status -ne 200 -or -not (Test-Path -LiteralPath $page.file)) { continue }
  $route = [string]$page.route
  $relativePage = if ($route -eq '/') { 'index.html' } else { ($route.Trim('/') + '.html') }
  $destination = Join-Path $outputFull ($relativePage -replace '/', [IO.Path]::DirectorySeparatorChar)
  New-Item -ItemType Directory -Force -Path ([IO.Path]::GetDirectoryName($destination)) | Out-Null

  $html = if ($exactOriginalRoutes -contains $route) { $spaShell } else { $currentShell }
  Set-Content -LiteralPath $destination -Value $html -Encoding utf8
}

Set-Content -LiteralPath (Join-Path $outputFull '404.html') -Value $currentShell -Encoding utf8

@'
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
'@ | Set-Content -LiteralPath (Join-Path $outputFull '_headers') -Encoding utf8

[pscustomobject]@{
  Pages = @($manifest.pages | Where-Object status -eq 200).Count
  Assets = $replacements.Count
  Output = $outputFull
}
