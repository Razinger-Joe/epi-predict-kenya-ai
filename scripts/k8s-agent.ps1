#!/usr/bin/env pwsh
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  EpiPredict Kenya AI — Kubernetes Deployment Agent                         ║
# ║  A menu-driven automation script for Docker Desktop Kubernetes on Windows  ║
# ║  Version : 2.0.0                                                          ║
# ║  Date    : 2026-05-30                                                      ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

#Requires -Version 5.1

# ─── Global Configuration ────────────────────────────────────────────────────
$ErrorActionPreference = "Stop"

$Script:RELEASE_NAME   = "epipredict"
$Script:NAMESPACE       = "epipredict"
$Script:HELM_CHART_PATH = "helm/epipredict"
$Script:VALUES_DEV      = "helm/epipredict/values-dev.yaml"
$Script:VALUES_PROD     = "helm/epipredict/values-prod.yaml"

# Service definitions — image name, Dockerfile context, container port
$Script:SERVICES = @(
    @{ Name = "frontend";   Image = "epipredict-frontend:latest";   Context = "./frontend";   Port = 80;   LocalPort = 8080  }
    @{ Name = "backend";    Image = "epipredict-backend:latest";    Context = "./backend";    Port = 8000; LocalPort = 8000  }
    @{ Name = "ml-service"; Image = "epipredict-ml-service:latest"; Context = "./ml-service"; Port = 5000; LocalPort = 5000  }
    @{ Name = "database";   Image = "postgres:15-alpine";           Context = $null;          Port = 5432; LocalPort = 5432  }
)

# Spinner frames for animations
$Script:SPINNER = @('⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏')

# ─── Color Helper Functions ──────────────────────────────────────────────────

function Write-Info    { param([string]$Msg) Write-Host $Msg -ForegroundColor Cyan }
function Write-Success { param([string]$Msg) Write-Host $Msg -ForegroundColor Green }
function Write-Warn    { param([string]$Msg) Write-Host $Msg -ForegroundColor Yellow }
function Write-Err     { param([string]$Msg) Write-Host $Msg -ForegroundColor Red }
function Write-Edu     { param([string]$Msg) Write-Host $Msg -ForegroundColor Magenta }
function Write-Accent  { param([string]$Msg) Write-Host $Msg -ForegroundColor DarkCyan }

function Write-Header {
    param([string]$Title)
    $width = 72
    $pad   = $width - $Title.Length - 4
    if ($pad -lt 0) { $pad = 0 }
    Write-Host ""
    Write-Host ("╔" + ("═" * ($width - 2)) + "╗") -ForegroundColor Cyan
    Write-Host ("║  $Title" + (" " * $pad) + "║") -ForegroundColor Cyan
    Write-Host ("╚" + ("═" * ($width - 2)) + "╝") -ForegroundColor Cyan
    Write-Host ""
}

function Write-SubHeader {
    param([string]$Title)
    $width = 60
    $line  = "─" * $width
    Write-Host ""
    Write-Host "  ┌$line┐" -ForegroundColor DarkCyan
    Write-Host "  │  $Title$(" " * ($width - $Title.Length - 2))│" -ForegroundColor DarkCyan
    Write-Host "  └$line┘" -ForegroundColor DarkCyan
    Write-Host ""
}

function Write-DashboardSection {
    param([string]$Title, [string[]]$Lines)
    $width = 76
    $border = "─" * ($width - 2)
    Write-Host "  ┌$border┐" -ForegroundColor DarkGray
    Write-Host "  │ $Title$(" " * ($width - $Title.Length - 4)) │" -ForegroundColor Yellow
    Write-Host "  ├$border┤" -ForegroundColor DarkGray
    foreach ($line in $Lines) {
        $clean = $line -replace '\x1b\[[0-9;]*m', ''
        $padLen = $width - $clean.Length - 4
        if ($padLen -lt 0) { $padLen = 0 }
        Write-Host "  │ $line$(" " * $padLen) │" -ForegroundColor DarkGray
    }
    Write-Host "  └$border┘" -ForegroundColor DarkGray
    Write-Host ""
}

# ─── Banner ──────────────────────────────────────────────────────────────────

function Show-Banner {
    Clear-Host
    Write-Host ""
    Write-Host "  ███████╗██████╗ ██╗██████╗ ██████╗ ███████╗██████╗ ██╗ ██████╗████████╗" -ForegroundColor Green
    Write-Host "  ██╔════╝██╔══██╗██║██╔══██╗██╔══██╗██╔════╝██╔══██╗██║██╔════╝╚══██╔══╝" -ForegroundColor Green
    Write-Host "  █████╗  ██████╔╝██║██████╔╝██████╔╝█████╗  ██║  ██║██║██║        ██║   " -ForegroundColor Green
    Write-Host "  ██╔══╝  ██╔═══╝ ██║██╔═══╝ ██╔══██╗██╔══╝  ██║  ██║██║██║        ██║   " -ForegroundColor Green
    Write-Host "  ███████╗██║     ██║██║     ██║  ██║███████╗██████╔╝██║╚██████╗   ██║   " -ForegroundColor Green
    Write-Host "  ╚══════╝╚═╝     ╚═╝╚═╝     ╚═╝  ╚═╝╚══════╝╚═════╝ ╚═╝ ╚═════╝   ╚═╝   " -ForegroundColor Green
    Write-Host ""
    Write-Host "       Kenya AI  ·  Kubernetes Deployment Agent  ·  v2.0" -ForegroundColor DarkGreen
    Write-Host "       Docker Desktop Kubernetes on Windows" -ForegroundColor DarkGray
    Write-Host ("       " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")) -ForegroundColor DarkGray
    Write-Host ""
}

# ─── Menu ────────────────────────────────────────────────────────────────────

function Show-Menu {
    $w = 56
    $border = "═" * ($w - 2)
    $thin   = "─" * ($w - 2)
    Write-Host "  ╔$border╗" -ForegroundColor Cyan
    Write-Host "  ║  MAIN MENU$(" " * ($w - 14))║" -ForegroundColor Cyan
    Write-Host "  ╠$border╣" -ForegroundColor Cyan

    $items = @(
        "1 │ Check Prerequisites"
        "2 │ Build Docker Images"
        "3 │ Deploy (Helm Install / Upgrade)"
        "4 │ Status Dashboard"
        "5 │ View Logs"
        "6 │ Scale Deployment"
        "7 │ Port Forward"
        "8 │ Load Test (HPA Demo)"
        "9 │ Full Guide Mode"
        "$thin"
        "0 │ Exit"
    )

    foreach ($item in $items) {
        if ($item -eq $thin) {
            Write-Host "  ╟$thin╢" -ForegroundColor Cyan
        } else {
            $pad = $w - $item.Length - 4
            if ($pad -lt 0) { $pad = 0 }
            Write-Host "  ║  $item$(" " * $pad)║" -ForegroundColor Cyan
        }
    }

    Write-Host "  ╚$border╝" -ForegroundColor Cyan
    Write-Host ""
}

# ─── Utility Helpers ─────────────────────────────────────────────────────────

function Test-CommandExists {
    param([string]$Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Get-CommandVersion {
    param([string]$Command, [string]$VersionFlag = "--version")
    try {
        $output = & $Command $VersionFlag 2>&1 | Select-Object -First 1
        return $output.ToString().Trim()
    } catch {
        return "N/A"
    }
}

function Test-HelmReleaseExists {
    <#
    .SYNOPSIS
        Checks whether a Helm release already exists in the target namespace.
    #>
    try {
        $releases = helm list -n $Script:NAMESPACE -q 2>&1
        if ($LASTEXITCODE -ne 0) { return $false }
        return ($releases -split "`n") -contains $Script:RELEASE_NAME
    } catch {
        return $false
    }
}

function Test-MetricsServerAvailable {
    <#
    .SYNOPSIS
        Returns $true when the metrics-server deployment is present in kube-system.
    #>
    try {
        $result = kubectl get deployment metrics-server -n kube-system -o name 2>&1
        return ($LASTEXITCODE -eq 0) -and ($result -match "metrics-server")
    } catch {
        return $false
    }
}

function Test-NamespaceExists {
    param([string]$Ns)
    try {
        kubectl get namespace $Ns -o name 2>&1 | Out-Null
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

function Ensure-Namespace {
    if (-not (Test-NamespaceExists $Script:NAMESPACE)) {
        Write-Info "  Creating namespace '$Script:NAMESPACE'..."
        kubectl create namespace $Script:NAMESPACE 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "  ✓ Namespace '$Script:NAMESPACE' created."
        } else {
            Write-Err "  ✗ Failed to create namespace."
        }
    }
}

function Wait-ForPodsReady {
    <#
    .SYNOPSIS
        Waits for all pods in the namespace to reach Running/Ready state.
        Displays a spinner animation while waiting.
    .PARAMETER TimeoutSeconds
        Maximum seconds to wait before giving up.
    .PARAMETER Label
        Optional label selector to filter pods.
    #>
    param(
        [int]$TimeoutSeconds = 180,
        [string]$Label = ""
    )

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $spinIdx   = 0

    $labelArgs = @()
    if ($Label) { $labelArgs = @("-l", $Label) }

    while ($stopwatch.Elapsed.TotalSeconds -lt $TimeoutSeconds) {
        $frame = $Script:SPINNER[$spinIdx % $Script:SPINNER.Count]
        $elapsed = [math]::Round($stopwatch.Elapsed.TotalSeconds)

        # Get pod statuses
        try {
            $pods = kubectl get pods -n $Script:NAMESPACE @labelArgs -o json 2>&1 | ConvertFrom-Json
        } catch {
            $spinIdx++
            Start-Sleep -Milliseconds 500
            continue
        }

        if (-not $pods.items -or $pods.items.Count -eq 0) {
            Write-Host "`r  $frame  Waiting for pods to appear... (${elapsed}s)" -NoNewline -ForegroundColor Yellow
            $spinIdx++
            Start-Sleep -Milliseconds 500
            continue
        }

        $total     = $pods.items.Count
        $ready     = 0
        $notReady  = @()

        foreach ($pod in $pods.items) {
            $podName   = $pod.metadata.name
            $phase     = $pod.status.phase
            $allReady  = $true

            if ($pod.status.containerStatuses) {
                foreach ($cs in $pod.status.containerStatuses) {
                    if (-not $cs.ready) { $allReady = $false }
                }
            } else {
                $allReady = $false
            }

            if ($phase -eq "Running" -and $allReady) {
                $ready++
            } else {
                $notReady += $podName
            }
        }

        Write-Host "`r  $frame  Pods ready: $ready/$total (${elapsed}s)        " -NoNewline -ForegroundColor Yellow

        if ($ready -eq $total) {
            Write-Host ""
            Write-Success "  ✓ All $total pods are ready! (${elapsed}s)"
            $stopwatch.Stop()
            return $true
        }

        $spinIdx++
        Start-Sleep -Milliseconds 500
    }

    Write-Host ""
    Write-Err "  ✗ Timed out after ${TimeoutSeconds}s. Not all pods are ready."
    if ($notReady.Count -gt 0) {
        Write-Warn "    Still waiting on: $($notReady -join ', ')"
    }
    $stopwatch.Stop()
    return $false
}

function Format-Age {
    <#
    .SYNOPSIS
        Converts a Kubernetes creation timestamp to a human-readable age string.
    #>
    param([string]$Timestamp)
    try {
        $created = [DateTime]::Parse($Timestamp)
        $diff    = (Get-Date) - $created
        if ($diff.TotalDays -ge 1)    { return "$([math]::Floor($diff.TotalDays))d" }
        if ($diff.TotalHours -ge 1)   { return "$([math]::Floor($diff.TotalHours))h" }
        if ($diff.TotalMinutes -ge 1) { return "$([math]::Floor($diff.TotalMinutes))m" }
        return "$([math]::Floor($diff.TotalSeconds))s"
    } catch {
        return "?"
    }
}

function Prompt-Continue {
    Write-Host ""
    Write-Host "  Press any key to return to the menu..." -ForegroundColor DarkGray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Select-Service {
    <#
    .SYNOPSIS
        Presents a numbered list and lets the user pick a service.
    #>
    param([string]$Prompt = "Select a service")
    Write-Info "  $Prompt"
    for ($i = 0; $i -lt $Script:SERVICES.Count; $i++) {
        Write-Host "    $($i + 1). $($Script:SERVICES[$i].Name)" -ForegroundColor White
    }
    Write-Host ""
    $choice = Read-Host "  Enter number (1-$($Script:SERVICES.Count))"
    $idx = [int]$choice - 1
    if ($idx -lt 0 -or $idx -ge $Script:SERVICES.Count) {
        Write-Err "  Invalid selection."
        return $null
    }
    return $Script:SERVICES[$idx]
}

# ─── 1. Check Prerequisites ─────────────────────────────────────────────────

function Invoke-CheckPrerequisites {
    param([switch]$Silent)

    if (-not $Silent) { Write-Header "PREREQUISITE CHECK" }

    Write-Edu "  ℹ  This check verifies that Docker, kubectl, Helm, and the Kubernetes"
    Write-Edu "     metrics-server are installed and reachable. All four are required"
    Write-Edu "     for the full deployment workflow."
    Write-Host ""

    $allGood = $true

    # ── Docker ───────────────────────────────────────────────────────────
    if (Test-CommandExists "docker") {
        $ver = Get-CommandVersion "docker" "--version"
        Write-Success "  ✓ Docker            : $ver"
    } else {
        Write-Err "  ✗ Docker            : NOT FOUND — install Docker Desktop"
        $allGood = $false
    }

    # ── kubectl ──────────────────────────────────────────────────────────
    if (Test-CommandExists "kubectl") {
        $ver = Get-CommandVersion "kubectl" "version" # kubectl version --client
        # Fallback: just grab client version
        try {
            $clientVer = kubectl version --client --short 2>&1 | Select-Object -First 1
            $ver = $clientVer.ToString().Trim()
        } catch { }
        Write-Success "  ✓ kubectl           : $ver"
    } else {
        Write-Err "  ✗ kubectl           : NOT FOUND — install via Docker Desktop settings"
        $allGood = $false
    }

    # ── Helm ─────────────────────────────────────────────────────────────
    if (Test-CommandExists "helm") {
        $ver = Get-CommandVersion "helm" "version"
        Write-Success "  ✓ Helm              : $ver"
    } else {
        Write-Err "  ✗ Helm              : NOT FOUND — install from https://helm.sh"
        $allGood = $false
    }

    # ── Kubernetes Cluster ───────────────────────────────────────────────
    Write-Host ""
    Write-Info "  Checking Kubernetes cluster connectivity..."
    try {
        $ctx = kubectl config current-context 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "  ✓ Kubernetes context: $($ctx.ToString().Trim())"

            # Verify cluster reachable
            $nodes = kubectl get nodes -o json 2>&1 | ConvertFrom-Json
            if ($nodes.items.Count -gt 0) {
                $nodeName   = $nodes.items[0].metadata.name
                $nodeStatus = ($nodes.items[0].status.conditions | Where-Object { $_.type -eq "Ready" }).status
                $statusText = if ($nodeStatus -eq "True") { "Ready" } else { "NotReady" }
                Write-Success "  ✓ Cluster node      : $nodeName ($statusText)"
            }
        } else {
            Write-Err "  ✗ No Kubernetes context — enable Kubernetes in Docker Desktop"
            $allGood = $false
        }
    } catch {
        Write-Err "  ✗ Cannot reach cluster — is Docker Desktop running with K8s enabled?"
        $allGood = $false
    }

    # ── Metrics Server ───────────────────────────────────────────────────
    Write-Host ""
    Write-Info "  Checking metrics-server..."
    if (Test-MetricsServerAvailable) {
        Write-Success "  ✓ metrics-server    : Installed"
    } else {
        Write-Warn "  ⚠ metrics-server    : NOT FOUND"
        Write-Edu "     The metrics-server is needed for 'kubectl top' and HPA auto-scaling."
        Write-Edu "     Without it, option 4 (dashboard) won't show resource usage and"
        Write-Edu "     option 8 (load test) cannot demonstrate HPA."

        if (-not $Silent) {
            Write-Host ""
            $install = Read-Host "  Install metrics-server now? (y/N)"
            if ($install -eq 'y' -or $install -eq 'Y') {
                Install-MetricsServer
            }
        }
    }

    # ── Helm chart check ─────────────────────────────────────────────────
    Write-Host ""
    Write-Info "  Checking Helm chart at '$Script:HELM_CHART_PATH'..."
    if (Test-Path $Script:HELM_CHART_PATH) {
        Write-Success "  ✓ Helm chart found"
    } else {
        Write-Warn "  ⚠ Helm chart directory not found at $Script:HELM_CHART_PATH"
        Write-Warn "    Deploy (option 3) will fail until the chart is created."
    }

    Write-Host ""
    if ($allGood) {
        Write-Success "  ══════════════════════════════════════════════════════"
        Write-Success "  All core prerequisites are satisfied!"
        Write-Success "  ══════════════════════════════════════════════════════"
    } else {
        Write-Err "  ══════════════════════════════════════════════════════"
        Write-Err "  Some prerequisites are missing. Please fix them above."
        Write-Err "  ══════════════════════════════════════════════════════"
    }

    return $allGood
}

function Install-MetricsServer {
    Write-Info "  Installing metrics-server via kubectl apply..."
    try {
        kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml 2>&1 | Out-Null

        # Patch for Docker Desktop — the kubelet uses an unsigned certificate
        Write-Info "  Patching metrics-server for Docker Desktop (--kubelet-insecure-tls)..."
        kubectl patch deployment metrics-server -n kube-system --type=json `
            -p '[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]' 2>&1 | Out-Null

        Write-Success "  ✓ metrics-server installed and patched."
        Write-Edu "     It may take 30–60 seconds for metrics to become available."
    } catch {
        Write-Err "  ✗ Failed to install metrics-server: $_"
    }
}

# ─── 2. Build Docker Images ─────────────────────────────────────────────────

function Invoke-BuildImages {
    Write-Header "BUILD DOCKER IMAGES"

    Write-Edu "  ℹ  Docker Desktop shares its image store with the built-in Kubernetes"
    Write-Edu "     cluster. This means once you build an image locally, it is immediately"
    Write-Edu "     available to Kubernetes pods — no need to push to a registry or run"
    Write-Edu "     'kind load' / 'minikube image load'."
    Write-Host ""

    $buildable = $Script:SERVICES | Where-Object { $null -ne $_.Context }
    $totalTime = [System.Diagnostics.Stopwatch]::StartNew()

    foreach ($svc in $buildable) {
        Write-SubHeader "Building $($svc.Name)"

        $dockerfilePath = Join-Path $svc.Context "Dockerfile"
        if (-not (Test-Path $dockerfilePath)) {
            Write-Warn "  ⚠ Dockerfile not found at $dockerfilePath — skipping."
            continue
        }

        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        Write-Info "  Image : $($svc.Image)"
        Write-Info "  Context: $($svc.Context)"
        Write-Host ""

        try {
            # Stream build output
            $process = Start-Process -FilePath "docker" `
                -ArgumentList "build", "-t", $svc.Image, $svc.Context `
                -NoNewWindow -PassThru -Wait

            $sw.Stop()
            $elapsed = [math]::Round($sw.Elapsed.TotalSeconds, 1)

            if ($process.ExitCode -eq 0) {
                Write-Success "  ✓ $($svc.Name) built successfully in ${elapsed}s"
            } else {
                Write-Err "  ✗ $($svc.Name) build failed (exit code $($process.ExitCode))"
            }
        } catch {
            $sw.Stop()
            Write-Err "  ✗ Error building $($svc.Name): $_"
        }

        Write-Host ""
    }

    $totalTime.Stop()
    $totalElapsed = [math]::Round($totalTime.Elapsed.TotalSeconds, 1)
    Write-Success "  ══════════════════════════════════════════════════════"
    Write-Success "  All builds completed in ${totalElapsed}s"
    Write-Success "  ══════════════════════════════════════════════════════"

    Write-Host ""
    Write-Info "  Current images:"
    docker images --filter "reference=epipredict-*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" 2>&1 | ForEach-Object {
        Write-Host "    $_" -ForegroundColor White
    }
}

# ─── 3. Deploy (Helm Install / Upgrade) ─────────────────────────────────────

function Invoke-Deploy {
    Write-Header "DEPLOY WITH HELM"

    Write-Edu "  ℹ  Helm is the 'package manager for Kubernetes'. It bundles all your"
    Write-Edu "     YAML manifests into a single chart, with templated values that can"
    Write-Edu "     be overridden per environment (dev / prod)."
    Write-Edu ""
    Write-Edu "     'helm upgrade --install' is idempotent — it will install the release"
    Write-Edu "     if it doesn't exist, or upgrade it if it does."
    Write-Host ""

    # Check chart exists
    if (-not (Test-Path $Script:HELM_CHART_PATH)) {
        Write-Err "  ✗ Helm chart not found at '$Script:HELM_CHART_PATH'."
        Write-Warn "    Please create the Helm chart first."
        return
    }

    # Select profile
    Write-Info "  Select deployment profile:"
    Write-Host "    1. dev  (development — lower resources, debug logging)" -ForegroundColor White
    Write-Host "    2. prod (production  — higher resources, optimised)" -ForegroundColor White
    Write-Host ""
    $profileChoice = Read-Host "  Enter choice (1 or 2)"

    switch ($profileChoice) {
        "1" { $profile = "dev";  $valuesFile = $Script:VALUES_DEV  }
        "2" { $profile = "prod"; $valuesFile = $Script:VALUES_PROD }
        default {
            Write-Warn "  Invalid choice — defaulting to dev."
            $profile = "dev"
            $valuesFile = $Script:VALUES_DEV
        }
    }

    if (-not (Test-Path $valuesFile)) {
        Write-Warn "  ⚠ Values file '$valuesFile' not found. Deploying with chart defaults."
        $valuesFile = $null
    }

    Write-Host ""
    Write-Info "  Profile    : $profile"
    Write-Info "  Release    : $Script:RELEASE_NAME"
    Write-Info "  Namespace  : $Script:NAMESPACE"
    if ($valuesFile) { Write-Info "  Values file: $valuesFile" }
    Write-Host ""

    # Ensure namespace
    Ensure-Namespace

    # Check existing release
    $releaseExists = Test-HelmReleaseExists
    $action = if ($releaseExists) { "Upgrading" } else { "Installing" }
    Write-Info "  $action release '$Script:RELEASE_NAME'..."

    # Build command args
    $helmArgs = @(
        "upgrade", "--install"
        $Script:RELEASE_NAME
        $Script:HELM_CHART_PATH
        "-n", $Script:NAMESPACE
        "--create-namespace"
        "--set", "profile=$profile"
        "--wait"
        "--timeout", "5m"
    )
    if ($valuesFile) {
        $helmArgs += @("-f", $valuesFile)
    }

    $sw = [System.Diagnostics.Stopwatch]::StartNew()

    try {
        Write-Host ""
        $output = & helm @helmArgs 2>&1
        $exitCode = $LASTEXITCODE
        $sw.Stop()
        $elapsed = [math]::Round($sw.Elapsed.TotalSeconds, 1)

        if ($exitCode -eq 0) {
            Write-Success "  ✓ Helm $($action.ToLower()) completed in ${elapsed}s"
            Write-Host ""

            # Show release info
            Write-Info "  Release status:"
            helm status $Script:RELEASE_NAME -n $Script:NAMESPACE 2>&1 | ForEach-Object {
                Write-Host "    $_" -ForegroundColor White
            }
        } else {
            Write-Err "  ✗ Helm $($action.ToLower()) failed (exit code $exitCode)"
            $output | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
        }
    } catch {
        $sw.Stop()
        Write-Err "  ✗ Helm deploy error: $_"
    }

    # Wait for pods
    Write-Host ""
    Write-Info "  Waiting for pods to be ready..."
    Wait-ForPodsReady -TimeoutSeconds 180
}

# ─── 4. Status Dashboard ────────────────────────────────────────────────────

function Invoke-StatusDashboard {
    Write-Header "STATUS DASHBOARD"

    Write-Edu "  ℹ  This dashboard queries the Kubernetes API to show the current state"
    Write-Edu "     of your EpiPredict deployment: pods, services, ingress, HPA, and"
    Write-Edu "     resource consumption."
    Write-Host ""

    # Verify namespace
    if (-not (Test-NamespaceExists $Script:NAMESPACE)) {
        Write-Warn "  Namespace '$Script:NAMESPACE' does not exist. Nothing is deployed yet."
        return
    }

    # ── Pods ─────────────────────────────────────────────────────────────
    try {
        $podsJson = kubectl get pods -n $Script:NAMESPACE -o json 2>&1 | ConvertFrom-Json
        $podLines = @()

        if ($podsJson.items.Count -eq 0) {
            $podLines += "  (no pods found)"
        } else {
            $podLines += ("{0,-40} {1,-12} {2,-10} {3,-6}" -f "NAME", "STATUS", "RESTARTS", "AGE")
            $podLines += ("{0,-40} {1,-12} {2,-10} {3,-6}" -f "----", "------", "--------", "---")

            foreach ($pod in $podsJson.items) {
                $name     = $pod.metadata.name
                if ($name.Length -gt 38) { $name = $name.Substring(0, 38) + "…" }
                $phase    = $pod.status.phase
                $restarts = 0
                if ($pod.status.containerStatuses) {
                    $restarts = ($pod.status.containerStatuses | Measure-Object -Property restartCount -Sum).Sum
                }
                $age = Format-Age $pod.metadata.creationTimestamp
                $podLines += ("{0,-40} {1,-12} {2,-10} {3,-6}" -f $name, $phase, $restarts, $age)
            }
        }

        Write-DashboardSection "PODS" $podLines
    } catch {
        Write-Warn "  Could not fetch pod information: $_"
    }

    # ── Services ─────────────────────────────────────────────────────────
    try {
        $svcsJson = kubectl get svc -n $Script:NAMESPACE -o json 2>&1 | ConvertFrom-Json
        $svcLines = @()

        if ($svcsJson.items.Count -eq 0) {
            $svcLines += "  (no services found)"
        } else {
            $svcLines += ("{0,-30} {1,-14} {2,-30}" -f "NAME", "TYPE", "PORTS")
            $svcLines += ("{0,-30} {1,-14} {2,-30}" -f "----", "----", "-----")

            foreach ($svc in $svcsJson.items) {
                $name  = $svc.metadata.name
                $type  = $svc.spec.type
                $ports = ($svc.spec.ports | ForEach-Object {
                    $p = "$($_.port)"
                    if ($_.nodePort) { $p += ":$($_.nodePort)" }
                    "$p/$($_.protocol)"
                }) -join ", "
                $svcLines += ("{0,-30} {1,-14} {2,-30}" -f $name, $type, $ports)
            }
        }

        Write-DashboardSection "SERVICES" $svcLines
    } catch {
        Write-Warn "  Could not fetch service information: $_"
    }

    # ── Ingress ──────────────────────────────────────────────────────────
    try {
        $ingJson = kubectl get ingress -n $Script:NAMESPACE -o json 2>&1 | ConvertFrom-Json
        $ingLines = @()

        if ($ingJson.items -and $ingJson.items.Count -gt 0) {
            $ingLines += ("{0,-30} {1,-30} {2,-20}" -f "NAME", "HOSTS", "ADDRESS")
            $ingLines += ("{0,-30} {1,-30} {2,-20}" -f "----", "-----", "-------")
            foreach ($ing in $ingJson.items) {
                $name    = $ing.metadata.name
                $hosts   = ($ing.spec.rules | ForEach-Object { $_.host }) -join ", "
                $address = ""
                if ($ing.status.loadBalancer.ingress) {
                    $address = ($ing.status.loadBalancer.ingress | ForEach-Object { $_.ip ?? $_.hostname }) -join ", "
                }
                $ingLines += ("{0,-30} {1,-30} {2,-20}" -f $name, $hosts, $address)
            }
        } else {
            $ingLines += "  (no ingress resources found)"
        }

        Write-DashboardSection "INGRESS" $ingLines
    } catch {
        # ingress might not exist — not an error
        Write-DashboardSection "INGRESS" @("  (no ingress resources found)")
    }

    # ── HPA ──────────────────────────────────────────────────────────────
    try {
        $hpaJson = kubectl get hpa -n $Script:NAMESPACE -o json 2>&1 | ConvertFrom-Json
        $hpaLines = @()

        if ($hpaJson.items -and $hpaJson.items.Count -gt 0) {
            $hpaLines += ("{0,-25} {1,-12} {2,-12} {3,-12} {4,-10}" -f "NAME", "CPU CUR/TGT", "MIN", "MAX", "REPLICAS")
            $hpaLines += ("{0,-25} {1,-12} {2,-12} {3,-12} {4,-10}" -f "----", "-----------", "---", "---", "--------")
            foreach ($hpa in $hpaJson.items) {
                $name        = $hpa.metadata.name
                $minReplicas = $hpa.spec.minReplicas
                $maxReplicas = $hpa.spec.maxReplicas
                $curReplicas = $hpa.status.currentReplicas
                $curCpu      = "<unknown>"
                $tgtCpu      = "<unknown>"

                if ($hpa.status.currentMetrics) {
                    $cpuMetric = $hpa.status.currentMetrics | Where-Object { $_.type -eq "Resource" -and $_.resource.name -eq "cpu" }
                    if ($cpuMetric) { $curCpu = "$($cpuMetric.resource.current.averageUtilization)%" }
                }
                if ($hpa.spec.metrics) {
                    $cpuSpec = $hpa.spec.metrics | Where-Object { $_.type -eq "Resource" -and $_.resource.name -eq "cpu" }
                    if ($cpuSpec) { $tgtCpu = "$($cpuSpec.resource.target.averageUtilization)%" }
                }

                $cpuDisplay = "$curCpu/$tgtCpu"
                $hpaLines += ("{0,-25} {1,-12} {2,-12} {3,-12} {4,-10}" -f $name, $cpuDisplay, $minReplicas, $maxReplicas, $curReplicas)
            }
        } else {
            $hpaLines += "  (no HPA resources found)"
        }

        Write-DashboardSection "HORIZONTAL POD AUTOSCALER (HPA)" $hpaLines
    } catch {
        Write-DashboardSection "HORIZONTAL POD AUTOSCALER (HPA)" @("  (no HPA resources found)")
    }

    # ── Resource Usage ───────────────────────────────────────────────────
    if (Test-MetricsServerAvailable) {
        try {
            $topOutput = kubectl top pods -n $Script:NAMESPACE 2>&1
            if ($LASTEXITCODE -eq 0) {
                $topLines = @()
                $topOutput -split "`n" | ForEach-Object { $topLines += $_.Trim() }
                Write-DashboardSection "RESOURCE USAGE (kubectl top pods)" $topLines
            } else {
                Write-DashboardSection "RESOURCE USAGE" @("  Metrics not yet available (server may still be starting)")
            }
        } catch {
            Write-DashboardSection "RESOURCE USAGE" @("  Error fetching metrics: $_")
        }
    } else {
        Write-DashboardSection "RESOURCE USAGE" @(
            "  metrics-server is not installed."
            "  Run option 1 to install it, then wait ~60s for metrics."
        )
    }
}

# ─── 5. View Logs ───────────────────────────────────────────────────────────

function Invoke-ViewLogs {
    Write-Header "VIEW LOGS"

    Write-Edu "  ℹ  Kubernetes stores the stdout/stderr of each container as logs."
    Write-Edu "     Use --previous to see logs from a crashed container's last run —"
    Write-Edu "     useful for debugging CrashLoopBackOff situations."
    Write-Host ""

    $svc = Select-Service -Prompt "Which service's logs would you like to view?"
    if (-not $svc) { return }

    Write-Host ""
    Write-Info "  Log options:"
    Write-Host "    1. Stream live logs (-f / --follow)" -ForegroundColor White
    Write-Host "    2. Show previous container logs (--previous)" -ForegroundColor White
    Write-Host "    3. Show last 100 lines" -ForegroundColor White
    Write-Host ""
    $logChoice = Read-Host "  Enter choice (1-3)"

    # Find pods matching this service
    $label    = "app.kubernetes.io/name=$($svc.Name)"
    $altLabel = "app=$($svc.Name)"

    # Try standard Helm labels first, fall back to simple label
    $pods = kubectl get pods -n $Script:NAMESPACE -l $label -o name 2>&1
    if ($LASTEXITCODE -ne 0 -or -not $pods) {
        $pods = kubectl get pods -n $Script:NAMESPACE -l $altLabel -o name 2>&1
    }
    if ($LASTEXITCODE -ne 0 -or -not $pods) {
        Write-Err "  No pods found for service '$($svc.Name)' in namespace '$Script:NAMESPACE'."
        return
    }

    $podName = ($pods -split "`n" | Select-Object -First 1).Trim()
    Write-Info "  Streaming logs from: $podName"
    Write-Info "  Press Ctrl+C to stop."
    Write-Host ""

    switch ($logChoice) {
        "1" { kubectl logs $podName -n $Script:NAMESPACE -f --tail=200 }
        "2" { kubectl logs $podName -n $Script:NAMESPACE --previous --tail=200 }
        "3" { kubectl logs $podName -n $Script:NAMESPACE --tail=100 }
        default { kubectl logs $podName -n $Script:NAMESPACE --tail=100 }
    }
}

# ─── 6. Scale Deployment ────────────────────────────────────────────────────

function Invoke-Scale {
    Write-Header "SCALE DEPLOYMENT"

    Write-Edu "  ℹ  Scaling changes the number of pod replicas for a deployment."
    Write-Edu "     Kubernetes will create or terminate pods to match the desired count."
    Write-Edu "     If an HPA is attached, it may override your manual scaling over time."
    Write-Host ""

    $svc = Select-Service -Prompt "Which service do you want to scale?"
    if (-not $svc) { return }

    Write-Host ""
    $replicas = Read-Host "  Desired replica count"
    try {
        $replicaInt = [int]$replicas
        if ($replicaInt -lt 0 -or $replicaInt -gt 20) {
            Write-Err "  Replica count must be between 0 and 20."
            return
        }
    } catch {
        Write-Err "  Invalid number."
        return
    }

    Write-Host ""
    Write-Info "  Scaling $($svc.Name) to $replicaInt replicas..."

    # Try deployment name patterns
    $deployName = "$($Script:RELEASE_NAME)-$($svc.Name)"
    $altDeployName = "$($svc.Name)-deployment"

    # Try Helm-style first
    $result = kubectl scale deployment $deployName -n $Script:NAMESPACE --replicas=$replicaInt 2>&1
    if ($LASTEXITCODE -ne 0) {
        # Try alternate name
        $result = kubectl scale deployment $altDeployName -n $Script:NAMESPACE --replicas=$replicaInt 2>&1
        if ($LASTEXITCODE -ne 0) {
            # Try just the service name
            $result = kubectl scale deployment $svc.Name -n $Script:NAMESPACE --replicas=$replicaInt 2>&1
        }
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Success "  ✓ Scaled $($svc.Name) to $replicaInt replicas."
        Write-Host ""
        Write-Info "  Waiting for rollout to complete..."
        Wait-ForPodsReady -TimeoutSeconds 120 -Label "app=$($svc.Name)"
    } else {
        Write-Err "  ✗ Failed to scale: $result"
    }
}

# ─── 7. Port Forward ────────────────────────────────────────────────────────

function Invoke-PortForward {
    Write-Header "PORT FORWARD"

    Write-Edu "  ℹ  'kubectl port-forward' creates a tunnel from your local machine"
    Write-Edu "     to a Kubernetes service or pod. This lets you access a ClusterIP"
    Write-Edu "     service on localhost without exposing it via NodePort or Ingress."
    Write-Host ""

    $svc = Select-Service -Prompt "Which service do you want to port-forward?"
    if (-not $svc) { return }

    $localPort   = $svc.LocalPort
    $remotePort  = $svc.Port

    Write-Host ""
    Write-Info "  Service     : $($svc.Name)"
    Write-Info "  Local port  : $localPort"
    Write-Info "  Remote port : $remotePort"
    Write-Host ""

    # Try to find the service
    $svcName = "svc/$($Script:RELEASE_NAME)-$($svc.Name)"
    $altSvcName = "svc/$($svc.Name)"

    # Verify service exists
    $exists = kubectl get svc -n $Script:NAMESPACE -o name 2>&1
    $targetSvc = $null

    if ($exists -match "$($Script:RELEASE_NAME)-$($svc.Name)") {
        $targetSvc = $svcName
    } elseif ($exists -match "service/$($svc.Name)") {
        $targetSvc = $altSvcName
    } else {
        # Try database naming variations
        if ($svc.Name -eq "database") {
            if ($exists -match "database-service") {
                $targetSvc = "svc/database-service"
            }
        }
    }

    if (-not $targetSvc) {
        Write-Err "  ✗ Service '$($svc.Name)' not found in namespace '$Script:NAMESPACE'."
        return
    }

    Write-Success "  ✓ Forwarding $targetSvc → localhost:$localPort"
    Write-Info "  Press Ctrl+C to stop port-forwarding."
    Write-Host ""

    try {
        kubectl port-forward $targetSvc ${localPort}:${remotePort} -n $Script:NAMESPACE
    } catch {
        Write-Info "  Port-forwarding stopped."
    }
}

# ─── 8. Load Test (HPA Demo) ────────────────────────────────────────────────

function Invoke-LoadTest {
    Write-Header "LOAD TEST — HPA DEMO"

    Write-Edu "  ℹ  Horizontal Pod Autoscaler (HPA) automatically adjusts the number"
    Write-Edu "     of pod replicas based on observed CPU utilisation (or custom metrics)."
    Write-Edu ""
    Write-Edu "     This test generates concurrent HTTP requests to the backend /health"
    Write-Edu "     endpoint. If an HPA is configured, you'll see the replica count"
    Write-Edu "     increase automatically to handle the load."
    Write-Edu ""
    Write-Edu "     Requirements:"
    Write-Edu "       • metrics-server must be installed"
    Write-Edu "       • An HPA resource must be configured for the backend"
    Write-Edu "       • The backend must be accessible (port-forward or NodePort)"
    Write-Host ""

    if (-not (Test-MetricsServerAvailable)) {
        Write-Warn "  ⚠ metrics-server is not installed. HPA will not function."
        Write-Warn "    Install it via option 1 first."
    }

    Write-Host ""
    Write-Info "  Configure load test:"
    $concurrency = Read-Host "  Concurrent workers (default: 10)"
    if (-not $concurrency) { $concurrency = "10" }
    $duration = Read-Host "  Duration in seconds (default: 30)"
    if (-not $duration) { $duration = "30" }
    $targetUrl = Read-Host "  Target URL (default: http://localhost:8000/health)"
    if (-not $targetUrl) { $targetUrl = "http://localhost:8000/health" }

    $concurrencyInt = [int]$concurrency
    $durationInt    = [int]$duration

    Write-Host ""
    Write-Info "  Starting load test: $concurrencyInt workers × ${durationInt}s → $targetUrl"
    Write-Host ""

    # Launch workers as PowerShell jobs
    $jobs = @()
    $totalRequests = [System.Collections.Concurrent.ConcurrentDictionary[string,int]]::new()

    $scriptBlock = {
        param([string]$Url, [int]$DurationSec)
        $sw      = [System.Diagnostics.Stopwatch]::StartNew()
        $success = 0
        $fail    = 0

        while ($sw.Elapsed.TotalSeconds -lt $DurationSec) {
            try {
                $null = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
                $success++
            } catch {
                $fail++
            }
        }

        return @{ Success = $success; Fail = $fail }
    }

    Write-Info "  Launching $concurrencyInt worker jobs..."
    for ($i = 0; $i -lt $concurrencyInt; $i++) {
        $jobs += Start-Job -ScriptBlock $scriptBlock -ArgumentList $targetUrl, $durationInt
    }

    Write-Success "  ✓ All workers launched."
    Write-Host ""

    # Monitor HPA while load test runs
    Write-Info "  Monitoring HPA status during load test..."
    Write-Host "  (Refreshing every 5 seconds — load test runs for ${durationInt}s)"
    Write-Host ""

    $monitorStart = [System.Diagnostics.Stopwatch]::StartNew()
    $spinIdx = 0

    while ($monitorStart.Elapsed.TotalSeconds -lt ($durationInt + 5)) {
        $frame   = $Script:SPINNER[$spinIdx % $Script:SPINNER.Count]
        $elapsed = [math]::Round($monitorStart.Elapsed.TotalSeconds)

        # Check HPA
        try {
            $hpaOutput = kubectl get hpa -n $Script:NAMESPACE --no-headers 2>&1
            if ($LASTEXITCODE -eq 0 -and $hpaOutput) {
                Write-Host "  $frame  [${elapsed}s] HPA: $($hpaOutput.ToString().Trim())" -ForegroundColor Yellow
            } else {
                Write-Host "  $frame  [${elapsed}s] (no HPA found — load test running...)" -ForegroundColor DarkGray
            }
        } catch {
            Write-Host "  $frame  [${elapsed}s] ..." -ForegroundColor DarkGray
        }

        $spinIdx++
        Start-Sleep -Seconds 5
    }

    # Collect results
    Write-Host ""
    Write-Info "  Collecting results from workers..."
    $totalSuccess = 0
    $totalFail    = 0

    foreach ($job in $jobs) {
        try {
            $result = Receive-Job -Job $job -Wait -AutoRemoveJob
            if ($result) {
                $totalSuccess += $result.Success
                $totalFail    += $result.Fail
            }
        } catch {
            Write-Warn "  Warning: could not collect results from a worker."
        }
    }

    # Clean up any remaining jobs
    $jobs | Remove-Job -Force -ErrorAction SilentlyContinue

    $totalReqs = $totalSuccess + $totalFail
    $rps       = if ($durationInt -gt 0) { [math]::Round($totalReqs / $durationInt, 1) } else { 0 }

    Write-Host ""
    Write-Success "  ══════════════════════════════════════════════════════"
    Write-Success "  Load Test Complete"
    Write-Success "  ══════════════════════════════════════════════════════"
    Write-Info "  Total requests : $totalReqs"
    Write-Success "  Successful     : $totalSuccess"
    Write-Err "  Failed         : $totalFail"
    Write-Info "  Throughput     : $rps req/s"
    Write-Host ""

    Write-Edu "  💡 If an HPA is configured, check the status dashboard (option 4)"
    Write-Edu "     to see if replicas scaled up. It may take 1–2 minutes for HPA"
    Write-Edu "     to react and scale back down after load stops."
}

# ─── 9. Full Guide Mode ─────────────────────────────────────────────────────

function Invoke-FullGuide {
    Write-Header "FULL GUIDE MODE"

    Write-Edu "  ╔════════════════════════════════════════════════════════════════════╗"
    Write-Edu "  ║  Welcome to the EpiPredict Full Deployment Guide!                 ║"
    Write-Edu "  ║                                                                   ║"
    Write-Edu "  ║  This interactive walkthrough will take you through the entire     ║"
    Write-Edu "  ║  deployment pipeline, from prerequisites to a running cluster     ║"
    Write-Edu "  ║  with auto-scaling. Each step includes explanations so you can    ║"
    Write-Edu "  ║  learn Kubernetes concepts as you go.                             ║"
    Write-Edu "  ╚════════════════════════════════════════════════════════════════════╝"
    Write-Host ""

    $confirm = Read-Host "  Ready to begin? (Y/n)"
    if ($confirm -eq 'n' -or $confirm -eq 'N') { return }

    # ── Step 1: Prerequisites ────────────────────────────────────────────
    Write-Host ""
    Write-SubHeader "STEP 1 of 6 — PREREQUISITES"
    Write-Edu "  Before deploying anything, we need to make sure Docker Desktop is"
    Write-Edu "  running with Kubernetes enabled, and that Helm is installed."
    Write-Edu ""
    Write-Edu "  Docker Desktop bundles a single-node Kubernetes cluster. When you"
    Write-Edu "  enable Kubernetes in Docker Desktop settings, it provisions a full"
    Write-Edu "  cluster with the control plane running as containers."
    Write-Host ""

    $preReqOk = Invoke-CheckPrerequisites -Silent
    if (-not $preReqOk) {
        Write-Err ""
        Write-Err "  Some prerequisites failed. Please fix them and re-run Guide Mode."
        return
    }
    Prompt-Continue

    # ── Step 2: Build Images ─────────────────────────────────────────────
    Show-Banner
    Write-SubHeader "STEP 2 of 6 — BUILD DOCKER IMAGES"
    Write-Edu "  We need three custom Docker images for EpiPredict:"
    Write-Edu "    • frontend  — React app served by Nginx"
    Write-Edu "    • backend   — FastAPI gateway that talks to the DB and ML service"
    Write-Edu "    • ml-service — Standalone ML prediction service"
    Write-Edu ""
    Write-Edu "  The database uses the official postgres:15-alpine image from Docker Hub,"
    Write-Edu "  so there's nothing to build for it."
    Write-Edu ""
    Write-Edu "  Key concept: Docker Desktop shares images between Docker Engine and"
    Write-Edu "  Kubernetes. Building locally makes images immediately available"
    Write-Edu "  to K8s pods (with imagePullPolicy: IfNotPresent or Never)."
    Write-Host ""

    $buildConfirm = Read-Host "  Build images now? (Y/n)"
    if ($buildConfirm -ne 'n' -and $buildConfirm -ne 'N') {
        Invoke-BuildImages
    } else {
        Write-Warn "  Skipping build — assuming images already exist."
    }
    Prompt-Continue

    # ── Step 3: Deploy ───────────────────────────────────────────────────
    Show-Banner
    Write-SubHeader "STEP 3 of 6 — DEPLOY WITH HELM (dev profile)"
    Write-Edu "  Helm packages all Kubernetes resources (Deployments, Services,"
    Write-Edu "  ConfigMaps, Secrets, HPA, Ingress) into a single 'chart'."
    Write-Edu ""
    Write-Edu "  Our chart lives at '$Script:HELM_CHART_PATH' and supports two profiles:"
    Write-Edu "    • dev  — Lower resource limits, 1 replica, debug logging"
    Write-Edu "    • prod — Higher limits, multiple replicas, production settings"
    Write-Edu ""
    Write-Edu "  For this guide, we'll deploy the dev profile."
    Write-Host ""

    if (-not (Test-Path $Script:HELM_CHART_PATH)) {
        Write-Warn "  ⚠ Helm chart not found at '$Script:HELM_CHART_PATH'."
        Write-Warn "    Skipping deployment step."
    } else {
        $deployConfirm = Read-Host "  Deploy now with dev profile? (Y/n)"
        if ($deployConfirm -ne 'n' -and $deployConfirm -ne 'N') {
            Ensure-Namespace

            $valuesFile = $Script:VALUES_DEV
            $helmArgs = @(
                "upgrade", "--install"
                $Script:RELEASE_NAME
                $Script:HELM_CHART_PATH
                "-n", $Script:NAMESPACE
                "--create-namespace"
                "--set", "profile=dev"
                "--wait"
                "--timeout", "5m"
            )
            if (Test-Path $valuesFile) {
                $helmArgs += @("-f", $valuesFile)
            }

            Write-Info "  Deploying..."
            try {
                & helm @helmArgs 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "  ✓ Deployment complete!"
                } else {
                    Write-Err "  ✗ Deployment failed."
                }
            } catch {
                Write-Err "  ✗ Error: $_"
            }

            Write-Host ""
            Write-Info "  Waiting for pods..."
            Wait-ForPodsReady -TimeoutSeconds 180
        }
    }
    Prompt-Continue

    # ── Step 4: Status ───────────────────────────────────────────────────
    Show-Banner
    Write-SubHeader "STEP 4 of 6 — STATUS DASHBOARD"
    Write-Edu "  Now let's look at what Kubernetes created for us. The dashboard shows:"
    Write-Edu "    • Pods     — The running instances of our containers"
    Write-Edu "    • Services — The network endpoints that route traffic to pods"
    Write-Edu "    • HPA      — Auto-scaling rules that adjust replicas based on load"
    Write-Edu ""
    Write-Edu "  A 'pod' is the smallest deployable unit in Kubernetes. Each pod runs"
    Write-Edu "  one or more containers and gets its own IP address within the cluster."
    Write-Host ""

    Invoke-StatusDashboard
    Prompt-Continue

    # ── Step 5: HPA Demo ─────────────────────────────────────────────────
    Show-Banner
    Write-SubHeader "STEP 5 of 6 — HPA MINI LOAD TEST"
    Write-Edu "  The Horizontal Pod Autoscaler (HPA) watches CPU/memory metrics and"
    Write-Edu "  automatically scales your deployment up or down."
    Write-Edu ""
    Write-Edu "  Example: if the HPA target is 50% CPU and current usage hits 80%,"
    Write-Edu "  Kubernetes will create additional pods to spread the load."
    Write-Edu ""
    Write-Edu "  We'll run a quick 15-second load test with 5 workers to demonstrate."
    Write-Host ""

    $hpaConfirm = Read-Host "  Run mini load test? (y/N)"
    if ($hpaConfirm -eq 'y' -or $hpaConfirm -eq 'Y') {
        # Mini load test — 5 workers, 15 seconds
        $scriptBlock = {
            param([string]$Url, [int]$DurationSec)
            $sw      = [System.Diagnostics.Stopwatch]::StartNew()
            $success = 0
            $fail    = 0
            while ($sw.Elapsed.TotalSeconds -lt $DurationSec) {
                try {
                    $null = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
                    $success++
                } catch { $fail++ }
            }
            return @{ Success = $success; Fail = $fail }
        }

        $miniJobs = @()
        for ($i = 0; $i -lt 5; $i++) {
            $miniJobs += Start-Job -ScriptBlock $scriptBlock -ArgumentList "http://localhost:8000/health", 15
        }

        Write-Info "  Load test running for 15 seconds..."
        Start-Sleep -Seconds 16

        $totalS = 0; $totalF = 0
        foreach ($j in $miniJobs) {
            try {
                $r = Receive-Job -Job $j -Wait -AutoRemoveJob
                if ($r) { $totalS += $r.Success; $totalF += $r.Fail }
            } catch { }
        }
        $miniJobs | Remove-Job -Force -ErrorAction SilentlyContinue

        Write-Success "  ✓ Mini load test done: $totalS successful, $totalF failed requests."
        Write-Edu "     Check the dashboard (Step 6) to see if HPA reacted."
    } else {
        Write-Info "  Skipping load test."
    }
    Prompt-Continue

    # ── Step 6: Final State ──────────────────────────────────────────────
    Show-Banner
    Write-SubHeader "STEP 6 of 6 — FINAL STATE"
    Write-Edu "  Let's take one last look at the cluster to see everything running."
    Write-Host ""

    Invoke-StatusDashboard

    Write-Host ""
    Write-Success "  ╔════════════════════════════════════════════════════════════════════╗"
    Write-Success "  ║  🎉  Congratulations! Guide Mode Complete!                        ║"
    Write-Success "  ╚════════════════════════════════════════════════════════════════════╝"
    Write-Host ""
    Write-Edu "  Next steps:"
    Write-Edu "    • Use option 7 (Port Forward) to access services on localhost"
    Write-Edu "    • Use option 5 (View Logs) to debug any issues"
    Write-Edu "    • Use option 6 (Scale) to manually adjust replicas"
    Write-Edu "    • Use option 3 to switch to the prod profile"
    Write-Host ""
    Write-Info "  Useful kubectl commands to remember:"
    Write-Host "    kubectl get all -n $Script:NAMESPACE" -ForegroundColor White
    Write-Host "    kubectl describe pod <name> -n $Script:NAMESPACE" -ForegroundColor White
    Write-Host "    kubectl exec -it <pod> -n $Script:NAMESPACE -- /bin/sh" -ForegroundColor White
    Write-Host "    helm history $Script:RELEASE_NAME -n $Script:NAMESPACE" -ForegroundColor White
}

# ─── Main Entry Point ───────────────────────────────────────────────────────

function Main {
    # Ensure we're running from the project root (or close to it)
    $projectMarker = @("docker-compose.yml", "backend", "frontend", "ml-service")
    $inProjectRoot = $true
    foreach ($marker in $projectMarker) {
        if (-not (Test-Path $marker)) {
            $inProjectRoot = $false
            break
        }
    }

    if (-not $inProjectRoot) {
        Write-Warn "  ⚠ It looks like you're not in the EpiPredict project root."
        Write-Warn "    Expected to find: docker-compose.yml, backend/, frontend/, ml-service/"
        Write-Warn "    Current directory: $(Get-Location)"
        Write-Host ""
        $cont = Read-Host "  Continue anyway? (y/N)"
        if ($cont -ne 'y' -and $cont -ne 'Y') {
            Write-Info "  Please cd to the project root and re-run this script."
            exit 0
        }
    }

    # Main loop
    while ($true) {
        Show-Banner
        Show-Menu

        $choice = Read-Host "  Enter your choice"

        switch ($choice) {
            "1" {
                Show-Banner
                Invoke-CheckPrerequisites
                Prompt-Continue
            }
            "2" {
                Show-Banner
                Invoke-BuildImages
                Prompt-Continue
            }
            "3" {
                Show-Banner
                Invoke-Deploy
                Prompt-Continue
            }
            "4" {
                Show-Banner
                Invoke-StatusDashboard
                Prompt-Continue
            }
            "5" {
                Show-Banner
                Invoke-ViewLogs
                Prompt-Continue
            }
            "6" {
                Show-Banner
                Invoke-Scale
                Prompt-Continue
            }
            "7" {
                Show-Banner
                Invoke-PortForward
                Prompt-Continue
            }
            "8" {
                Show-Banner
                Invoke-LoadTest
                Prompt-Continue
            }
            "9" {
                Show-Banner
                Invoke-FullGuide
                Prompt-Continue
            }
            "0" {
                Write-Host ""
                Write-Info "  Goodbye! Happy deploying. 🚀"
                Write-Host ""
                exit 0
            }
            default {
                Write-Warn "  Invalid choice. Please enter 0–9."
                Start-Sleep -Seconds 1
            }
        }
    }
}

# ─── Run ─────────────────────────────────────────────────────────────────────
Main
