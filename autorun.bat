@echo off
:loop
cls
title Stadestér-CLI
node --max-old-space-size=16384 --expose-gc --trace-uncaught "main.js"
pause
goto loop
