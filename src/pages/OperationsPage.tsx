import { useMemo } from "react";
import { Target, AlertTriangle, ArrowRight, Shield, Clock, TrendingUp, Zap, Users, Landmark, Compass, Droplets, Building2 } from "lucide-react";
import { getStoredAssets, deriveAlerts } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

type Priority = "critical" | "elevated" | "routine";

function getPriority(riskScore: number): Priority {
  if (riskScore >= 75) return "critical";
  if (riskScore >= 50) return "elevated";
  return "routine";
}

const priorityConfig: Record<Priority, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: "Critical", color: "text-risk-high", bg: "bg-risk-high/10", border: "border-risk-high/30" },
  elevated: { label: "Elevated", color: "text-risk-medium", bg: "bg-risk-medium/10", border: "border-risk-medium/30" },
  routine:  { label: "Routine", color: "text-risk-low", bg: "bg-risk-low/10", border: "border-risk-low/30" },
};

const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "Bridge":
      return <Landmark className="h-3.5 w-3.5 text-primary/80" />;
    case "Tunnel":
      return <Compass className="h-3.5 w-3.5 text-[hsl(22_55%_48%)]" />;
    case "Dam":
      return <Droplets className="h-3.5 w-3.5 text-risk-medium" />;
    default:
      return <Building2 className="h-3.5 w-3.5 text-risk-low" />;
  }
};

const HIGH_DENSITY_KEYWORDS = ["Delhi", "New Delhi", "Central Delhi", "Mumbai", "Kolkata", "Noida", "Gurugram", "Greater Noida", "Bengaluru"];

function estimatePopulation(item: typeof infrastructureList[0]): string {
  const isUrban = HIGH_DENSITY_KEYWORDS.some(k => item.location.includes(k));
  const base = isUrban ? 30000 : 8000;
  const riskMult = item.riskScore >= 75 ? 2.2 : item.riskScore >= 50 ? 1.4 : 0.8;
  const pop = Math.round((base * riskMult) / 1000) * 1000;
  return pop >= 1000 ? `~${(pop / 1000).toFixed(0)}K` : `~${pop}`;
}

const OperationsPage = () => {
  const navigate = useNavigate();

  const prioritized = useMemo(() => {
    const assets = getStoredAssets();
    const alerts = deriveAlerts(assets);
    return [...assets]
      .sort((a, b) => b.riskScore - a.riskScore)
      .map(item => ({
        ...item,
        priority: getPriority(item.riskScore),
        hasAlert: alerts.some(a => a.infrastructure === item.name),
        popAffected: estimatePopulation(item),
      }));
  }, []);

  const critical = prioritized.filter(i => i.priority === "critical");
  const elevated = prioritized.filter(i => i.priority === "elevated");
  const routine = prioritized.filter(i => i.priority === "routine");

  const handleNavigate = (id: string) => {
    navigate("/", { state: { selectedId: id } });
  };

  const renderGroup = (title: string, items: typeof prioritized, priority: Priority) => {
    const config = priorityConfig[priority];
    if (items.length === 0) return null;

    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className={`h-2.5 w-2.5 rounded-full ${config.bg} border ${config.border}`} style={{ backgroundColor: `hsl(var(--risk-${priority === "critical" ? "high" : priority === "elevated" ? "medium" : "low"}))` }} />
          <h3 className={`text-sm font-semibold ${config.color}`}>{title}</h3>
          <span className="text-xs text-muted-foreground font-mono">({items.length})</span>
        </div>
        <div className="space-y-2">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full text-left flex items-start gap-4 rounded-xl border p-4 transition-all duration-200 hover:scale-[1.005] hover:shadow-lg cursor-pointer ${config.border} ${config.bg}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <TypeIcon type={item.type} />
                    {item.name}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${config.color} ${config.border} ${config.bg}`}>
                    {config.label}
                  </span>
                  {priority === "critical" && (
                    <span className="flex items-center gap-1 rounded-full border border-risk-high/40 bg-risk-high/20 px-2 py-0.5 text-[10px] font-bold text-risk-high">
                      <Zap className="h-3 w-3" /> Fix Now
                    </span>
                  )}
                  <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-mono">
                    {item.id}
                  </span>
                  {item.hasAlert && (
                    <span className="flex items-center gap-1 rounded-full border border-risk-high/40 bg-risk-high/10 px-2 py-0.5 text-[10px] font-medium text-risk-high">
                      <AlertTriangle className="h-3 w-3" /> Active Alert
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2 flex-wrap">
                  <span>📍 {item.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Age: {item.age}</span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Risk: <span className={`font-mono font-bold ${config.color}`}>{item.riskScore}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Impact: <span className="font-mono font-medium text-foreground">{item.popAffected} people</span>
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${priority === "critical" ? "text-risk-high/80" : "text-muted-foreground"}`}>
                  {item.recommendedAction}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="dashboard-card flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Target className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">Operations — Decision Center</h2>
          <p className="text-xs text-muted-foreground">
            {critical.length} critical • {elevated.length} elevated • {routine.length} routine priority assets
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-xs font-mono text-muted-foreground">{infrastructureList.length} assets monitored</span>
        </div>
      </div>

      {renderGroup("⚡ Immediate Action Required", critical, "critical")}
      {renderGroup("Elevated Monitoring", elevated, "elevated")}
      {renderGroup("Routine Monitoring", routine, "routine")}
    </div>
  );
};

export default OperationsPage;