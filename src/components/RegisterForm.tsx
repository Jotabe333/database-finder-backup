import { useState } from "react";
import type { DatabaseEntry } from "@/types/database";
import { X, Server, Globe, User, Lock } from "lucide-react";

interface Props {
  onSave: (entry: DatabaseEntry) => void;
  onCancel: () => void;
  editEntry?: DatabaseEntry | null;
}

const RegisterForm = ({ onSave, onCancel, editEntry }: Props) => {
  const [name, setName] = useState(editEntry?.name ?? "");
  const [cnpj, setCnpj] = useState(editEntry?.cnpj ?? "");
  const [ip, setIp] = useState(editEntry?.ip ?? "");
  const [user, setUser] = useState(editEntry?.user ?? "SYSDBA");
  const [password, setPassword] = useState(editEntry?.password ?? "Bwd@UPiC!FR4");
  const [backupPath, setBackupPath] = useState(editEntry?.backupPath ?? "");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleSave = () => {
    const newErrors: Record<string, boolean> = {};
    if (!name.trim()) newErrors.name = true;
    if (!ip.trim()) newErrors.ip = true;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSave({
      id: editEntry?.id ?? crypto.randomUUID(),
      name: name.trim(),
      cnpj: cnpj.trim(),
      ip: ip.trim(),
      user: user.trim(),
      password: password.trim(),
      backupPath: backupPath.trim(),
    });
  };

  const fieldClass = (key?: string) =>
    `w-full bg-input rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring/40 border border-border/50 transition-all ${key && errors[key] ? "ring-1 ring-destructive/60 border-destructive/40" : ""}`;

  const isDuplicate = editEntry && !editEntry.id;
  const title = isDuplicate ? "Duplicar Registro" : editEntry?.id ? "Editar Registro" : "Novo Registro";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/70 backdrop-blur-sm p-4">
      <div className="bg-card rounded-lg w-full max-w-[400px] border border-border shadow-2xl overflow-hidden">
        <div className="win-title-bar px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
              <Server className="w-3 h-3 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          </div>
          <button onClick={onCancel} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Informações do Banco */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Informações do Banco</p>
            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Nome <span className="text-destructive">*</span></label>
                <input className={fieldClass("name")} value={name} onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: false })); }} placeholder="Ex: RIO_NILO" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">CNPJ <span className="text-muted-foreground/50">(opcional)</span></label>
                <input className={fieldClass()} value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
              </div>
            </div>
          </div>

          {/* Conexão */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Conexão</p>
            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1"><Globe className="w-3 h-3" /> IP <span className="text-destructive">*</span></label>
                <input className={fieldClass("ip")} value={ip} onChange={(e) => { setIp(e.target.value); setErrors((p) => ({ ...p, ip: false })); }} placeholder="10.1.0.144" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Usuário</label>
                <input className={fieldClass()} value={user} onChange={(e) => setUser(e.target.value)} placeholder="SYSDBA" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1"><Lock className="w-3 h-3" /> Senha</label>
                <input className={fieldClass()} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>
          </div>


          {/* Actions */}
          <div className="flex justify-end gap-1.5 pt-1">
            <button className="px-3 py-2 rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:brightness-110 border border-border/50 transition-all" onClick={onCancel}>
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

export default RegisterForm;
