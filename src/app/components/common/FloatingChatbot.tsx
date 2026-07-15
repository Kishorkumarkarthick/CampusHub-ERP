import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Minus, Maximize2, Trash2, Loader2, Bot } from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";

interface Message {
  id?: number;
  message: string;
  isBot: boolean;
  timestamp?: string;
}

interface FloatingChatbotProps {
  userEmail: string;
  role: "student" | "faculty" | "admin";
}

export default function FloatingChatbot({ userEmail, role }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Suggested questions based on role
  const getSuggestions = () => {
    switch (role) {
      case "faculty":
        return [
          "Show my teaching timetable",
          "What courses do I teach?",
          "How do I enter attendance?",
          "Faculty leave request info",
        ];
      case "admin":
        return [
          "Check enrollment analytics",
          "What user portals are available?",
          "How do I manage departments?",
          "Publish global announcement info",
        ];
      case "student":
      default:
        return [
          "Check my attendance details",
          "Show my exam scorecard",
          "What are my fee dues?",
          "Show my timetable slots",
          "Any books due in library?",
        ];
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await api.get(`/api/chat/history?userEmail=${encodeURIComponent(userEmail)}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load chat history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userEmail) {
      fetchHistory();
    }
  }, [isOpen, userEmail]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    if (!textToSend) setInput("");

    // Add local user message immediately
    const userMsg: Message = { message: text, isBot: false };
    setMessages((prev) => [...prev, userMsg]);

    try {
      setLoading(true);
      const res = await api.post("/api/chat", {
        userEmail,
        role,
        message: text,
      });
      // Add bot message
      setMessages((prev) => [...prev, { message: res.data.message, isBot: true }]);
    } catch (err) {
      console.error("Failed to send message to assistant", err);
      toast.error("AI Assistant is currently unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.delete(`/api/chat/history?userEmail=${encodeURIComponent(userEmail)}`);
      setMessages([]);
      toast.success("Chat history cleared");
    } catch (err) {
      console.error("Failed to clear chat history", err);
      toast.error("Failed to clear conversation logs.");
    }
  };

  // Simple custom Markdown rendering parser
  const renderMarkdown = (text: string) => {
    if (!text) return "";
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Replace **bold** with <strong>
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    
    // Replace *italic* with <em>
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    
    // Replace `code` with <code>
    html = html.replace(/`(.*?)`/g, "<code class='bg-secondary px-1 py-0.5 rounded font-mono text-[10px]'>$1</code>");

    return html.split("\n").map((line, i) => (
      <div key={i} dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }} />
    ));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none flex flex-col items-end">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/10"
          title="CampusHub AI Assistant"
        >
          <MessageSquare className="w-6 h-6 animate-pulse" />
        </button>
      )}

      {/* Expandable Chat window panel */}
      {isOpen && (
        <div
          className={`bg-card border border-border rounded-2xl shadow-2xl w-[360px] sm:w-[400px] flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized ? "h-14" : "h-[500px]"
          }`}
        >
          {/* Header */}
          <div className="bg-indigo-600 dark:bg-indigo-950 p-4 text-white flex justify-between items-center select-none border-b border-indigo-700/30">
            <div className="flex items-center gap-2 text-left">
              <Bot className="w-5 h-5" />
              <div>
                <p className="text-xs font-bold leading-tight">CampusHub AI Assistant</p>
                <p className="text-[9px] text-indigo-200">Online &bull; Role: {role}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/10 rounded cursor-pointer transition-colors"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              </button>
              {messages.length > 0 && !isMinimized && (
                <button
                  onClick={handleClearHistory}
                  className="p-1 hover:bg-white/10 rounded cursor-pointer transition-colors text-white/80 hover:text-white"
                  title="Clear Chat History"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chat content area */}
          {!isMinimized && (
            <>
              <div
                className="flex-grow p-4 overflow-y-auto space-y-4 bg-muted/10 text-left text-xs"
                ref={scrollRef}
              >
                {historyLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 space-y-2 select-none">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                      <Bot className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-foreground">Welcome to CampusHub ERP AI Assistant!</p>
                    <p className="text-[11px] text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
                      Ask me questions about your attendance, exam schedules, book checkouts, or fees status.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2.5 max-w-[85%] ${
                        msg.isBot ? "" : "ml-auto flex-row-reverse"
                      }`}
                    >
                      {msg.isBot && (
                        <div className="w-6 h-6 rounded-full bg-indigo-600/10 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 select-none">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-2xl leading-relaxed text-xs shadow-sm font-medium ${
                          msg.isBot
                            ? "bg-card border border-border text-foreground rounded-tl-none"
                            : "bg-indigo-600 text-white rounded-tr-none"
                        }`}
                      >
                        {renderMarkdown(msg.message)}
                      </div>
                    </div>
                  ))
                )}

                {loading && (
                  <div className="flex gap-2.5 max-w-[85%]">
                    <div className="w-6 h-6 rounded-full bg-indigo-600/10 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 select-none">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-3 bg-card border border-border text-foreground rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 font-bold select-none">
                      <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions Panel */}
              {messages.length === 0 && !historyLoading && (
                <div className="px-4 py-2 border-t border-border bg-secondary/10 text-left select-none">
                  <p className="text-[10px] text-muted-foreground font-semibold mb-2">Suggested Prompts:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {getSuggestions().map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(sug)}
                        className="text-[9px] font-bold py-1 px-2.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Form Footer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-3 border-t border-border bg-card flex gap-2 items-center"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question here..."
                  className="flex-grow px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs font-sans"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow transition-all active:scale-95 disabled:opacity-50 cursor-pointer disabled:pointer-events-none"
                  disabled={loading || !input.trim()}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
