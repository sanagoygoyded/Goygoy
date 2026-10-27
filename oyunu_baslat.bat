@echo off
title Gods of Egypt MMORPG - Sunucu
echo ======================================================
echo    MISIR TANRILARI (GODS OF EGYPT) MMORPG SUNUCUSU
echo ======================================================
echo Web sunucusu ve oyun baslatiliyor...
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
