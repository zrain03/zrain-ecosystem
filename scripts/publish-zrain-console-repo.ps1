param(
    [switch]$PrepareOnly
)
$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$destination = Join-Path (Split-Path $root -Parent) "zrain-console"

function Check-Git([string]$label) {
    if ($LASTEXITCODE -ne 0) { throw "$label failed. No source files overwritten." }
}

if ((git -C $root branch --show-current).Trim() -ne "main") {
    throw "Switch zrain-ecosystem to the updated main branch first."
}
git -C $root diff --quiet HEAD --
Check-Git "Source safety check"

if (Test-Path $destination) {
    throw "Target folder already exists: $destination. Nothing overwritten. If prepared earlier, publish it manually with gh repo create."
}

$sourceDir = Join-Path $destination "src"
$docsDir = Join-Path $destination "docs"
New-Item -ItemType Directory -Force -Path $sourceDir,$docsDir | Out-Null

# Copy real production source without modifying the Ecosystem.
Copy-Item -LiteralPath (Join-Path $root "public\zrain-console.js") -Destination (Join-Path $sourceDir "zrain-console.js")
Copy-Item -LiteralPath (Join-Path $root "public\console-products.js") -Destination (Join-Path $sourceDir "console-products.js")
Copy-Item -LiteralPath (Join-Path $root "projects\zrain-console\README.md") -Destination (Join-Path $destination "README.md")
Copy-Item -LiteralPath (Join-Path $root "projects\zrain-console\ARCHITECTURE.md") -Destination (Join-Path $docsDir "ARCHITECTURE.md")
Copy-Item -LiteralPath (Join-Path $root "projects\zrain-console\.gitignore") -Destination (Join-Path $destination ".gitignore")

$css = Get-Content (Join-Path $root "public\style.css") -Raw
$start = $css.IndexOf("/* Zrain Console v4.1.0.")
$end = $css.IndexOf("/* Hub section navigation", $start)
if ($start -lt 0 -or $end -le $start) {
    throw "Console CSS marker not found. Local repo prepared but not published."
}
$prefix = ":root { --zr-navy:#172433; --zr-terra:#b95136; --zr-terra-deep:#963d28; }" + [Environment]::NewLine
Set-Content -LiteralPath (Join-Path $sourceDir "zrain-console.css") -Value ($prefix + $css.Substring($start,$end-$start)) -Encoding UTF8

git -C $destination init -b main
Check-Git "Initialize Zrain Console repository"
git -C $destination add .
Check-Git "Stage public source"
git -C $destination commit -m "Initial Zrain Console source and documentation"
Check-Git "Commit public source"

Write-Host "Project source prepared: $destination" -ForegroundColor Green
if ($PrepareOnly) { return }

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "GitHub CLI is missing. Local source is ready." -ForegroundColor Yellow
    Write-Host "Install with: winget install --id GitHub.cli -e"
    Write-Host "Then: gh auth login"
    Write-Host "Then: gh repo create zrain03/zrain-console --public --source $destination --remote origin --push"
    return
}

gh auth status
if ($LASTEXITCODE -ne 0) {
    Write-Host "Authenticate GitHub CLI: gh auth login" -ForegroundColor Yellow
    Write-Host "Then: gh repo create zrain03/zrain-console --public --source $destination --remote origin --push"
    return
}

# Never overwrite or repurpose an existing remote repository.
gh repo view zrain03/zrain-console --json name 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) {
    throw "Remote zrain03/zrain-console already exists. Nothing changed remotely."
}

gh repo create zrain03/zrain-console --public --source $destination --remote origin --push --description "Responsive live app viewer used across Zrain Ecosystem"
Check-Git "Publish Zrain Console repository"
Write-Host "PUBLIC ZRAIN CONSOLE GITHUB REPOSITORY CREATED!" -ForegroundColor Green
Write-Host "https://github.com/zrain03/zrain-console"
