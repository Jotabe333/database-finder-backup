import { useState, useEffect, useCallback } from "react";
import type { DatabaseEntry } from "@/types/database";
import RegisterForm from "@/components/RegisterForm";
import DetailView from "@/components/DetailView";
import GenerateBackup from "@/components/GenerateBackup";
import { Search, Plus, Pencil, Trash2, Database, Server, Copy, Play, FolderOpen, MoreVertical, Upload, Download } from "lucide-react";
import { useRef } from "react";

const STORAGE_KEY = "backup-generator-entries";
const SAVE_PATH_KEY = "backup-generator-save-path";

const loadEntries = (): DatabaseEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return [];
};

const Index = () => {
  const [entries, setEntries] = useState<DatabaseEntry[]>(loadEntries);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState<DatabaseEntry | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [editEntry, setEditEntry] = useState<DatabaseEntry | null>(null);
  const [showGenerate, setShowGenerate] = useState<DatabaseEntry | null>(null);
  const [savePath, setSavePath] = useState(() => localStorage.getItem(SAVE_PATH_KEY) || "C:\\Users\\%USERNAME%\\Desktop\\BDS");

  // Persist entries
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  // Persist save path
  useEffect(() => {
    localStorage.setItem(SAVE_PATH_KEY, savePath);
  }, [savePath]);

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
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bancos_backup.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          setEntries(data);
        }
      } catch {}
    };
    reader.readAsText(file);
    setShowMenu(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Server className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Gerador de Backup</h1>
                  <p className="text-xs text-muted-foreground">Gerenciamento de servidores</p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 glass-surface rounded-lg border border-border/50 py-1 w-48 shadow-lg">
                      <button
                        onClick={handleExport}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-secondary/40 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Exportar Bancos
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-secondary/40 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Importar Bancos
                      </button>
                    </div>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                />
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

          {/* Save path + Generate */}
          <div className="px-6 py-3 flex items-center gap-3 border-t border-border/30">
            <FolderOpen className="w-4 h-4 text-muted-foreground shrink-0" />
            <label className="text-xs text-muted-foreground shrink-0">Salvar em:</label>
            <input
              className="flex-1 bg-input rounded-lg px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              value={savePath}
              onChange={(e) => setSavePath(e.target.value)}
              placeholder="C:\Users\...\Desktop\BDS"
            />
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-40 shrink-0"
              disabled={!selectedEntry}
              onClick={() => { if (selectedEntry) setShowGenerate(selectedEntry); }}
            >
              <Play className="w-3.5 h-3.5" />
              Gerar Backup
            </button>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 flex items-center justify-between border-t border-border/30">
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
      {showGenerate && (
        <GenerateBackup
          entry={showGenerate}
          savePath={savePath}
          onClose={() => setShowGenerate(null)}
        />
      )}
    </div>
  );
};

export default Index;
