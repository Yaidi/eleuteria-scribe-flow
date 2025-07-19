Write-Host "Installing Poetry..."

$pythonCmd = ""

if (Get-Command py -ErrorAction SilentlyContinue) {
    $pyPath = (Get-Command py).Source
    if ($pyPath -like "*WindowsApps*") {
        Write-Host "⚠️  Detected Microsoft Store Python ('py'). Falling back to 'python'..."
    } else {
        $pythonCmd = "py"
    }
}

if (-not $pythonCmd -and (Get-Command python -ErrorAction SilentlyContinue)) {
    $pythonCmd = "python"
}

if (-not $pythonCmd) {
    Write-Error "❌ Could not find a suitable Python installation (py or python). Please install Python manually."
    exit 1
}

Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing | ForEach-Object {
    $_.Content | & $pythonCmd -
}

$env:Path = "$env:USERPROFILE\.poetry\bin;" + $env:Path

Write-Host "Configuring Poetry..."
poetry config virtualenvs.in-project true

Write-Host "Moving to backend dir..."
Set-Location ..\backend
if (-not $?) {
    Write-Error "'backend' not found"
    exit 1
}

Write-Host "Creating Poetry Venv and installing dependencies..."
poetry install

Write-Host ""
Write-Host "Dependencies installed!"
Write-Host ""
Write-Host "To activate your Python virtual environment please run:"
Write-Host ". (poetry env info --path)\\Scripts\\activate.ps1"
Write-Host ""
