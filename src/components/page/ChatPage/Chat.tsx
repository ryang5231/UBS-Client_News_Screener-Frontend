"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  AlertCircle,
  Clock,
  Bot,
  User,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  confidence?: number;
  sources?: string[];
  compliance?: boolean;
  agentUsed?: string;
  requiresEscalation?: boolean;
  analysis?: {
    intent: string;
    sensitivityLevel: string;
    entities: string[];
  };
}

interface Doc {
  url: string;
  title?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your UBS Wealth Advisory Assistant. I can help you with client intelligence, portfolio analysis, and compliance checks. How can I assist you today?",
      sender: "assistant",
      timestamp: new Date(),
      confidence: 95,
      compliance: true,
      agentUsed: "orchestrator",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: currentInput,
          session_id: "demo",
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.text, // rendered chat text
        sender: "assistant",
        timestamp: new Date(),
        analysis: {
          intent: data.meta.intent,
          sensitivityLevel: "N/A",
          entities: data.meta.entity ? [data.meta.entity] : [],
        },
        confidence: undefined, // optional
        sources:
          typeof data.meta.docs === "number"
            ? [`${data.meta.docs} source(s) retrieved`]
            : Array.isArray(data.meta.docs)
              ? data.meta.docs.map((d: Doc) => d.url).filter(Boolean)
              : [],
        agentUsed: "orchestrator",
        requiresEscalation: data.meta.needs_clarification,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.",
        sender: "assistant",
        timestamp: new Date(),
        confidence: 0,
        compliance: true,
        requiresEscalation: true,
        agentUsed: "error_handler",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-muted/20">
      {/* Header */}
      <div className="border-b bg-background p-4 shadow-sm">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                UBS Wealth Advisory Assistant
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-powered financial insights
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Online
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 w-full">
        <div className="max-w-5xl mx-auto w-full space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex w-full gap-3",
                message.sender === "user" ? "justify-end" : "justify-start",
              )}
            >
              {/* Avatar for assistant */}
              {message.sender === "assistant" && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                </div>
              )}

              <Card
                className={cn(
                  "max-w-[80%] shadow-sm",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background",
                )}
              >
                <CardContent className="p-4">
                  <div className="text-sm leading-relaxed space-y-2 break-words">
                    {message.content.split("\n").map((line, idx) => {
                      // First line is always h3
                      if (idx === 0) {
                        return (
                          <h3
                            key={idx}
                            className="font-bold text-lg break-words"
                          >
                            {line.replace(/\*\*/g, "")}
                          </h3>
                        );
                      }

                      // Bold header lines
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return (
                          <h3
                            key={idx}
                            className="font-bold text-lg break-words"
                          >
                            {line.replace(/\*\*/g, "")}
                          </h3>
                        );
                      }

                      // Bullet points
                      if (line.startsWith("• ")) {
                        const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
                        const text = line
                          .replace("• ", "")
                          .replace(urlMatch?.[0] ?? "", "")
                          .trim();
                        return (
                          <ul
                            key={idx}
                            className="ml-4 list-disc break-words w-full"
                          >
                            <li className="break-words">
                              {text}
                              {urlMatch && (
                                <>
                                  {" "}
                                  <a
                                    href={urlMatch[0]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline break-words"
                                  >
                                    link
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </>
                              )}
                            </li>
                          </ul>
                        );
                      }

                      // Lines with standalone URLs
                      const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
                      if (urlMatch) {
                        const text =
                          line.replace(urlMatch[0], "").trim() || "link";
                        return (
                          <p key={idx} className="break-words">
                            {text}{" "}
                            <a
                              href={urlMatch[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline break-words"
                            >
                              link
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </p>
                        );
                      }

                      // Default paragraph
                      return (
                        <p key={idx} className="break-words">
                          {line}
                        </p>
                      );
                    })}
                  </div>

                  {/* Assistant metadata */}
                  {message.sender === "assistant" && (
                    <div className="mt-3 space-y-2">
                      {message.sources && (
                        <div className="text-xs text-muted-foreground break-words">
                          <span className="font-medium">Sources: </span>
                          {message.sources.join(", ")}
                        </div>
                      )}

                      {message.analysis && (
                        <div className="text-xs text-muted-foreground break-words">
                          <span className="font-medium">Intent: </span>
                          {message.analysis.intent} |
                          {message.analysis.entities.length > 0 && (
                            <>
                              <span className="font-medium"> Entity: </span>
                              {message.analysis.entities.slice(0, 3).join(", ")}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* User timestamp */}
                  {message.sender === "user" && (
                    <div className="mt-2 text-xs text-right opacity-70">
                      {formatTime(message.timestamp)}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Avatar for user */}
              {message.sender === "user" && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {isLoading && (
          <div className="max-w-5xl mx-auto w-full">
            <div className="flex justify-start w-full gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              </div>
              <Card className="max-w-[80%] shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Processing your request...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      {/* Input Area */}
      <div className="border-t border-border p-4 bg-background shadow-lg">
        <div className="max-w-5xl mx-auto w-full space-y-3">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about client portfolios, market insights, or compliance matters..."
              className="flex-1 text-base"
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSendMessage()
              }
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              size="lg"
              className="px-6"
              disabled={isLoading || !inputValue.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="w-3 h-3" />
            <span>
              All conversations are recorded for compliance and quality
              assurance purposes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
