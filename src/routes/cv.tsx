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
import { getCv, saveCv, getAiPlan } from "@/lib/data.functions";
import { generateAndSavePlan } from "@/lib/ai.functions";
import { requireAuth } from "@/lib/auth-route";
import { toast } from "sonner";

export const Route = createFileRoute("/cv")({
  ssr: false,
  beforeLoad: requireAuth,
  component: CvPage,
});

interface CvContent {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  profile?: string;
  education?: string;
  skills?: string;
  experience?: string;
  projects?: string;
  interests?: string;
}

function CvPage() {
  const fetchCv = useServerFn(getCv);
  const save = useServerFn(saveCv);
  const fetchAi = useServerFn(getAiPlan);
  const gen = useServerFn(generateAndSavePlan);
  const qc = useQueryClient();

  const { data: cvData } = useQuery({ queryKey: ["cv"], queryFn: () => fetchCv({}) });
  const { data: aiData } = useQuery({
    queryKey: ["plan", "cv"],
    queryFn: () => fetchAi({ data: { kind: "cv" } }),
  });

  const [cv, setCv] = useState<CvContent>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (cvData?.cv?.content_json) setCv(cvData.cv.content_json as CvContent);
  }, [cvData]);

  const update = (k: keyof CvContent) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setCv((c) => ({ ...c, [k]: e.target.value }));

  const onSave = async () => {
    setBusy(true);
    try {
      await save({ data: { content_json: cv as Record<string, unknown> } });
      qc.invalidateQueries({ queryKey: ["cv"] });
      toast.success("CV saved");
    } finally {
      setBusy(false);
    }
  };

  const onAiDraft = async () => {
    setBusy(true);
    try {
      await gen({ data: { kind: "cv" } });
      qc.invalidateQueries({ queryKey: ["plan", "cv"] });
      toast.success("AI draft ready below — copy into the editor.");
    } catch {
      toast.error("Could not generate");
    } finally {
      setBusy(false);
    }
  };

  const exportPdf = async () => {
    setBusy(true);
    try {
      const { pdf, Document, Page, Text, View, StyleSheet } = await import("@react-pdf/renderer");
      const styles = StyleSheet.create({
        page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#111" },
        name: { fontSize: 22, fontWeight: 700, marginBottom: 2 },
        contact: { fontSize: 10, color: "#555", marginBottom: 14 },
        h2: { fontSize: 13, fontWeight: 700, marginTop: 12, marginBottom: 4, borderBottom: "1px solid #ccc", paddingBottom: 2 },
        p: { marginBottom: 4, lineHeight: 1.4 },
      });
      const Doc = (
        <Document>
          <Page size="A4" style={styles.page}>
            <Text style={styles.name}>{cv.name || "Your Name"}</Text>
            <Text style={styles.contact}>
              {[cv.email, cv.phone, cv.location].filter(Boolean).join("  •  ")}
            </Text>
            {cv.profile && (<><Text style={styles.h2}>Profile</Text><Text style={styles.p}>{cv.profile}</Text></>)}
            {cv.education && (<><Text style={styles.h2}>Education</Text><Text style={styles.p}>{cv.education}</Text></>)}
            {cv.skills && (<><Text style={styles.h2}>Skills</Text><Text style={styles.p}>{cv.skills}</Text></>)}
            {cv.experience && (<><Text style={styles.h2}>Experience</Text><Text style={styles.p}>{cv.experience}</Text></>)}
            {cv.projects && (<><Text style={styles.h2}>Projects & Achievements</Text><Text style={styles.p}>{cv.projects}</Text></>)}
            {cv.interests && (<><Text style={styles.h2}>Interests</Text><Text style={styles.p}>{cv.interests}</Text></>)}
          </Page>
        </Document>
      );
      const blob = await pdf(Doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(cv.name || "cv").replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error("PDF export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold">CV Builder</h1>
            <p className="text-sm text-muted-foreground">UK-style CV. Save, refine with AI, export to PDF.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onAiDraft} disabled={busy}>AI draft</Button>
            <Button variant="outline" onClick={onSave} disabled={busy}>Save</Button>
            <Button onClick={exportPdf} disabled={busy}>Export PDF</Button>
          </div>
        </div>

        <div className="surface-card grid gap-3 p-6 sm:grid-cols-2">
          <div><Label>Name</Label><Input value={cv.name ?? ""} onChange={update("name")} /></div>
          <div><Label>Email</Label><Input value={cv.email ?? ""} onChange={update("email")} /></div>
          <div><Label>Phone</Label><Input value={cv.phone ?? ""} onChange={update("phone")} /></div>
          <div><Label>Location</Label><Input value={cv.location ?? ""} onChange={update("location")} /></div>
          <div className="sm:col-span-2"><Label>Profile</Label><Textarea rows={3} value={cv.profile ?? ""} onChange={update("profile")} /></div>
          <div className="sm:col-span-2"><Label>Education</Label><Textarea rows={3} value={cv.education ?? ""} onChange={update("education")} /></div>
          <div className="sm:col-span-2"><Label>Skills</Label><Textarea rows={2} value={cv.skills ?? ""} onChange={update("skills")} /></div>
          <div className="sm:col-span-2"><Label>Experience</Label><Textarea rows={4} value={cv.experience ?? ""} onChange={update("experience")} /></div>
          <div className="sm:col-span-2"><Label>Projects & Achievements</Label><Textarea rows={3} value={cv.projects ?? ""} onChange={update("projects")} /></div>
          <div className="sm:col-span-2"><Label>Interests</Label><Textarea rows={2} value={cv.interests ?? ""} onChange={update("interests")} /></div>
        </div>

        {aiData?.content && (
          <div className="surface-card p-6">
            <h3 className="mb-2 font-display font-semibold">AI draft</h3>
            <MessageResponse>{aiData.content}</MessageResponse>
          </div>
        )}

        <div>
          <h2 className="mb-3 font-display text-lg font-semibold">CV coach chat</h2>
          <Chat tool="cv" placeholder="Ask your CV coach to improve a section…" />
        </div>
      </div>
    </AppShell>
  );
}
