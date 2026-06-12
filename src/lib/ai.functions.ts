import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "./ai-gateway.server";
import { TOOL_SYSTEM_PROMPTS, contextToPromptBlock, loadUserContext } from "./user-context.server";

function model() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(DEFAULT_MODEL);
}

const KindSchema = z.object({
  kind: z.enum(["plan", "cv", "house", "finance", "education"]),
});

export const generateAndSavePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => KindSchema.parse(d))
  .handler(async ({ data, context }) => {
    const ctx = await loadUserContext(context.supabase, context.userId);
    const system = TOOL_SYSTEM_PROMPTS[data.kind];
    const prompts: Record<string, string> = {
      plan: "Produce a personalised, actionable 'best-applicant' plan with clear sections: Headline strategy, Subjects & grades to focus on, Post-16 route recommendation, Skills to build (with free resources), Portfolio / proof, Work experience moves, Networking, Timeline (1m / 3m / 6m / 12m). Use markdown headings and short bullets.",
      cv: "Draft a strong starter UK CV in markdown for this student aimed at their target job. Sections: Profile, Education (with predicted GCSEs), Key skills, Experience (use a part-time-job placeholder if none), Projects/achievements, Interests. Keep concise and quantifiable.",
      house: "Produce a realistic UK cost breakdown in £ for the user's chosen home plan (renovate vs redecorate). Group by category (structural, kitchen, bathrooms, decoration, furnishings, contingency). Provide a single total range and assumptions.",
      finance: "Build a personalised savings & debt-minimising plan to reach the dream home. Include: monthly target now (from part-time job), education-cost projections (UK tuition + maintenance), graduate salary ramp, deposit target, indicative mortgage math, and a 1-line disclaimer that this is guidance, not regulated advice. Use markdown with a short numeric summary at the top.",
      education: "Suggest a starter shortlist of UK colleges near the user (A-level / BTEC / T-level providers) and named UK universities + courses matched to their career goal. For each, give a 1-2 line rationale. Add a 'Verify on UCAS or the college's official site' note at the end.",
    };
    const userPrompt = `${prompts[data.kind]}\n\n${contextToPromptBlock(ctx)}`;
    const { text } = await generateText({ model: model(), system, prompt: userPrompt });

    await (context.supabase as unknown as {
      from: (t: string) => { upsert: (v: unknown, o?: unknown) => Promise<{ error: unknown }> };
    })
      .from("ai_plans")
      .upsert(
        {
          user_id: context.userId,
          kind: data.kind,
          content_md: text,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,kind" },
      );

    return { content: text };
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ tool: z.string().min(1).max(40), title: z.string().min(1).max(120).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await (context.supabase as unknown as {
      from: (t: string) => {
        insert: (v: unknown) => {
          select: () => { single: () => Promise<{ data: { id: string } | null; error: unknown }> };
        };
      };
    })
      .from("chat_threads")
      .insert({
        user_id: context.userId,
        tool: data.tool,
        title: data.title ?? "New conversation",
      })
      .select()
      .single();
    if (error || !row) throw new Error("Could not create thread");
    return { id: row.id };
  });
