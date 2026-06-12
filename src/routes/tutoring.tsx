import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTutoringPosts, createTutoringPost } from "@/lib/data.functions";
import { requireAuth } from "@/lib/auth-route";
import { toast } from "sonner";

export const Route = createFileRoute("/tutoring")({
  ssr: false,
  beforeLoad: requireAuth,
  component: TutoringPage,
});

interface Post {
  id: string;
  type: "offer" | "request";
  subject: string;
  level: string | null;
  body: string;
  contact: string | null;
  author_name: string | null;
  created_at: string;
}

function TutoringPage() {
  const fetchPosts = useServerFn(getTutoringPosts);
  const create = useServerFn(createTutoringPost);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["tutoring"], queryFn: () => fetchPosts({}) });

  const [type, setType] = useState<"offer" | "request">("offer");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [body, setBody] = useState("");
  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body) return;
    setBusy(true);
    try {
      await create({
        data: {
          type,
          subject,
          level: level || undefined,
          body,
          contact: contact || undefined,
          author_name: name || undefined,
        },
      });
      setSubject(""); setLevel(""); setBody(""); setContact(""); setName("");
      qc.invalidateQueries({ queryKey: ["tutoring"] });
      toast.success("Posted");
    } catch {
      toast.error("Could not post");
    } finally {
      setBusy(false);
    }
  };

  const posts = (data?.posts ?? []) as Post[];

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Peer Tutoring</h1>
          <p className="text-sm text-muted-foreground">Offer help or ask for help — free between students.</p>
        </div>

        <form onSubmit={submit} className="surface-card grid gap-3 p-6 sm:grid-cols-2">
          <div>
            <Label>I want to…</Label>
            <div className="mt-1 flex gap-2">
              <Button type="button" size="sm" variant={type === "offer" ? "default" : "outline"} onClick={() => setType("offer")}>Offer help</Button>
              <Button type="button" size="sm" variant={type === "request" ? "default" : "outline"} onClick={() => setType("request")}>Ask for help</Button>
            </div>
          </div>
          <div>
            <Label>Your name (optional)</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Maths" required />
          </div>
          <div>
            <Label>Level</Label>
            <Input value={level} onChange={(e) => setLevel(e.target.value)} placeholder="GCSE / A-level" />
          </div>
          <div className="sm:col-span-2">
            <Label>Details</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} required />
          </div>
          <div className="sm:col-span-2">
            <Label>Contact (email / Discord)</Label>
            <Input value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy}>Post</Button>
          </div>
        </form>

        <div className="space-y-3">
          {posts.length === 0 && (
            <div className="surface-card p-6 text-sm text-muted-foreground">No posts yet — be the first.</div>
          )}
          {posts.map((p) => (
            <div key={p.id} className="surface-card p-5">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${p.type === "offer" ? "bg-primary/10 text-primary" : "bg-secondary"}`}>
                  {p.type === "offer" ? "Offering" : "Requesting"}
                </span>
                <span className="font-medium">{p.subject}</span>
                {p.level && <span className="text-xs text-muted-foreground">· {p.level}</span>}
              </div>
              <p className="mt-2 text-sm whitespace-pre-wrap">{p.body}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{p.author_name ?? "Anonymous"}</span>
                {p.contact && <span>Contact: {p.contact}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
