$watches = Get-Content 'data/watches.json' | ConvertFrom-Json
$watches | Where-Object { $_.brand -match 'Panerai' } | Select-Object name, slug, brand
