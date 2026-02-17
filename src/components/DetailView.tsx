import type { DatabaseEntry } from "@/types/database";
import { X, Server, Copy } from "lucide-react";
import { toast } from "sonner";

interface Props {
  entry: DatabaseEntry;
  onClose: () => void;
  onEdit: () => void;
}

const DetailView = ({ entry, onClose, onEdit }: Props) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const InfoRow = ({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm text-foreground ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
        {value && (
          <button onClick={() => copyToClipboard(value, label)} className="p-1 rounded hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
            <Copy className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/60 backdrop-blur-sm">
      <div className="glass-surface rounded-2xl w-[400px] glow-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Server className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">{entry.name}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="rounded-xl border border-border/50 px-4">
            <InfoRow label="Nome" value={entry.name} />
            <InfoRow label="CNPJ" value={entry.cnpj} mono />
            <InfoRow label="IP" value={entry.ip} mono />
            <InfoRow label="Usuário" value={entry.user} />
            <InfoRow label="Senha" value={entry.password ? "••••••••" : ""} />
            <InfoRow label="Local do Backup" value={entry.backupPath} mono />
          </div>

          <div className="flex justify-end gap-2 pt-5">
            <button className="px-4 py-2.5 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:brightness-110 transition-all" onClick={onClose}>
              Fechar
            </button>
            <button className="px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:brightness-110 transition-all" onClick={onEdit}>
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailView;
