$content = Get-Content 'C:\BACKUP\SpeedUpTutorial\resources\js\Pages\Dashboard.jsx' -Raw
$content = $content -replace '(?s)\{/\* Monthly summary \*/\}.*?<div class="space-y-4">', '<div class="space-y-4">'
$content | Set-Content 'C:\BACKUP\SpeedUpTutorial\resources\js\Pages\Dashboard.jsx' -NoNewline
