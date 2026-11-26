'use strict'
// Creates the `mz` command for you, every time the app starts (Windows only).
//
//   C:\bin\mz.cmd     written (or refreshed) if missing or different
//   C:\bin            added to your USER PATH only if it is not on PATH already
//
// Want a different folder? Set the PLUFFY_BIN environment variable. If C:\bin cannot be
// written to, %USERPROFILE%\bin is used instead.
//
// After the first start, open a NEW terminal and run:  mz install | mz push | mz pull | mz uninstall
// It never throws: if anything fails, the app carries on and the error is returned.

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const MZ_CMD = String.raw`@echo off
setlocal
rem ---- edit these two lines if you want a different repo or folder ----
set "REPO=https://github.com/Mizumi250/Pluffy.git"
set "DIR=%USERPROFILE%\Documents\Pluffy"

if "%~1"=="" goto usage
if /i "%~1"=="install"   goto install
if /i "%~1"=="push"      goto push
if /i "%~1"=="pull"      goto pull
if /i "%~1"=="uninstall" goto uninstall
goto usage

:usage
echo.
echo   mz install     clone Pluffy to %DIR%
echo   mz push        commit everything and push to GitHub
echo   mz pull        discard local changes and match GitHub
echo   mz uninstall   permanently delete %DIR%
echo.
exit /b 1

:install
if exist "%DIR%\.git" (
  echo Already installed at %DIR%
  exit /b 0
)
git clone "%REPO%" "%DIR%"
exit /b %errorlevel%

:push
if not exist "%DIR%\.git" goto missing
cd /d "%DIR%"
git add -A
git commit -m "mizumi push %date% %time%"
git push
exit /b %errorlevel%

:pull
if not exist "%DIR%\.git" goto missing
cd /d "%DIR%"
echo This throws away ALL local changes that are not pushed.
set /p OK=Type YES to continue:
if /i not "%OK%"=="YES" (
  echo Cancelled.
  exit /b 1
)
git fetch origin
for /f %%b in ('git rev-parse --abbrev-ref HEAD') do git reset --hard origin/%%b
exit /b %errorlevel%

:uninstall
if not exist "%DIR%" goto missing
echo This permanently deletes %DIR% (skips the Recycle Bin).
echo Anything not pushed to GitHub will be lost.
set /p OK=Type DELETE to continue:
if /i not "%OK%"=="DELETE" (
  echo Cancelled.
  exit /b 1
)
cd /d "%USERPROFILE%"
rmdir /s /q "%DIR%"
if exist "%DIR%" (
  echo Some files could not be deleted. Close editors or terminals using the folder and try again.
  exit /b 1
)
echo Deleted.
exit /b 0

:missing
echo Pluffy not found at %DIR%. Run: mz install
exit /b 1
`

const norm = (p) => path.resolve(p).replace(/[\\/]+$/, '').toLowerCase()

// Adds `dir` to the user-level PATH (HKCU\Environment) if it is not already in it.
// PowerShell is used instead of setx, which cuts PATH off at 1024 characters.
function ensureOnUserPath(dir) {
  const ps = [
    '$d = $env:MZ_ADD_TO_PATH',
    "$cur = [Environment]::GetEnvironmentVariable('Path','User')",
    "$parts = @(); if ($cur) { $parts = $cur -split ';' | Where-Object { $_ } }",
    "$has = $parts | Where-Object { $_.TrimEnd('\\').ToLower() -eq $d.TrimEnd('\\').ToLower() }",
    "if (-not $has) { [Environment]::SetEnvironmentVariable('Path', (($parts + $d) -join ';'), 'User'); 'added' } else { 'present' }",
  ].join('; ')
  const r = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], {
    env: { ...process.env, MZ_ADD_TO_PATH: dir }, windowsHide: true, encoding: 'utf8', timeout: 15000,
  })
  if (r.error || r.status !== 0) throw new Error((r.stderr || (r.error && r.error.message) || 'PowerShell failed').trim())
  return (r.stdout || '').trim() === 'added'
}

function writeMz(binDir) {
  const file = path.join(binDir, 'mz.cmd')
  const want = MZ_CMD.replace(/\r?\n/g, '\r\n')   // .cmd files need Windows line endings
  fs.mkdirSync(binDir, { recursive: true })
  let have = null
  try { have = fs.readFileSync(file, 'utf8') } catch { /* not there yet */ }
  if (have !== want) { fs.writeFileSync(file, want); return { file, wrote: true } }
  return { file, wrote: false }
}

function ensureMz() {
  if (process.platform !== 'win32') return { skipped: true }
  const home = process.env.USERPROFILE
  const systemDrive = process.env.SystemDrive || 'C:'
  const candidates = [process.env.PLUFFY_BIN, `${systemDrive}\\bin`, home && path.join(home, 'bin')].filter(Boolean)
  let out = { pathAdded: false }
  let binDir = null
  for (const dir of candidates) {
    try { out = { ...out, ...writeMz(dir) }; binDir = dir; break } catch (e) { out.error = `could not write mz.cmd in ${dir}: ${e.message}` }
  }
  if (!binDir) return out
  delete out.error
  try {
    const onPath = String(process.env.PATH || '').split(';').some((p) => p && norm(p) === norm(binDir))
    if (!onPath) out.pathAdded = ensureOnUserPath(binDir)
  } catch (e) { out.error = `mz.cmd is in ${binDir} but adding it to PATH failed: ${e.message}` }
  return out
}

module.exports = { ensureMz, MZ_CMD }
