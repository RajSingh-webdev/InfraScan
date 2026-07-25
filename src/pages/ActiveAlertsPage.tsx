import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, AlertCircle, ArrowRight, Filter, Clock, ClipboardList } from "lucide-react";
import {
  deriveAlerts,
  getStoredAssets,
  infrastructureList,
  type WorkOrder,
  type WorkOrderPriority,
  type WorkOrderType,
  getStoredWorkOrders,
  saveStoredWorkOrders,
} from "@/data/mockData";
import WorkOrderDialog from "@/components/WorkOrderDialog";

type FilterLevel = "all" | "Critical" | "Warning";
type StatusFilter = "active" | "resolved";

const AlertIcon = ({ level }: { level: "Critical" | "Warning" }) =>
  level === "Critical" ? (
    <AlertTriangle className="h-5 w-5 text-risk-high shrink-0" />
  ) : (
    <AlertCircle className="h-5 w-5 text-risk-medium shrink-0" />
  );

const getRandomTimeAgo = (seed: number): string => {
  const options = [
    "2 min ago", "5 min ago", "12 min ago", "25 min ago", "45 min ago",
    "1 hour ago", "2 hours ago", "4 hours ago", "8 hours ago", "1 day ago",
  ];
  return options[seed % options.length];
};

const ActiveAlertsPage = () => {
  const navigate = useNavigate();
  const [levelFilter, setLevelFilter] = useState<FilterLevel>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => getStoredWorkOrders());
  const [woDialogOpen, setWoDialogOpen] = useState(false);
  const [woPrefill, setWoPrefill] = useState<{
    infrastructureId: string;
    alertId: number;
    title: string;
    description: string;
    priority: WorkOrderPriority;
    type: WorkOrderType;
  } | undefined>(undefined);

  const alerts = useMemo(() => deriveAlerts(getStoredAssets()), [workOrders]);

  const filteredAlerts = useMemo(() => {
    let list = alerts;
    if (levelFilter !== "all") {
      list = list.filter(a => a.level === levelFilter);
    }
    // All current alerts are "active" in mock data
    return list;
  }, [alerts, levelFilter]);

  const handleAlertClick = (alertInfraName: string) => {
    const item = infrastructureList.find((i) => i.name === alertInfraName);
    if (item) {
      navigate("/", { state: { selectedId: item.id } });
    } else {
      navigate("/");
    }
  };

  const handleCreateWO = (
    e: React.MouseEvent,
    alert: { id: number; infrastructure: string; level: "Critical" | "Warning"; message: string },
  ) => {
    e.stopPropagation();
    const infra = infrastructureList.find((i) => i.name === alert.infrastructure);
    const isCritical = alert.level === "Critical";
    const priority = isCritical ? "Critical" : "High";
    const type = isCritical ? "Emergency Repair" : "Inspection";
    const title = `${type} – ${alert.infrastructure}`;

    setWoPrefill({
      infrastructureId: infra?.id ?? "",
      alertId: alert.id,
      title,
      description: alert.message,
      priority,
      type,
    });
    setWoDialogOpen(true);
  };

  const levelButtons: { label: string; value: FilterLevel; count: number }[] = [
    { label: "All", value: "all", count: alerts.length },
    { label: "Critical", value: "Critical", count: alerts.filter(a => a.level === "Critical").length },
    { label: "Warning", value: "Warning", count: alerts.filter(a => a.level === "Warning").length },
  ];

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="dashboard-card flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-risk-high" />
        <div>
          <h2 className="text-sm font-bold text-foreground">Active Alerts — Action Center</h2>
          <p className="text-xs text-muted-foreground">
            {alerts.filter(a => a.level === "Critical").length} critical • {alerts.filter(a => a.level === "Warning").length} warnings
          </p>
        </div>
        <span className="ml-auto rounded-full bg-risk-high/20 border border-risk-high/30 px-2.5 py-0.5 text-[10px] font-mono text-risk-high">
          {alerts.length} active
        </span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">Level:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {levelButtons.map(btn => (
            <button
              key={btn.value}
              onClick={() => setLevelFilter(btn.value)}
              className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none ${
                levelFilter === btn.value
                  ? "bg-primary/15 border-primary/30 text-primary font-semibold"
                  : "border-border text-muted-foreground hover:bg-secondary/60"
              }`}
            >
              {btn.label} ({btn.count})
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-border mx-1" />

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground font-medium">Status:</span>
          {(["active", "resolved"] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-3 py-1 text-[11px] font-medium capitalize transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none ${
                statusFilter === s
                  ? "bg-primary/15 border-primary/30 text-primary font-semibold"
                  : "border-border text-muted-foreground hover:bg-secondary/60"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-2">
        {statusFilter === "resolved" ? (
          <div className="dashboard-card flex flex-col items-center justify-center py-12 text-center max-w-lg mx-auto">
            <p className="text-sm font-semibold text-foreground">No resolved alerts</p>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Alerts move here automatically after an associated work order is completed or when an asset's risk level improves.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert, idx) => {
            const infra = infrastructureList.find((i) => i.name === alert.infrastructure);
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-4 rounded-xl border p-4 transition-all hover:shadow-lg ${
                  alert.level === "Critical"
                    ? "border-risk-high/30 bg-risk-high/5 hover:border-risk-high/50"
                    : "border-risk-medium/30 bg-risk-medium/5 hover:border-risk-medium/50"
                }`}
              >
                <AlertIcon level={alert.level} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{alert.infrastructure}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                      alert.level === "Critical"
                        ? "text-risk-high border-risk-high/40 bg-risk-high/10"
                        : "text-risk-medium border-risk-medium/40 bg-risk-medium/10"
                    }`}>{alert.level}</span>
                    <span className="rounded-full border border-risk-low/30 bg-risk-low/10 px-2 py-0.5 text-[10px] font-medium text-risk-low">
                      Active
                    </span>
                    {infra && (
                      <>
                        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{infra.type}</span>
                        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Risk: {infra.riskScore}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground/70">
                    {infra && <span>📍 {infra.location}</span>}
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {getRandomTimeAgo(alert.id)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    onClick={() => handleAlertClick(alert.infrastructure)}
                    className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                    title="View on map"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => handleCreateWO(e, alert)}
                    className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary transition-all hover:bg-primary/20"
                    title="Create Work Order from this alert"
                  >
                    <ClipboardList className="h-3 w-3" />
                    Create WO
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Work Order Dialog */}
      <WorkOrderDialog
        open={woDialogOpen}
        prefill={woPrefill}
        onClose={() => { setWoDialogOpen(false); setWoPrefill(undefined); }}
        onSave={(wo) => {
          const current = getStoredWorkOrders();
          const updated = [wo, ...current];
          saveStoredWorkOrders(updated);
          setWorkOrders(updated);
          setWoDialogOpen(false);
          setWoPrefill(undefined);
        }}
      />
    </main>
  );
};

export default ActiveAlertsPage;