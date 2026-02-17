import { useState } from "react";
import type { DatabaseEntry } from "@/types/database";
import RegisterForm from "@/components/RegisterForm";
import DetailView from "@/components/DetailView";

const INITIAL_DATA: DatabaseEntry[] = [
  { id: "1", name: "RUFINI", cnpj: "12.345.678/0001-90", ip: "10.1.0.144", user: "sa", password: "backup123" },
  { id: "2", name: "COMERCIAL_SP", cnpj: "98.765.432/0001-10", ip: "10.1.0.200", user: "admin", password: "srv2024" },
  { id: "3", name: "INDUSTRIA_RJ", cnpj: "11.222.333/0001-44", ip: "192.168.1.50", user: "dba", password: "ind@2024" },
];

const Index = () => {
  const [entries, setEntries] = useState<DatabaseEntry[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState<DatabaseEntry | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [editEntry, setEditEntry] = useState<DatabaseEntry | null>(null);

  const filtered = entries.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (entry: DatabaseEntry) => {
    setEntries((prev) => {
      const exists = prev.find((e) => e.id === entry.id);
      if (exists) return prev.map((e) => (e.id === entry.id ? entry : e));
      return [...prev, entry];
    });
    setShowRegister(false);
    setEditEntry(null);
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setSelectedId(null);
  };

  const selectedEntry = entries.find((e) => e.id === selectedId);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="win-window w-[520px]">
        {/* Title bar */}
        <div className="win-titlebar">
          <div className="flex items-center gap-2">
            <span>🖥️</span>
            <span>Gerador de Backup - Servidor v1.0</span>
          </div>
          <div className="flex gap-1">
            <button className="win-btn-close text-[10px]">—</button>
            <button className="win-btn-close text-[10px]">□</button>
            <button className="win-btn-close">✕</button>
          </div>
        </div>

        {/* Menu bar */}
        <div className="flex gap-0 border-b border-border px-1 py-[2px]" style={{ background: "hsl(var(--card))" }}>
          <span className="px-2 py-[1px] text-xs cursor-pointer hover:bg-[hsl(var(--win-highlight))] hover:text-[hsl(var(--win-highlight-text))]">Arquivo</span>
          <span className="px-2 py-[1px] text-xs cursor-pointer hover:bg-[hsl(var(--win-highlight))] hover:text-[hsl(var(--win-highlight-text))]">Editar</span>
          <span className="px-2 py-[1px] text-xs cursor-pointer hover:bg-[hsl(var(--win-highlight))] hover:text-[hsl(var(--win-highlight-text))]">Ajuda</span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border" style={{ background: "hsl(var(--card))" }}>
          <button className="win-btn text-xs" onClick={() => { setEditEntry(null); setShowRegister(true); }}>
            ➕ Novo
          </button>
          <button
            className="win-btn text-xs"
            disabled={!selectedEntry}
            onClick={() => { if (selectedEntry) { setEditEntry(selectedEntry); setShowRegister(true); } }}
          >
            ✏️ Editar
          </button>
          <button
            className="win-btn text-xs"
            disabled={!selectedEntry}
            onClick={() => { if (selectedId) handleDelete(selectedId); }}
          >
            🗑️ Excluir
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2" style={{ background: "hsl(var(--card))" }}>
          <label className="text-xs">🔍 Pesquisar:</label>
          <input
            className="win-input flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Digite o nome do banco de dados..."
          />
        </div>

        {/* List */}
        <div className="px-3 pb-2" style={{ background: "hsl(var(--card))" }}>
          <div className="win-list h-[200px]">
            {/* Header */}
            <div className="flex border-b-2 border-border px-1 py-1 text-[11px] font-bold" style={{ background: "hsl(var(--win-button-face))" }}>
              <span className="w-[140px]">Nome</span>
              <span className="w-[150px]">CNPJ</span>
              <span className="flex-1">IP</span>
            </div>
            {/* Items */}
            {filtered.length === 0 ? (
              <div className="p-3 text-xs text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
                Nenhum registro encontrado.
              </div>
            ) : (
              filtered.map((entry) => (
                <div
                  key={entry.id}
                  className={`win-list-item flex ${selectedId === entry.id ? "selected" : ""}`}
                  onClick={() => setSelectedId(entry.id)}
                  onDoubleClick={() => setShowDetail(entry)}
                >
                  <span className="w-[140px] truncate">{entry.name}</span>
                  <span className="w-[150px] truncate">{entry.cnpj}</span>
                  <span className="flex-1 truncate">{entry.ip}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="flex justify-between items-center px-3 py-2 border-t border-border" style={{ background: "hsl(var(--card))" }}>
          <span className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>
            {filtered.length} registro(s)
          </span>
          <div className="flex gap-2">
            <button
              className="win-btn"
              disabled={!selectedEntry}
              onClick={() => { if (selectedEntry) setShowDetail(selectedEntry); }}
            >
              Detalhes
            </button>
            <button className="win-btn">Cancelar</button>
            <button className="win-btn">Fechar</button>
          </div>
        </div>

        {/* Status bar */}
        <div className="win-status-bar">
          Pronto
        </div>
      </div>

      {/* Modals */}
      {showRegister && (
        <RegisterForm
          editEntry={editEntry}
          onSave={handleSave}
          onCancel={() => { setShowRegister(false); setEditEntry(null); }}
        />
      )}

      {showDetail && (
        <DetailView
          entry={showDetail}
          onClose={() => setShowDetail(null)}
          onEdit={() => {
            setEditEntry(showDetail);
            setShowDetail(null);
            setShowRegister(true);
          }}
        />
      )}
    </div>
  );
};

export default Index;
