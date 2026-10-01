$ErrorActionPreference = 'Stop'
$src = Split-Path -Parent $MyInvocation.MyCommand.Path
$dest = Join-Path $env:LOCALAPPDATA 'Permit Quest'

Write-Host 'Installing Permit Quest to:'
Write-Host "  $dest"
Write-Host ''

New-Item -ItemType Directory -Force -Path $dest | Out-Null
& robocopy $src $dest /E /NFL /NDL /NJH /NJS /XF Install.bat Install.ps1
if ($LASTEXITCODE -ge 8) {
    throw "Install failed (robocopy exit $LASTEXITCODE)."
}

$shell = New-Object -ComObject WScript.Shell
$target = Join-Path $dest 'Start Permit Quest.bat'
foreach ($folder in @($shell.SpecialFolders('Desktop'), $shell.SpecialFolders('Programs'))) {
    $link = $shell.CreateShortcut((Join-Path $folder 'Permit Quest.lnk'))
    $link.TargetPath = $target
    $link.WorkingDirectory = $dest
    $link.Description = 'Start the Permit Quest server'
    $link.Save()
}

Write-Host ''
Write-Host 'Installed. Python 3 is still required to run the server.'
Write-Host 'Use the Permit Quest shortcut on the desktop or in the Start menu.'
Write-Host 'To remove it, run Uninstall.bat in:'
Write-Host "  $dest"
