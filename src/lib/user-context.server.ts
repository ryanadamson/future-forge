/* Server-only helpers that fetch the user's onboarding context for AI prompts. */
import type { SupabaseClient } from "@supabase/supabase-js";

export interface UserContext {
  profile: Record<string, unknown> | null;
  gcses: Array<{ subject: string; predicted_grade: string }>;
  career: Record<string, unknown> | null;
  house: Record<string, unknown> | null;
  finance: Record<string, unknown> | null;
}

export async function loadUserContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserContext> {
  const sb = supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (k: string, v: string) => {
          maybeSingle?: () => Promise<{ data: unknown }>;
          order?: (c: string) => Promise<{ data: unknown }>;
        };
      };
    };
  };
  const [profile, gcses, career, house, finance] = await Promise.all([
    sb.from("profiles").select("*").eq("id", userId).maybeSingle!(),
    sb.from("gcse_subjects").select("subject,predicted_grade").eq("user_id", userId).order!("subject"),
    sb.from("career_goals").select("*").eq("user_id", userId).maybeSingle!(),
    sb.from("house_plans").select("*").eq("user_id", userId).maybeSingle!(),
    sb.from("finance_snapshots").select("*").eq("user_id", userId).maybeSingle!(),
  ]);
  return {
    profile: (profile.data as Record<string, unknown>) ?? null,
    gcses: (gcses.data as Array<{ subject: string; predicted_grade: string }>) ?? [],
    career: (career.data as Record<string, unknown>) ?? null,
    house: (house.data as Record<string, unknown>) ?? null,
    finance: (finance.data as Record<string, unknown>) ?? null,
  };
}

export function contextToPromptBlock(ctx: UserContext): string {
  return `User profile JSON:\n${JSON.stringify(ctx, null, 2)}`;
}

export const TOOL_SYSTEM_PROMPTS: Record<string, string> = {
  plan:
    "You are PathForge's career strategist for a UK student at the end of GCSEs. Build a sharp, encouraging action plan to become the best possible applicant for their target job and company. Cover: subjects to push, A-level / BTEC / T-level / apprenticeship route, skills, portfolio, work-experience moves, networking, and 1/3/6/12-month milestones. Use clear markdown.",
  cv:
    "You are PathForge's CV coach for a UK student. Help draft and refine a professional CV in UK style (no photo, no DOB, no marital status). Be specific, action-verb led, and quantify achievements when possible. Output edited CV sections as JSON when asked, otherwise markdown.",
  house:
    "You are PathForge's home planning assistant. Estimate realistic UK costs in £ for renovation or redecoration projects, broken down by room and category. Be honest about ranges and assumptions.",
  finance:
    "You are PathForge's personal financial adviser for a UK teenager. Build a realistic plan to save toward a dream home while minimising debt. Account for part-time income now, costs of 6th form / college / university (UK tuition fees ~£9,535/yr and maintenance), graduate salary ramp, deposit, and indicative mortgage maths in £. Be encouraging, transparent about assumptions, and never give regulated financial advice — always add a brief disclaimer.",
  education:
    "You are PathForge's UK college and university adviser. Ask sharp clarifying questions to understand subject area, vocational vs academic preference, and travel range from their current location. Then suggest realistic nearby colleges (A-level / BTEC / T-level providers) and named UK universities + courses that fit. Always tell users to verify on the official UCAS / college website.",
  accountant:
    "You are PathForge's friendly personal accountant for a UK Year 10 student. Give open-ended, conversational money advice on any decision the user brings — spending, saving, budgeting, part-time income, tax basics (income tax, NI, personal allowance), student finance, ISAs/LISAs, pocket money, big purchases. Do NOT ask for structured forms or numeric parameters; work with whatever detail the user shares and ask brief follow-up questions when truly needed. Show simple £ maths inline when it helps. Always add a one-line note that this is general information, not regulated financial advice.",
};
