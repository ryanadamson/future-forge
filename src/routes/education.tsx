import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Chat } from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { MessageResponse } from "@/components/ai-elements/message";
import { getAiPlan, getProfile } from "@/lib/data.functions";
import { generateAndSavePlan } from "@/lib/ai.functions";
import { requireAuth } from "@/lib/auth-route";
import { toast } from "sonner";

export const Route = createFileRoute("/education")({
  ssr: false,
  beforeLoad: requireAuth,
  component: EducationPage,
});

function EducationPage() {
  const fetchAi = useServerFn(getAiPlan);
  const fetchProfile = useServerFn(getProfile);
  const gen = useServerFn(generateAndSavePlan);
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["plan", "education"],
    queryFn: () => fetchAi({ data: { kind: "education" } }),
  });
  const { data: profileData } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile({}) });
  const [busy, setBusy] = useState(false);
  const loc = profileData?.profile?.current_location;

  const mapsQuery = encodeURIComponent(`colleges near ${loc ?? "UK"}`);
  const uniQuery = encodeURIComponent("UK universities");

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold">Education</h1>
            <p className="text-sm text-muted-foreground">Colleges nearby and UK university matches.</p>
          </div>
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await gen({ data: { kind: "education" } });
                qc.invalidateQueries({ queryKey: ["plan", "education"] });
                toast.success("Shortlist generated");
              } catch {
                toast.error("Could not generate");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Generating…" : data?.content ? "Regenerate shortlist" : "Generate shortlist"}
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <a
            className="surface-card p-5 hover:border-primary/30"
            href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
            target="_blank"
            rel="noreferrer"
          >
            <h3 className="font-display font-semibold">🏫 Find colleges nearby</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Opens Google Maps for colleges around <strong>{loc ?? "your area"}</strong>.
            </p>
          </a>
          <a
            className="surface-card p-5 hover:border-primary/30"
            href={`https://www.ucas.com/explore/search/all?query=${uniQuery}`}
            target="_blank"
            rel="noreferrer"
          >
            <h3 className="font-display font-semibold">🎓 Explore UK universities</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Search UCAS for courses that match your goal.
            </p>
          </a>
        </div>

        {data?.content && (
          <div className="surface-card p-6">
            <MessageResponse>{data.content}</MessageResponse>
          </div>
        )}

        <div>
          <h2 className="mb-3 font-display text-lg font-semibold">Education adviser chat</h2>
          <Chat tool="education" placeholder="Tell me what you'd like to study or do…" />
        </div>
      </div>
    </AppShell>
  );
}
