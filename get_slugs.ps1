$watches = Get-Content 'data/watches.json' | ConvertFrom-Json
$watches | Where-Object { [int]$_.price_new_usd.min -lt 10000 } | Select-Object -First 20 | Select-Object name, slug, brand
