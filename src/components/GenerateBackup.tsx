import type { DatabaseEntry } from "@/types/database";
import { X, Server, Play, CheckCircle } from "lucide-react";
import { useState } from "react";

interface Props {
  entry: DatabaseEntry;
  onClose: () => void;
}

const GenerateBackup = ({ entry, onClose }: Props) => {
  const [status, setStatus] = useState<"idle" | "generating" | "done">("idle");

  const handleGenerate = () => {
    setStatus("generating");
    setTimeout(() => setStatus("done"), 2500);
  };

  const backupCommand = `BACKUP DATABASE [${entry.name}] TO DISK = N'${entry.backupPath || "C:\\Backups"}\\${entry.name}_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.bak' WITH NOFORMAT, NOINIT, SKIP, NOREWIND, NOUNLOAD, STATS = 10`;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/60 backdrop-blur-sm">
      <div className="glass-surface rounded-2xl w-[480px] glow-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Server className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Gerar Backup</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Info summary */}
          <div className="rounded-xl border border-border/50 px-4 py-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Banco:</span>
              <span className="font-medium text-foreground">{entry.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Servidor:</span>
              <span className="font-mono text-xs text-foreground">{entry.ip}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Usuário:</span>
              <span className="text-foreground">{entry.user}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Destino:</span>
              <span className="font-mono text-xs text-foreground">{entry.backupPath || "Não definido"}</span>
            </div>
          </div>

          {/* Command preview */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Comando SQL</p>
            <div className="bg-background/80 rounded-lg p-3 border border-border/50">
              <code className="text-xs font-mono text-foreground/80 break-all leading-relaxed">{backupCommand}</code>
            </div>
          </div>

          {/* Status */}
          {status === "generating" && (
            <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-foreground">Gerando backup de <strong>{entry.name}</strong>...</span>
            </div>
          )}

          {status === "done" && (
            <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/20 px-4 py-3">
              <CheckCircle className="w-4 h-4 text-[hsl(var(--success))]" />
              <span className="text-sm text-foreground">Backup gerado com sucesso!</span>
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-40"
              onClick={handleGenerate}
              disabled={status === "generating"}
            >
              <Play className="w-4 h-4" />
              {status === "done" ? "Gerar Novamente" : "Gerar Backup"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateBackup;
