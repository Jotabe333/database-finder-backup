import type { DatabaseEntry } from "@/types/database";
import { X, Server, Download, Copy, CheckCircle, Settings2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  entry: DatabaseEntry;
  savePath: string;
  onClose: () => void;
}

const GenerateBackup = ({ entry, savePath, onClose }: Props) => {
  const [downloaded, setDownloaded] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Remove prefixo BANCODADOS_ se o usuário já incluiu no nome
  const cleanName = entry.name.replace(/^BANCODADOS_/i, "");
  const gbakUser = entry.user || "SYSDBA";
  const gbakPassword = entry.password || "Bwd@UPiC!FR4";
  const [firebirdRemotePath, setFirebirdRemotePath] = useState(entry.backupPath || "/firebird/data");
  const [firebirdLocalPath, setFirebirdLocalPath] = useState("C:\\Program Files\\Firebird\\Firebird_5_0");
  const [winrarPath, setWinrarPath] = useState("C:\\Program Files\\WinRAR");
  const [destino, setDestino] = useState(savePath || "C:\\Users\\%USERNAME%\\Desktop\\BDS");

  const buildBat = () => {
    return `@echo off
title Backup/Restore - BANCODADOS_${cleanName}
echo.
echo ============================================
echo   Backup do Banco: "BANCODADOS_${cleanName}"
echo   Servidor: ${entry.ip}
echo   Usuario: ${gbakUser}
echo ============================================
echo.
echo Iniciando Backup do Banco: "BANCODADOS_${cleanName}" ...
C:
cd "${firebirdLocalPath}"
echo Hora inicio: %time%
gbak -l -t -user ${gbakUser} -password ${gbakPassword} "${entry.ip}:${firebirdRemotePath}/BANCODADOS_${cleanName}.FDB" "${destino}\\BANCODADOS_${cleanName}.FBK"
gbak -user ${gbakUser} -pas ${gbakPassword} -p 8192 -o -c "${destino}\\BANCODADOS_${cleanName}.FBK" "${destino}\\BANCODADOS_${cleanName}.FDB"
del "${destino}\\BANCODADOS_${cleanName}.FBK"
cd "${winrarPath}"
rar.exe a -t "${destino}\\BANCODADOS ${cleanName}.rar" "${destino}\\*.FDB"
del "${destino}\\*.FDB"
echo.
if %ERRORLEVEL%==0 (
echo FEITOOOOoOOOooooooooOOOOO.
echo Processo concluido!
echo FDB disponivel na pasta "BDS". Bora beber um cafezinho
) ELSE (
echo Erro!!! Tu digitou certo? Tem certeza? ! Tenta de novo campeao...
)
echo Hora termino: %time%
echo.
pause`;
  };

  const batContent = buildBat();

  const handleDownload = () => {
    const blob = new Blob([batContent], { type: "application/x-bat" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_${entry.name}.bat`;
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
      <div className="bg-card rounded-lg w-full max-w-[540px] max-h-[90vh] border border-border shadow-2xl overflow-hidden flex flex-col">
        <div className="win-title-bar px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
              <Server className="w-3 h-3 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground leading-tight">Gerar Backup</h2>
              <p className="text-[10px] text-muted-foreground leading-tight font-mono">backup_{entry.name}.bat</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          {/* Info */}
          <div className="rounded-md border border-border px-3 py-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Banco:</span>
              <span className="font-medium text-foreground">{entry.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">IP:</span>
              <span className="font-mono text-[11px] text-foreground">{entry.ip}</span>
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
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">Caminho remoto do Firebird (servidor)</label>
                  <input className={fieldClass} value={firebirdRemotePath} onChange={(e) => setFirebirdRemotePath(e.target.value)} />
                </div>
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
              <span className="text-xs text-foreground">Arquivo <strong className="font-mono">backup_{entry.name}.bat</strong> baixado!</span>
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
