import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Paperclip, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createThread } from "@/lib/ai.functions";
import { getThreads, getThreadMessages } from "@/lib/data.functions";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { toast } from "sonner";

interface ThreadRow {
  id: string;
  title: string;
  tool: string;
  updated_at: string;
}

interface MessageRow {
  id: string;
  role: string;
  parts_json: unknown;
  created_at: string;
}

function rowsToUIMessages(rows: MessageRow[]): UIMessage[] {
  return rows.map((r) => ({
    id: r.id,
    role: r.role as UIMessage["role"],
    parts: (Array.isArray(r.parts_json) ? r.parts_json : []) as UIMessage["parts"],
  }));
}

export function Chat({ tool, placeholder }: { tool: string; placeholder?: string }) {
  const qc = useQueryClient();
  const fetchThreads = useServerFn(getThreads);
  const fetchMessages = useServerFn(getThreadMessages);
  const newThread = useServerFn(createThread);

  const { data: threadData } = useQuery({
    queryKey: ["threads", tool],
    queryFn: async () => {
      const r = await fetchThreads({});
      return { threads: (r.threads as ThreadRow[]).filter((t) => t.tool === tool) };
    },
  });
  const threads = threadData?.threads ?? [];
  const [activeId, setActiveId] = useState<string | null>(null);

  // Auto-select or create first thread
  useEffect(() => {
    if (activeId) return;
    if (threads.length > 0) {
      setActiveId(threads[0].id);
    } else if (threadData) {
      // No threads — create one
      newThread({ data: { tool, title: "New chat" } }).then((r) => {
        setActiveId(r.id);
        qc.invalidateQueries({ queryKey: ["threads", tool] });
      });
    }
  }, [threadData, threads, activeId, newThread, qc, tool]);

  const { data: msgData } = useQuery({
    queryKey: ["messages", activeId],
    queryFn: async () => {
      if (!activeId) return { messages: [] };
      const r = await fetchMessages({ data: { threadId: activeId } });
      return { messages: r.messages as MessageRow[] };
    },
    enabled: !!activeId,
  });
  const initialMessages = useMemo(
    () => (msgData ? rowsToUIMessages(msgData.messages) : []),
    [msgData],
  );

  if (!activeId) {
    return <div className="p-6 text-sm text-muted-foreground">Loading chat…</div>;
  }

  return (
    <div className="grid h-[calc(100vh-9rem)] grid-cols-[200px_1fr] gap-4">
      <aside className="surface-card flex flex-col overflow-hidden">
        <div className="border-b border-border p-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={async () => {
              const r = await newThread({ data: { tool, title: "New chat" } });
              setActiveId(r.id);
              qc.invalidateQueries({ queryKey: ["threads", tool] });
            }}
          >
            + New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-1">
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={`block w-full truncate rounded px-2 py-1.5 text-left text-xs ${
                t.id === activeId ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>
      </aside>
      <ChatWindow
        key={activeId}
        tool={tool}
        threadId={activeId}
        initialMessages={initialMessages}
        placeholder={placeholder}
      />
    </div>
  );
}

function ChatWindow({
  tool,
  threadId,
  initialMessages,
  placeholder,
}: {
  tool: string;
  threadId: string;
  initialMessages: UIMessage[];
  placeholder?: string;
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { threadId, tool },
        fetch: (async (url, init) => {
          const { data: { session } } = await supabase.auth.getSession();
          const headers = new Headers(init?.headers);
          if (session?.access_token) headers.set("Authorization", `Bearer ${session.access_token}`);
          return fetch(url as RequestInfo, { ...init, headers });
        }) as typeof fetch,
      }),
    [threadId, tool],
  );

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (e: Error) => toast.error(e.message || "Chat error"),
  });

  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId, status]);

  const busy = status === "submitted" || status === "streaming";

  const filesToDataParts = async (fs: File[]) =>
    Promise.all(
      fs.map(
        (f) =>
          new Promise<{ type: "file"; mediaType: string; filename: string; url: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                type: "file",
                mediaType: f.type || "application/octet-stream",
                filename: f.name,
                url: reader.result as string,
              });
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(f);
          }),
      ),
    );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if ((!text && files.length === 0) || busy) return;
    try {
      const fileParts = await filesToDataParts(files);
      setInput("");
      setFiles([]);
      if (fileRef.current) fileRef.current.value = "";
      await sendMessage({ text: text || " ", files: fileParts });
    } catch {
      toast.error("Could not attach files");
    }
  };

  return (
    <div className="surface-card flex flex-col overflow-hidden">
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              title="Ask anything"
              description={placeholder ?? "Your context is shared automatically."}
            />
          ) : (
            messages.map((m: UIMessage) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? (p as { type: "text"; text: string }).text : ""))
                .join("");
              const fileParts = m.parts.filter(
                (p): p is { type: "file"; mediaType?: string; filename?: string; url: string } =>
                  p.type === "file",
              );
              return (
                <Message key={m.id} from={m.role}>
                  <MessageContent>
                    {fileParts.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {fileParts.map((fp, i) =>
                          fp.mediaType?.startsWith("image/") ? (
                            <img
                              key={i}
                              src={fp.url}
                              alt={fp.filename ?? "attachment"}
                              className="max-h-48 rounded border border-border"
                            />
                          ) : (
                            <a
                              key={i}
                              href={fp.url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded border border-border px-2 py-1 text-xs underline"
                            >
                              📎 {fp.filename ?? "file"}
                            </a>
                          ),
                        )}
                      </div>
                    )}
                    {m.role === "assistant" ? (
                      <MessageResponse>{text}</MessageResponse>
                    ) : (
                      text.trim() && <p className="whitespace-pre-wrap">{text}</p>
                    )}
                  </MessageContent>
                </Message>
              );
            })
          )}
          {busy && (
            <Message from="assistant">
              <MessageContent>
                <p className="text-xs text-muted-foreground">Thinking…</p>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <form onSubmit={onSubmit} className="flex flex-col gap-2 border-t border-border p-3">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-1 rounded border border-border bg-muted/40 px-2 py-1 text-xs"
              >
                <span className="max-w-[160px] truncate">{f.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Remove file"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,application/pdf,.txt,.md,.csv,.json"
            className="hidden"
            onChange={(e) => {
              const list = e.target.files;
              if (!list) return;
              setFiles((prev) => [...prev, ...Array.from(list)]);
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            aria-label="Attach files"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder ?? "Type your message…"}
            disabled={busy}
          />
          <Button type="submit" disabled={busy || (!input.trim() && files.length === 0)}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}

