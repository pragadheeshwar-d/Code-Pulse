# CodePulse Automated SQLite Backup Script for Windows PowerShell
param (
    [string]$DbPath = "data\codetrack.sqlite",
    [string]$BackupDir = "database\backups"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $DbPath)) {
    Write-Host "[Backup] Error: Database file not found at $DbPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
}

$Timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$BackupFile = Join-Path $BackupDir "codepulse_backup_$Timestamp.sqlite"

Write-Host "[Backup] Creating snapshot of $DbPath -> $BackupFile..." -ForegroundColor Cyan

# Perform safe copy (handles WAL active files if present)
Copy-Item -Path $DbPath -Destination $BackupFile -Force
if (Test-Path "$DbPath-wal") {
    Copy-Item -Path "$DbPath-wal" -Destination "$BackupFile-wal" -Force
}

Write-Host "[Backup] Database backup completed successfully: $BackupFile" -ForegroundColor Green
