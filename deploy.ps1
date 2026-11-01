param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId
)

$ErrorActionPreference = 'Stop'
if ($ProjectId -ne 'zrain-ecosystem') {
    throw 'Deployment stopped: use Firebase project zrain-ecosystem only.'
}

Push-Location $PSScriptRoot
try {
    function Assert-Success([string]$Step) {
        if ($LASTEXITCODE -ne 0) {
            throw "$Step failed. Deployment stopped."
        }
    }

    if (!(Test-Path '.\firebase.json') -or !(Test-Path '.\public\index.html')) {
        throw 'Missing firebase.json or public/index.html. Deployment stopped.'
    }

    # This release must not publish a nonfunctional /admin page.
    if (Test-Path '.\public\admin\index.html') {
        $config = Get-Content '.\public\api-config.js' -Raw
        if ($config -notmatch 'const PRODUCTION_API_URL = "([^"]+)";') {
            throw 'Production Admin API URL is not configured.'
        }
        $apiUrl = $Matches[1]
        if ($apiUrl -notmatch '^https://[A-Za-z0-9.-]+$') {
            throw 'Production Admin API URL must be an HTTPS origin.'
        }
        try {
            $health = Invoke-RestMethod -Uri "$apiUrl/api/health" -TimeoutSec 90
        } catch {
            throw 'Production Admin API is unreachable. Deployment stopped.'
        }
        if ($health.status -ne 'ok') {
            throw 'Production Admin API health check failed.'
        }

        # Stage 1 permits an empty catalog URL while the six products are imported.
        # Stage 2 requires the published catalog to contain all six official products.
        if ($config -match 'const PRODUCTION_CATALOG_URL = "([^"]+)";') {
            $catalogUrl = $Matches[1]
            if ($catalogUrl -notmatch '^https://[A-Za-z0-9.-]+/api/catalog$') {
                throw 'Invalid Cloudflare public catalog URL.'
            }
            try {
                $catalog = Invoke-RestMethod -Uri $catalogUrl -TimeoutSec 30
            } catch {
                throw 'Public catalog endpoint unavailable. Deployment stopped.'
            }
            if ($null -eq $catalog -or @($catalog).Count -lt 6) {
                throw 'Fewer than six published products. Deployment stopped.'
            }
        }
    }

    npm install
    Assert-Success 'Dependency installation'

    npm run ui:sync
    Assert-Success 'Official Zrain UI sync'

    npm run test:release
    Assert-Success 'Zrain Ecosystem release tests'

    firebase hosting:sites:get zrain --project $ProjectId
    Assert-Success 'Confirm Firebase Hosting site zrain'

    firebase deploy --only hosting --project $ProjectId
    Assert-Success 'Firebase Hosting deployment'

    Write-Host 'Zrain Ecosystem v4 deployment complete: https://zrain.web.app'
} finally {
    Pop-Location
}
