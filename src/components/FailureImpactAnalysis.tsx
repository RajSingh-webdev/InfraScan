import { useMemo } from "react";
import { AlertTriangle, Users, Car, IndianRupee } from "lucide-react";
import { type InfrastructureItem } from "@/data/mockData";

type Density = "high" | "medium" | "low";
type Importance = "high" | "medium" | "low";

const HIGH_DENSITY_KEYWORDS = ["Delhi", "Mumbai", "NCR", "Kolkata", "Bengaluru", "Noida", "Gurugram", "Greater Noida", "Central Delhi", "New Delhi"];
const MEDIUM_DENSITY_KEYWORDS = ["Sambalpur", "Rajahmundry", "Bilaspur", "Yamunanagar", "Kevadia"];

function getDensity(location: string): Density {
  if (HIGH_DENSITY_KEYWORDS.some((k) => location.includes(k))) return "high";
  if (MEDIUM_DENSITY_KEYWORDS.some((k) => location.includes(k))) return "medium";
  return "low";
}

/* Importance is assigned per infrastructure by ID or name pattern */
const HIGH_IMPORTANCE_IDS = new Set([
  "BR-MH-001", // Bandra–Worli Sea Link
  "BR-JK-001", // Chenab Rail Bridge
  "DM-UK-001", // Tehri Dam
  "DM-GJ-001", // Sardar Sarovar Dam
  "DM-OD-001", // Hirakud Dam
  "BL-MH-001", // Antilia Tower
  "BR-DL-005", // Signature Bridge
  "TN-DL-005", // Delhi Metro Underground Tunnel
  "BL-DL-004", // Supreme Court of India
  "BL-DL-005", // Rashtrapati Bhavan
]);

const LOW_IMPORTANCE_IDS = new Set([
  "BR-DL-007", // Old Yamuna Bridge
  "BL-UP-006", // Gaur City Mall Tower
  "DM-DL-005", // Okhla Barrage
  "DM-HR-004", // Hathnikund Barrage
]);

function getImportance(id: string): Importance {
  if (HIGH_IMPORTANCE_IDS.has(id)) return "high";
  if (LOW_IMPORTANCE_IDS.has(id)) return "low";
  return "medium";
}

/* Economic impact ranges by importance */
const ECON_RANGES: Record<Importance, [number, number]> = {
  high:   [5, 15],
  medium: [2, 5],
  low:    [0.5, 2],
};

/* Population & traffic ranges stay density-based */
const POP_TRAFFIC_RANGES: Record<Density, { pop: [number, number]; traffic: [number, number] }> = {
  high:   { pop: [20000, 80000], traffic: [15000, 50000] },
  medium: { pop: [8000, 30000],  traffic: [5000, 20000] },
  low:    { pop: [1000, 10000],  traffic: [1000, 8000] },
};

/* Density multiplier shifts econ within importance range */
const DENSITY_BIAS: Record<Density, number> = { high: 0.25, medium: 0, low: -0.2 };

function lerp(min: number, max: number, t: number) {
  return Math.round(min + (max - min) * Math.max(0, Math.min(1, t)));
}

function assetHash(id: string, riskScore: number): number {
  const str = `${id}:${riskScore}`;
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h = h >>> 0; // keep as unsigned 32-bit
  }
  return h / 0xffffffff; // normalize to [0, 1]
}

function generateImpact(item: InfrastructureItem) {
  const density = getDensity(item.location);
  const importance = getImportance(item.id);
  const seed = assetHash(item.id, item.riskScore);

  // Risk-based bias
  const riskT = item.riskScore >= 75 ? 0.7 + seed * 0.3
              : item.riskScore >= 50 ? 0.3 + seed * 0.4
              : seed * 0.35;

  // Pop & traffic from density
  const pr = POP_TRAFFIC_RANGES[density];
  const pop = lerp(pr.pop[0], pr.pop[1], riskT);
  const traffic = lerp(pr.traffic[0], pr.traffic[1], riskT);

  // Economic from importance + density adjustment + risk
  const er = ECON_RANGES[importance];
  const econT = Math.max(0, Math.min(1, riskT + DENSITY_BIAS[density]));
  const econRaw = er[0] + (er[1] - er[0]) * econT;
  const econ = Math.round(econRaw * 10) / 10;

  return { density, importance, pop, traffic, econ };
}

function formatNum(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n);
}

const densityLabel: Record<Density, string> = {
  high: "High Density (Urban)",
  medium: "Medium Density (Semi-Urban)",
  low: "Low Density (Rural/Remote)",
};

const densityBadge: Record<Density, string> = {
  high: "border-risk-high/30 bg-risk-high/10 text-risk-high",
  medium: "border-risk-medium/30 bg-risk-medium/10 text-risk-medium",
  low: "border-risk-low/30 bg-risk-low/10 text-risk-low",
};

interface Props {
  selected: InfrastructureItem;
}

const FailureImpactAnalysis = ({ selected }: Props) => {
  const impact = useMemo(() => generateImpact(selected), [selected.id]);

  const metrics = [
    { icon: Users, label: "Population Affected", value: `~${formatNum(impact.pop)} people`, color: "text-primary" },
    { icon: Car, label: "Traffic Disruption", value: `~${formatNum(impact.traffic)} vehicles/day`, color: "text-risk-medium" },
    { icon: IndianRupee, label: "Economic Impact", value: `₹${impact.econ} Cr/day`, color: "text-risk-high" },
  ];

  return (
    <div className="dashboard-card">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-risk-high" />
        <h3 className="text-sm font-semibold text-foreground">Failure Impact Analysis</h3>
        <span className={`ml-auto rounded-full border px-2 py-0.5 text-[10px] font-medium ${densityBadge[impact.density]}`}>
          {densityLabel[impact.density]}
        </span>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Estimated impact if <span className="font-medium text-foreground">{selected.name}</span> experiences structural failure
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-lg border border-border bg-secondary/30 p-3">
            <div className="mb-1 flex items-center gap-2">
              <m.icon className={`h-4 w-4 ${m.color}`} />
              <span className="text-xs text-muted-foreground">{m.label}</span>
            </div>
            <p className={`font-mono text-lg font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FailureImpactAnalysis;
