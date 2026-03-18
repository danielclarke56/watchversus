$watches = Get-Content 'data/watches.json' | ConvertFrom-Json
$watchNames = @('Omega Seamaster 300m', 'Rolex Submariner 41', 'Cartier Santos', 'TAG Heuer Carrera 42', 'IWC Portugieser 40', 'Longines HydroConquest 41', 'Grand Seiko SBGA211', 'Tudor Black Bay 58')

foreach ($name in $watchNames) {
    $watch = $watches | Where-Object { $_.name -match [regex]::Escape($name) } | Select-Object -First 1
    if ($watch) {
        Write-Host "$($watch.name) => $($watch.slug)"
    } else {
        Write-Host "NOT FOUND: $name"
    }
}
