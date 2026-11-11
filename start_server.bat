@echo off
title MatSci Nexus - PhD Research & Lab Management Suite
cd /d "%~dp0"
echo Starting MatSci Nexus Server at http://localhost:8000 ...
start "" http://localhost:8000
.\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000
pause
