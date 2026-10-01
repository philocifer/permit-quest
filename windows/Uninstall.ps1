$ErrorActionPreference = 'Stop'
Write-Host 'This removes Permit Quest for this Windows user.'
Write-Host 'Close the Permit Quest server window first.'

$shell = New-Object -ComObject WScript.Shell
foreach ($folder in @($shell.SpecialFolders('Desktop'), $shell.SpecialFolders('Programs'))) {
    $link = Join-Path $folder 'Permit Quest.lnk'
    if (Test-Path $link) { Remove-Item -Force $link }
}

$dest = Join-Path $env:LOCALAPPDATA 'Permit Quest'
Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', "timeout /t 2 /nobreak >nul & rmdir /s /q `"$dest`"" -WindowStyle Hidden
Write-Host 'Permit Quest has been removed.'
