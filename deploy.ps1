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

    # Protect the admin release from publishing a non-functional /admin page.
    if (Test-Path '.\public\admin\index.html') {
        $config = Get-Content '.\public\api-config.js' -Raw
        if ($config -notmatch 'const PRODUCTION_API_URL = "([^"]+)";') {
            throw 'Production Admin API URL is not configured. Deployment stopped.'
        }
        $apiUrl = $Matches[1]
        if ($apiUrl -notmatch '^https://[A-Za-z0-9.-]+

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
) {
            throw 'Production Admin API must be a verified HTTPS origin.'
        }
        try {
            $health = Invoke-RestMethod -Uri "$apiUrl/api/health" -TimeoutSec 100
        } catch {
            throw 'Production Admin API health check failed. Deployment stopped.'
        }
        if ($health.status -ne 'ok') {
            throw 'Production Admin API is not healthy. Deployment stopped.'
        }

        # Stage 1 intentionally allows a blank public catalog URL.
        # Once configured, the Worker must already provide a valid published array.
        if ($config -match 'const PRODUCTION_CATALOG_URL = "([^"]+)";') {
            $catalogUrl = $Matches[1]
            if ($catalogUrl -notmatch '^https://[A-Za-z0-9.-]+/api/catalog

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
) {
                throw 'Production catalog URL must use the verified HTTPS catalog endpoint.'
            }
            try {
                $catalog = @(Invoke-RestMethod -Uri $catalogUrl -TimeoutSec 25)
            } catch {
                throw 'Published catalog could not be loaded. Deployment stopped.'
            }
            if ($catalog.Count -lt 1) {
                throw 'The published catalog is empty. Deployment stopped.'
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
