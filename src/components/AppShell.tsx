import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/plan", label: "Career Plan" },
  { to: "/cv", label: "CV" },
  { to: "/finance", label: "Finance" },
  { to: "/accountant", label: "Accountant" },
  { to: "/education", label: "Education" },
  { to: "/tutoring", label: "Tutoring" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-60 flex-col border-r border-border bg-surface md:flex">
        <div className="px-5 py-4">
          <Link to="/" className="font-display text-lg font-semibold tracking-tight">
            PathForge
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "bg-primary/10 text-primary font-medium" }}
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={async () => {
              await queryClient.cancelQueries();
              queryClient.clear();
              await supabase.auth.signOut();
              navigate({ to: "/auth", replace: true });
            }}
          >
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
          <Link to="/" className="font-display text-lg font-semibold">PathForge</Link>
          <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>Menu</Button>
        </header>
        {open && (
          <div className="border-b border-border bg-surface px-4 py-2 md:hidden space-y-1">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="block py-2 text-sm text-muted-foreground" onClick={() => setOpen(false)}>
                {n.label}
              </Link>
            ))}
            <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={async () => {
              await queryClient.cancelQueries();
              queryClient.clear();
              await supabase.auth.signOut();
              navigate({ to: "/auth", replace: true });
            }}>
              Sign out
            </Button>
          </div>
        )}
        <main className="mx-auto max-w-5xl p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
