@echo off
:loop
cls
title Stadester-CLI
node --max-old-space-size=16384 --expose-gc --trace-uncaught "main.js"
pause
goto loop
