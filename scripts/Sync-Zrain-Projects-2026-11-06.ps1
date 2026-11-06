<#
Fail / File: Sync-Zrain-Projects-2026-11-06.ps1
Pembangun / Developer: Zrain
Dicipta / Created: 2026-11-06
Dikemas kini / Last updated: 2026-11-06
BM: Selaraskan sumber tempatan dengan branch rasmi setiap projek GitHub, simpan
    folder asal secara utuh, dan elakkan reset paksa atau penghapusan kerja pengguna.
EN: Align local sources with each project's official GitHub branch, preserve
    complete originals, and avoid forced resets or deleting user changes.
#>
[CmdletBinding()]
param([switch]$AuditOnly)

$ErrorActionPreference = 'Stop'
$projects = Join-Path $env:USERPROFILE 'Downloads\Zrain\Projects'
$releases = Join-Path $env:USERPROFILE 'Downloads\Zrain\Releases'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $releases ("Source-Sync-Backup-$stamp")

# BM: Nama folder PC mungkin berbeza daripada nama repositori GitHub.
# EN: Local folder names can differ from their GitHub repository names.
$entries = @(
    @{ Folder='zrain-ecosystem'; Repo='zrain-ecosystem'; Branch='main'; ExpectedSha='155308b652a4cb9fc675d68bacd56705f078a654' },
    @{ Folder='zrain-links'; Repo='zrain-links'; Branch='main' },
    @{ Folder='zrain-auth-starter'; Repo='zrain-auth-starter'; Branch='main' },
    @{ Folder='zrain-community'; Repo='zrain-community'; Branch='main' },
    @{ Folder='zrain-ai'; Repo='zrain-ai'; Branch='main' },
    @{ Folder='zrain-tools'; Repo='zrain-tools'; Branch='main' },
    @{ Folder='zrain-monitor'; Repo='zrain-monitor'; Branch='master' },
    @{ Folder='flagtheguess'; Repo='guess-the-flag'; Branch='main' },
    @{ Folder='memory_rush'; Repo='memory-rush'; Branch='main' },
    @{ Folder='zrain-console'; Repo='zrain-console'; Branch='main' },
    @{ Folder='zrain-ui'; Repo='zrain-ui'; Branch='main' }
)

if (!(Get-Command git.exe -ErrorAction SilentlyContinue)) {
    throw 'Git is not installed or cannot be found.'
}
if (!(Test-Path -LiteralPath $projects -PathType Container)) {
    throw "Official Projects folder is missing: $projects"
}

$results = [System.Collections.Generic.List[object]]::new()
function Report([string]$name,[string]$status,[string]$message) {
    $results.Add([pscustomobject]@{ Project=$name; Result=$status; Detail=$message })
    Write-Host ("[{0}] {1}: {2}" -f $status,$name,$message)
}

Write-Host ('='*70) -ForegroundColor Cyan
Write-Host ('ZRAIN OFFICIAL SOURCE SYNC: ' + $(if ($AuditOnly) {'AUDIT ONLY'} else {'SAFE UPDATE'})) -ForegroundColor Cyan
Write-Host ('Local root: ' + $projects)
Write-Host 'Never force-resets or deletes an existing official project.'
Write-Host ('='*70) -ForegroundColor Cyan

foreach ($entry in $entries) {
    $name = [string]$entry.Folder
    $repo = [string]$entry.Repo
    $branch = [string]$entry.Branch
    $local = Join-Path $projects $name
    $stage = $null

    try {
        if (!(Test-Path -LiteralPath $local -PathType Container)) {
            Report $name 'SKIPPED' 'Official folder missing; not creating an unrequested project.'
            continue
        }
        # BM: Jangan sentuh folder tanpa direktori Git sebenar atau worktree bersambung.
        # EN: Refuse non-Git folders and linked Git worktrees.
        if (!(Test-Path -LiteralPath (Join-Path $local '.git') -PathType Container)) {
            Report $name 'SKIPPED' 'Not a standalone Git checkout; existing contents protected.'
            continue
        }
        $origin = (& git.exe -C $local remote get-url origin 2>$null)
        if ($LASTEXITCODE -ne 0 -or !($origin -match ('(?i)github\.com[:/]zrain03/' + [regex]::Escape($repo) + '(?:\.git)?/?$'))) {
            Report $name 'SKIPPED' 'Origin does not match the expected official GitHub repository.'
            continue
        }
        $onBranch = (& git.exe -C $local symbolic-ref --quiet --short HEAD 2>$null)
        if ($LASTEXITCODE -ne 0 -or "$onBranch".Trim() -cne $branch) {
            Report $name 'SKIPPED' "Local branch is not $branch; preserving independent work."
            continue
        }
        $localHead = (& git.exe -C $local rev-parse HEAD)
        if ($LASTEXITCODE -ne 0) { throw 'Cannot read local Git commit.' }
        $localHead = "$localHead".Trim()
        $remoteLine = @(& git.exe -C $local ls-remote --heads origin "refs/heads/$branch" 2>$null)
        if ($LASTEXITCODE -ne 0 -or $remoteLine.Count -ne 1) {
            Report $name 'SKIPPED' 'Cannot verify remote branch (network or permissions).'
            continue
        }
        $remoteHead = ($remoteLine[0] -split '\s+')[0]
        if ($remoteHead -notmatch '^[0-9a-f]{40}$') { throw 'Invalid remote commit SHA.' }
        if ($entry.ContainsKey('ExpectedSha') -and $remoteHead -cne [string]$entry.ExpectedSha) {
            Report $name 'SKIPPED' 'Ecosystem main has advanced beyond the verified release; manual review required.'
            continue
        }
        $changed = @(& git.exe -C $local status --porcelain=v1 --untracked-files=all)
        if ($LASTEXITCODE -ne 0) { throw 'Cannot inspect local changes.' }
        if ($localHead -ceq $remoteHead -and $changed.Count -eq 0) {
            Report $name 'CURRENT' ('Already matches GitHub: ' + $remoteHead.Substring(0,10))
            continue
        }
        # BM: Jangan gantikan commit yang belum berada di GitHub.
        # EN: Refuse to replace local-only or diverged commits.
        if ($localHead -cne $remoteHead) {
            & git.exe -C $local fetch --no-tags origin $branch | Out-Null
            if ($LASTEXITCODE -ne 0) { throw 'Unable to fetch remote branch.' }
            & git.exe -C $local merge-base --is-ancestor $localHead $remoteHead
            if ($LASTEXITCODE -ne 0) {
                Report $name 'SKIPPED' 'Local commits are ahead or diverged; preserved without replacement.'
                continue
            }
        }
        $reason = if ($changed.Count -gt 0) { "$($changed.Count) local change(s) backed up" } else { 'clean checkout' }
        if ($AuditOnly) {
            Report $name 'WOULD UPDATE' ("GitHub $($remoteHead.Substring(0,10)); $reason")
            continue
        }
        # BM: Klon dahulu dan semak SHA sebelum menyentuh folder rasmi.
        # EN: Stage a fully verified clone before moving any official folder.
        $stage = Join-Path $projects ('.zrain-stage-' + $name + '-' + [guid]::NewGuid().ToString('N').Substring(0,8))
        $expectedUrl = "https://github.com/zrain03/zrain03/zrain-ecosystem.git"
        & git.exe clone --quiet --single-branch --branch $branch $expectedUrl $stage
        if ($LASTEXITCODE -ne 0) { throw 'Fresh GitHub clone failed; original folder unchanged.' }
        $stageHead = (& git.exe -C $stage rev-parse HEAD)
        if ($LASTEXITCODE -ne 0 -or "$stageHead".Trim() -cne $remoteHead) {
            throw 'Staged clone SHA is different from verified GitHub HEAD; original unchanged.'
        }
        $backup = Join-Path $backupRoot $name
        if (!(Test-Path -LiteralPath $backupRoot)) {
            New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
        }
        if (Test-Path -LiteralPath $backup) { throw 'Backup destination already exists; no swap made.' }
        # BM: Pemindahan ini menyimpan SELURUH folder asal, termasuk fail tidak di-commit.
        # EN: This move retains the COMPLETE original, including uncommitted files.
        Move-Item -LiteralPath $local -Destination $backup -ErrorAction Stop
        try {
            Move-Item -LiteralPath $stage -Destination $local -ErrorAction Stop
            $stage = $null
        } catch {
            if (!(Test-Path -LiteralPath $local) -and (Test-Path -LiteralPath $backup)) {
                Move-Item -LiteralPath $backup -Destination $local -ErrorAction Stop
            }
            throw
        }
        Report $name 'UPDATED' ("GitHub $($remoteHead.Substring(0,10)); original saved at $backup")
    } catch {
        Report $name 'FAILED' $_.Exception.Message
    } finally {
        # BM: Hanya buang klon sementara yang dicipta sendiri jika ia masih wujud.
        # EN: Only remove a disposable staging clone created by this script.
        if ($stage -and (Test-Path -LiteralPath $stage)) {
            Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}
# BM: Gifts belum mempunyai repositori rasmi yang disahkan. Jangan disentuh.
# EN: Gifts has no verified matching repo. Leave its original folder untouched.
Report 'zrain-gifts' 'UNCHANGED' 'No verified zrain03/zrain-gifts repository. Folder preserved.'
Write-Host ("`n=== SUMMARY ===") -ForegroundColor Cyan
$results | Format-Table Project,Result,Detail -Wrap -AutoSize
if (!$AuditOnly -and (Test-Path -LiteralPath $backupRoot)) {
    Write-Host ('Original source backups: ' + $backupRoot) -ForegroundColor Yellow
}
Write-Host 'GitHub push: NOT performed. Firebase deployment: NOT performed.'
