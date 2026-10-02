import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, Loader, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Message {
  role: "user" | "assistant";
  content: string;
  sourcesUsed?: string[];
  visualizations?: Visualization[];
}

interface Visualization {
  type: "bar" | "line";
  title: string;
  xLabel?: string;
  yLabel?: string;
  data: Array<{
    label: string;
    value: number;
  }>;
}

export const Route = createFileRoute("/control/intelligence")({
  component: ControlIntelligencePage,
});

const CHAT_STORAGE_KEY = "voz-control-intelligence-chat:v1";

const QUICK_QUESTIONS = [
  "Resumen del negocio",
  "¿Qué cambió esta semana?",
  "Oportunidades comerciales",
  "¿Qué debería priorizar?",
];

function ControlIntelligencePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Restore chat from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Message[];
        if (Array.isArray(parsed) && parsed.every((m) => m.role && m.content)) {
          setMessages(parsed);
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
          }, 100);
        }
      }
    } catch (err) {
      console.warn("Failed to restore chat", err);
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  }, []);

  // Persist chat to localStorage whenever it changes
  useEffect(() => {
    if (messages.length === 0) {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } else {
      try {
        // Keep only last 40 messages
        const toStore = messages.slice(-40);
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(toStore));
      } catch (err) {
        console.warn("Failed to save chat", err);
      }
    }
  }, [messages]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle logout: clear chat
  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    };

    window.addEventListener("logout", handleLogout);
    return () => window.removeEventListener("logout", handleLogout);
  }, []);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMsg = message.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      // Build history: exclude current message, include previous messages
      const history = messages
        .slice(-20)
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/admin/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMsg,
          history,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Logout: clear chat
          localStorage.removeItem(CHAT_STORAGE_KEY);
          window.dispatchEvent(new Event("logout"));
        }
        throw new Error("Error en el agente");
      }

      const data = await res.json();
      if (data.success) {
        // Extract sources from sourcesUsed array
        const sources = data.data.sourcesUsed
          ? data.data.sourcesUsed.map((s: { source: string }) => {
              const sourceNames: Record<string, string> = {
                ga4: "GA4",
                google_ads: "Google Ads",
                agent_metrics: "Agent Metrics",
                supabase: "Supabase",
              };
              return sourceNames[s.source] || s.source;
            })
          : [];

        const assistantMsg: Message = {
          role: "assistant",
          content: data.data.message,
          sourcesUsed: sources,
        };

        // Add visualizations if present
        if (data.data.visualizations && data.data.visualizations.length > 0) {
          assistantMsg.visualizations = data.data.visualizations.slice(0, 3);
        }

        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error procesando consulta. Intenta de nuevo.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const clearChat = () => {
    if (confirm("¿Quieres iniciar una nueva conversación?")) {
      setMessages([]);
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-2rem)] flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl uppercase">Copiloto Ejecutivo</h1>
          <p className="mt-1 text-muted-foreground">Inteligencia estratégica en tiempo real</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-2 rounded-lg border border-foreground/10 px-3 py-2 text-sm text-muted-foreground hover:bg-foreground/5 transition-colors"
            title="Limpiar conversación"
          >
            <Trash2 className="h-4 w-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col rounded-lg border border-foreground/10 bg-card">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
              <div>
                <p className="font-semibold">Copiloto Ejecutivo</p>
                <p className="text-sm mt-2 text-muted-foreground">Pregunta sobre el negocio, tendencias y oportunidades</p>
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 w-full">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className="rounded-lg border border-foreground/10 bg-background px-4 py-2 text-sm text-left hover:bg-foreground/5 transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="flex flex-col gap-3 w-full max-w-3xl">
                  <div
                    className={`rounded-lg px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-black text-white ml-auto max-w-xl"
                        : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ node, ...props }) => <h2 className="text-lg font-bold mt-4 mb-2" {...props} />,
                            h2: ({ node, ...props }) => <h3 className="text-base font-semibold mt-3 mb-2" {...props} />,
                            h3: ({ node, ...props }) => <h4 className="text-sm font-semibold mt-2 mb-1" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                            code: ({ node, ...props }) => <code className="bg-neutral-200 dark:bg-neutral-700 rounded px-1" {...props} />,
                            table: ({ node, ...props }) => <table className="border-collapse border border-neutral-300 dark:border-neutral-600 mb-2 w-full text-sm" {...props} />,
                            th: ({ node, ...props }) => <th className="border border-neutral-300 dark:border-neutral-600 px-2 py-1 font-bold text-left bg-neutral-200 dark:bg-neutral-700" {...props} />,
                            td: ({ node, ...props }) => <td className="border border-neutral-300 dark:border-neutral-600 px-2 py-1" {...props} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {/* Visualizations */}
                  {msg.role === "assistant" && msg.visualizations && msg.visualizations.length > 0 && (
                    <div className="space-y-3">
                      {msg.visualizations.map((viz, vidx) => (
                        <div
                          key={vidx}
                          className="rounded-lg border border-foreground/10 bg-white dark:bg-neutral-900 p-4"
                        >
                          <h4 className="text-sm font-semibold mb-3 text-neutral-900 dark:text-white">{viz.title}</h4>
                          <ResponsiveContainer width="100%" height={250}>
                            {viz.type === "bar" ? (
                              <BarChart data={viz.data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#000" />
                              </BarChart>
                            ) : (
                              <LineChart data={viz.data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke="#000" />
                              </LineChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sources */}
                  {msg.role === "assistant" && msg.sourcesUsed && msg.sourcesUsed.length > 0 && (
                    <div className="text-xs text-muted-foreground px-1">
                      Fuentes: {msg.sourcesUsed.join(" · ")}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-foreground/10 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              placeholder="¿Cómo estuvo el negocio?"
              disabled={isLoading}
              className="flex-1 rounded-lg border border-foreground/10 bg-background px-4 py-2 text-sm outline-none focus:border-black disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-lg bg-black p-2 text-white disabled:opacity-50 hover:bg-neutral-900"
              aria-label="Enviar"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
