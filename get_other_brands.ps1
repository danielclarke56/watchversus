$watches = Get-Content 'data/watches.json' | ConvertFrom-Json
$watches | Where-Object { $_.brand -match 'Cartier|Longines|Breitling' } | Select-Object name, slug, brand
