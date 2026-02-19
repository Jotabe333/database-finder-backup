import type { DatabaseEntry } from "@/types/database";
import { X, Server, Download, Copy, CheckCircle, ChevronDown, ChevronRight, AlertTriangle, Play, Loader2, XCircle, StopCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { getConfigPaths } from "@/components/SettingsModal";

interface Props {
  entries: DatabaseEntry[];
  savePath: string;
  onClose: () => void;
}

type ExecutionState = "idle" | "running" | "success" | "error";

const GenerateBackup = ({ entries, savePath, onClose }: Props) => {
  const [showPreview, setShowPreview] = useState(false);
  const [execState, setExecState] = useState<ExecutionState>("idle");
  const [execOutput, setExecOutput] = useState("");
  const outputRef = useRef<HTMLPreElement>(null);

  const config = getConfigPaths();
  const firebirdLocalPath = config.firebirdLocalPath;
  const winrarPath = config.winrarPath;
  const destino = savePath || "C:\\Users\\%USERNAME%\\Desktop\\BDS";

  const isElectron = !!(window as any).electronAPI?.runBat;

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [execOutput]);

  // Listen to real-time output
  useEffect(() => {
    if (execState !== "running") return;
    const api = (window as any).electronAPI;
    if (!api?.onBatOutput) return;
    const cleanup = api.onBatOutput((data: string) => {
      setExecOutput((prev) => prev + data);
    });
    return cleanup;
  }, [execState]);

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
if not exist "${destino}\\BANCODADOS_${cleanName}.FBK" (
  echo.
  echo [ERRO] Falha ao gerar o arquivo FBK do banco "BANCODADOS_${cleanName}".
  echo   Verifique: IP do servidor, credenciais, caminho remoto do banco.
  echo.
  set TEVE_ERRO=1
  goto :PROXIMO_${cleanName}
)
echo   [OK] FBK gerado com sucesso.

echo [2/5] Executando restore local...
gbak -user ${gbakUser} -pas ${gbakPassword} -p 8192 -o -c "${destino}\\BANCODADOS_${cleanName}.FBK" "${destino}\\BANCODADOS_${cleanName}.FDB"
if not exist "${destino}\\BANCODADOS_${cleanName}.FDB" (
  echo.
  echo [ERRO] Falha ao restaurar o banco "BANCODADOS_${cleanName}".
  echo   O arquivo .FBK pode estar corrompido ou sem espaco em disco.
  echo.
  set TEVE_ERRO=1
  goto :PROXIMO_${cleanName}
)
echo   [OK] FDB restaurado com sucesso.

echo [3/5] Removendo arquivo .FBK temporario...
del "${destino}\\BANCODADOS_${cleanName}.FBK"

echo [4/5] Compactando com WinRAR...
cd /d "${winrarPath}"
rar.exe a -t "${destino}\\BANCODADOS_${cleanName}.rar" "${destino}\\*.FDB"
if not exist "${destino}\\BANCODADOS_${cleanName}.rar" (
  echo.
  echo [ERRO] Falha ao compactar com WinRAR.
  echo   Verifique se o WinRAR esta instalado em: ${winrarPath}
  echo.
  set TEVE_ERRO=1
  goto :PROXIMO_${cleanName}
)
echo   [OK] RAR compactado com sucesso.

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

  // Build version without "pause" for execution (so it doesn't hang)
  const buildBatForExecution = () => {
    const header = `@echo off
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
echo.`;
    return header + body + footer;
  };

  const handleDownloadLog = () => {
    if (!execOutput) return;
    const crlfContent = execOutput.replace(/\n/g, "\r\n");
    const blob = new Blob([crlfContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    a.download = `backup_log_${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Log baixado com sucesso!");
  };

  const handleExecute = async () => {
    const api = (window as any).electronAPI;
    if (!api?.runBat) return;

    setExecState("running");
    setExecOutput("");

    const result = await api.runBat(buildBatForExecution());

    if (result.success) {
      setExecState("success");
    } else {
      setExecState("error");
      if (!execOutput) setExecOutput(result.output);
    }
  };

  const handleCancel = async () => {
    const api = (window as any).electronAPI;
    if (api?.cancelBat) {
      await api.cancelBat();
      setExecState("error");
      setExecOutput((prev) => prev + "\n\n[CANCELADO] Backup cancelado pelo usuário.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(batContent);
    toast.success("Conteúdo do .bat copiado!");
  };

  // Block closing while running
  const canClose = execState !== "running";

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
          {canClose && (
            <button onClick={onClose} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          {/* Execution overlay states */}
          {execState === "running" && (
            <div className="rounded-md border border-primary/30 bg-primary/5 px-4 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Executando backup...</p>
                  <p className="text-[11px] text-muted-foreground">Não feche a aplicação. O processo está em andamento.</p>
                </div>
              </div>
              {execOutput && (
                <pre
                  ref={outputRef}
                  className="bg-background rounded-md p-3 border border-border max-h-[200px] overflow-y-auto text-[10px] font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed"
                >
               {execOutput}
                </pre>
              )}
              <div className="flex justify-end pt-2">
                <button
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-destructive text-destructive-foreground hover:brightness-110 transition-all"
                  onClick={handleCancel}
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {execState === "success" && (
            <div className="rounded-md border border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5 px-4 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[hsl(var(--success))]" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Backup concluído com sucesso!</p>
                  <p className="text-[11px] text-muted-foreground">Todos os {entries.length} banco(s) foram processados sem erros.</p>
                </div>
              </div>
              {execOutput && (
                <details className="text-[11px]">
                  <summary className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">Ver log de execução</summary>
                  <pre className="mt-2 bg-background rounded-md p-3 border border-border max-h-[200px] overflow-y-auto text-[10px] font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed">
                    {execOutput}
                  </pre>
                </details>
              )}
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:brightness-110 border border-border/50 transition-all"
                  onClick={handleDownloadLog}
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar Log
                </button>
                <button
                  className="px-4 py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:brightness-110 transition-all"
                  onClick={onClose}
                >
                  Fechar
                </button>
              </div>
            </div>
          )}

          {execState === "error" && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-destructive" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Erro durante o backup</p>
                  <p className="text-[11px] text-muted-foreground">Alguns bancos podem ter falhado. Verifique o log abaixo.</p>
                </div>
              </div>
              <pre
                ref={outputRef}
                className="bg-background rounded-md p-3 border border-border max-h-[200px] overflow-y-auto text-[10px] font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed"
              >
                {execOutput}
              </pre>
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  className="px-3 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:brightness-110 border border-border/50 transition-all"
                  onClick={() => { setExecState("idle"); setExecOutput(""); }}
                >
                  Voltar
                </button>
                <button
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:brightness-110 border border-border/50 transition-all"
                  onClick={handleDownloadLog}
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar Log
                </button>
                <button
                  className="px-4 py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:brightness-110 transition-all"
                  onClick={onClose}
                >
                  Fechar
                </button>
              </div>
            </div>
          )}

          {/* Normal content - hidden during execution/results */}
          {execState === "idle" && (
            <>
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
              <div className="rounded-md border border-border px-3 py-2.5 space-y-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Processo de backup por banco</p>
                {[
                  { step: "1", label: "Gerando FBK", desc: "Backup remoto via gbak" },
                  { step: "2", label: "Gerando FDB", desc: "Restore local do .FBK" },
                  { step: "3", label: "Limpando FBK", desc: "Removendo arquivo temporário" },
                  { step: "4", label: "Compactando arquivos", desc: "Empacotando com WinRAR (.rar)" },
                  { step: "5", label: "Limpando FDB", desc: "Removendo arquivo temporário" },
                ].map((item, i) => (
                  <div key={item.step} className="flex items-start gap-2.5 relative">
                    {i < 4 && (
                      <div className="absolute left-[9px] top-[20px] w-px h-[calc(100%-4px)] bg-border/60" />
                    )}
                    <div className="w-[19px] h-[19px] rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5 z-10">
                      <span className="text-[9px] font-bold text-primary">{item.step}</span>
                    </div>
                    <div className="py-1">
                      <p className="text-[11px] font-medium text-foreground leading-tight">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{item.desc}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-2 pt-1.5 border-t border-border/30">
                  <AlertTriangle className="w-3 h-3 text-amber-500/70" />
                  Em caso de erro, o banco é ignorado e os demais continuam
                </div>
              </div>

              {/* Info de caminhos */}
              <div className="rounded-md border border-border/50 px-3 py-2 space-y-0.5">
                <p className="text-[10px] text-muted-foreground">
                  <span className="font-medium">Firebird:</span> <span className="font-mono">{firebirdLocalPath}</span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  <span className="font-medium">WinRAR:</span> <span className="font-mono">{winrarPath}</span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  <span className="font-medium">Destino:</span> <span className="font-mono">{destino}</span>
                </p>
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


              {/* Actions */}
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  className="px-3 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:brightness-110 border border-border/50 transition-all"
                  onClick={onClose}
                >
                  Fechar
                </button>
                {isElectron && (
                  <button
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:brightness-110 transition-all"
                    onClick={handleExecute}
                  >
                    <Play className="w-3.5 h-3.5" />
                    Executar
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateBackup;
