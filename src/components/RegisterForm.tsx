import { useState } from "react";
import type { DatabaseEntry } from "@/types/database";

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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.3)" }}>
      <div className="win-window w-[380px]">
        <div className="win-titlebar">
          <div className="flex items-center gap-2">
            <span>💾</span>
            <span>{editEntry ? "Editar Registro" : "Novo Registro"}</span>
          </div>
          <button className="win-btn-close" onClick={onCancel}>✕</button>
        </div>

        <div className="p-4 space-y-3">
          <fieldset className="win-fieldset">
            <legend>Informações do Banco</legend>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="w-16 text-xs text-right">Nome:</label>
                <input className="win-input flex-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: RUFINI" />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-16 text-xs text-right">CNPJ:</label>
                <input className="win-input flex-1" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
              </div>
            </div>
          </fieldset>

          <fieldset className="win-fieldset">
            <legend>Conexão</legend>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="w-16 text-xs text-right">IP:</label>
                <input className="win-input flex-1" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="10.1.0.144" />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-16 text-xs text-right">Usuário:</label>
                <input className="win-input flex-1" value={user} onChange={(e) => setUser(e.target.value)} placeholder="admin" />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-16 text-xs text-right">Senha:</label>
                <input className="win-input flex-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
              </div>
            </div>
          </fieldset>

          <div className="flex justify-end gap-2 pt-2">
            <button className="win-btn" onClick={handleSave}>Salvar</button>
            <button className="win-btn" onClick={onCancel}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
