param(
  [string]$Root = (Join-Path $PSScriptRoot '..\tools')
)

$ErrorActionPreference = 'Stop'
$manifestPath = Join-Path $PSScriptRoot '..\published-projects.json'
$manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json

function Get-SafeName([uri]$Uri) {
  $leaf = [IO.Path]::GetFileName($Uri.AbsolutePath)
  if ([string]::IsNullOrWhiteSpace($leaf)) { $leaf = 'asset' }
  $sha = [Security.Cryptography.SHA256]::Create()
  try {
    $bytes = [Text.Encoding]::UTF8.GetBytes($Uri.AbsoluteUri)
    $hash = ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-', '').Substring(0, 12).ToLowerInvariant()
  } finally { $sha.Dispose() }
  return "$hash-$leaf"
}

function Resolve-AssetUri([uri]$BaseUri, [string]$Reference) {
  if ($Reference -match '^(data:|mailto:|tel:|#|javascript:)') { return $null }
  try { return [uri]::new($BaseUri, $Reference) } catch { return $null }
}

function Save-WebFile([uri]$Uri, [string]$Destination) {
  New-Item -ItemType Directory -Force -Path ([IO.Path]::GetDirectoryName($Destination)) | Out-Null
  Invoke-WebRequest -Uri $Uri.AbsoluteUri -MaximumRedirection 8 -OutFile $Destination -UseBasicParsing -Headers @{
    'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138 Safari/537.36'
    'Accept' = '*/*'
  }
}

foreach ($project in $manifest.projects | Where-Object published) {
  $toolRoot = Join-Path $Root $project.slug
  $publicRoot = Join-Path $toolRoot 'public'
  New-Item -ItemType Directory -Force -Path $publicRoot | Out-Null

  $sourceUri = [uri]"https://$($project.hostname)/"
  $response = Invoke-WebRequest -Uri $sourceUri.AbsoluteUri -MaximumRedirection 8 -UseBasicParsing -Headers @{
    'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138 Safari/537.36'
    'Accept' = 'text/html,application/xhtml+xml'
  }
  $html = [string]$response.Content
  $title = [regex]::Match($html, '<title[^>]*>(.*?)</title>', 'IgnoreCase,Singleline').Groups[1].Value

  if ($title -match 'CNAME Cross-User Banned') {
    [pscustomobject]@{ slug=$project.slug; hostname=$project.hostname; status='recovery-required'; title=$title }
    continue
  }

  $references = [regex]::Matches($html, '(?:src|href|content)=["'']([^"'']+)["'']', 'IgnoreCase') |
    ForEach-Object { $_.Groups[1].Value } |
    Where-Object { $_ -match '\.(js|css|svg|png|jpe?g|webp|gif|ico|woff2?|ttf)(\?|$)' } |
    Select-Object -Unique

  foreach ($reference in $references) {
    $assetUri = Resolve-AssetUri $sourceUri $reference
    if ($null -eq $assetUri) { continue }

    if ($assetUri.Host -eq $sourceUri.Host) {
      $relative = $assetUri.AbsolutePath.TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($relative)) { continue }
      $localRelative = $relative
    } else {
      $localRelative = 'assets/external/' + (Get-SafeName $assetUri)
    }

    $destination = Join-Path $publicRoot ($localRelative -replace '/', [IO.Path]::DirectorySeparatorChar)
    try {
      Save-WebFile $assetUri $destination
      $html = $html.Replace($reference, '/' + ($localRelative -replace '\\', '/'))
    } catch {
      Write-Warning "Failed to download $($assetUri.AbsoluteUri): $($_.Exception.Message)"
    }
  }

  Set-Content -LiteralPath (Join-Path $publicRoot 'index.html') -Value $html -Encoding utf8
  [pscustomobject]@{ slug=$project.slug; hostname=$project.hostname; status='mirrored'; title=$title.Trim() }
}
