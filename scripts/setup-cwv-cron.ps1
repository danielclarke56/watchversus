# Core Web Vitals Monitoring - Windows Task Scheduler Setup
# Runs nightly at 02:00 UTC (converts to local time automatically)
# Usage: .\setup-cwv-cron.ps1

$taskName = "WVW-Core-Web-Vitals-Monitor"
$taskDescription = "WatchVsWatch: Fetch and log Core Web Vitals metrics nightly at 02:00 UTC"
$scriptPath = "$PSScriptRoot\monitor-core-web-vitals.mjs"
$logDir = "$PSScriptRoot\..\logs"

# Ensure logs directory exists
if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null
  Write-Host "Created logs directory: $logDir"
}

# Verify script exists
if (-not (Test-Path $scriptPath)) {
  Write-Host "ERROR: Script not found: $scriptPath"
  exit 1
}

Write-Host "Setting up Core Web Vitals monitoring cron job..."

# Remove existing task if it exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
  Write-Host "Removing existing task: $taskName"
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Convert 02:00 UTC to local time
$utcTime = [DateTime]::ParseExact("02:00", "HH:mm", [System.Globalization.CultureInfo]::InvariantCulture)
$localTime = [System.TimeZone]::CurrentTimeZone.ToLocalTime($utcTime)
$localTimeStr = $localTime.ToString("HH:mm")

# Create task trigger (daily at converted time)
$trigger = New-ScheduledTaskTrigger -Daily -At $localTime

# Create task action - run node script
$action = New-ScheduledTaskAction `
  -Execute "node" `
  -Argument "`"$scriptPath`"" `
  -WorkingDirectory "$PSScriptRoot\.."

# Create task settings
$settings = New-ScheduledTaskSettingsSet `
  -RunOnlyIfNetworkAvailable `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

# Register the task
Register-ScheduledTask `
  -TaskName $taskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Description $taskDescription `
  -RunLevel Highest `
  -Force | Out-Null

Write-Host "SUCCESS: Task scheduled!"
Write-Host ""
Write-Host "Task Details:"
Write-Host "  Name: $taskName"
Write-Host "  Schedule: Daily at $localTimeStr local time (02:00 UTC)"
Write-Host "  Script: $scriptPath"
Write-Host "  Metrics log: $logDir\core-web-vitals.json"
Write-Host ""
Write-Host "Test the setup:"
Write-Host "  1. Manual run: Start-ScheduledTask -TaskName $taskName"
Write-Host "  2. View results: Get-Content $logDir\core-web-vitals.json"
Write-Host "  3. View task info: Get-ScheduledTaskInfo -TaskName $taskName"
