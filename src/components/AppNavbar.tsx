import { useLocation, useNavigate } from "react-router-dom";
import { Shield, Map, Bell, BarChart3, ClipboardList, Package, RotateCcw } from "lucide-react";
import { deriveAlerts, getStoredAssets } from "@/data/mockData";
import { cn } from "@/lib/utils";

const AppNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const alertsCount = deriveAlerts(getStoredAssets()).length;

  const navItems = [
    { label: "Dashboard", icon: Map, path: "/" },
    { label: "Alerts", icon: Bell, path: "/alerts", badge: alertsCount },
    { label: "Analytics", icon: BarChart3, path: "/analytics" },
    { label: "Work Orders", icon: ClipboardList, path: "/workorders" },
    { label: "Inventory", icon: Package, path: "/inventory" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <div className="mr-1 flex items-center gap-3 rounded-2xl border border-border/80 bg-card/90 px-3 py-2 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12">
            <Shield className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="leading-tight">
            <h1 className="font-mono text-sm font-semibold tracking-[0.14em] text-foreground">InfraScan</h1>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Infrastructure Risk Desk</p>
          </div>
        </div>

        <nav aria-label="Main Navigation" className="flex flex-1 items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-200",
                  "active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
                  isActive
                    ? "border-border bg-card text-foreground shadow-sm font-semibold"
                    : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-card/70 hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={cn(
                      "rounded-full border px-1.5 py-0.5 font-mono text-[10px] leading-none",
                      isActive
                        ? "border-primary/20 bg-primary/10 text-primary font-bold"
                        : "border-risk-high/30 bg-risk-high/10 text-risk-high font-bold"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => {
            const ok = window.confirm(
              "Are you sure you want to reset all demo data? This will clear all Local Storage changes for assets and work orders and restore the original mock dataset."
            );
            if (ok) {
              localStorage.removeItem("infrascan_assets");
              localStorage.removeItem("infrascan_work_orders");
              window.location.reload();
            }
          }}
          className="shrink-0 flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-risk-high hover:border-risk-high/40 hover:bg-risk-high/10 transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-risk-high/40 focus-visible:outline-none ml-2"
          title="Reset Demo Data"
          aria-label="Reset Demo Data to default state"
        >
          <RotateCcw className="h-3.5 w-3.5 font-bold" />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>
      </div>
    </header>
  );
};

export default AppNavbar;
