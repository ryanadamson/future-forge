import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";

import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "@/lib/ai-gateway.server";
import {
  TOOL_SYSTEM_PROMPTS,
  contextToPromptBlock,
  loadUserContext,
} from "@/lib/user-context.server";

type Body = {
  messages: UIMessage[];
  threadId: string;
  tool: string;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");
        if (!token) return new Response("Unauthorized", { status: 401 });

        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const SUPABASE_URL = process.env.SUPABASE_URL!;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: userData, error: userErr } = await supabase.auth.getUser(token);
        if (userErr || !userData.user) return new Response("Unauthorized", { status: 401 });
        const userId = userData.user.id;

        const { messages, threadId, tool } = (await request.json()) as Body;
        if (!Array.isArray(messages) || !threadId || !tool) {
          return new Response("Bad request", { status: 400 });
        }

        // Verify thread ownership
        const { data: thread } = await (supabase as unknown as {
          from: (t: string) => {
            select: (c: string) => {
              eq: (k: string, v: string) => {
                eq: (k: string, v: string) => { maybeSingle: () => Promise<{ data: unknown }> };
              };
            };
          };
        })
          .from("chat_threads")
          .select("id")
          .eq("id", threadId)
          .eq("user_id", userId)
          .maybeSingle();
        if (!thread) return new Response("Thread not found", { status: 404 });

        const ctx = await loadUserContext(supabase, userId);
        const systemBase = TOOL_SYSTEM_PROMPTS[tool] ?? TOOL_SYSTEM_PROMPTS.plan;
        const system = `${systemBase}\n\nAlways respond in British English, use £ for money, and refer to UK education systems (GCSE, A-level, BTEC, T-level, UCAS).\n\n${contextToPromptBlock(ctx)}`;

        const gateway = createLovableAiGatewayProvider(apiKey);
        const model = gateway(DEFAULT_MODEL);

        // Persist the latest user message before streaming
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        if (lastUser) {
          await (supabase as unknown as {
            from: (t: string) => { insert: (v: unknown) => Promise<{ error: unknown }> };
          })
            .from("chat_messages")
            .insert({
              thread_id: threadId,
              user_id: userId,
              role: "user",
              parts_json: lastUser.parts,
            });
        }

        const result = streamText({
          model,
          system,
          messages: convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ messages: finalMessages }) => {
            const lastAssistant = [...finalMessages]
              .reverse()
              .find((m) => m.role === "assistant");
            if (!lastAssistant) return;
            await (supabase as unknown as {
              from: (t: string) => { insert: (v: unknown) => Promise<{ error: unknown }> };
            })
              .from("chat_messages")
              .insert({
                thread_id: threadId,
                user_id: userId,
                role: "assistant",
                parts_json: lastAssistant.parts,
              });
            await (supabase as unknown as {
              from: (t: string) => {
                update: (v: unknown) => { eq: (k: string, v: string) => Promise<unknown> };
              };
            })
              .from("chat_threads")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", threadId);
          },
        });
      },
    },
  },
});
