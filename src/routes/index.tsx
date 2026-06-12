import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PathForge — Plan your career, CV and dream home after GCSEs" },
      {
        name: "description",
        content:
          "PathForge helps UK students at the end of their GCSEs build a clear plan for their dream job, CV, college or uni route, dream home and finances — with personalised AI chat.",
      },
      { property: "og:title", content: "PathForge — From GCSE to dream job & dream home" },
      {
        property: "og:description",
        content:
          "Personalised AI plans, CV builder with PDF export, college/uni finder, dream-house designer, peer tutoring and a finance adviser — built for UK students.",
      },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <img src={logo} alt="" className="h-9 w-9" width={36} height={36} />
          <span className="font-display text-xl font-semibold tracking-tight">PathForge</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <Button asChild variant="hero" size="sm">
            <a href="#early">Get early access</a>
          </Button>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="grid items-center gap-10 py-10 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-brand">
              For UK Year 11 leavers
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">
              From your <span className="text-gradient-brand">GCSEs</span> to your dream job — and
              dream home.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              PathForge turns your subjects, predicted grades and ambitions into a real plan:
              a personalised career strategy, a UK-style CV you can export as PDF, a dream-house
              designer, a finance adviser to keep debt low, a free peer-tutoring board and a
              college / uni finder. Every tool has its own AI chat.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button variant="hero" size="xl" asChild>
                <a href="#early">Start building your plan</a>
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
            Your plan is being forged
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base opacity-90">
            PathForge is being built live. The backend, design system, AI gateway and database
            (profiles, GCSEs, career, house, CV, AI plans, chat threads, tutoring, finance) are
            wired up. The sign-up flow, onboarding wizard, dashboard, AI plan, CV+PDF export,
            house designer, finance adviser, tutoring board and college/uni finder pages are
            being built in the next iteration.
          </p>
          <p className="mt-4 text-sm opacity-80">
            Reply in chat with “continue” and I'll keep going.
          </p>
        </section>

        <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} PathForge · Built for UK GCSE leavers
        </footer>
      </main>
    </div>
  );
}

const FEATURES = [
  {
    emoji: "🎯",
    title: "Best-applicant plan",
    body: "AI strategist turns your GCSEs, target job and company into a 12-month action plan.",
  },
  {
    emoji: "📄",
    title: "CV builder + PDF",
    body: "Draft a UK-style CV with AI, edit it in a dedicated chatbot, export to PDF.",
  },
  {
    emoji: "🏠",
    title: "Dream house designer",
    body: "Pick renovate or redecorate, get a costed £ plan for the home you want.",
  },
  {
    emoji: "💷",
    title: "Finance adviser",
    body: "Save toward the deposit, factor in tuition, part-time work and graduate pay.",
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
];
