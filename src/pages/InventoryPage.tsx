import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  infrastructureList,
  type InfrastructureItem,
  getStoredAssets,
  saveStoredAssets,
} from "@/data/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InfrastructureTable from "@/components/InfrastructureTable";
import AssetFormSheet from "@/components/inventory/AssetFormSheet";

// ─── Sort helper ──────────────────────────────────────────────────────────────

type SortDir = "asc" | "desc";

function sortAssets(
  list: InfrastructureItem[],
  col: string,
  dir: SortDir,
): InfrastructureItem[] {
  return [...list].sort((a, b) => {
    let valA: number | string;
    let valB: number | string;

    switch (col) {
      case "name":
        valA = a.name;
        valB = b.name;
        break;
      case "type":
        valA = a.type;
        valB = b.type;
        break;
      case "age":
        valA = parseInt(a.age, 10) || 0;
        valB = parseInt(b.age, 10) || 0;
        break;
      case "status": {
        const order: Record<string, number> = {
          Critical: 0,
          Warning: 1,
          Stable: 2,
        };
        valA = order[a.status] ?? 3;
        valB = order[b.status] ?? 3;
        break;
      }
      default: // riskScore
        valA = a.riskScore;
        valB = b.riskScore;
    }

    if (typeof valA === "string") {
      const cmp = valA.localeCompare(valB as string);
      return dir === "asc" ? cmp : -cmp;
    }
    return dir === "asc"
      ? (valA as number) - (valB as number)
      : (valB as number) - (valA as number);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

const InventoryPage = () => {
  const navigate = useNavigate();

  // ── Local data state (seeded from mock, supports add / edit) ─────────────
  const [assets, setAssets] = useState<InfrastructureItem[]>(() => getStoredAssets());

  // ── Filter state ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  // ── Sort state ────────────────────────────────────────────────────────────
  const [sortColumn, setSortColumn] = useState("riskScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // ── Sheet state ───────────────────────────────────────────────────────────
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<InfrastructureItem | null>(null);

  // ── Derived: filtered + sorted list ──────────────────────────────────────
  const filteredSorted = useMemo(() => {
    let list = assets;

    // Text search across name, id, and location
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q),
      );
    }

    if (typeFilter !== "all") list = list.filter((i) => i.type === typeFilter);
    if (statusFilter !== "all")
      list = list.filter((i) => i.status === statusFilter);

    if (riskFilter === "high") list = list.filter((i) => i.riskScore >= 75);
    else if (riskFilter === "medium")
      list = list.filter((i) => i.riskScore >= 50 && i.riskScore < 75);
    else if (riskFilter === "low") list = list.filter((i) => i.riskScore < 50);

    return sortAssets(list, sortColumn, sortDir);
  }, [assets, search, typeFilter, statusFilter, riskFilter, sortColumn, sortDir]);

  // ── Risk-level breakdown of the current visible set ───────────────────────
  const criticalCount = filteredSorted.filter((i) => i.riskScore >= 75).length;
  const warningCount = filteredSorted.filter(
    (i) => i.riskScore >= 50 && i.riskScore < 75,
  ).length;
  const stableCount = filteredSorted.filter((i) => i.riskScore < 50).length;

  const hasActiveFilters =
    search !== "" ||
    typeFilter !== "all" ||
    statusFilter !== "all" ||
    riskFilter !== "all";

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDir("desc");
    }
  };

  const handleView = (item: InfrastructureItem) =>
    navigate(`/inventory/${item.id}`, { state: { asset: item, from: "/inventory", fromLabel: "Inventory" } });

  const handleEdit = (item: InfrastructureItem) => {
    setEditAsset(item);
    setSheetOpen(true);
  };

  const handleAddNew = () => {
    setEditAsset(null);
    setSheetOpen(true);
  };

  const handleSheetClose = () => {
    setSheetOpen(false);
    setEditAsset(null);
  };

  const handleSave = (item: InfrastructureItem) => {
    let updated: InfrastructureItem[];
    if (editAsset) {
      // Update existing
      updated = assets.map((a) => (a.id === item.id ? item : a));
    } else {
      // Append new
      updated = [...assets, item];
    }
    setAssets(updated);
    saveStoredAssets(updated);
    handleSheetClose();
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setRiskFilter("all");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="dashboard-card flex flex-wrap items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Package className="h-5 w-5 text-primary" />
        </div>

        <div className="min-w-0">
          <h1 className="text-sm font-bold text-foreground">
            Asset Inventory Register
          </h1>
          <p className="text-xs text-muted-foreground">
            {assets.length} assets in registry &mdash; bridges, tunnels, dams &amp; buildings
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">
            {filteredSorted.length} / {assets.length} shown
          </span>
          <button
            id="btn-add-asset"
            onClick={handleAddNew}
            className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary/20 hover:border-primary/50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Asset
          </button>
        </div>
      </div>

      {/* ── Search + Filters ─────────────────────────────────────────────── */}
      <div className="dashboard-card space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Filters:
          </span>

          {/* Search input */}
          <div className="relative min-w-48 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="inventory-search"
              type="text"
              placeholder="Search name, ID, or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-full border border-border bg-background/80 py-2 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Type filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger
              id="filter-type"
              className="h-9 w-36 rounded-full text-xs"
            >
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Bridge">🌉 Bridge</SelectItem>
              <SelectItem value="Tunnel">🚇 Tunnel</SelectItem>
              <SelectItem value="Dam">🏗 Dam</SelectItem>
              <SelectItem value="Building">🏢 Building</SelectItem>
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              id="filter-status"
              className="h-9 w-36 rounded-full text-xs"
            >
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="Warning">Warning</SelectItem>
              <SelectItem value="Stable">Stable</SelectItem>
            </SelectContent>
          </Select>

          {/* Risk level filter */}
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger
              id="filter-risk"
              className="h-9 w-40 rounded-full text-xs"
            >
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="high">High (≥ 75)</SelectItem>
              <SelectItem value="medium">Medium (50 – 74)</SelectItem>
              <SelectItem value="low">Low (&lt; 50)</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs text-muted-foreground transition-all hover:border-risk-high/30 hover:text-risk-high"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          )}
        </div>

        {/* Results summary cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="dashboard-card py-3 px-4 flex flex-col justify-center border-border/50 bg-background/50">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Assets</span>
            <span className="text-2xl font-mono font-bold text-foreground mt-1">{filteredSorted.length}</span>
          </div>
          <div className="dashboard-card py-3 px-4 flex flex-col justify-center border-risk-high/20 bg-risk-high/5">
            <span className="text-[10px] uppercase tracking-wider text-risk-high font-semibold">Critical</span>
            <span className="text-2xl font-mono font-bold text-risk-high mt-1">{criticalCount}</span>
          </div>
          <div className="dashboard-card py-3 px-4 flex flex-col justify-center border-risk-medium/20 bg-risk-medium/5">
            <span className="text-[10px] uppercase tracking-wider text-risk-medium font-semibold">Warning</span>
            <span className="text-2xl font-mono font-bold text-risk-medium mt-1">{warningCount}</span>
          </div>
          <div className="dashboard-card py-3 px-4 flex flex-col justify-center border-risk-low/20 bg-risk-low/5">
            <span className="text-[10px] uppercase tracking-wider text-risk-low font-semibold">Stable</span>
            <span className="text-2xl font-mono font-bold text-risk-low mt-1">{stableCount}</span>
          </div>
        </div>
      </div>

      {/* ── Asset table ───────────────────────────────────────────────────── */}
      <InfrastructureTable
        items={filteredSorted}
        onView={handleView}
        onEdit={handleEdit}
        showActions
        isCollapsible={false}
        sortColumn={sortColumn}
        sortDir={sortDir}
        onSort={handleSort}
        onClearFilters={clearFilters}
      />

      {/* ── Add / Edit sheet ──────────────────────────────────────────────── */}
      <AssetFormSheet
        open={sheetOpen}
        asset={editAsset}
        onClose={handleSheetClose}
        onSave={handleSave}
      />
    </main>
  );
};

export default InventoryPage;
