<#
Auto Push Script
用途: 在网络可用时自动尝试将本地分支推送到远程。
用法示例（在仓库根目录外也可运行，指定 -RepositoryPath）:
    .\auto_push.ps1 -RepositoryPath 'C:\path\to\repo' -Branch 'main' -IntervalSec 60

默认行为: 每间隔检查一次网络，若能连通 github:443 则执行 `git push origin <branch>`，成功后记录日志并退出。
#>

param(
    [string]$RepositoryPath = "${PWD}",
    [string]$Branch = 'main',
    [int]$IntervalSec = 60,
    [int]$MaxAttempts = 0  # 0 means unlimited
)

function Log($msg) {
    $ts = (Get-Date).ToString('u')
    $line = "[$ts] $msg"
    Write-Output $line
    try { Add-Content -Path (Join-Path $RepositoryPath 'auto_push.log') -Value $line } catch {}
}

Set-Location -Path $RepositoryPath
Log "启动 auto_push：仓库=$RepositoryPath 分支=$Branch 间隔=${IntervalSec}s"

$attempt = 0
while ($MaxAttempts -eq 0 -or $attempt -lt $MaxAttempts) {
    $attempt++
    Log "尝试 #$attempt: 检查网络连通性到 github.com:443..."

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
        Log "检测到网络：尝试 git push origin $Branch"
        try {
            $pushOut = git rev-parse --is-inside-work-tree 2>&1
            if ($LASTEXITCODE -ne 0) {
                Log "错误：当前目录不是 git 仓库或 git 未安装。退出。"
                break
            }

            $cmd = "git push origin $Branch"
            Log "执行: $cmd"
            $result = & git push origin $Branch 2>&1
            $rc = $LASTEXITCODE
            Log ("git push 返回码: $rc")
            Log ($result -join "`n")

            if ($rc -eq 0) {
                Log "推送成功，脚本退出。"
                break
            } else {
                Log "推送失败，稍后重试。"
            }
        } catch {
            Log "执行 git push 时出现异常：$_"
        }
    } else {
        Log "网络不可用，等待 ${IntervalSec}s 后重试。"
    }

    Start-Sleep -Seconds $IntervalSec
}

Log "auto_push 脚本结束。"
