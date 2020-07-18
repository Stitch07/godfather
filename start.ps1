if (-Not (Test-Path env:VIRTUAL_ENV)) {
    Invoke-Expression .\venv\Scripts\Activate.ps1
}

Set-Variable -Name PIPENV_VERBOSITY -Value "-1"

Invoke-Expression "python -m pip install -q -r requirements.txt" > $null
Invoke-Expression "python ."