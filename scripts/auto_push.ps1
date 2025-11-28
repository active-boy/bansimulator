<#
Auto Push Script
Purpose: Attempt to push local commits to remote when network is available.
Usage (can be run outside repo root by specifying -RepositoryPath):
    .\auto_push.ps1 -RepositoryPath 'C:\path\to\repo' -Branch 'main' -IntervalSec 60

Behavior: Periodically check network connectivity; if github:443 is reachable,
run `git push origin <branch>`. On success write a log and exit.
#>

param(
    [string]$RepositoryPath,
    [string]$Branch = 'main',
    [int]$IntervalSec = 60,
    [int]$MaxAttempts = 0  # 0 means unlimited
)

if (-not $RepositoryPath -or $RepositoryPath -eq '') {
    $RepositoryPath = (Get-Location).Path
}

function Log($msg) {
    $ts = (Get-Date).ToString('u')
    $line = "[$ts] $msg"
    Write-Output $line
    try { Add-Content -Path (Join-Path $RepositoryPath 'auto_push.log') -Value $line } catch {}
}

Set-Location -Path $RepositoryPath
Log "Starting auto_push: repo=$RepositoryPath branch=${Branch} interval=${IntervalSec}s"

$attempt = 0
while ($MaxAttempts -eq 0 -or $attempt -lt $MaxAttempts) {
    $attempt++
    Log "Attempt #${attempt}: checking connectivity to github.com:443..."

    try {
        $net = Test-NetConnection -ComputerName 'github.com' -Port 443 -WarningAction SilentlyContinue
        $ok = $false
        if ($net) {
            if ($net.TcpTestSucceeded -eq $true) { $ok = $true }
        }
    } catch {
        $ok = $false
    }

    if ($ok) {
        Log "Network available: attempting git push origin ${Branch}"
        try {
            $pushOut = git rev-parse --is-inside-work-tree 2>&1
            if ($LASTEXITCODE -ne 0) {
                Log 'Error: current directory is not a git repo or git is not installed. Exiting.'
                break
            }

            $cmd = "git push origin $Branch"
            Log "执行: $cmd"
            $result = & git push origin $Branch 2>&1
            $rc = $LASTEXITCODE
            Log ("git push 返回码: $rc")
            Log ($result -join "`n")

            if ($rc -eq 0) {
                Log 'Push succeeded, exiting script.'
                break
            } else {
                Log 'Push failed, will retry later.'
            }
        } catch {
            Log "Exception while executing git push: $($_)"
        }
    } else {
        Log "Network unavailable, waiting ${IntervalSec}s before retry."
    }

    Start-Sleep -Seconds $IntervalSec
}

Log 'auto_push script finished.'
