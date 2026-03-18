$watches = Get-Content 'data/watches.json' | ConvertFrom-Json
$picks = @('omega-seamaster-300m', 'omega-speedmaster-moonwatch', 'tag-heuer-carrera-42', 'rolex-submariner-41', 'cartier-santos', 'iwc-portugieser-40', 'panerai-luminor-44-pam01312', 'breitling-navitimer-b01-42', 'grand-seiko-sbga211-snowflake', 'rolex-datejust-36')
$watches | Where-Object { $picks -contains $_.slug } | ConvertTo-Json -Depth 10
