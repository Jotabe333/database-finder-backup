import type { DatabaseEntry } from "@/types/database";

interface Props {
  entry: DatabaseEntry;
  onClose: () => void;
  onEdit: () => void;
}

const DetailView = ({ entry, onClose, onEdit }: Props) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.3)" }}>
      <div className="win-window w-[360px]">
        <div className="win-titlebar">
          <div className="flex items-center gap-2">
            <span>🗄️</span>
            <span>Detalhes - {entry.name}</span>
          </div>
          <button className="win-btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="p-4">
          <fieldset className="win-fieldset">
            <legend>Informações</legend>
            <div className="space-y-2 text-xs">
              <div className="flex">
                <span className="w-20 font-bold">Nome:</span>
                <span>{entry.name}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-bold">CNPJ:</span>
                <span>{entry.cnpj || "—"}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-bold">IP:</span>
                <span>{entry.ip}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-bold">Usuário:</span>
                <span>{entry.user || "—"}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-bold">Senha:</span>
                <span>{entry.password ? "••••••••" : "—"}</span>
              </div>
            </div>
          </fieldset>

          <div className="flex justify-end gap-2 pt-3">
            <button className="win-btn" onClick={onEdit}>✏️ Editar</button>
            <button className="win-btn" onClick={onClose}>Fechar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailView;
