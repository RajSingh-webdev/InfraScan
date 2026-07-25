import { useState } from "react";
import { infrastructureList, type InfrastructureItem } from "@/data/mockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Database,
  Eye,
  Pencil,
  SearchX,
  Landmark,
  Compass,
  Droplets,
  Building2,
} from "lucide-react";

// ─── Props ────────────────────────────────────────────────────────────────────

interface InfrastructureTableProps {
  /** Override the list to display. Defaults to the full mock list. */
  items?: InfrastructureItem[];
  /** Called when the user clicks a row or the eye icon (inventory mode). */
  onView?: (item: InfrastructureItem) => void;
  /** Called when the user clicks the pencil icon (inventory mode). */
  onEdit?: (item: InfrastructureItem) => void;
  /** Show Age column + row action buttons. Default: false. */
  showActions?: boolean;
  /** Wrap the table in a collapsible accordion. Default: true. */
  isCollapsible?: boolean;
  /** Currently active sort column key. */
  sortColumn?: string;
  /** Current sort direction. */
  sortDir?: "asc" | "desc";
  /** Called with the column key when a sortable header is clicked. */
  onSort?: (col: string) => void;
  /** Called when the Reset Filters button is clicked in empty state. */
  onClearFilters?: () => void;
}

// ─── Static helpers ───────────────────────────────────────────────────────────

const statusColor: Record<string, string> = {
  Critical: "text-risk-high bg-risk-high/10 border-risk-high/30",
  Warning: "text-risk-medium bg-risk-medium/10 border-risk-medium/30",
  Moderate: "text-primary bg-primary/10 border-primary/30",
  Stable: "text-risk-low bg-risk-low/10 border-risk-low/30",
};

const scoreColor = (score: number) =>
  score >= 75
    ? "text-risk-high"
    : score >= 50
    ? "text-risk-medium"
    : "text-risk-low";

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

// ─── Component ────────────────────────────────────────────────────────────────

const InfrastructureTable = ({
  items,
  onView,
  onEdit,
  showActions = false,
  isCollapsible = true,
  sortColumn,
  sortDir,
  onSort,
  onClearFilters,
}: InfrastructureTableProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const displayItems = items ?? infrastructureList;

  // Inline render helper — not a component so no reconciliation issues
  const sortHeader = (col: string, label: string, rightAlign = false) => {
    const isActive = sortColumn === col;
    return (
      <button
        onClick={() => onSort?.(col)}
        className={`flex items-center gap-1 text-xs font-mono transition-colors active:scale-[0.98] focus-visible:ring-1 focus-visible:ring-primary/40 rounded px-1 py-0.5 ${
          rightAlign ? "ml-auto" : ""
        } ${isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}
      >
        {label}
        {isActive ? (
          sortDir === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    );
  };

  const plainHead = (label: string, right = false) => (
    <span
      className={`text-muted-foreground text-xs font-mono ${right ? "block text-right" : ""}`}
    >
      {label}
    </span>
  );

  // ── Table body (shared between collapsible and flat modes) ────────────────
  const tableContent = (
    <div className={`overflow-x-auto ${isCollapsible ? "mt-3" : ""}`}>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead>{plainHead("ID")}</TableHead>

            <TableHead>
              {onSort ? sortHeader("name", "Name") : plainHead("Name")}
            </TableHead>

            <TableHead>
              {onSort ? sortHeader("type", "Type") : plainHead("Type")}
            </TableHead>

            <TableHead>{plainHead("Location")}</TableHead>

            {showActions && (
              <TableHead>
                {onSort ? sortHeader("age", "Age") : plainHead("Age")}
              </TableHead>
            )}

            <TableHead>
              {onSort
                ? sortHeader("riskScore", "Risk Score", !showActions)
                : plainHead("Risk Score", !showActions)}
            </TableHead>

            <TableHead>
              {onSort
                ? sortHeader("status", "Status", !showActions)
                : plainHead("Status", !showActions)}
            </TableHead>

            {showActions && (
              <TableHead className="text-right text-muted-foreground text-xs font-mono">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {displayItems.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={showActions ? 8 : 6}
                className="py-16 text-center"
              >
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <SearchX className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    No assets match your current filters.
                  </p>
                  {onClearFilters && (
                    <button
                      onClick={onClearFilters}
                      className="text-xs font-medium text-primary hover:underline focus-visible:ring-1 focus-visible:ring-primary/40 rounded px-1.5 py-0.5"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            displayItems.map((item) => (
              <TableRow
                key={item.id}
                onClick={() => onView?.(item)}
                tabIndex={onView ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onView && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onView(item);
                  }
                }}
                className={`border-border/50 transition-colors hover:bg-secondary/40 focus-visible:bg-secondary/50 focus-visible:outline-none ${
                  onView ? "cursor-pointer" : ""
                }`}
              >
                <TableCell className="font-mono text-xs text-primary font-medium">
                  {item.id}
                </TableCell>

                <TableCell className="text-sm font-medium text-foreground">
                  {item.name}
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <TypeIcon type={item.type} />
                    {item.type}
                  </span>
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  {item.location}
                </TableCell>

                {showActions && (
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.age}
                  </TableCell>
                )}

                <TableCell className={showActions ? "" : "text-right"}>
                  <span
                    className={`font-mono font-semibold text-sm ${scoreColor(
                      item.riskScore,
                    )}`}
                  >
                    {item.riskScore}
                  </span>
                </TableCell>

                <TableCell className={showActions ? "" : "text-right"}>
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      statusColor[item.status] ?? ""
                    }`}
                  >
                    {item.status}
                  </span>
                </TableCell>

                {showActions && (
                  /* Actions cell */
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="View details"
                        aria-label={`View details for ${item.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onView?.(item);
                        }}
                        className="rounded-lg border border-border/70 bg-background/60 p-1.5 text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-[0.96] focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:outline-none"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        title="Edit asset"
                        aria-label={`Edit asset ${item.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(item);
                        }}
                        className="rounded-lg border border-border/70 bg-background/60 p-1.5 text-muted-foreground transition-all hover:border-risk-medium/40 hover:bg-risk-medium/10 hover:text-risk-medium active:scale-[0.96] focus-visible:ring-1 focus-visible:ring-risk-medium/40 focus-visible:outline-none"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  // ── Flat (non-collapsible) mode — used by InventoryPage ──────────────────
  if (!isCollapsible) {
    return (
      <div className="dashboard-card overflow-hidden">{tableContent}</div>
    );
  }

  // ── Collapsible accordion mode — used by Index page (unchanged) ───────────
  return (
    <div className="dashboard-card overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex w-full cursor-pointer select-none items-center gap-2 group">
          <Database className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Monitored Infrastructure
          </h2>
          <span className="font-mono text-xs text-muted-foreground">
            ({displayItems.length})
          </span>
          <ChevronDown
            className={`ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          {tableContent}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default InfrastructureTable;
