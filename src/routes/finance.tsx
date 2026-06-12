import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Chat } from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageResponse } from "@/components/ai-elements/message";
import {
  getFinanceSnapshot,
  saveFinanceSnapshot,
  getAiPlan,
  getProfile,
} from "@/lib/data.functions";
import { generateAndSavePlan } from "@/lib/ai.functions";
import { requireAuth } from "@/lib/auth-route";
import { toast } from "sonner";

export const Route = createFileRoute("/finance")({
  ssr: false,
  beforeLoad: requireAuth,
  component: FinancePage,
});

function FinancePage() {
  const fetchSnap = useServerFn(getFinanceSnapshot);
  const saveSnap = useServerFn(saveFinanceSnapshot);
  const fetchAi = useServerFn(getAiPlan);
  const fetchProfile = useServerFn(getProfile);
  const gen = useServerFn(generateAndSavePlan);
  const qc = useQueryClient();

  const { data: snapData } = useQuery({ queryKey: ["financeSnap"], queryFn: () => fetchSnap({}) });
  const { data: aiData } = useQuery({
    queryKey: ["plan", "finance"],
    queryFn: () => fetchAi({ data: { kind: "finance" } }),
  });
  const { data: profileData } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile({}) });

  const [target, setTarget] = useState("");
  const [year, setYear] = useState("");
  const [monthly, setMonthly] = useState("");
  const [debt, setDebt] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const s = snapData?.snapshot;
    if (!s) return;
    setTarget(s.target_house_cost?.toString() ?? "");
    setYear(s.target_year?.toString() ?? "");
    setMonthly(s.monthly_save?.toString() ?? "");
    setDebt(s.debt_estimate?.toString() ?? "");
  }, [snapData]);

  const profile = profileData?.profile;
  const ptHours = Number(profile?.part_time_hours_week ?? 0);
  const ptWage = Number(profile?.part_time_wage_hourly ?? 0);
  const weeklyIncome = ptHours * ptWage;
  const monthlyIncome = weeklyIncome * 4.33;

  const onSave = async () => {
    setBusy(true);
    try {
      await saveSnap({
        data: {
          target_house_cost: target ? Number(target) : undefined,
          target_year: year ? Number(year) : undefined,
          monthly_save: monthly ? Number(monthly) : undefined,
          debt_estimate: debt ? Number(debt) : undefined,
        },
      });
      qc.invalidateQueries({ queryKey: ["financeSnap"] });
      toast.success("Saved");
    } finally {
      setBusy(false);
    }
  };

  const onGenerate = async () => {
    setBusy(true);
    try {
      await gen({ data: { kind: "finance" } });
      qc.invalidateQueries({ queryKey: ["plan", "finance"] });
      toast.success("Plan generated");
    } catch {
      toast.error("Could not generate");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Finance</h1>
          <p className="text-sm text-muted-foreground">Savings, tuition and the road to your deposit.</p>
        </div>

        <div className="surface-card grid gap-4 p-6 sm:grid-cols-3">
          <Stat label="Part-time income / month" value={`£${monthlyIncome.toFixed(0)}`} />
          <Stat label="Deposit target" value={target ? `£${Number(target).toLocaleString()}` : "—"} />
          <Stat label="Monthly save target" value={monthly ? `£${monthly}` : "—"} />
        </div>

        <div className="surface-card space-y-4 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Target house cost (£)</Label>
              <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="250000" />
            </div>
            <div>
              <Label>Target year</Label>
              <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2035" />
            </div>
            <div>
              <Label>Planned monthly save (£)</Label>
              <Input type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
            </div>
            <div>
              <Label>Estimated tuition debt (£)</Label>
              <Input type="number" value={debt} onChange={(e) => setDebt(e.target.value)} placeholder="60000" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onSave} disabled={busy}>Save</Button>
            <Button variant="outline" onClick={onGenerate} disabled={busy}>
              {aiData?.content ? "Regenerate plan" : "Generate finance plan"}
            </Button>
          </div>
        </div>

        {aiData?.content && (
          <div className="surface-card p-6">
            <MessageResponse>{aiData.content}</MessageResponse>
          </div>
        )}

        <div>
          <h2 className="mb-3 font-display text-lg font-semibold">Finance chat</h2>
          <Chat tool="finance" placeholder="Ask about saving, tuition, mortgages…" />
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
    </div>
  );
}
