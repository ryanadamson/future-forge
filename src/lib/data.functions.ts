import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Profile
export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle();
    return { profile: data };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      full_name: z.string().optional(),
      current_location: z.string().optional(),
      dream_location: z.string().optional(),
      part_time_hours_week: z.number().optional(),
      part_time_wage_hourly: z.number().optional(),
      onboarded: z.boolean().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await context.supabase.from("profiles").upsert({ id: context.userId, ...data, updated_at: new Date().toISOString() });
    return { ok: true };
  });

// GCSEs
export const getGcseSubjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("gcse_subjects").select("*").eq("user_id", context.userId).order("subject");
    return { subjects: data ?? [] };
  });

export const saveGcseSubjects = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.array(z.object({ subject: z.string().min(1), predicted_grade: z.string().min(1) })).parse(d),
  )
  .handler(async ({ data, context }) => {
    await context.supabase.from("gcse_subjects").delete().eq("user_id", context.userId);
    if (data.length > 0) {
      const rows = data.map((s) => ({ user_id: context.userId, subject: s.subject, predicted_grade: s.predicted_grade }));
      await context.supabase.from("gcse_subjects").insert(rows);
    }
    return { ok: true };
  });

// Career goals
export const getCareerGoal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("career_goals").select("*").eq("user_id", context.userId).maybeSingle();
    return { goal: data };
  });

export const saveCareerGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      job_title: z.string().optional(),
      company: z.string().optional(),
      job_description: z.string().optional(),
      job_link: z.string().optional(),
      posted_salary: z.string().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await context.supabase.from("career_goals").upsert({ user_id: context.userId, ...data, updated_at: new Date().toISOString() });
    return { ok: true };
  });

// House plan
export const getHousePlan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("house_plans").select("*").eq("user_id", context.userId).maybeSingle();
    return { plan: data };
  });

export const saveHousePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      mode: z.enum(["renovate", "redecorate"]).optional(),
      bedrooms: z.number().optional(),
      bathrooms: z.number().optional(),
      style: z.string().optional(),
      notes: z.string().optional(),
      est_cost: z.number().optional(),
      target_year: z.number().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await context.supabase.from("house_plans").upsert({ user_id: context.userId, ...data, updated_at: new Date().toISOString() });
    return { ok: true };
  });

// Finance snapshot
export const getFinanceSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("finance_snapshots").select("*").eq("user_id", context.userId).maybeSingle();
    return { snapshot: data };
  });

export const saveFinanceSnapshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      target_house_cost: z.number().optional(),
      target_year: z.number().optional(),
      monthly_save: z.number().optional(),
      debt_estimate: z.number().optional(),
      breakdown_json: z.record(z.any()).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await context.supabase.from("finance_snapshots").upsert({ user_id: context.userId, ...data, updated_at: new Date().toISOString() });
    return { ok: true };
  });

// AI plans
export const getAiPlan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ kind: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase.from("ai_plans").select("content_md").eq("user_id", context.userId).eq("kind", data.kind).maybeSingle();
    return { content: row?.content_md ?? null };
  });

// CV
export const getCv = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("cvs").select("*").eq("user_id", context.userId).maybeSingle();
    return { cv: data };
  });

export const saveCv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ content_json: z.record(z.any()) }).parse(d))
  .handler(async ({ data, context }) => {
    await context.supabase.from("cvs").upsert({ user_id: context.userId, content_json: data.content_json, updated_at: new Date().toISOString() });
    return { ok: true };
  });

// Chat threads
export const getThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("chat_threads").select("*").eq("user_id", context.userId).order("updated_at", { ascending: false });
    return { threads: data ?? [] };
  });

export const getThreadMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ threadId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows } = await context.supabase.from("chat_messages").select("*").eq("thread_id", data.threadId).eq("user_id", context.userId).order("created_at");
    return { messages: rows ?? [] };
  });

// Tutoring posts
export const getTutoringPosts = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("tutoring_posts").select("*").order("created_at", { ascending: false });
    return { posts: data ?? [] };
  });

export const createTutoringPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      type: z.enum(["offer", "request"]),
      subject: z.string().min(1),
      level: z.string().optional(),
      body: z.string().min(1),
      contact: z.string().optional(),
      author_name: z.string().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await context.supabase.from("tutoring_posts").insert({ user_id: context.userId, ...data });
    return { ok: true };
  });
