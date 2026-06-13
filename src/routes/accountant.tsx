import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Chat } from "@/components/Chat";
import { requireAuth } from "@/lib/auth-route";

export const Route = createFileRoute("/accountant")({
  ssr: false,
  beforeLoad: requireAuth,
  component: AccountantPage,
});

function AccountantPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Accountant</h1>
          <p className="text-sm text-muted-foreground">
            Open-ended money advice — no forms, no targets. Just ask anything about budgeting,
            saving, tax, student finance, part-time income, or everyday spending decisions.
          </p>
        </div>

        <div className="surface-card p-4">
          <p className="text-sm text-muted-foreground">
            Try: <span className="text-foreground">"Should I save my birthday money or buy new trainers?"</span>,{" "}
            <span className="text-foreground">"How does income tax work on a part-time job?"</span>, or{" "}
            <span className="text-foreground">"Is a Lifetime ISA worth it at my age?"</span>
          </p>
        </div>

        <Chat
          tool="accountant"
          placeholder="Ask your accountant anything about money…"
        />
      </div>
    </AppShell>
  );
}
