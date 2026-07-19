param(
  [ValidateRange(1, 65535)]
  [int]$Port = 3001
)

$ErrorActionPreference = 'Stop'

$listeners = @(
  Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique
)

foreach ($processId in $listeners) {
  if ($processId -eq $PID) { continue }

  $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
  if (-not $process) { continue }

  Write-Host "Port $Port is in use by $($process.ProcessName) (PID $processId). Stopping it..."
  Stop-Process -Id $processId -Force
  Wait-Process -Id $processId -Timeout 5 -ErrorAction SilentlyContinue
}

$deadline = (Get-Date).AddSeconds(5)
do {
  $remaining = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if (-not $remaining) {
    Write-Host "Port $Port is available."
    exit 0
  }
  Start-Sleep -Milliseconds 150
} while ((Get-Date) -lt $deadline)

Write-Error "Port $Port is still occupied after stopping its previous listener."
exit 1
