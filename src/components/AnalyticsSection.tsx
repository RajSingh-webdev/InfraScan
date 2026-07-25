import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceDot,
} from "recharts";
import { type InfrastructureItem } from "@/data/mockData";
import { TrendingUp, BarChart3, Info, AlertTriangle } from "lucide-react";

const chartTooltipStyle = {
  backgroundColor: "hsl(40 36% 98%)",
  border: "1px solid hsl(31 22% 82%)",
  borderRadius: "14px",
  boxShadow: "0 18px 38px -28px hsl(24 18% 18% / 0.35)",
  color: "hsl(24 17% 19%)",
  fontSize: "12px",
};

const chartGridColor = "hsl(32 18% 82%)";
const chartTickColor = "hsl(25 11% 40%)";
const chartPrimaryColor = "hsl(171 28% 31%)";
const chartHighColor = "hsl(11 61% 52%)";
const chartMediumColor = "hsl(39 73% 47%)";
const chartLowColor = "hsl(95 25% 42%)";

const riskLevel = (score: number) =>
  score >= 75 ? "High" : score >= 50 ? "Medium" : "Low";

interface Props {
  selected: InfrastructureItem;
}

const AnalyticsSection = ({ selected }: Props) => {
  const lastPoint = selected.groundMovement[selected.groundMovement.length - 1];
  const abnormal = selected.riskScore > 70;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="dashboard-card">
        <div className="mb-1 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Ground Deformation Trend</h3>
          {abnormal && (
            <span className="ml-auto flex items-center gap-1 rounded-full border border-risk-high/40 bg-risk-high/10 px-2 py-0.5 text-[10px] font-medium text-risk-high">
              <AlertTriangle className="h-3 w-3" /> Abnormal
            </span>
          )}
        </div>

        <p className="mb-3 text-xs text-muted-foreground">{selected.name} - Displacement (mm)</p>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={selected.groundMovement}>
            <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fill: chartTickColor, fontSize: 11 }} axisLine={false} />
            <YAxis tick={{ fill: chartTickColor, fontSize: 11 }} axisLine={false} unit="mm" />
            <Tooltip contentStyle={chartTooltipStyle} animationDuration={150} />
            <Line
              type="monotone"
              dataKey="displacement"
              stroke={chartPrimaryColor}
              strokeWidth={2.5}
              dot={{ fill: chartPrimaryColor, r: 4 }}
              activeDot={{ r: 6 }}
            />
            {abnormal && (
              <ReferenceDot
                x={lastPoint.year}
                y={lastPoint.displacement}
                r={6}
                fill={chartHighColor}
                stroke={chartHighColor}
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-card">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Risk Factors</h3>
          <span className="ml-auto rounded-full border border-border bg-secondary/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {selected.type}
          </span>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={selected.riskFactors} layout="vertical">
            <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fill: chartTickColor, fontSize: 11 }} axisLine={false} domain={[0, 100]} />
            <YAxis dataKey="factor" type="category" tick={{ fill: chartTickColor, fontSize: 10 }} axisLine={false} width={110} />
            <Tooltip contentStyle={chartTooltipStyle} animationDuration={150} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {selected.riskFactors.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.value >= 75 ? chartHighColor : entry.value >= 50 ? chartMediumColor : chartLowColor}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={`dashboard-card ${selected.riskScore >= 75 ? "risk-card-high" : selected.riskScore >= 50 ? "risk-card-medium" : "risk-card-low"}`}>
        <div className="mb-4 flex items-center gap-2">
          <Info className={`h-4 w-4 ${selected.riskScore >= 75 ? "text-risk-high" : selected.riskScore >= 50 ? "text-risk-medium" : "text-risk-low"}`} />
          <h3 className="text-sm font-semibold text-foreground">Infrastructure Details</h3>
        </div>

        <div className="space-y-3 text-sm">
          {[
            ["Name", selected.name],
            ["Type", selected.type],
            ["Location", selected.location],
            ["Age", selected.age],
            ["Risk Score", `${selected.riskScore}/100`],
            ["Risk Level", riskLevel(selected.riskScore)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">{label}</span>
              <span
                className={`font-mono font-medium ${
                  label === "Risk Level" || label === "Risk Score"
                    ? selected.riskScore >= 75
                      ? "text-risk-high"
                      : selected.riskScore >= 50
                        ? "text-risk-medium"
                        : "text-risk-low"
                    : "text-foreground"
                }`}
              >
                {value}
              </span>
            </div>
          ))}

          <div className="pt-1">
            <p className="mb-1 text-xs text-muted-foreground">Recommended Action</p>
            <p
              className={`text-xs leading-relaxed ${
                selected.riskScore >= 75
                  ? "text-risk-high"
                  : selected.riskScore >= 50
                    ? "text-risk-medium"
                    : "text-primary"
              }`}
            >
              {selected.recommendedAction}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
