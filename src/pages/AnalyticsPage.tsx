import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  Lightbulb,
  AlertTriangle,
  ClipboardList,
  Shield,
  ShieldAlert,
  CheckCircle2,
  Wrench,
  Clock,
  Check,
  Building2,
} from "lucide-react";
import {
  getStoredAssets,
  getStoredWorkOrders,
  deriveAlerts,
  type WorkOrderStatus,
} from "@/data/mockData";

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

const RISK_COLORS = {
  High: "hsl(11 61% 52%)",
  Medium: "hsl(39 73% 47%)",
  Low: "hsl(95 25% 42%)",
};

const TYPE_COLORS: Record<string, string> = {
  Bridge: chartPrimaryColor,
  Tunnel: "hsl(22 55% 48%)",
  Dam: "hsl(39 73% 47%)",
  Building: "hsl(95 25% 42%)",
};

const AnalyticsPage = () => {
  // ── Data Sources (Dynamic from localStorage) ─────────────────────────────────
  const assets = useMemo(() => getStoredAssets(), []);
  const workOrders = useMemo(() => getStoredWorkOrders(), []);
  const alerts = useMemo(() => deriveAlerts(assets), [assets]);

  // ── KPI Calculations ─────────────────────────────────────────────────────────

  // 1. Total Assets
  const totalAssets = assets.length;

  // 2. Open Work Orders (Open + Assigned + In Progress)
  const openWOsCount = useMemo(() => {
    return workOrders.filter(
      (wo) => wo.status === "Open" || wo.status === "Assigned" || wo.status === "In Progress"
    ).length;
  }, [workOrders]);

  // 3. Highest Risk Asset Name & Score
  const highestRiskAsset = useMemo(() => {
    if (assets.length === 0) return null;
    return [...assets].sort((a, b) => b.riskScore - a.riskScore)[0];
  }, [assets]);

  // 4. Critical Assets Count (Risk Score >= 75)
  const criticalAssetsCount = useMemo(() => {
    return assets.filter((item) => item.riskScore >= 75).length;
  }, [assets]);

  // 5. Maintenance Coverage KPI (Critical Assets with Active WOs / Total Critical Assets)
  const maintenanceCoverage = useMemo(() => {
    const criticalAssets = assets.filter((a) => a.riskScore >= 75 || a.status === "Critical");
    const totalCritical = criticalAssets.length;
    if (totalCritical === 0) return { percentage: 100, assigned: 0, total: 0 };

    const activeWOs = workOrders.filter(
      (wo) => wo.status === "Open" || wo.status === "Assigned" || wo.status === "In Progress"
    );

    const assignedCount = criticalAssets.filter((asset) =>
      activeWOs.some((wo) => wo.infrastructureId === asset.id)
    ).length;

    const percentage = Math.round((assignedCount / totalCritical) * 100);
    return { percentage, assigned: assignedCount, total: totalCritical };
  }, [assets, workOrders]);

  // 6. Alert Summary KPI
  const alertSummary = useMemo(() => {
    const critical = alerts.filter((a) => a.level === "Critical").length;
    const warning = alerts.filter((a) => a.level === "Warning").length;
    return { critical, warning, total: alerts.length };
  }, [alerts]);

  // ── Distribution & Chart Calculations ───────────────────────────────────────

  // Risk Distribution (Pie Chart)
  const riskDistribution = useMemo(() => {
    const high = assets.filter((item) => item.riskScore >= 75).length;
    const medium = assets.filter((item) => item.riskScore >= 50 && item.riskScore < 75).length;
    const low = assets.filter((item) => item.riskScore < 50).length;

    return [
      { name: "High Risk", value: high, color: RISK_COLORS.High },
      { name: "Medium Risk", value: medium, color: RISK_COLORS.Medium },
      { name: "Low Risk", value: low, color: RISK_COLORS.Low },
    ];
  }, [assets]);

  // Asset Status Distribution (Stable / Warning / Critical)
  const statusDistribution = useMemo(() => {
    const counts = { Stable: 0, Warning: 0, Critical: 0 };
    assets.forEach((item) => {
      if (item.status === "Critical") counts.Critical++;
      else if (item.status === "Warning") counts.Warning++;
      else counts.Stable++;
    });

    return [
      { name: "Stable", value: counts.Stable, color: "hsl(95 25% 42%)" },
      { name: "Warning", value: counts.Warning, color: "hsl(39 73% 47%)" },
      { name: "Critical", value: counts.Critical, color: "hsl(11 61% 52%)" },
    ];
  }, [assets]);

  // Infrastructure by Type (Bar Chart)
  const typeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    assets.forEach((item) => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });

    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      fill: TYPE_COLORS[type] || chartPrimaryColor,
    }));
  }, [assets]);

  // Average Risk by Type (Horizontal Bar Chart)
  const avgRiskByType = useMemo(() => {
    const sums: Record<string, { total: number; count: number }> = {};

    assets.forEach((item) => {
      if (!sums[item.type]) sums[item.type] = { total: 0, count: 0 };
      sums[item.type].total += item.riskScore;
      sums[item.type].count++;
    });

    return Object.entries(sums).map(([type, { total, count }]) => ({
      type,
      avgRisk: Math.round(total / count),
      fill: TYPE_COLORS[type] || chartPrimaryColor,
    }));
  }, [assets]);

  // Work Order Status Distribution (Bar Chart)
  const woStatusDistribution = useMemo(() => {
    const counts: Record<WorkOrderStatus, number> = {
      Open: 0,
      Assigned: 0,
      "In Progress": 0,
      Completed: 0,
      Cancelled: 0,
    };

    workOrders.forEach((wo) => {
      if (counts[wo.status] !== undefined) {
        counts[wo.status]++;
      }
    });

    const statusColors: Record<string, string> = {
      Open: "hsl(39 73% 47%)",
      Assigned: "hsl(171 28% 31%)",
      "In Progress": "hsl(220 70% 50%)",
      Completed: "hsl(95 25% 42%)",
      Cancelled: "hsl(25 11% 40%)",
    };

    return (["Open", "Assigned", "In Progress", "Completed"] as WorkOrderStatus[]).map((status) => ({
      status,
      count: counts[status] || 0,
      fill: statusColors[status] || chartPrimaryColor,
    }));
  }, [workOrders]);

  // Asset Age Distribution (Bar Chart)
  const ageDistribution = useMemo(() => {
    const brackets = [
      { range: "0–20 Yrs", count: 0 },
      { range: "21–40 Yrs", count: 0 },
      { range: "41–60 Yrs", count: 0 },
      { range: "60+ Yrs", count: 0 },
    ];

    assets.forEach((item) => {
      const ageNum = parseInt(item.age, 10) || 0;
      if (ageNum <= 20) brackets[0].count++;
      else if (ageNum <= 40) brackets[1].count++;
      else if (ageNum <= 60) brackets[2].count++;
      else brackets[3].count++;
    });

    return brackets.map((b) => ({
      range: b.range,
      count: b.count,
      fill: chartPrimaryColor,
    }));
  }, [assets]);

  // Top 5 Ground Movement Assets (Bar Chart)
  const topDisplacementAssets = useMemo(() => {
    return [...assets]
      .map((item) => {
        const lastMovement = item.groundMovement[item.groundMovement.length - 1];
        const displacement = lastMovement ? lastMovement.displacement : 0;
        return {
          name: item.name.length > 18 ? `${item.name.slice(0, 16)}…` : item.name,
          fullName: item.name,
          displacement,
          riskScore: item.riskScore,
          type: item.type,
        };
      })
      .sort((a, b) => b.displacement - a.displacement)
      .slice(0, 5);
  }, [assets]);

  // Top 8 Highest Risk Assets
  const topRisk = useMemo(
    () => [...assets].sort((left, right) => right.riskScore - left.riskScore).slice(0, 8),
    [assets]
  );

  // ── Quick Operational Insights (Concise Bullet Points) ──────────────────────
  const quickInsights = useMemo(() => {
    const items: { text: string; type: "critical" | "warning" | "info" | "success" }[] = [];

    // 1. Critical assets without active work orders
    const criticalAssets = assets.filter((a) => a.riskScore >= 75 || a.status === "Critical");
    const activeWOs = workOrders.filter(
      (wo) => wo.status === "Open" || wo.status === "Assigned" || wo.status === "In Progress"
    );
    const unassignedCriticalCount = criticalAssets.filter(
      (asset) => !activeWOs.some((wo) => wo.infrastructureId === asset.id)
    ).length;

    if (unassignedCriticalCount > 0) {
      items.push({
        text: `${unassignedCriticalCount} Critical Asset${unassignedCriticalCount > 1 ? "s have" : " has"} no active Work Order`,
        type: "critical",
      });
    } else if (criticalAssets.length > 0) {
      items.push({
        text: `All ${criticalAssets.length} Critical Assets have active Work Orders assigned`,
        type: "success",
      });
    }

    // 2. Highest risk infrastructure type
    const typeSums: Record<string, { total: number; count: number }> = {};
    assets.forEach((item) => {
      if (!typeSums[item.type]) typeSums[item.type] = { total: 0, count: 0 };
      typeSums[item.type].total += item.riskScore;
      typeSums[item.type].count++;
    });

    let highestType = "";
    let maxAvg = 0;
    Object.entries(typeSums).forEach(([type, data]) => {
      const avg = data.total / data.count;
      if (avg > maxAvg) {
        maxAvg = avg;
        highestType = type;
      }
    });

    if (highestType) {
      items.push({
        text: `${highestType}s have the highest average risk (${Math.round(maxAvg)})`,
        type: "warning",
      });
    }

    // 3. Stable percentage
    const stableCount = assets.filter((a) => a.status === "Stable").length;
    const stablePct = assets.length > 0 ? Math.round((stableCount / assets.length) * 100) : 0;
    items.push({
      text: `${stablePct}% of infrastructure fleet is currently Stable`,
      type: "info",
    });

    // 4. Assets exceeding Risk Score 90
    const high90Count = assets.filter((a) => a.riskScore >= 90).length;
    if (high90Count > 0) {
      items.push({
        text: `${high90Count} asset${high90Count > 1 ? "s exceed" : " exceeds"} Risk Score 90`,
        type: "critical",
      });
    }

    // 5. Assets older than 60 years
    const old60Count = assets.filter((a) => (parseInt(a.age, 10) || 0) >= 60).length;
    if (old60Count > 0) {
      items.push({
        text: `${old60Count} asset${old60Count > 1 ? "s are" : " is"} older than 60 years`,
        type: "warning",
      });
    }

    // 6. Active Alerts notice
    if (alerts.length > 0) {
      items.push({
        text: `${alerts.length} active alert${alerts.length > 1 ? "s require" : " requires"} engineering review`,
        type: "warning",
      });
    }

    return items;
  }, [assets, workOrders, alerts]);

  // ── Render Dashboard ────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      
      {/* ── Top KPI Grid (6 Operational Metrics) ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {/* Total Assets */}
        <div className="dashboard-card flex flex-col items-center justify-center py-4 text-center">
          <p className="mb-1 text-xs text-muted-foreground">Total Assets</p>
          <p className="font-mono text-2xl font-bold text-primary">{totalAssets}</p>
        </div>

        {/* Open Work Orders */}
        <div className="dashboard-card flex flex-col items-center justify-center py-4 text-center">
          <p className="mb-1 text-xs text-muted-foreground">Open Work Orders</p>
          <p className="font-mono text-2xl font-bold text-risk-medium">{openWOsCount}</p>
        </div>

        {/* Highest Risk Asset */}
        <div className="dashboard-card flex flex-col items-center justify-center py-4 text-center">
          <p className="mb-1 text-xs text-muted-foreground">Highest Risk Asset</p>
          <p className="font-mono text-2xl font-bold text-risk-high">
            {highestRiskAsset ? highestRiskAsset.riskScore : "—"}
          </p>
          <p className="mt-0.5 truncate max-w-[120px] text-[10px] font-medium text-muted-foreground" title={highestRiskAsset?.name}>
            {highestRiskAsset ? highestRiskAsset.name : "N/A"}
          </p>
        </div>

        {/* Critical Assets */}
        <div className="dashboard-card flex flex-col items-center justify-center py-4 text-center">
          <p className="mb-1 text-xs text-muted-foreground">Critical Assets</p>
          <p className="font-mono text-2xl font-bold text-risk-high">{criticalAssetsCount}</p>
        </div>

        {/* Maintenance Coverage */}
        <div className="dashboard-card flex flex-col items-center justify-center py-4 text-center">
          <p className="mb-1 text-xs text-muted-foreground">Maintenance Coverage</p>
          <p className="font-mono text-2xl font-bold text-primary">{maintenanceCoverage.percentage}%</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            ({maintenanceCoverage.assigned} of {maintenanceCoverage.total} Critical Covered)
          </p>
        </div>

        {/* Alert Summary */}
        <div className="dashboard-card flex flex-col items-center justify-center py-4 text-center">
          <p className="mb-1 text-xs text-muted-foreground">Active Alerts</p>
          <p className="font-mono text-2xl font-bold text-risk-high">{alertSummary.total}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {alertSummary.critical} Critical • {alertSummary.warning} Warning
          </p>
        </div>
      </div>

      {/* ── Charts Row 1: Asset Health & Status Breakdown ─────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Risk Distribution Pie Chart */}
        <div className="dashboard-card">
          <div className="mb-4 flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Risk Distribution</h3>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
                stroke="none"
                paddingAngle={3}
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend formatter={(value) => <span style={{ color: "hsl(24 17% 19%)", fontSize: 12 }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Status Distribution */}
        <div className="dashboard-card">
          <div className="mb-4 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Asset Status Distribution</h3>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
                stroke="none"
                paddingAngle={3}
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend formatter={(value) => <span style={{ color: "hsl(24 17% 19%)", fontSize: 12 }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Charts Row 2: Fleet Composition & Average Risk by Type ───────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Infrastructure by Type */}
        <div className="dashboard-card">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Infrastructure by Type</h3>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={typeBreakdown}>
              <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" />
              <XAxis dataKey="type" tick={{ fill: chartTickColor, fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: chartTickColor, fontSize: 11 }} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {typeBreakdown.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Average Risk by Type */}
        <div className="dashboard-card">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Average Risk by Type</h3>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={avgRiskByType} layout="vertical">
              <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: chartTickColor, fontSize: 11 }} axisLine={false} />
              <YAxis dataKey="type" type="category" tick={{ fill: chartTickColor, fontSize: 11 }} axisLine={false} width={80} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="avgRisk" radius={[0, 6, 6, 0]}>
                {avgRiskByType.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Charts Row 3: Maintenance Operations & Demographics ──────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Work Order Status Distribution */}
        <div className="dashboard-card">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Work Order Status Distribution</h3>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={woStatusDistribution}>
              <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" />
              <XAxis dataKey="status" tick={{ fill: chartTickColor, fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: chartTickColor, fontSize: 11 }} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {woStatusDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Age Distribution */}
        <div className="dashboard-card">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Asset Age Distribution</h3>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ageDistribution}>
              <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" />
              <XAxis dataKey="range" tick={{ fill: chartTickColor, fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: chartTickColor, fontSize: 11 }} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {ageDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Charts Row 4: Top Ground Movement Assets ─────────────────────────── */}
      <div className="dashboard-card">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Top Ground Movement Assets</h3>
          <span className="ml-auto rounded-full border border-border bg-secondary/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Current Displacement (mm)
          </span>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={topDisplacementAssets} layout="vertical">
            <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" unit="mm" tick={{ fill: chartTickColor, fontSize: 11 }} axisLine={false} />
            <YAxis dataKey="name" type="category" tick={{ fill: chartTickColor, fontSize: 11 }} axisLine={false} width={140} />
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(val: number) => [`${val} mm`, "Current Displacement"]}
            />
            <Bar dataKey="displacement" radius={[0, 6, 6, 0]}>
              {topDisplacementAssets.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.riskScore >= 75 ? RISK_COLORS.High : entry.riskScore >= 50 ? RISK_COLORS.Medium : RISK_COLORS.Low}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Bottom Section: Quick Operational Insights & Top Risk Leaderboard ──── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Quick Operational Insights */}
        <div className="dashboard-card">
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-risk-medium" />
            <h3 className="text-sm font-semibold text-foreground">Quick Operational Insights</h3>
            <span className="ml-auto rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Live Data</span>
          </div>

          <div className="space-y-2.5">
            {quickInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 rounded-xl border border-border bg-secondary/35 px-4 py-3">
                <span className="mt-0.5 shrink-0">
                  {insight.type === "critical" ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-risk-high" />
                  ) : insight.type === "warning" ? (
                    <Clock className="h-3.5 w-3.5 text-risk-medium" />
                  ) : insight.type === "success" ? (
                    <Check className="h-3.5 w-3.5 text-risk-low" />
                  ) : (
                    <Activity className="h-3.5 w-3.5 text-primary" />
                  )}
                </span>
                <p className="text-xs leading-relaxed text-foreground font-medium">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Risk Assets Leaderboard */}
        <div className="dashboard-card">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-risk-high" />
            <h3 className="text-sm font-semibold text-foreground">Top Risk Assets</h3>
          </div>

          <div className="space-y-2">
            {topRisk.map((item, index) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  navigate(`/inventory/${item.id}`, {
                    state: { asset: item, from: "/analytics", fromLabel: "Analytics" },
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/inventory/${item.id}`, {
                      state: { asset: item, from: "/analytics", fromLabel: "Analytics" },
                    });
                  }
                }}
                className="flex items-center gap-3 rounded-xl border border-border bg-secondary/35 px-4 py-2.5 cursor-pointer hover:bg-secondary/70 hover:border-primary/30 transition-all active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
              >
                <span className="w-5 font-mono text-xs text-muted-foreground">{index + 1}</span>
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.riskScore >= 75 ? "bg-risk-high animate-pulse" : item.riskScore >= 50 ? "bg-risk-medium" : "bg-risk-low"}`} />
                <span className="flex-1 text-sm font-medium text-foreground truncate">{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.type}</span>
                <span className={`font-mono text-sm font-bold ${item.riskScore >= 75 ? "text-risk-high" : item.riskScore >= 50 ? "text-risk-medium" : "text-risk-low"}`}>
                  {item.riskScore}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
