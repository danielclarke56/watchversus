$watches = Get-Content 'data/watches.json' | ConvertFrom-Json
$watches | Where-Object { [int]$_.price_new_usd.min -lt 10000 } | Select-Object -First 30 | Select-Object name, brand, @{N='price_min';E={$_.price_new_usd.min}}, slug
