@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\OpenLevelEditor.ps1" %*
endlocal
