# Como gerar o .exe do Gerador de Backup

## Pré-requisitos
1. Instale o **Node.js** (LTS): https://nodejs.org
2. Instale o **Git**: https://git-scm.com

## Passo a passo

### 1. Clone o projeto
Abra o **Prompt de Comando** (ou PowerShell) e execute:
```bash
git clone https://github.com/SEU_USUARIO/SEU_REPO.git
cd SEU_REPO
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Instale o Electron
```bash
npm install --save-dev electron electron-builder
```

### 4. Adicione ao `package.json`
Abra o arquivo `package.json` e adicione/altere:

Dentro de `"scripts"`, adicione:
```json
"electron:build": "vite build && electron-builder"
```

No nível raiz do JSON (fora de scripts), adicione:
```json
"main": "electron/main.js",
"build": {
  "appId": "com.backup.generator",
  "productName": "Gerador de Backup",
  "win": {
    "target": "nsis",
    "icon": "public/favicon.png"
  },
  "files": [
    "dist/**/*",
    "electron/**/*",
    "public/favicon.png"
  ],
  "directories": {
    "output": "release"
  }
}
```

### 5. Gere o .exe
```bash
npm run electron:build
```

### 6. Pronto!
O instalador `.exe` estará na pasta `release/`.
Basta executar para instalar o **Gerador de Backup** no Windows.
