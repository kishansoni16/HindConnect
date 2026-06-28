@echo off
echo Stopping existing Ollama background instances...
taskkill /f /im "ollama.exe" >nul 2>&1
taskkill /f /im "ollama app.exe" >nul 2>&1
echo.
echo Starting Ollama with CORS allowed for Vercel...
set OLLAMA_ORIGINS=*
ollama serve
