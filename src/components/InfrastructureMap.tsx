import { useEffect, useMemo, useState } from "react";
import { MapPin, Maximize2, Minimize2, ClipboardList } from "lucide-react";
import { infrastructureList, type InfrastructureItem, getStoredWorkOrders } from "@/data/mockData";

const getRandomLastUpdated = (): string => {
  const roll = Math.random();
  if (roll < 0.5) {
    const mins = [2, 5, 10, 15, 20, 30][Math.floor(Math.random() * 6)];
    return `${mins} min ago`;
  } else if (roll < 0.8) {
    const hours = [1, 2, 3, 5, 8, 10][Math.floor(Math.random() * 6)];
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    return "1 day ago";
  }
};

const riskBadgeClass = (score: number) => {
  if (score >= 75) return "bg-risk-high/10 text-risk-high border-risk-high/20";
  if (score >= 50) return "bg-risk-medium/10 text-risk-medium border-risk-medium/20";
  return "bg-risk-low/10 text-risk-low border-risk-low/20";
};

const riskDotClass = (score: number) => {
  if (score >= 75) return "bg-risk-high";
  if (score >= 50) return "bg-risk-medium";
  return "bg-risk-low";
};

const riskLabel = (score: number) => {
  if (score >= 75) return "High";
  if (score >= 50) return "Medium";
  return "Low";
};

interface Props {
  selected: InfrastructureItem | null;
  onSelect: (item: InfrastructureItem) => void;
  focusMode?: boolean;
  onToggleFocus?: () => void;
}

const InfrastructureMap = ({ selected, onSelect, focusMode = false, onToggleFocus }: Props) => {
  const activeItem = selected || infrastructureList[0];
  const lastUpdated = useMemo(() => getRandomLastUpdated(), [activeItem.id]);

  // Construct Google Maps embed URL
  const embedUrl = `https://maps.google.com/maps?q=${activeItem.lat},${activeItem.lng}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className={`dashboard-card overflow-hidden p-0 transition-all duration-300 ${focusMode ? "fixed inset-0 z-50 rounded-none" : ""}`}>
      <div className="flex items-center justify-between px-5 pb-3 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Infrastructure Map</h2>
          <span className="text-xs text-muted-foreground">-</span>
          <span className="h-2 w-2 rounded-full bg-risk-low animate-pulse" />
          <span className="font-mono text-xs text-muted-foreground">Live Monitoring</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-[10px] text-muted-foreground">Updated {lastUpdated}</span>
        </div>

        <div className="flex items-center gap-2">
          {onToggleFocus && (
            <button
              onClick={onToggleFocus}
              className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card/90 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/20 hover:text-foreground"
            >
              {focusMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              {focusMode ? "Exit Focus" : "Focus Mode"}
            </button>
          )}
        </div>
      </div>

      <div className="relative" style={{ height: focusMode ? "calc(100vh - 52px)" : "70vh", minHeight: 500 }}>
        <iframe
          key={embedUrl}
          title={`Google map for ${activeItem.name}`}
          src={embedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
          style={{ borderRadius: focusMode ? "0" : "0 0 0.95rem 0.95rem" }}
        />

        <div className="absolute right-3 top-3 z-[1000] hidden w-80 max-h-[calc(100%-1.5rem)] overflow-hidden rounded-3xl border border-border bg-card/94 shadow-lg backdrop-blur-sm lg:flex lg:flex-col">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Tracked Assets</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{activeItem.name}</p>
          </div>
          <div className="space-y-2 overflow-y-auto p-3">
            {infrastructureList.map((item) => {
              const isActive = item.id === activeItem.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className={`w-full rounded-2xl border px-3 py-3 text-left transition-all ${
                    isActive
                      ? "border-primary/25 bg-background shadow-sm"
                      : "border-border/80 bg-background/75 hover:border-primary/20 hover:bg-background"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${riskDotClass(item.riskScore)} ${item.riskScore >= 75 ? "animate-pulse" : ""}`} />
                      <span className="truncate text-sm font-semibold text-foreground">{item.name}</span>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${riskBadgeClass(item.riskScore)}`}>
                      {riskLabel(item.riskScore)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.location}</p>
                </button>
              );
            })}
          </div>
          {(() => {
            const relatedWOs = getStoredWorkOrders().filter(
              (wo) => wo.infrastructureId === activeItem.id && wo.status !== "Completed",
            );
            if (relatedWOs.length === 0) return null;
            const STATUS_DOT: Record<string, string> = {
              Open: "bg-risk-medium",
              Assigned: "bg-primary",
              "In Progress": "bg-blue-500",
            };
            return (
              <div className="border-t border-border px-3 pt-3 pb-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <ClipboardList className="h-3 w-3 text-primary" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Work Orders ({relatedWOs.length})
                  </p>
                </div>
                <div className="space-y-1.5">
                  {relatedWOs.map((wo) => (
                    <div
                      key={wo.id}
                      className="rounded-xl border border-border/80 bg-background/75 px-2.5 py-2"
                    >
                      <div className="flex items-start gap-2">
                        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[wo.status] ?? "bg-muted-foreground"}`} />
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-medium text-foreground leading-snug">{wo.title}</p>
                          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{wo.status} · Due {wo.dueDate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default InfrastructureMap;