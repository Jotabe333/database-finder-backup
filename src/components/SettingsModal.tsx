import { useState } from "react";
import { X, Settings2 } from "lucide-react";
import { toast } from "sonner";

const KEYS = {
  firebirdLocal: "config-firebird-local",
  winrar: "config-winrar-path",
};

export const getConfigPaths = () => ({
  firebirdLocalPath: localStorage.getItem(KEYS.firebirdLocal) || "C:\\Program Files\\Firebird\\Firebird_5_0",
  winrarPath: localStorage.getItem(KEYS.winrar) || "C:\\Program Files\\WinRAR",
});

interface Props {
  onClose: () => void;
}

const SettingsModal = ({ onClose }: Props) => {
  const config = getConfigPaths();
  const [firebirdLocalPath, setFirebirdLocalPath] = useState(config.firebirdLocalPath);
  const [winrarPath, setWinrarPath] = useState(config.winrarPath);

  const handleSave = () => {
    localStorage.setItem(KEYS.firebirdLocal, firebirdLocalPath);
    localStorage.setItem(KEYS.winrar, winrarPath);
    toast.success("Configurações salvas!");
    onClose();
  };

  const fieldClass = "w-full bg-input rounded-md px-2.5 py-2 text-[11px] font-mono text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring/40 border border-border/50 transition-all";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/70 backdrop-blur-sm p-4">
      <div className="bg-card rounded-lg w-full max-w-[420px] border border-border shadow-2xl overflow-hidden">
        <div className="win-title-bar px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
              <Settings2 className="w-3 h-3 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Configurações</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Caminhos dos programas</p>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Caminho local do Firebird</label>
                <input className={fieldClass} value={firebirdLocalPath} onChange={(e) => setFirebirdLocalPath(e.target.value)} placeholder="C:\Program Files\Firebird\Firebird_5_0" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Caminho do WinRAR</label>
                <input className={fieldClass} value={winrarPath} onChange={(e) => setWinrarPath(e.target.value)} placeholder="C:\Program Files\WinRAR" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-1.5 pt-1">
            <button className="px-3 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:brightness-110 border border-border/50 transition-all" onClick={onClose}>
              Cancelar
            </button>
            <button className="px-4 py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:brightness-110 transition-all" onClick={handleSave}>
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
