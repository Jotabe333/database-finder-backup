import type { DatabaseEntry } from "@/types/database";
import { X, Server, Download, Copy, CheckCircle, Settings2 } from "lucide-react";
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

  // Caminhos e credenciais configuráveis
  const gbakUser = "SYSDBA";
  const gbakPassword = "Bwd@UPiC!FR4";
  const [firebirdRemotePath, setFirebirdRemotePath] = useState("/firebird/data");
  const [firebirdLocalPath, setFirebirdLocalPath] = useState("C:\\Program Files\\Firebird\\Firebird_5_0");
  const [winrarPath, setWinrarPath] = useState("C:\\Program Files\\WinRAR");
  const [destino, setDestino] = useState(savePath || entry.backupPath || "C:\\Users\\%USERNAME%\\Desktop\\BDS");

  const buildBat = () => {
    return `@echo off
title Backup/Restore - ${entry.name}
echo.
echo ============================================
echo   Backup do Banco: "${entry.name}"
echo   Servidor: ${entry.ip}
echo   Usuario: ${gbakUser}
echo ============================================
echo.
echo Iniciando Backup do Banco: "${entry.name}" ...
C:
cd "${firebirdLocalPath}"
echo Hora inicio: %time%
gbak -l -t -user ${gbakUser} -password ${gbakPassword} "${entry.ip}:${firebirdRemotePath}/BANCODADOS_${entry.name}.FDB" "${destino}\\BANCODADOS_${entry.name}.FBK"
if %ERRORLEVEL% NEQ 0 (
echo.
echo Erro no backup! Verifique os dados e tente novamente.
pause
exit /b 1
)
gbak -user ${gbakUser} -pas ${gbakPassword} -p 8192 -o -c "${destino}\\BANCODADOS_${entry.name}.FBK" "${destino}\\BANCODADOS_${entry.name}.FDB"
del "${destino}\\BANCODADOS_${entry.name}.FBK"
cd "${winrarPath}"
rar.exe a -t "${destino}\\BANCODADOS ${entry.name}.rar" "${destino}\\*.FDB"
del "${destino}\\*.FDB"
echo.
echo FEITOOOOoOOOooooooooOOOOO.
if %ERRORLEVEL%==0 (
echo.
echo Processo concluido!
echo.
echo FDB disponivel na pasta de destino. Bora beber um cafezinho
echo Hora termino: %time%
echo.
pause
) ELSE (
echo.
echo Erro!!! Verifique os dados e tente novamente.
pause
)`;
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

  const fieldClass = "w-full bg-input rounded-lg px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/60 backdrop-blur-sm">
      <div className="glass-surface rounded-2xl w-[560px] max-h-[90vh] glow-border overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Server className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Gerar Backup</h2>
              <p className="text-xs text-muted-foreground">backup_{entry.name}.bat</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Dados do banco selecionado */}
          <div className="rounded-xl border border-border/50 px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Banco:</span>
              <span className="font-medium text-foreground">{entry.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IP:</span>
              <span className="font-mono text-xs text-foreground">{entry.ip}</span>
            </div>
          </div>

          {/* Configurações de caminhos */}
          <div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <Settings2 className="w-3.5 h-3.5" />
              {showConfig ? "Ocultar configurações" : "Configurações de caminhos"}
            </button>

            {showConfig && (
              <div className="space-y-3 rounded-xl border border-border/50 p-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Caminho remoto do Firebird (servidor)</label>
                  <input className={fieldClass} value={firebirdRemotePath} onChange={(e) => setFirebirdRemotePath(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Caminho local do Firebird</label>
                  <input className={fieldClass} value={firebirdLocalPath} onChange={(e) => setFirebirdLocalPath(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Caminho do WinRAR</label>
                  <input className={fieldClass} value={winrarPath} onChange={(e) => setWinrarPath(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Pasta destino do backup</label>
                  <input className={fieldClass} value={destino} onChange={(e) => setDestino(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* BAT preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preview do .bat</p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="w-3 h-3" />
                Copiar
              </button>
            </div>
            <div className="bg-background/80 rounded-lg p-3 border border-border/50 max-h-[220px] overflow-y-auto">
              <pre className="text-[11px] font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed">{batContent}</pre>
            </div>
          </div>

          {/* Downloaded status */}
          {downloaded && (
            <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/20 px-4 py-3">
              <CheckCircle className="w-4 h-4 text-[hsl(var(--success))]" />
              <span className="text-sm text-foreground">Arquivo <strong>backup_{entry.name}.bat</strong> baixado!</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              className="px-4 py-2.5 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:brightness-110 transition-all"
              onClick={onClose}
            >
              Fechar
            </button>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:brightness-110 transition-all"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
              Baixar .bat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateBackup;
