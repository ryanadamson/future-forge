import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero.jpg";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PathForge — Plan your career & next steps in Year 10" },
      {
        name: "description",
        content:
          "PathForge helps UK Year 10 students turn their GCSE choices into a clear plan for their dream job, CV, college or uni route and finances — with personalised AI chat for every tool.",
      },
      { property: "og:title", content: "PathForge — From Year 10 to your dream career" },
      {
        property: "og:description",
        content:
          "Personalised AI plans, CV builder with PDF export, college and uni finder, finance adviser and peer tutoring — built for UK Year 10 students working toward GCSEs.",
      },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [session, setSession] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <img src={logo} alt="" className="h-9 w-9" width={36} height={36} />
          <span className="font-display text-xl font-semibold tracking-tight">PathForge</span>
        </div>
        <nav className="flex items-center gap-3">
          {session ? (
            <Button asChild variant="hero" size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
              <Button asChild variant="hero" size="sm">
                <Link to="/auth">Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </header>


      <main className="mx-auto max-w-6xl px-6">
        <section className="grid items-center gap-10 py-10 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-brand">
              For UK Year 10 students
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">
              From Year 10 to your <span className="text-gradient-brand">dream career</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              You're nearly through Year 10 — PathForge turns your subjects, predicted grades and
              ambitions into a real plan: a personalised career strategy, a UK-style CV you can
              export as PDF, a finance adviser to keep debt low, a free peer-tutoring board and a
              college / uni finder. Every tool has its own multi-thread AI chat.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth">Start building your plan</Link>
              </Button>
              <span className="text-sm text-muted-foreground">
                Free during early access · £ figures · UK education
              </span>
            </div>


          </div>
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-brand opacity-20 blur-2xl" />
            <img
              src={heroImg}
              alt="A student standing at the start of a winding path toward graduation, a key, a home and savings"
              width={1024}
              height={1024}
              className="rounded-3xl border border-border shadow-2xl shadow-primary/10"
            />
          </div>
        </section>

        <section id="features" className="grid gap-4 pb-16 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="surface-card p-6">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground">
                {f.emoji}
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>

        <section
          id="early"
          className="my-16 rounded-3xl bg-gradient-brand p-10 text-center text-primary-foreground shadow-xl"
        >
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Ready to forge your path?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base opacity-90">
            {session
              ? "Jump back in and keep building your plan."
              : "Create your free account and build a plan tailored to your GCSE subjects and dream job."}
          </p>
          <div className="mt-6">
            <Button asChild size="xl" variant="secondary">
              <Link to={session ? "/dashboard" : "/auth"}>
                {session ? "Go to Dashboard" : "Create your account"}
              </Link>
            </Button>
          </div>
        </section>


        <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} PathForge · Built for UK Year 10 students
        </footer>
      </main>
    </div>
  );
}

const FEATURES = [
  {
    emoji: "🎯",
    title: "Best-applicant plan",
    body: "AI strategist turns your subjects, target job and company into a 12-month action plan.",
  },
  {
    emoji: "📄",
    title: "CV builder + PDF",
    body: "Draft a UK-style CV with AI, refine it in a dedicated chatbot, export to PDF.",
  },
  {
    emoji: "💷",
    title: "Finance adviser",
    body: "Plan savings, factor in tuition, part-time work and graduate pay.",
  },
  {
    emoji: "🎓",
    title: "College & uni finder",
    body: "Answer a few questions, get nearby colleges and matched UK universities.",
  },
  {
    emoji: "🤝",
    title: "Free peer tutoring",
    body: "Offer or request help to push your grades — and your future job chances — higher.",
  },
  {
    emoji: "💬",
    title: "Multi-thread AI chat",
    body: "Each tool has its own chatbot with multiple saved conversations you can revisit.",
  },
];
