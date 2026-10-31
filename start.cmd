@echo off
REM Loui DS - start Storybook and open it in the browser.
REM Double-click this file, or run `start.cmd` from a terminal in the repo root.
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 24 LTS from https://nodejs.org and run this again.
  goto :error
)

where pnpm >nul 2>nul
if errorlevel 1 (
  echo pnpm was not found. Installing pnpm 12.16.1 with npm...
  call npm install -g pnpm@12.16.1
  if errorlevel 1 goto :error
)

if not exist node_modules (
  echo Installing dependencies. This takes a minute the first time...
  call pnpm install
  if errorlevel 1 goto :error
)

echo.
echo Starting Storybook at http://localhost:6006
echo Your browser opens automatically when it is ready. Press Ctrl+C to stop.
echo.
call pnpm start
if errorlevel 1 goto :error
goto :eof

:error
echo.
echo Something went wrong. Check the messages above.
pause
exit /b 1
