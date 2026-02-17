import { useState } from "react";
import type { DatabaseEntry } from "@/types/database";
import RegisterForm from "@/components/RegisterForm";
import DetailView from "@/components/DetailView";
import { Search, Plus, Pencil, Trash2, Database, Server, Copy } from "lucide-react";

const INITIAL_DATA: DatabaseEntry[] = [
  { id: "1", name: "RUFINI", cnpj: "12.345.678/0001-90", ip: "10.1.0.144", user: "sa", password: "backup123", backupPath: "D:\\Backups\\RUFINI" },
  { id: "2", name: "COMERCIAL_SP", cnpj: "98.765.432/0001-10", ip: "10.1.0.200", user: "admin", password: "srv2024", backupPath: "E:\\Backups\\COMERCIAL" },
  { id: "3", name: "INDUSTRIA_RJ", cnpj: "11.222.333/0001-44", ip: "192.168.1.50", user: "dba", password: "ind@2024", backupPath: "C:\\SQL_Backups" },
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

  const handleDuplicate = (entry: DatabaseEntry) => {
    setEditEntry({ ...entry, id: "", name: entry.name + "_COPIA" });
    setShowRegister(true);
  };

  const selectedEntry = entries.find((e) => e.id === selectedId);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(hsl(var(--primary)) 1px, transparent 1px)`,
        backgroundSize: "30px 30px",
      }} />

      <div className="relative w-full max-w-[600px]">
        {/* Main window */}
        <div className="glass-surface rounded-2xl overflow-hidden glow-border">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Server className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Gerador de Backup</h1>
                <p className="text-xs text-muted-foreground">Gerenciamento de servidores</p>
              </div>
            </div>
          </div>

          {/* Search + Actions */}
          <div className="px-6 py-4 flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="w-full bg-input rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar banco de dados..."
              />
            </div>
            <button
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:brightness-110 transition-all"
              onClick={() => { setEditEntry(null); setShowRegister(true); }}
            >
              <Plus className="w-4 h-4" />
              Novo
            </button>
          </div>

          {/* Table */}
          <div className="px-6">
            <div className="rounded-xl border border-border/50 overflow-hidden">
              {/* Table header */}
              <div className="flex items-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
                <span className="w-[160px]">Nome</span>
                <span className="w-[170px]">CNPJ</span>
                <span className="flex-1">IP</span>
                <span className="w-[100px] text-right">Ações</span>
              </div>

              {/* Table body */}
              <div className="max-h-[260px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Database className="w-8 h-8 mb-2 opacity-40" />
                    <span className="text-sm">Nenhum registro encontrado</span>
                  </div>
                ) : (
                  filtered.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center px-4 py-3 text-sm cursor-pointer transition-colors border-t border-border/30 ${
                        selectedId === entry.id
                          ? "bg-primary/10 border-l-2 border-l-primary"
                          : "hover:bg-secondary/40"
                      }`}
                      onClick={() => setSelectedId(entry.id)}
                      onDoubleClick={() => setShowDetail(entry)}
                    >
                      <span className="w-[160px] font-medium text-foreground truncate">{entry.name}</span>
                      <span className="w-[170px] text-muted-foreground truncate text-xs font-mono">{entry.cnpj}</span>
                      <span className="flex-1 text-muted-foreground truncate text-xs font-mono">{entry.ip}</span>
                      <div className="w-[100px] flex justify-end gap-1">
                        <button
                          className="p-1.5 rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleDuplicate(entry); }}
                          title="Duplicar"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={(e) => { e.stopPropagation(); setEditEntry(entry); setShowRegister(true); }}
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {filtered.length} registro(s)
            </span>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:brightness-110 transition-all disabled:opacity-40"
                disabled={!selectedEntry}
                onClick={() => { if (selectedEntry) setShowDetail(selectedEntry); }}
              >
                Detalhes
              </button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:brightness-110 transition-all">
                Cancelar
              </button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:brightness-110 transition-all">
                Fechar
              </button>
            </div>
          </div>
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
          onEdit={() => { setEditEntry(showDetail); setShowDetail(null); setShowRegister(true); }}
        />
      )}
    </div>
  );
};

export default Index;
