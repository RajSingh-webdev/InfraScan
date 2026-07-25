import { useState, useEffect, useCallback } from "react";
import { X, ClipboardList, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  type WorkOrder,
  type WorkOrderStatus,
  type WorkOrderPriority,
  type WorkOrderType,
  infrastructureList,
  TEAMS,
} from "@/data/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateId = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 900) + 100;
  return `WO-${year}-${rand}`;
};

const today = () => new Date().toISOString().split("T")[0];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkOrderFormValues {
  title: string;
  description: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  infrastructureId: string;
  assignedTeam: string;
  dueDate: string;
  estimatedCost: string; // kept as string for input control; parsed on save
}

interface Props {
  open: boolean;
  workOrder?: WorkOrder | null;   // null / undefined → create mode
  /** Pre-fill certain fields (e.g. when opened from Alerts page) */
  prefill?: {
    infrastructureId?: string;
    alertId?: number;
    title?: string;
    description?: string;
    priority?: WorkOrderPriority;
    type?: WorkOrderType;
  };
  onClose: () => void;
  onSave: (wo: WorkOrder) => void;
}

// ─── Blank form state ─────────────────────────────────────────────────────────

const blank = (): WorkOrderFormValues => ({
  title: "",
  description: "",
  type: "Inspection",
  status: "Open",
  priority: "Medium",
  infrastructureId: "",
  assignedTeam: "",
  dueDate: "",
  estimatedCost: "",
});

// ─── Field label helper ───────────────────────────────────────────────────────

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
    {children}{required && <span className="ml-0.5 text-risk-high">*</span>}
  </label>
);

const inputClass =
  "h-9 w-full rounded-xl border border-border bg-background/80 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all";

// ─── Component ────────────────────────────────────────────────────────────────

const WorkOrderDialog = ({ open, workOrder, prefill, onClose, onSave }: Props) => {
  const [form, setForm] = useState<WorkOrderFormValues>(blank());
  const [initialForm, setInitialForm] = useState<WorkOrderFormValues>(blank());
  const [errors, setErrors] = useState<Partial<Record<keyof WorkOrderFormValues, string>>>({});
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const isEdit = !!workOrder;

  // Sync form whenever dialog opens / workOrder changes
  useEffect(() => {
    if (!open) return;
    let initial: WorkOrderFormValues;
    if (workOrder) {
      initial = {
        title: workOrder.title,
        description: workOrder.description,
        type: workOrder.type,
        status: workOrder.status,
        priority: workOrder.priority,
        infrastructureId: workOrder.infrastructureId,
        assignedTeam: workOrder.assignedTeam,
        dueDate: workOrder.dueDate,
        estimatedCost: String(workOrder.estimatedCost),
      };
    } else {
      initial = blank();
      if (prefill) {
        if (prefill.infrastructureId) initial.infrastructureId = prefill.infrastructureId;
        if (prefill.description) initial.description = prefill.description;
        if (prefill.title) initial.title = prefill.title;
        if (prefill.priority) initial.priority = prefill.priority;
        if (prefill.type) initial.type = prefill.type;
      }
    }
    setForm(initial);
    setInitialForm(initial);
    setErrors({});
    setShowDiscardConfirm(false);
  }, [open, workOrder, prefill]);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  const requestClose = useCallback(() => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  // Handle Escape key listener for unsaved changes protection
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showDiscardConfirm) {
          setShowDiscardConfirm(false);
        } else {
          requestClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, showDiscardConfirm, requestClose]);

  if (!open) return null;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const set = (key: keyof WorkOrderFormValues, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.infrastructureId) e.infrastructureId = "Asset is required";
    if (!form.assignedTeam) e.assignedTeam = "Team is required";
    if (!form.dueDate) e.dueDate = "Due date is required";
    if (!form.estimatedCost || isNaN(Number(form.estimatedCost)) || Number(form.estimatedCost) < 0)
      e.estimatedCost = "Enter a valid cost (₹ Lakhs)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const saved: WorkOrder = {
      id: workOrder?.id ?? generateId(),
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      status: form.status,
      priority: form.priority,
      infrastructureId: form.infrastructureId,
      alertId: workOrder?.alertId ?? prefill?.alertId,
      assignedTeam: form.assignedTeam,
      dueDate: form.dueDate,
      createdAt: workOrder?.createdAt ?? today(),
      estimatedCost: parseFloat(form.estimatedCost),
    };
    onSave(saved);

    // Alert suppression feedback toast when creating a work order from an alert or prefill
    if (!isEdit || prefill?.alertId !== undefined) {
      toast.success("Work Order Created", {
        description: "A work order has been created for this asset. The alert will remain hidden while the work order is active.",
      });
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/25 backdrop-blur-sm transition-opacity animate-in fade-in-0 duration-200"
        onClick={requestClose}
      />

      {/* Discard Confirmation Dialog */}
      {showDiscardConfirm && (
        <div className="relative z-20 w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex items-center gap-3 mb-2 text-risk-high">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <h3 className="text-sm font-bold text-foreground">Discard changes?</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
            You have unsaved changes that will be lost.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowDiscardConfirm(false)}
              className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/60 transition-all active:scale-[0.98]"
            >
              Continue Editing
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDiscardConfirm(false);
                onClose();
              }}
              className="rounded-full bg-risk-high px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-risk-high/90 transition-all active:scale-[0.98]"
            >
              Discard Changes
            </button>
          </div>
        </div>
      )}

      {/* Main Dialog panel */}
      {!showDiscardConfirm && (
        <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 ease-out">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border px-6 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <ClipboardList className="h-4.5 w-4.5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-foreground">
                {isEdit ? "Edit Work Order" : "Create Work Order"}
              </h2>
              {isEdit && (
                <p className="font-mono text-[10px] text-muted-foreground">{workOrder!.id}</p>
              )}
            </div>
            <button
              onClick={requestClose}
              className="ml-auto rounded-full border border-border p-1.5 text-muted-foreground transition-all hover:border-risk-high/30 hover:text-risk-high"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="max-h-[72vh] overflow-y-auto">
          <div className="space-y-4 px-6 py-5">

            {/* Title */}
            <div>
              <FieldLabel required>Title</FieldLabel>
              <input
                className={inputClass}
                placeholder="Short descriptive title…"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
              {errors.title && <p className="mt-1 text-[11px] text-risk-high">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-border bg-background/80 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                placeholder="Detailed scope of work…"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>

            {/* Type + Priority — 2 col */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Type</FieldLabel>
                <Select value={form.type} onValueChange={(v) => set("type", v as WorkOrderType)}>
                  <SelectTrigger className="h-9 w-full rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inspection">🔍 Inspection</SelectItem>
                    <SelectItem value="Preventive Maintenance">🔧 Preventive Maintenance</SelectItem>
                    <SelectItem value="Emergency Repair">⚡ Emergency Repair</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <FieldLabel required>Priority</FieldLabel>
                <Select value={form.priority} onValueChange={(v) => set("priority", v as WorkOrderPriority)}>
                  <SelectTrigger className="h-9 w-full rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">🔴 Critical</SelectItem>
                    <SelectItem value="High">🟠 High</SelectItem>
                    <SelectItem value="Medium">🟡 Medium</SelectItem>
                    <SelectItem value="Low">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status (edit mode only) */}
            {isEdit && (
              <div>
                <FieldLabel>Status</FieldLabel>
                <Select value={form.status} onValueChange={(v) => set("status", v as WorkOrderStatus)}>
                  <SelectTrigger className="h-9 w-full rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Assigned">Assigned</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Asset */}
            <div>
              <FieldLabel required>Associated Asset</FieldLabel>
              <Select value={form.infrastructureId} onValueChange={(v) => set("infrastructureId", v)}>
                <SelectTrigger className="h-9 w-full rounded-xl text-xs">
                  <SelectValue placeholder="Select asset…" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {infrastructureList.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name} — {i.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.infrastructureId && (
                <p className="mt-1 text-[11px] text-risk-high">{errors.infrastructureId}</p>
              )}
            </div>

            {/* Assigned Team */}
            <div>
              <FieldLabel required>Assigned Team</FieldLabel>
              <Select value={form.assignedTeam} onValueChange={(v) => set("assignedTeam", v)}>
                <SelectTrigger className="h-9 w-full rounded-xl text-xs">
                  <SelectValue placeholder="Select team…" />
                </SelectTrigger>
                <SelectContent>
                  {TEAMS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assignedTeam && (
                <p className="mt-1 text-[11px] text-risk-high">{errors.assignedTeam}</p>
              )}
            </div>

            {/* Due Date + Est. Cost — 2 col */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Due Date</FieldLabel>
                <input
                  type="date"
                  className={inputClass}
                  value={form.dueDate}
                  onChange={(e) => set("dueDate", e.target.value)}
                />
                {errors.dueDate && (
                  <p className="mt-1 text-[11px] text-risk-high">{errors.dueDate}</p>
                )}
              </div>

              <div>
                <FieldLabel required>Est. Cost (₹ Lakhs)</FieldLabel>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClass}
                  placeholder="e.g. 25.5"
                  value={form.estimatedCost}
                  onChange={(e) => set("estimatedCost", e.target.value)}
                />
                {errors.estimatedCost && (
                  <p className="mt-1 text-[11px] text-risk-high">{errors.estimatedCost}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={requestClose}
              className="rounded-full border border-border px-5 py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-secondary/60 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary/20 hover:border-primary/50 active:scale-[0.98]"
            >
              {isEdit ? "Save Changes" : "Create Work Order"}
            </button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
};

export default WorkOrderDialog;
