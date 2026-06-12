import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Chat } from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageResponse } from "@/components/ai-elements/message";
import { getHousePlan, saveHousePlan, getAiPlan } from "@/lib/data.functions";
import { generateAndSavePlan } from "@/lib/ai.functions";
import { requireAuth } from "@/lib/auth-route";
import { toast } from "sonner";

export const Route = createFileRoute("/house")({
  ssr: false,
  beforeLoad: requireAuth,
  component: HousePage,
});

function HousePage() {
  const fetchPlan = useServerFn(getHousePlan);
  const savePlan = useServerFn(saveHousePlan);
  const fetchAi = useServerFn(getAiPlan);
  const gen = useServerFn(generateAndSavePlan);
  const qc = useQueryClient();

  const { data: planData } = useQuery({ queryKey: ["housePlan"], queryFn: () => fetchPlan({}) });
  const { data: aiData } = useQuery({
    queryKey: ["plan", "house"],
    queryFn: () => fetchAi({ data: { kind: "house" } }),
  });

  const [mode, setMode] = useState<"renovate" | "redecorate">("renovate");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [style, setStyle] = useState("");
  const [notes, setNotes] = useState("");
  const [targetYear, setTargetYear] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const p = planData?.plan;
    if (!p) return;
    setMode((p.mode as "renovate" | "redecorate") ?? "renovate");
    setBedrooms(p.bedrooms?.toString() ?? "");
    setBathrooms(p.bathrooms?.toString() ?? "");
    setStyle(p.style ?? "");
    setNotes(p.notes ?? "");
    setTargetYear(p.target_year?.toString() ?? "");
  }, [planData]);

  const onSave = async () => {
    setBusy(true);
    try {
      await savePlan({
        data: {
          mode,
          bedrooms: bedrooms ? Number(bedrooms) : undefined,
          bathrooms: bathrooms ? Number(bathrooms) : undefined,
          style: style || undefined,
          notes: notes || undefined,
          target_year: targetYear ? Number(targetYear) : undefined,
        },
      });
      qc.invalidateQueries({ queryKey: ["housePlan"] });
      toast.success("Saved");
    } finally {
      setBusy(false);
    }
  };

  const onGenerate = async () => {
    setBusy(true);
    try {
      await gen({ data: { kind: "house" } });
      qc.invalidateQueries({ queryKey: ["plan", "house"] });
      toast.success("Cost breakdown generated");
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
          <h1 className="font-display text-2xl font-semibold">Dream House</h1>
          <p className="text-sm text-muted-foreground">Plan and cost your future home in £.</p>
        </div>
        <div className="surface-card space-y-4 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Plan</Label>
              <div className="mt-1 flex gap-2">
                <Button
                  type="button"
                  variant={mode === "renovate" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("renovate")}
                >
                  Renovate
                </Button>
                <Button
                  type="button"
                  variant={mode === "redecorate" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("redecorate")}
                >
                  Redecorate
                </Button>
              </div>
            </div>
            <div>
              <Label>Target year</Label>
              <Input type="number" value={targetYear} onChange={(e) => setTargetYear(e.target.value)} placeholder="2032" />
            </div>
            <div>
              <Label>Bedrooms</Label>
              <Input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
            </div>
            <div>
              <Label>Bathrooms</Label>
              <Input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Style</Label>
              <Input value={style} onChange={(e) => setStyle(e.target.value)} placeholder="e.g. modern, scandi, period" />
            </div>
            <div className="sm:col-span-2">
              <Label>Notes / wishlist</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onSave} disabled={busy}>Save</Button>
            <Button variant="outline" onClick={onGenerate} disabled={busy}>
              {aiData?.content ? "Regenerate cost breakdown" : "Generate cost breakdown"}
            </Button>
          </div>
        </div>
        {aiData?.content && (
          <div className="surface-card p-6">
            <MessageResponse>{aiData.content}</MessageResponse>
          </div>
        )}
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold">House chat</h2>
          <Chat tool="house" placeholder="Ask about costs, styles, timelines…" />
        </div>
      </div>
    </AppShell>
  );
}
