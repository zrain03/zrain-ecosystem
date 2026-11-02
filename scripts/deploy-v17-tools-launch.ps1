# Release only the existing Zrain Catalog Worker and Firebase Hosting site.
# Run from a detached Git worktree fetched from origin/main.
# No paid services, Worker, KV namespace, Firebase project or account is created.
param()
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$worker = Join-Path $root 'catalog-worker'
$api = 'https://zrain-ecosystem-catalog.zrain-dev.workers.dev'
function Assert-Exit([string]$step) {
  if ($LASTEXITCODE -ne 0) { throw "$step failed (exit code $LASTEXITCODE). Stopped." }
}
$origin = (& git -C $root remote get-url origin | Select-Object -First 1)
Assert-Exit 'Read Git origin'
if ($origin -notmatch 'github[.]com[:/]zrain03/zrain-ecosystem([.]git)?$') {
  throw "Unexpected repository origin. Stopped without deploying."
}
if (!(Test-Path (Join-Path $root 'public/tools-directory.js')) -or
    !(Test-Path (Join-Path $root 'public/tools-directory-data.js')) -or
    !(Test-Path (Join-Path $worker 'wrangler.toml'))) {
  throw 'v1.7 Zrain Ecosystem release source missing. Stopped.'
}
Write-Host "Testing merged Zrain Ecosystem before production release..." -ForegroundColor Cyan
Push-Location $root
try {
  npm install --no-audit --no-fund
  Assert-Exit 'Install pinned Zrain dependencies'
  npm run ui:sync
  Assert-Exit 'Synchronize Zrain UI'
  npm run test:release
  Assert-Exit 'Zrain Ecosystem release tests'
} finally { Pop-Location }
Write-Host "Confirm the existing Catalog Worker is healthy before updating it..." -ForegroundColor Cyan
try {
  $health = Invoke-RestMethod -Uri "$api/api/health" -TimeoutSec 30
  $ready = Invoke-RestMethod -Uri "$api/api/ready" -TimeoutSec 30
} catch {
  throw 'Existing Catalog Worker could not be verified. Nothing has been deployed.'
}
if ($health.status -ne 'ok' -or $ready.ready -ne $true) {
  throw 'Existing Catalog Worker is not ready. Nothing has been deployed.'
}
Write-Host 'Before any Cloudflare change, check Workers Free and KV Free in your own Cloudflare dashboard.' -ForegroundColor Yellow
$approve = Read-Host 'Type FREE_WORKERS only if the account uses Workers Free and you approve updating the existing catalog Worker'
if ($approve -cne 'FREE_WORKERS') { throw 'Cloudflare Free approval missing. Nothing has been deployed.' }
Push-Location $worker
try {
  npm install --no-audit --no-fund
  Assert-Exit 'Install Worker dependencies'
  npm test
  Assert-Exit 'Catalog Worker unit tests'
  $wrangler = Join-Path $worker 'node_modules\.bin\wrangler.cmd'
  if (!(Test-Path $wrangler)) { throw 'Local Wrangler CLI missing. Stopped.' }
  & $wrangler whoami
  Assert-Exit 'Cloudflare login'
  Write-Host 'Deploying code to the existing Catalog Worker, without changing KV or secrets.' -ForegroundColor Cyan
  & $wrangler deploy
  Assert-Exit 'Catalog Worker deployment'
} finally { Pop-Location }
$ready = Invoke-RestMethod -Uri "$api/api/ready" -TimeoutSec 40
if ($ready.ready -ne $true) { throw 'Updated Worker is not ready. Firebase Hosting was NOT deployed.' }
Write-Host "Cloudflare Worker updated. Firebase release requires Spark plan validation next." -ForegroundColor Green
firebase --version
Assert-Exit 'Firebase CLI'
firebase projects:list
Assert-Exit 'Firebase account project list'
& (Join-Path $root 'deploy.ps1') -ProjectId 'zrain-ecosystem'
if (-not $?) { throw 'Firebase deploy.ps1 did not complete successfully.' }
Write-Host ""
Write-Host "Zrain Ecosystem release commands completed." -ForegroundColor Green
Write-Host 'Check https://zrain.web.app/#explore-tools for 28 searchable tools.' -ForegroundColor Cyan
Write-Host 'Then sign in at https://zrain.web.app/admin and choose Publish the 5 Zrain Tools.' -ForegroundColor Cyan
Write-Host 'Monitor and Links Hosting are independent and still use their own prior release script.' -ForegroundColor Yellow
