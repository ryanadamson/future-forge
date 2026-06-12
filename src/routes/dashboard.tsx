import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { getProfile } from "@/lib/data.functions";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: DashboardPage,
});

const TOOLS = [
  { to: "/plan", title: "Career Plan", emoji: "🎯", desc: "AI-generated action plan" },
  { to: "/cv", title: "CV Builder", emoji: "📄", desc: "Draft and export your CV" },
  { to: "/house", title: "Dream House", emoji: "🏠", desc: "Plan your future home" },
  { to: "/finance", title: "Finance", emoji: "💷", desc: "Savings & debt plan" },
  { to: "/education", title: "Education", emoji: "🎓", desc: "Colleges & universities" },
  { to: "/tutoring", title: "Tutoring", emoji: "🤝", desc: "Peer help board" },
] as const;

function DashboardPage() {
  const fetchProfile = useServerFn(getProfile);
  const navigate = useNavigate();
  const { data: profileData } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile({}) });
  const profile = profileData?.profile;

  useEffect(() => {
    if (profileData && !profile?.onboarded) {
      navigate({ to: "/onboarding" });
    }
  }, [profileData, profile, navigate]);


  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold">
            Welcome{profile?.full_name ? ", " + profile.full_name : ""}
          </h1>
          <p className="mt-1 text-muted-foreground">Pick a tool to build your future.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="surface-card group block p-5 transition-colors hover:border-primary/30"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{t.emoji}</span>
                <div>
                  <h3 className="font-display font-semibold group-hover:text-primary">{t.title}</h3>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
