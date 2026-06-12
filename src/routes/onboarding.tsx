import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { updateProfile, saveGcseSubjects, saveCareerGoal } from "@/lib/data.functions";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const saveProfile = useServerFn(updateProfile);
  const saveGcses = useServerFn(saveGcseSubjects);
  const saveCareer = useServerFn(saveCareerGoal);

  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [dreamLocation, setDreamLocation] = useState("");
  const [partTimeHours, setPartTimeHours] = useState("");
  const [partTimeWage, setPartTimeWage] = useState("");
  const [gcseList, setGcseList] = useState<{ subject: string; grade: string }[]>([
    { subject: "", grade: "" },
  ]);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [salary, setSalary] = useState("");
  const [jobDesc, setJobDesc] = useState("");

  const handleSubmit = async () => {
    try {
      await saveProfile({
        data: {
          full_name: fullName || undefined,
          current_location: currentLocation || undefined,
          dream_location: dreamLocation || undefined,
          part_time_hours_week: partTimeHours ? Number(partTimeHours) : undefined,
          part_time_wage_hourly: partTimeWage ? Number(partTimeWage) : undefined,
          onboarded: true,
        },
      });
      const gcses = gcseList.filter((g) => g.subject && g.grade);
      await saveGcses({ data: gcses.map((g) => ({ subject: g.subject, predicted_grade: g.grade })) });
      await saveCareer({
        data: {
          job_title: jobTitle || undefined,
          company: company || undefined,
          posted_salary: salary || undefined,
          job_description: jobDesc || undefined,
        },
      });
      toast.success("Profile saved!");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const steps = [
    <div key="profile" className="space-y-4">
      <h2 className="font-display text-xl font-semibold">About you</h2>
      <div className="space-y-2">
        <Label>Full name</Label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
      </div>
      <div className="space-y-2">
        <Label>Where do you live now?</Label>
        <Input value={currentLocation} onChange={(e) => setCurrentLocation(e.target.value)} placeholder="Town or city" />
      </div>
      <div className="space-y-2">
        <Label>Where do you want to live?</Label>
        <Input value={dreamLocation} onChange={(e) => setDreamLocation(e.target.value)} placeholder="Dream town or city" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Part-time hours / week</Label>
          <Input type="number" value={partTimeHours} onChange={(e) => setPartTimeHours(e.target.value)} placeholder="e.g. 8" />
        </div>
        <div className="space-y-2">
          <Label>Hourly wage (£)</Label>
          <Input type="number" value={partTimeWage} onChange={(e) => setPartTimeWage(e.target.value)} placeholder="e.g. 7.50" />
        </div>
      </div>
    </div>,
    <div key="gcses" className="space-y-4">
      <h2 className="font-display text-xl font-semibold">GCSE subjects & predicted grades</h2>
      {gcseList.map((g, i) => (
        <div key={i} className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Subject"
            value={g.subject}
            onChange={(e) => {
              const next = [...gcseList];
              next[i].subject = e.target.value;
              setGcseList(next);
            }}
          />
          <Input
            placeholder="Grade (e.g. 7, A*)"
            value={g.grade}
            onChange={(e) => {
              const next = [...gcseList];
              next[i].grade = e.target.value;
              setGcseList(next);
            }}
          />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => setGcseList([...gcseList, { subject: "", grade: "" }])}>
        + Add subject
      </Button>
    </div>,
    <div key="career" className="space-y-4">
      <h2 className="font-display text-xl font-semibold">Dream job</h2>
      <div className="space-y-2">
        <Label>Job title</Label>
        <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Software Engineer" />
      </div>
      <div className="space-y-2">
        <Label>Target company</Label>
        <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google UK" />
      </div>
      <div className="space-y-2">
        <Label>Posted salary (optional)</Label>
        <Input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g. £35,000" />
      </div>
      <div className="space-y-2">
        <Label>Job description or link</Label>
        <Input value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} placeholder="Brief description or URL" />
      </div>
    </div>,
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold">Let's build your plan</h1>
          <p className="text-sm text-muted-foreground">Step {step + 1} of {steps.length}</p>
        </div>
        {steps[step]}
        <div className="flex justify-between pt-2">
          {step > 0 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
          ) : (
            <div />
          )}
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>Next</Button>
          ) : (
            <Button onClick={handleSubmit}>Finish</Button>
          )}
        </div>
      </div>
    </div>
  );
}
