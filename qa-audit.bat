@echo off
REM QA Swarm API Audit Trigger
SET SKILL_SCRIPT=C:\Users\vignesh theerdala\.gemini\antigravity\skills\qa-swarm\scripts\qa_audit_shell.js
SET TARGET_DIR=d:\dev\projects\personal\bluepenguin\backend
SET TARGET_FILE=qa_audit_shell.js

echo [QA SWARM] Copying audit script to backend...
copy "%SKILL_SCRIPT%" "%TARGET_DIR%\%TARGET_FILE%" > nul

echo [QA SWARM] Executing API Audit...
cd /d "%TARGET_DIR%"
node %TARGET_FILE%

echo [QA SWARM] Cleaning up...
del "%TARGET_DIR%\%TARGET_FILE%"
echo [QA SWARM] Audit Complete.
