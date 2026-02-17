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
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`text-xs text-foreground ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
        {value && (
          <button onClick={() => copyToClipboard(value, label)} className="p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <Copy className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/70 backdrop-blur-sm p-4">
      <div className="bg-card rounded-lg w-full max-w-[380px] border border-border shadow-2xl overflow-hidden">
        <div className="win-title-bar px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
              <Server className="w-3 h-3 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">{entry.name}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4">
          <div className="rounded-md border border-border px-3">
            <InfoRow label="Nome" value={entry.name} />
            <InfoRow label="CNPJ" value={entry.cnpj} mono />
            <InfoRow label="IP" value={entry.ip} mono />
            <InfoRow label="Usuário" value={entry.user} />
            <InfoRow label="Senha" value={entry.password ? "••••••••" : ""} />
            <InfoRow label="Local do Backup" value={entry.backupPath} mono />
          </div>

          <div className="flex justify-end gap-1.5 pt-4">
            <button className="px-3 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:brightness-110 border border-border/50 transition-all" onClick={onClose}>
              Fechar
            </button>
            <button className="px-4 py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:brightness-110 transition-all" onClick={onEdit}>
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailView;
