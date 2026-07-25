import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { type InfrastructureItem } from "@/data/mockData";
import { Save } from "lucide-react";

// ─── Data helpers ─────────────────────────────────────────────────────────────

const TYPE_PREFIX: Record<string, string> = {
  Bridge: "BR",
  Tunnel: "TN",
  Dam: "DM",
  Building: "BL",
};

function generateId(type: string): string {
  const prefix = TYPE_PREFIX[type] ?? "XX";
  // Use last 4 digits of timestamp for a simple unique suffix
  return `${prefix}-USR-${Date.now().toString().slice(-4)}`;
}

function generateGroundMovement(
  riskScore: number,
): InfrastructureItem["groundMovement"] {
  const years = ["2019", "2020", "2021", "2022", "2023", "2024", "2025"];
  const maxDisp = riskScore >= 75 ? 9.0 : riskScore >= 50 ? 4.5 : 1.8;
  const step = maxDisp / 6;
  let running = 0;
  return years.map((year) => {
    const inc = step * (0.6 + Math.random() * 0.8);
    running = Math.min(Math.round((running + inc) * 10) / 10, maxDisp);
    return { year, displacement: running };
  });
}

function generateRiskFactors(
  type: string,
  riskScore: number,
): InfrastructureItem["riskFactors"] {
  const v = (delta: number) =>
    Math.min(100, Math.max(0, Math.round(riskScore + delta)));

  switch (type) {
    case "Bridge":
      return [
        { factor: "Ground Movement", value: v(-12) },
        { factor: "Traffic Load", value: v(5) },
        { factor: "Rainfall Impact", value: v(-8) },
        { factor: "Temp Variation", value: v(-18) },
      ];
    case "Tunnel":
      return [
        { factor: "Ground Movement", value: v(-8) },
        { factor: "Rainfall Impact", value: v(-3) },
        { factor: "Traffic Load", value: v(-12) },
        { factor: "Geological Pressure", value: v(5) },
      ];
    case "Dam":
      return [
        { factor: "Reservoir Pressure", value: v(10) },
        { factor: "Rainfall Impact", value: v(-2) },
        { factor: "Ground Movement", value: v(-15) },
        { factor: "Structural Age", value: v(-5) },
      ];
    default: // Building
      return [
        { factor: "Ground Movement", value: v(-8) },
        { factor: "Rainfall Impact", value: v(-12) },
        { factor: "Temperature Stress", value: v(-18) },
        { factor: "Structural Age", value: v(-3) },
      ];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  type: string;
  location: string;
  lat: string;
  lng: string;
  age: string;
  riskScore: number;
  status: string;
  recommendedAction: string;
}

interface FormErrors {
  name?: string;
  location?: string;
  lat?: string;
  lng?: string;
  age?: string;
  status?: string;
  recommendedAction?: string;
}

const DEFAULT_FORM: FormState = {
  name: "",
  type: "Bridge",
  location: "",
  lat: "20.5937",
  lng: "78.9629",
  age: "",
  riskScore: 50,
  status: "Warning",
  recommendedAction: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface AssetFormSheetProps {
  open: boolean;
  /** null = Add mode, InfrastructureItem = Edit mode */
  asset: InfrastructureItem | null;
  onClose: () => void;
  onSave: (item: InfrastructureItem) => void;
}

const scoreColor = (score: number) =>
  score >= 75
    ? "text-risk-high"
    : score >= 50
    ? "text-risk-medium"
    : "text-risk-low";

const AssetFormSheet = ({ open, asset, onClose, onSave }: AssetFormSheetProps) => {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [initialForm, setInitialForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Reset the form whenever the sheet opens or switches between add/edit targets
  useEffect(() => {
    if (!open) return;
    let initial: FormState;
    if (asset) {
      initial = {
        name: asset.name,
        type: asset.type,
        location: asset.location,
        lat: String(asset.lat),
        lng: String(asset.lng),
        age: asset.age,
        riskScore: asset.riskScore,
        status: asset.status,
        recommendedAction: asset.recommendedAction,
      };
    } else {
      initial = DEFAULT_FORM;
    }
    setForm(initial);
    setInitialForm(initial);
    setErrors({});
    setShowDiscardConfirm(false);
  }, [open, asset]);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  const handleRequestClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((s) => ({ ...s, [field]: value }));

  // ── Validation ──────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Asset name is required.";
    if (!form.location.trim()) e.location = "Location is required.";
    const latN = parseFloat(form.lat);
    if (isNaN(latN) || latN < -90 || latN > 90)
      e.lat = "Latitude must be between –90 and 90.";
    const lngN = parseFloat(form.lng);
    if (isNaN(lngN) || lngN < -180 || lngN > 180)
      e.lng = "Longitude must be between –180 and 180.";
    if (!form.age.trim()) e.age = "Age is required (e.g. '12 years').";
    if (!form.status) e.status = "Status is required.";
    if (!form.recommendedAction.trim())
      e.recommendedAction = "Recommended action is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const riskScore = form.riskScore;
    const result: InfrastructureItem = {
      id: asset?.id ?? generateId(form.type),
      name: form.name.trim(),
      type: form.type as InfrastructureItem["type"],
      location: form.location.trim(),
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      age: form.age.trim(),
      riskScore,
      status: form.status,
      recommendedAction: form.recommendedAction.trim(),
      // Preserve existing time-series data in edit mode; generate fresh for new assets
      groundMovement:
        asset?.groundMovement ?? generateGroundMovement(riskScore),
      riskFactors: generateRiskFactors(form.type, riskScore),
    };

    onSave(result);
    toast.success(
      asset ? "Asset updated successfully." : "New asset added to inventory.",
    );
  };

  const isEdit = !!asset;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleRequestClose()}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        {showDiscardConfirm ? (
          <div className="py-12 text-center space-y-4">
            <h3 className="text-sm font-bold text-foreground">Discard changes?</h3>
            <p className="text-xs text-muted-foreground">
              You have unsaved changes that will be lost.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDiscardConfirm(false)}
              >
                Continue Editing
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  setShowDiscardConfirm(false);
                  onClose();
                }}
              >
                Discard Changes
              </Button>
            </div>
          </div>
        ) : (
          <>
            <SheetHeader className="mb-4">
              <SheetTitle>
                {isEdit ? "Edit Asset" : "Register New Asset"}
              </SheetTitle>
              <SheetDescription>
                {isEdit
                  ? "Update the details for this infrastructure asset."
                  : "Fill in the fields below to register a new asset in the inventory."}
              </SheetDescription>
            </SheetHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-6 pb-4">
          {/* ── Identity ── */}
          <section className="space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Identity
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="sf-name">Asset Name *</Label>
              <Input
                id="sf-name"
                placeholder="e.g. Chenab Rail Bridge"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
              {errors.name && (
                <p className="text-[11px] text-risk-high">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sf-type">Infrastructure Type *</Label>
              <Select
                value={form.type}
                onValueChange={(v) => set("type", v)}
              >
                <SelectTrigger id="sf-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bridge">🌉 Bridge</SelectItem>
                  <SelectItem value="Tunnel">🚇 Tunnel</SelectItem>
                  <SelectItem value="Dam">🏗 Dam</SelectItem>
                  <SelectItem value="Building">🏢 Building</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          <Separator />

          {/* ── Location ── */}
          <section className="space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Location
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="sf-location">Location Description *</Label>
              <Input
                id="sf-location"
                placeholder="e.g. Reasi, Jammu & Kashmir"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
              {errors.location && (
                <p className="text-[11px] text-risk-high">{errors.location}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sf-lat">Latitude *</Label>
                <Input
                  id="sf-lat"
                  type="number"
                  step="0.0001"
                  placeholder="20.5937"
                  value={form.lat}
                  onChange={(e) => set("lat", e.target.value)}
                />
                {errors.lat && (
                  <p className="text-[11px] text-risk-high">{errors.lat}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sf-lng">Longitude *</Label>
                <Input
                  id="sf-lng"
                  type="number"
                  step="0.0001"
                  placeholder="78.9629"
                  value={form.lng}
                  onChange={(e) => set("lng", e.target.value)}
                />
                {errors.lng && (
                  <p className="text-[11px] text-risk-high">{errors.lng}</p>
                )}
              </div>
            </div>
          </section>

          <Separator />

          {/* ── Risk & Status ── */}
          <section className="space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Risk &amp; Status
            </p>

            {/* Risk score slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Risk Score *</Label>
                <span
                  className={`font-mono text-sm font-bold ${scoreColor(
                    form.riskScore,
                  )}`}
                >
                  {form.riskScore} / 100
                </span>
              </div>
              <Slider
                value={[form.riskScore]}
                onValueChange={([v]) => set("riskScore", v)}
                min={0}
                max={100}
                step={1}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sf-status">Status *</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => set("status", v)}
                >
                  <SelectTrigger id="sf-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="Warning">Warning</SelectItem>
                    <SelectItem value="Stable">Stable</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-[11px] text-risk-high">{errors.status}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sf-age">Structural Age *</Label>
                <Input
                  id="sf-age"
                  placeholder="e.g. 25 years"
                  value={form.age}
                  onChange={(e) => set("age", e.target.value)}
                />
                {errors.age && (
                  <p className="text-[11px] text-risk-high">{errors.age}</p>
                )}
              </div>
            </div>
          </section>

          <Separator />

          {/* ── Recommended Action ── */}
          <section className="space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Recommended Action
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="sf-action">Action / Notes *</Label>
              <Textarea
                id="sf-action"
                rows={4}
                placeholder="Describe the recommended inspection or maintenance action…"
                value={form.recommendedAction}
                onChange={(e) => set("recommendedAction", e.target.value)}
              />
              {errors.recommendedAction && (
                <p className="text-[11px] text-risk-high">
                  {errors.recommendedAction}
                </p>
              )}
            </div>
          </section>

          {/* ── Footer ── */}
          <SheetFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleRequestClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2">
              <Save className="h-4 w-4" />
              {isEdit ? "Save Changes" : "Register Asset"}
            </Button>
          </SheetFooter>
        </form>
        </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default AssetFormSheet;
