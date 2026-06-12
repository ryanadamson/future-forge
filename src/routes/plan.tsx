import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Chat } from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { MessageResponse } from "@/components/ai-elements/message";
import { getAiPlan } from "@/lib/data.functions";
import { generateAndSavePlan } from "@/lib/ai.functions";
import { requireAuth } from "@/lib/auth-route";
import { toast } from "sonner";

export const Route = createFileRoute("/plan")({
  ssr: false,
  beforeLoad: requireAuth,
  component: PlanPage,
});

function PlanPage() {
  const fetchPlan = useServerFn(getAiPlan);
  const gen = useServerFn(generateAndSavePlan);
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["plan", "plan"],
    queryFn: () => fetchPlan({ data: { kind: "plan" } }),
  });
  const [busy, setBusy] = useState(false);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold">Career Plan</h1>
            <p className="text-sm text-muted-foreground">Your personalised AI action plan.</p>
          </div>
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await gen({ data: { kind: "plan" } });
                qc.invalidateQueries({ queryKey: ["plan", "plan"] });
                toast.success("Plan generated");
              } catch {
                toast.error("Could not generate plan");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Generating…" : data?.content ? "Regenerate" : "Generate plan"}
          </Button>
        </div>
        {data?.content ? (
          <div className="surface-card prose prose-invert max-w-none p-6">
            <MessageResponse>{data.content}</MessageResponse>
          </div>
        ) : (
          <div className="surface-card p-6 text-sm text-muted-foreground">
            No plan yet. Click <strong>Generate plan</strong> to build one from your profile.
          </div>
        )}
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold">Coach chat</h2>
          <Chat tool="plan" placeholder="Ask your career coach…" />
        </div>
      </div>
    </AppShell>
  );
}
