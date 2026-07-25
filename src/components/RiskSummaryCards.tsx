import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { getStoredAssets } from "@/data/mockData";

const RiskSummaryCards = () => {
  const assets = getStoredAssets();
  const high = assets.filter((item) => item.riskScore >= 75).length;
  const medium = assets.filter((item) => item.riskScore >= 50 && item.riskScore < 75).length;
  const low = assets.filter((item) => item.riskScore < 50).length;

  const cards = [
    {
      label: "High Risk Structures",
      count: high,
      icon: AlertTriangle,
      variant: "risk-card-high" as const,
      color: "text-risk-high",
    },
    {
      label: "Medium Risk Structures",
      count: medium,
      icon: AlertCircle,
      variant: "risk-card-medium" as const,
      color: "text-risk-medium",
    },
    {
      label: "Low Risk Structures",
      count: low,
      icon: CheckCircle,
      variant: "risk-card-low" as const,
      color: "text-risk-low",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`dashboard-card ${card.variant} flex items-center gap-4 cursor-default select-none`}
          aria-label={`${card.label}: ${card.count}`}
        >
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.color} bg-current/10 shadow-sm`}>
            <card.icon className={`h-6 w-6 ${card.color}`} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
            <p className={`text-3xl font-bold font-mono ${card.color}`}>{card.count}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RiskSummaryCards;
