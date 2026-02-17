import { useState } from "react";
import type { DatabaseEntry } from "@/types/database";
import { X, Server, Key, Globe, User } from "lucide-react";

interface Props {
  onSave: (entry: DatabaseEntry) => void;
  onCancel: () => void;
  editEntry?: DatabaseEntry | null;
}

const RegisterForm = ({ onSave, onCancel, editEntry }: Props) => {
  const [name, setName] = useState(editEntry?.name ?? "");
  const [cnpj, setCnpj] = useState(editEntry?.cnpj ?? "");
  const [ip, setIp] = useState(editEntry?.ip ?? "");
  const [user, setUser] = useState(editEntry?.user ?? "");
  const [password, setPassword] = useState(editEntry?.password ?? "");

  const handleSave = () => {
    if (!name.trim() || !ip.trim()) return;
    onSave({
      id: editEntry?.id ?? crypto.randomUUID(),
      name: name.trim(),
      cnpj: cnpj.trim(),
      ip: ip.trim(),
      user: user.trim(),
      password: password.trim(),
    });
  };

  const fieldClass = "w-full bg-input rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/60 backdrop-blur-sm">
      <div className="glass-surface rounded-2xl w-[420px] glow-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Server className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">{editEntry ? "Editar Registro" : "Novo Registro"}</h2>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Informações do Banco</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
                <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: RUFINI" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">CNPJ</label>
                <input className={fieldClass} value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Conexão</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Globe className="w-3 h-3" /> IP</label>
                <input className={fieldClass} value={ip} onChange={(e) => setIp(e.target.value)} placeholder="10.1.0.144" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Usuário</label>
                <input className={fieldClass} value={user} onChange={(e) => setUser(e.target.value)} placeholder="admin" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Key className="w-3 h-3" /> Senha</label>
                <input className={fieldClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button className="px-4 py-2.5 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:brightness-110 transition-all" onClick={onCancel}>
              Cancelar
            </button>
            <button className="px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:brightness-110 transition-all" onClick={handleSave}>
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
