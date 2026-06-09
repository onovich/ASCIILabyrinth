param(
    [string]$HostName = "127.0.0.1",
    [int]$Port = 5174,
    [string]$BasePath = "/ASCIILabyrinth/",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $scriptDir "..")
$editorPath = "editor/index.html"
$base = $BasePath.TrimEnd("/")
$url = "http://${HostName}:${Port}${base}/${editorPath}"

function Test-UrlReady {
    param([string]$TargetUrl)

    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $TargetUrl -TimeoutSec 2
        return [int]$response.StatusCode -ge 200 -and [int]$response.StatusCode -lt 500
    } catch {
        return $false
    }
}

function Wait-UrlReady {
    param(
        [string]$TargetUrl,
        [int]$TimeoutSeconds = 25
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-UrlReady -TargetUrl $TargetUrl) {
            return $true
        }
        Start-Sleep -Milliseconds 500
    }
    return $false
}

if ($DryRun) {
    Write-Host "Project root: $projectRoot"
    Write-Host "Editor URL:   $url"
    Write-Host "Dev command:  npm.cmd run dev -- --host $HostName --port $Port --strictPort"
    if (Test-UrlReady -TargetUrl $url) {
        Write-Host "Server state: already reachable"
    } else {
        Write-Host "Server state: would start Vite dev server"
    }
    exit 0
}

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    Write-Error "npm.cmd was not found on PATH. Install Node.js or open this command from a shell with npm available."
}

if (-not (Test-Path (Join-Path $projectRoot "node_modules"))) {
    Write-Host "node_modules is missing; installing dependencies first..."
    Push-Location $projectRoot
    try {
        & npm.cmd install
    } finally {
        Pop-Location
    }
}

if (-not (Test-UrlReady -TargetUrl $url)) {
    $command = "cd /d `"$projectRoot`" && npm.cmd run dev -- --host $HostName --port $Port --strictPort"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k", $command -WorkingDirectory $projectRoot

    if (-not (Wait-UrlReady -TargetUrl $url)) {
        Write-Error "The local dev server did not become ready at $url"
    }
}

Start-Process $url
