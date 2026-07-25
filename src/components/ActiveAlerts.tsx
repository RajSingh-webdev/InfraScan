import { Bell, AlertTriangle, AlertCircle } from "lucide-react";
import { deriveAlerts, getStoredAssets } from "@/data/mockData";

const AlertIcon = ({ level }: { level: "Critical" | "Warning" }) =>
  level === "Critical" ? (
    <AlertTriangle className="h-4 w-4 text-risk-high shrink-0" />
  ) : (
    <AlertCircle className="h-4 w-4 text-risk-medium shrink-0" />
  );

const ActiveAlerts = () => {
  const alerts = deriveAlerts(getStoredAssets());

  return (
    <div className="dashboard-card">
      <div className="mb-3 flex items-center gap-2">
        <Bell className="h-4 w-4 text-risk-high" />
        <h2 className="text-sm font-semibold text-foreground">Active Alerts</h2>
        <span className="ml-auto rounded-full bg-risk-high/20 border border-risk-high/30 px-2 py-0.5 text-xs font-mono text-risk-high">
          {alerts.length} active
        </span>
      </div>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
              alert.level === "Critical"
                ? "border-risk-high/30 bg-risk-high/5"
                : "border-risk-medium/30 bg-risk-medium/5"
            }`}
          >
            <AlertIcon level={alert.level} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{alert.infrastructure}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    alert.level === "Critical"
                      ? "text-risk-high border-risk-high/40 bg-risk-high/10"
                      : "text-risk-medium border-risk-medium/40 bg-risk-medium/10"
                  }`}
                >
                  {alert.level}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveAlerts;
