import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Map,
  MapPin,
  Pencil,
  Shield,
} from "lucide-react";
import {
  infrastructureList,
  type InfrastructureItem,
  getStoredAssets,
  saveStoredAssets,
} from "@/data/mockData";
import { Button } from "@/components/ui/button";
import AnalyticsSection from "@/components/AnalyticsSection";
import FailureImpactAnalysis from "@/components/FailureImpactAnalysis";
import AssetFormSheet from "@/components/inventory/AssetFormSheet";

// ─── Static helpers ───────────────────────────────────────────────────────────

const typeEmoji: Record<string, string> = {
  Bridge: "🌉",
  Tunnel: "🚇",
  Dam: "🏗",
  Building: "🏢",
};

const scoreColor = (score: number) =>
  score >= 75
    ? "text-risk-high"
    : score >= 50
    ? "text-risk-medium"
    : "text-risk-low";

const statusBadgeClass: Record<string, string> = {
  Critical: "border-risk-high/30 bg-risk-high/10 text-risk-high",
  Warning: "border-risk-medium/30 bg-risk-medium/10 text-risk-medium",
  Stable: "border-risk-low/30 bg-risk-low/10 text-risk-low",
};

// ─── Component ────────────────────────────────────────────────────────────────

const AssetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state as { asset?: InfrastructureItem; from?: string; fromLabel?: string } | null;
  const routeAsset = locationState?.asset;
  const backRoute = locationState?.from ?? "/inventory";
  const backLabel = locationState?.fromLabel ?? "Inventory";

  const [asset, setAsset] = useState<InfrastructureItem | null>(
    () =>
      routeAsset ??
      (id ? (getStoredAssets().find((i) => i.id === id) ?? null) : null),
  );

  const [sheetOpen, setSheetOpen] = useState(false);

  // ── Not-found fallback ────────────────────────────────────────────────────
  if (!asset) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm font-semibold text-foreground">
          Asset not found
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          ID <span className="font-mono text-primary">{id}</span> does not
          exist in the registry.
        </p>
        <Button
          variant="outline"
          className="mt-6 gap-2"
          onClick={() => navigate(backRoute)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {backLabel}
        </Button>
      </main>
    );
  }

  const handleSaveEdit = (updated: InfrastructureItem) => {
    setAsset(updated);
    const all = getStoredAssets();
    const next = all.map((a) => (a.id === updated.id ? updated : a));
    saveStoredAssets(next);
    setSheetOpen(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">

      {/* ── Context-Aware Navigation & Breadcrumbs ───────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <button
            onClick={() => navigate(backRoute)}
            className="hover:text-foreground transition-colors flex items-center gap-1 font-semibold text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to {backLabel}
          </button>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{asset.name}</span>
        </div>
      </div>

      {/* ── Asset identity card ───────────────────────────────────────────── */}
      <div className="dashboard-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Left — name + badges */}
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 text-3xl leading-none">
              {typeEmoji[asset.type]}
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-mono text-lg font-bold leading-tight text-foreground">
                {asset.name}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-primary">
                  {asset.id}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">
                  {asset.type}
                </span>
                <span className="text-muted-foreground">·</span>
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                    statusBadgeClass[asset.status] ?? ""
                  }`}
                >
                  {asset.status}
                </span>
              </div>
            </div>
          </div>

          {/* Right — action buttons */}
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate("/", { state: { selectedId: asset.id } })
              }
              className="gap-1.5 text-xs"
            >
              <Map className="h-3.5 w-3.5" />
              View on Map
            </Button>
            <Button
              size="sm"
              onClick={() => setSheetOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Asset
            </Button>
          </div>
        </div>
      </div>

      {/* ── Quick-stat cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Risk Score */}
        <div className="dashboard-card flex flex-col items-center py-5 text-center">
          <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            Risk Score
          </div>
          <p
            className={`font-mono text-3xl font-bold leading-none ${scoreColor(
              asset.riskScore,
            )}`}
          >
            {asset.riskScore}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">out of 100</p>
        </div>

        {/* Status */}
        <div className="dashboard-card flex flex-col items-center py-5 text-center">
          <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Activity className="h-3 w-3" />
            Status
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              statusBadgeClass[asset.status] ?? ""
            }`}
          >
            {asset.status}
          </span>
        </div>

        {/* Age */}
        <div className="dashboard-card flex flex-col items-center py-5 text-center">
          <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Structural Age
          </div>
          <p className="font-mono text-2xl font-bold leading-none text-foreground">
            {asset.age.replace(/\s*years?\s*/i, "")}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">years old</p>
        </div>

        {/* Location */}
        <div className="dashboard-card flex flex-col items-center py-5 text-center">
          <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            Location
          </div>
          <p className="text-center text-[11px] font-medium leading-snug text-foreground">
            {asset.location}
          </p>
        </div>
      </div>

      {/* ── Physical details ─────────────────────────────────────────────── */}
      <div className="dashboard-card">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          Physical Details
        </h2>
        <div className="grid grid-cols-1 gap-x-10 gap-y-2.5 sm:grid-cols-2">
          {(
            [
              ["Asset ID", asset.id],
              ["Infrastructure Type", asset.type],
              ["Location", asset.location],
              ["Structural Age", asset.age],
              ["Latitude", `${asset.lat}°`],
              ["Longitude", `${asset.lng}°`],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between border-b border-border/40 pb-2"
            >
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="font-mono text-xs font-medium text-foreground">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts: ground movement + risk factors + inline details ──────── */}
      <AnalyticsSection selected={asset} />

      {/* ── Failure impact simulation ─────────────────────────────────────── */}
      <FailureImpactAnalysis selected={asset} />

      {/* ── Edit sheet ────────────────────────────────────────────────────── */}
      <AssetFormSheet
        open={sheetOpen}
        asset={asset}
        onClose={() => setSheetOpen(false)}
        onSave={handleSaveEdit}
      />
    </main>
  );
};

export default AssetDetailPage;
