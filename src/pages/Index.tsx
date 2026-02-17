import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { DatabaseEntry } from "@/types/database";
import RegisterForm from "@/components/RegisterForm";
import DetailView from "@/components/DetailView";
import GenerateBackup from "@/components/GenerateBackup";
import { Search, Plus, Pencil, Trash2, Database, Server, Copy, Play, FolderOpen, MoreVertical, Upload, Download, Minus, X } from "lucide-react";

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
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

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
    const entry = entries.find((e) => e.id === id);
    if (!window.confirm(`Deseja realmente excluir "${entry?.name || ""}"?`)) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setSelectedId(null);
    toast.success("Registro excluído!");
  };

  const handleDuplicate = (entry: DatabaseEntry) => {
    setEditEntry({ ...entry, id: "", name: entry.name + "_COPIA" });
    setShowRegister(true);
  };

  const selectedEntry = entries.find((e) => e.id === selectedId);

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
    toast.success(`${entries.length} banco(s) exportado(s)!`);
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
          toast.success(`${data.length} banco(s) importado(s) com sucesso!`);
        } else {
          toast.error("Arquivo inválido: formato inesperado.");
        }
      } catch {
        toast.error("Erro ao ler o arquivo. Verifique se é um JSON válido.");
      }
    };
    reader.readAsText(file);
    setShowMenu(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-[720px]">
        {/* Main window — desktop app feel */}
        <div className="glass-surface rounded-lg overflow-hidden glow-border">
          {/* Title bar */}
          <div className="win-title-bar px-4 sm:px-5 py-3 sm:py-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center">
                  <Server className="w-3.5 h-3.5 text-primary" />
                </div>
                <h1 className="text-sm font-semibold text-foreground leading-tight">Gerador de Backup</h1>
              </div>
              <div className="flex items-center gap-1">
                <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 bg-card rounded-md border border-border py-1 w-44 shadow-2xl">
                      <button
                        onClick={handleExport}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Exportar Bancos
                      </button>
                      <button
                        onClick={() => { fileInputRef.current?.click(); setShowMenu(false); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
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
                <button
                  className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Minimizar"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  className="p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  title="Fechar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="px-4 sm:px-5 py-2.5 flex items-center gap-2 border-b border-border/50 bg-muted/20">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                className="w-full bg-input rounded-md pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring/40 border border-border/50 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar banco de dados..."
              />
            </div>
            <button
              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-md text-xs font-medium hover:brightness-110 transition-all shrink-0"
              onClick={() => { setEditEntry(null); setShowRegister(true); }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Novo</span>
            </button>
          </div>

          {/* Data grid */}
          <div className="px-4 sm:px-5 pt-2.5">
            <div className="rounded-md border border-border overflow-hidden">
              {/* Grid header */}
              <div className="flex items-center px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-card border-b border-border">
                <span className="w-[90px] sm:w-[150px]">Nome</span>
                <span className="hidden sm:block w-[160px]">CNPJ</span>
                <span className="flex-1">IP</span>
                <span className="w-[76px] sm:w-[90px] text-right">Ações</span>
              </div>

              {/* Grid body */}
              <div className="max-h-[200px] sm:max-h-[280px] overflow-y-auto bg-background/50">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Database className="w-7 h-7 mb-2 opacity-30" />
                    <span className="text-xs">Nenhum registro encontrado</span>
                  </div>
                ) : (
                  filtered.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center px-3 py-2.5 text-xs cursor-pointer transition-colors border-b border-border/40 last:border-b-0 ${
                        selectedId === entry.id
                          ? "bg-primary/10 border-l-2 border-l-primary"
                          : "hover:bg-secondary/50"
                      }`}
                      onClick={() => setSelectedId(entry.id)}
                      onDoubleClick={() => setShowDetail(entry)}
                    >
                      <span className="w-[90px] sm:w-[150px] font-medium text-foreground truncate">{entry.name}</span>
                      <span className="hidden sm:block w-[160px] text-muted-foreground truncate font-mono text-[11px]">{entry.cnpj}</span>
                      <span className="flex-1 text-muted-foreground truncate font-mono text-[11px]">{entry.ip}</span>
                      <div className="w-[76px] sm:w-[90px] flex justify-end gap-0.5">
                        <button
                          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleDuplicate(entry); }}
                          title="Duplicar"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          onClick={(e) => { e.stopPropagation(); setEditEntry(entry); setShowRegister(true); }}
                          title="Editar"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                          title="Excluir"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Path + Generate */}
          <div className="px-4 sm:px-5 py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <FolderOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <label className="text-[10px] text-muted-foreground shrink-0 uppercase tracking-wide font-medium">Destino:</label>
              <input
                className="flex-1 min-w-0 bg-input rounded-md px-2.5 py-1.5 text-[11px] font-mono text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring/40 border border-border/50 transition-all"
                value={savePath}
                onChange={(e) => setSavePath(e.target.value)}
                placeholder="C:\Users\...\Desktop\BDS"
              />
              <button
                className="p-1.5 rounded-md bg-secondary hover:brightness-110 text-muted-foreground hover:text-foreground border border-border/50 transition-all shrink-0"
                title="Selecionar pasta"
                onClick={async () => {
                  try {
                    const dirHandle = await (window as any).showDirectoryPicker();
                    setSavePath(dirHandle.name);
                  } catch {}
                }}
              >
                <FolderOpen className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-30 shrink-0"
              disabled={!selectedEntry}
              onClick={() => { if (selectedEntry) setShowGenerate(selectedEntry); }}
            >
              <Play className="w-3 h-3" />
              Gerar Backup
            </button>
          </div>

          {/* Status bar */}
          <div className="px-4 sm:px-5 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-border bg-card/50">
            <span className="text-[10px] text-muted-foreground font-mono">
              {filtered.length} registro(s) · {entries.length} total
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-secondary text-secondary-foreground hover:brightness-110 border border-border/50 transition-all disabled:opacity-30"
                disabled={!selectedEntry}
                onClick={() => { if (selectedEntry) setShowDetail(selectedEntry); }}
              >
                Detalhes
              </button>
              <button className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-secondary text-secondary-foreground hover:brightness-110 border border-border/50 transition-all">
                Cancelar
              </button>
              <button className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-secondary text-secondary-foreground hover:brightness-110 border border-border/50 transition-all">
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
