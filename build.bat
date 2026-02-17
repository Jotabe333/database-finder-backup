@echo off
:: Entra na pasta onde o build.bat esta localizado
cd /d "%~dp0"

echo ============================================
echo   Gerador de Backup - Build .exe
echo ============================================
echo.

:: Verifica Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado! Instale em: https://nodejs.org
    pause
    exit /b 1
)

:: Instala dependencias
echo [1/4] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar dependencias.
    pause
    exit /b 1
)

:: Instala Electron
echo [2/4] Instalando Electron...
call npm install --save-dev electron electron-builder
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar Electron.
    pause
    exit /b 1
)

:: Injeta configs no package.json se necessario
echo [3/4] Configurando package.json...
node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));let changed=false;if(!p.main){p.main='electron/main.js';changed=true;}if(!p.scripts['electron:build']){p.scripts['electron:build']='vite build && electron-builder';changed=true;}if(!p.build){p.build={appId:'com.backup.generator',productName:'Gerador de Backup',win:{target:'portable',icon:'public/favicon.png'},files:['dist/**/*','electron/**/*','public/favicon.png'],directories:{output:'release'}};changed=true;}else if(p.build&&p.build.win&&p.build.win.target!=='portable'){p.build.win.target='portable';changed=true;}if(changed){fs.writeFileSync('package.json',JSON.stringify(p,null,2));console.log('   package.json configurado!');}else{console.log('   package.json ja configurado.');}"

:: Build
echo [4/4] Gerando .exe...
call npm run electron:build
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao gerar o .exe.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   BUILD CONCLUIDO!
echo   O .exe esta na pasta "release/"
echo ============================================
pause
