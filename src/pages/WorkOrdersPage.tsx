import { useState, useMemo } from "react";
import {
  ClipboardList,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Pencil,
  Trash2,
  Link,
  Search,
  X,
} from "lucide-react";
import {
  infrastructureList,
  type WorkOrder,
  type WorkOrderStatus,
  type WorkOrderPriority,
  getStoredWorkOrders,
  saveStoredWorkOrders,
} from "@/data/mockData";
import WorkOrderDialog from "@/components/WorkOrderDialog";

// ─── Badge helpers ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<WorkOrderStatus, string> = {
  Open: "border-risk-medium/40 bg-risk-medium/10 text-risk-medium",
  Assigned: "border-primary/35 bg-primary/10 text-primary",
  "In Progress": "border-[hsl(220_70%_50%)]/35 bg-[hsl(220_70%_50%)]/10 text-[hsl(220_70%_50%)]",
  Completed: "border-risk-low/40 bg-risk-low/10 text-risk-low",
  Cancelled: "border-muted-foreground/40 bg-muted/20 text-muted-foreground",
};

const PRIORITY_STYLES: Record<WorkOrderPriority, string> = {
  Critical: "border-risk-high/40 bg-risk-high/10 text-risk-high",
  High: "border-risk-medium/40 bg-risk-medium/10 text-risk-medium",
  Medium: "border-[hsl(48_80%_45%)]/40 bg-[hsl(48_80%_45%)]/10 text-[hsl(48_80%_45%)]",
  Low: "border-risk-low/40 bg-risk-low/10 text-risk-low",
};

const TYPE_ICONS: Record<string, string> = {
  Inspection: "🔍",
  "Preventive Maintenance": "🔧",
  "Emergency Repair": "⚡",
};

const Badge = ({ label, className }: { label: string; className: string }) => (
  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap ${className}`}>
    {label}
  </span>
);

// ─── Sort helpers ──────────────────────────────────────────────────────────────

type SortCol = "id" | "priority" | "status" | "dueDate" | "estimatedCost";
type SortDir = "asc" | "desc";

const PRIORITY_ORDER: Record<WorkOrderPriority, number> = {
  Critical: 0, High: 1, Medium: 2, Low: 3,
};
const STATUS_ORDER: Record<WorkOrderStatus, number> = {
  Open: 0, Assigned: 1, "In Progress": 2, Completed: 3, Cancelled: 4,
};

function sortOrders(list: WorkOrder[], col: SortCol, dir: SortDir): WorkOrder[] {
  return [...list].sort((a, b) => {
    let cmp = 0;
    switch (col) {
      case "id":
        cmp = a.id.localeCompare(b.id);
        break;
      case "priority":
        cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        break;
      case "status":
        cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        break;
      case "dueDate":
        cmp = a.dueDate.localeCompare(b.dueDate);
        break;
      case "estimatedCost":
        cmp = a.estimatedCost - b.estimatedCost;
        break;
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

// ─── Quick-filter definition ───────────────────────────────────────────────────

type QuickFilter = "all" | "open" | "high-priority" | "overdue" | "completed";

const TODAY = new Date().toISOString().split("T")[0];

function applyQuickFilter(list: WorkOrder[], qf: QuickFilter): WorkOrder[] {
  switch (qf) {
    case "open":
      return list.filter((w) => w.status === "Open");
    case "high-priority":
      return list.filter((w) => w.priority === "Critical" || w.priority === "High");
    case "overdue":
      return list.filter((w) => w.dueDate < TODAY && w.status !== "Completed");
    case "completed":
      return list.filter((w) => w.status === "Completed");
    default:
      return list;
  }
}

// ─── Sort icon ─────────────────────────────────────────────────────────────────

const SortIcon = ({ col, active, dir }: { col: string; active: string; dir: SortDir }) => {
  if (col !== active) return <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />;
  return dir === "asc"
    ? <ChevronUp className="h-3 w-3 text-primary" />
    : <ChevronDown className="h-3 w-3 text-primary" />;
};

const ThBtn = ({
  col, label, active, dir, onSort,
}: {
  col: SortCol; label: string; active: SortCol; dir: SortDir;
  onSort: (c: SortCol) => void;
}) => (
  <button
    onClick={() => onSort(col)}
    className="flex items-center gap-1 whitespace-nowrap hover:text-foreground transition-colors"
  >
    {label}
    <SortIcon col={col} active={active} dir={dir} />
  </button>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const WorkOrdersPage = () => {
  const [orders, setOrders] = useState<WorkOrder[]>(() => getStoredWorkOrders());
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortCol, setSortCol] = useState<SortCol>("priority");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<WorkOrder | null>(null);

  // ── Derived counts for metric cards ────────────────────────────────────────
  const openCount = orders.filter((w) => w.status === "Open").length;
  const highPriorityCount = orders.filter(
    (w) => (w.priority === "Critical" || w.priority === "High") && w.status !== "Completed",
  ).length;
  const overdueCount = orders.filter(
    (w) => w.dueDate < TODAY && w.status !== "Completed",
  ).length;
  const completedCount = orders.filter((w) => w.status === "Completed").length;

  // ── Visible rows ────────────────────────────────────────────────────────────
  const visible = useMemo(() => {
    let result = applyQuickFilter(orders, quickFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((w) => {
        const assetName = infrastructureList.find((i) => i.id === w.infrastructureId)?.name.toLowerCase() ?? "";
        return (
          w.id.toLowerCase().includes(q) ||
          w.title.toLowerCase().includes(q) ||
          w.assignedTeam.toLowerCase().includes(q) ||
          assetName.includes(q)
        );
      });
    }
    return sortOrders(result, sortCol, sortDir);
  }, [orders, quickFilter, searchQuery, sortCol, sortDir]);

  // ── Sort handler ────────────────────────────────────────────────────────────
  const handleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  // ── CRUD handlers ────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditOrder(null);
    setDialogOpen(true);
  };
  const openEdit = (wo: WorkOrder) => {
    setEditOrder(wo);
    setDialogOpen(true);
  };
  const handleSave = (wo: WorkOrder) => {
    const updated = editOrder ? orders.map((o) => (o.id === wo.id ? wo : o)) : [wo, ...orders];
    setOrders(updated);
    saveStoredWorkOrders(updated);
    setDialogOpen(false);
    setEditOrder(null);
  };
  const handleDelete = (id: string) => {
    const updated = orders.filter((o) => o.id !== id);
    setOrders(updated);
    saveStoredWorkOrders(updated);
  };

  // ── Quick-filter pills ──────────────────────────────────────────────────────
  const qfOptions: { value: QuickFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: orders.length },
    { value: "open", label: "Open", count: openCount },
    { value: "high-priority", label: "High Priority", count: highPriorityCount },
    { value: "overdue", label: "Overdue", count: overdueCount },
    { value: "completed", label: "Completed", count: completedCount },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="dashboard-card flex flex-wrap items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-foreground">Work Orders</h1>
          <p className="text-xs text-muted-foreground">
            {orders.length} total work orders — inspections, maintenance &amp; emergency repairs
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">
            {visible.length} / {orders.length} shown
          </span>
          <button
            id="btn-create-workorder"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary/20 hover:border-primary/50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Work Order
          </button>
        </div>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          label="Open"
          value={openCount}
          icon={<Clock className="h-4 w-4 text-risk-medium" />}
          borderClass="border-risk-medium/20 bg-risk-medium/5"
          labelClass="text-risk-medium"
          valueClass="text-risk-medium"
        />
        <MetricCard
          label="High Priority"
          value={highPriorityCount}
          icon={<AlertTriangle className="h-4 w-4 text-risk-high" />}
          borderClass="border-risk-high/20 bg-risk-high/5"
          labelClass="text-risk-high"
          valueClass="text-risk-high"
        />
        <MetricCard
          label="Overdue"
          value={overdueCount}
          icon={<AlertTriangle className="h-4 w-4 text-risk-high" />}
          borderClass="border-risk-high/15 bg-risk-high/5"
          labelClass="text-risk-high"
          valueClass="text-risk-high"
        />
        <MetricCard
          label="Completed"
          value={completedCount}
          icon={<CheckCircle2 className="h-4 w-4 text-risk-low" />}
          borderClass="border-risk-low/20 bg-risk-low/5"
          labelClass="text-risk-low"
          valueClass="text-risk-low"
        />
      </div>

      {/* ── Quick-filter pills + Table ────────────────────────────────────── */}
      <div className="dashboard-card space-y-4 p-0 overflow-hidden">
        {/* Filter strip */}
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            {qfOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setQuickFilter(opt.value)}
                className={`rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none ${
                  quickFilter === opt.value
                    ? "border-primary/30 bg-primary/12 text-primary font-semibold"
                    : "border-border text-muted-foreground hover:bg-secondary/60"
                }`}
              >
                {opt.label}
                <span className="ml-1.5 font-mono text-[10px] opacity-70">({opt.count})</span>
              </button>
            ))}
          </div>

          {/* Live Search input */}
          <div className="relative min-w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search WO ID, Title, Team, Asset…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8.5 w-full rounded-full border border-border bg-background/80 py-1.5 pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No work orders match this filter</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Try a different filter or create a new work order
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {[
                    { col: "id" as SortCol, label: "ID" },
                  ].map(({ col, label }) => (
                    <th key={col} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <ThBtn col={col} label={label} active={sortCol} dir={sortDir} onSort={handleSort} />
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Title / Asset
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <ThBtn col="priority" label="Priority" active={sortCol} dir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <ThBtn col="status" label="Status" active={sortCol} dir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Team
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <ThBtn col="dueDate" label="Due Date" active={sortCol} dir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <ThBtn col="estimatedCost" label="Est. Cost" active={sortCol} dir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((wo) => {
                  const asset = infrastructureList.find((i) => i.id === wo.infrastructureId);
                  const isOverdue = wo.dueDate < TODAY && wo.status !== "Completed";
                  return (
                    <tr
                      key={wo.id}
                      className="group transition-colors hover:bg-muted/30"
                    >
                      {/* ID */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-muted-foreground">{wo.id}</span>
                          {wo.alertId && (
                            <span title={`Linked to Alert #${wo.alertId}`}>
                              <Link className="h-3 w-3 text-risk-high" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Title / Asset */}
                      <td className="max-w-[220px] px-4 py-3.5 align-top">
                        <p className="font-semibold text-foreground leading-snug line-clamp-2">{wo.title}</p>
                        {asset && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                            📍 {asset.name}
                          </p>
                        )}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3.5 align-top whitespace-nowrap">
                        <span className="text-xs text-muted-foreground">
                          {TYPE_ICONS[wo.type]} {wo.type}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3.5 align-top">
                        <Badge label={wo.priority} className={PRIORITY_STYLES[wo.priority]} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 align-top">
                        <Badge label={wo.status} className={STATUS_STYLES[wo.status]} />
                      </td>

                      {/* Team */}
                      <td className="max-w-[160px] px-4 py-3.5 align-top">
                        <span className="text-xs text-muted-foreground leading-snug">{wo.assignedTeam}</span>
                      </td>

                      {/* Due Date */}
                      <td className="px-4 py-3.5 align-top whitespace-nowrap">
                        <span className={`font-mono text-[11px] ${isOverdue ? "text-risk-high font-semibold" : "text-muted-foreground"}`}>
                          {wo.dueDate}
                        </span>
                        {isOverdue && (
                          <p className="text-[10px] text-risk-high font-medium">Overdue</p>
                        )}
                      </td>

                      {/* Est. Cost */}
                      <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                        <span className="font-mono text-xs text-foreground">₹{wo.estimatedCost.toFixed(1)}L</span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(wo)}
                            title="Edit"
                            className="rounded-lg border border-border p-1.5 text-muted-foreground transition-all hover:border-primary/30 hover:text-primary"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(wo.id)}
                            title="Delete"
                            className="rounded-lg border border-border p-1.5 text-muted-foreground transition-all hover:border-risk-high/30 hover:text-risk-high"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table footer — cost summary */}
        {visible.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3 bg-muted/20">
            <span className="text-[11px] text-muted-foreground">{visible.length} work order{visible.length !== 1 ? "s" : ""} shown</span>
            <span className="font-mono text-xs text-muted-foreground">
              Est. total:{" "}
              <span className="font-semibold text-foreground">
                ₹{visible.reduce((sum, w) => sum + w.estimatedCost, 0).toFixed(1)}L
              </span>
            </span>
          </div>
        )}
      </div>

      {/* ── Dialog ───────────────────────────────────────────────────────── */}
      <WorkOrderDialog
        open={dialogOpen}
        workOrder={editOrder}
        onClose={() => { setDialogOpen(false); setEditOrder(null); }}
        onSave={handleSave}
      />
    </main>
  );
};

// ─── Metric Card ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  borderClass: string;
  labelClass: string;
  valueClass: string;
}

const MetricCard = ({ label, value, icon, borderClass, labelClass, valueClass }: MetricCardProps) => (
  <div className={`dashboard-card flex items-center gap-3 py-3 px-4 ${borderClass}`}>
    <div className="shrink-0">{icon}</div>
    <div>
      <p className={`text-[10px] uppercase tracking-wider font-semibold ${labelClass}`}>{label}</p>
      <p className={`text-2xl font-mono font-bold mt-0.5 ${valueClass}`}>{value}</p>
    </div>
  </div>
);

export default WorkOrdersPage;
