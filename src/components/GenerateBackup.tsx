import type { DatabaseEntry } from "@/types/database";
import { X, Server, Download, Copy, CheckCircle, Settings2, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  entries: DatabaseEntry[];
  savePath: string;
  onClose: () => void;
}

const GenerateBackup = ({ entries, savePath, onClose }: Props) => {
  const [downloaded, setDownloaded] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [firebirdLocalPath, setFirebirdLocalPath] = useState("C:\\Program Files\\Firebird\\Firebird_5_0");
  const [winrarPath, setWinrarPath] = useState("C:\\Program Files\\WinRAR");
  const [destino, setDestino] = useState(savePath || "C:\\Users\\%USERNAME%\\Desktop\\BDS");

  const buildBatForEntry = (entry: DatabaseEntry) => {
    const cleanName = entry.name.replace(/^BANCODADOS_/i, "");
    const gbakUser = entry.user || "SYSDBA";
    const gbakPassword = entry.password || "Bwd@UPiC!FR4";
    const firebirdRemotePath = entry.backupPath || "/firebird/data";

    return `
echo.
echo ============================================
echo   Backup do Banco: "BANCODADOS_${cleanName}"
echo   Servidor: ${entry.ip}
echo   Usuario: ${gbakUser}
echo ============================================
echo.
echo Iniciando Backup do Banco: "BANCODADOS_${cleanName}" ...
echo Hora inicio: %time%

echo [1/5] Executando backup (gbak)...
cd /d "${firebirdLocalPath}"
gbak -l -t -user ${gbakUser} -password ${gbakPassword} "${entry.ip}:${firebirdRemotePath}/BANCODADOS_${cleanName}.FDB" "${destino}\\BANCODADOS_${cleanName}.FBK"
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [ERRO] Falha ao executar o backup do banco "BANCODADOS_${cleanName}".
  echo   Verifique: IP do servidor, credenciais, caminho remoto do banco.
  echo   Codigo de erro: %ERRORLEVEL%
  echo.
  set TEVE_ERRO=1
  goto :PROXIMO_${cleanName}
)

echo [2/5] Executando restore local...
gbak -user ${gbakUser} -pas ${gbakPassword} -p 8192 -o -c "${destino}\\BANCODADOS_${cleanName}.FBK" "${destino}\\BANCODADOS_${cleanName}.FDB"
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [ERRO] Falha ao restaurar o banco "BANCODADOS_${cleanName}".
  echo   O arquivo .FBK pode estar corrompido ou sem espaco em disco.
  echo   Codigo de erro: %ERRORLEVEL%
  echo.
  set TEVE_ERRO=1
  goto :PROXIMO_${cleanName}
)

echo [3/5] Removendo arquivo .FBK temporario...
del "${destino}\\BANCODADOS_${cleanName}.FBK"

echo [4/5] Compactando com WinRAR...
cd /d "${winrarPath}"
rar.exe a -t "${destino}\\BANCODADOS ${cleanName}.rar" "${destino}\\*.FDB"
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [ERRO] Falha ao compactar com WinRAR.
  echo   Verifique se o WinRAR esta instalado em: ${winrarPath}
  echo   Codigo de erro: %ERRORLEVEL%
  echo.
  set TEVE_ERRO=1
  goto :PROXIMO_${cleanName}
)

echo [5/5] Limpando arquivos .FDB temporarios...
del "${destino}\\*.FDB"

echo.
echo FEITOOOOoOOOooooooooOOOOO.
echo Processo concluido para "BANCODADOS_${cleanName}"!
echo FDB disponivel na pasta "BDS". Bora beber um cafezinho

:PROXIMO_${cleanName}
echo Hora termino: %time%
echo.`;
  };

  const buildBat = () => {
    const header = `@echo off
chcp 65001 >nul
title Backup/Restore - Gerador de Backup
set TEVE_ERRO=0

if not exist "${destino}" (
  mkdir "${destino}"
)
`;

    const body = entries.map(buildBatForEntry).join("\n");

    const footer = `
echo.
echo ============================================
if "%TEVE_ERRO%"=="1" (
  echo   [!] Alguns backups tiveram ERRO. Revise as mensagens acima.
) else (
  echo   Todos os backups concluidos com sucesso!
)
echo ============================================
echo.
pause`;

    return header + body + footer;
  };

  const batContent = buildBat();

  const handleDownload = () => {
    // BOM + content para garantir encoding correto no Windows
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + batContent], { type: "application/x-bat;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fileName = entries.length === 1
      ? `backup_${entries[0].name}.bat`
      : `backup_${entries.length}_bancos.bat`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(batContent);
    toast.success("Conteúdo do .bat copiado!");
  };

  const fieldClass = "w-full bg-input rounded-md px-2.5 py-1.5 text-[11px] font-mono text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring/40 border border-border/50 transition-all";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/70 backdrop-blur-sm p-4">
      <div className="bg-card rounded-lg w-full max-w-[580px] max-h-[90vh] border border-border shadow-2xl overflow-hidden flex flex-col">
        <div className="win-title-bar px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
              <Server className="w-3 h-3 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground leading-tight">Gerar Backup</h2>
              <p className="text-[10px] text-muted-foreground leading-tight font-mono">
                {entries.length} banco(s) selecionado(s)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          {/* Lista de bancos */}
          <div className="rounded-md border border-border overflow-hidden">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-card border-b border-border">
              Bancos incluídos
            </div>
            <div className="max-h-[120px] overflow-y-auto">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between px-3 py-1.5 text-xs border-b border-border/30 last:border-0">
                  <span className="font-medium text-foreground">{entry.name}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{entry.ip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Etapas do .bat */}
          <div className="rounded-md border border-border px-3 py-2.5 space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Etapas por banco</p>
            {[
              "1. Backup remoto (gbak → .FBK)",
              "2. Restore local (.FBK → .FDB)",
              "3. Remover .FBK temporário",
              "4. Compactar com WinRAR (.rar)",
              "5. Remover .FDB temporário",
            ].map((step) => (
              <div key={step} className="flex items-center gap-2 text-[11px] text-foreground/70">
                <CheckCircle className="w-3 h-3 text-primary/50" />
                {step}
              </div>
            ))}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1 pt-1 border-t border-border/30">
              <AlertTriangle className="w-3 h-3 text-amber-500/70" />
              Em caso de erro, o banco é ignorado e os demais continuam
            </div>
          </div>

          {/* Config toggle */}
          <div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <Settings2 className="w-3 h-3" />
              {showConfig ? "Ocultar configurações" : "Configurações de caminhos"}
            </button>

            {showConfig && (
              <div className="space-y-2.5 rounded-md border border-border p-3">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">Caminho local do Firebird</label>
                  <input className={fieldClass} value={firebirdLocalPath} onChange={(e) => setFirebirdLocalPath(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">Caminho do WinRAR</label>
                  <input className={fieldClass} value={winrarPath} onChange={(e) => setWinrarPath(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">Pasta destino do backup</label>
                  <input className={fieldClass} value={destino} onChange={(e) => setDestino(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* BAT preview */}
          <div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors mb-1.5"
            >
              {showPreview ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span className="text-[10px] font-semibold uppercase tracking-wider">Preview do .bat</span>
            </button>

            {showPreview && (
              <>
                <div className="flex justify-end mb-1">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    Copiar
                  </button>
                </div>
                <div className="bg-background rounded-md p-3 border border-border max-h-[200px] overflow-y-auto">
                  <pre className="text-[10px] font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed">{batContent}</pre>
                </div>
              </>
            )}
          </div>

          {/* Success */}
          {downloaded && (
            <div className="flex items-center gap-2.5 rounded-md bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/20 px-3 py-2.5">
              <CheckCircle className="w-3.5 h-3.5 text-[hsl(var(--success))]" />
              <span className="text-xs text-foreground">
                Arquivo .bat baixado com {entries.length} banco(s)!
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-1.5 pt-1">
            <button
              className="px-3 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:brightness-110 border border-border/50 transition-all"
              onClick={onClose}
            >
              Fechar
            </button>
            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:brightness-110 transition-all"
              onClick={handleDownload}
            >
              <Download className="w-3.5 h-3.5" />
              Baixar .bat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateBackup;
