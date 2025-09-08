"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, AlertCircle, CheckCircle, Clock, User } from "lucide-react";
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

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          conversationId: "current-session",
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: "assistant",
        timestamp: new Date(),
        confidence: data.confidence,
        sources: data.sources,
        compliance: data.compliance,
        agentUsed: data.agentUsed,
        requiresEscalation: data.requiresEscalation,
        analysis: data.analysis,
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

  const getAgentBadgeColor = (agent?: string) => {
    switch (agent) {
      case "client_intelligence":
        return "bg-blue-100 text-blue-800";
      case "advisory":
        return "bg-green-100 text-green-800";
      case "compliance":
        return "bg-red-100 text-red-800";
      case "orchestrator":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col h-screen ">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[70%] rounded-lg p-4",
                message.sender === "user"
                  ? "bg-background border border-border"
                  : "bg-background border border-border"
              )}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>

              {message.sender === "assistant" && (
                <div className="mt-3 space-y-2">
                  {message.sources && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Sources: </span>
                      {message.sources.join(", ")}
                    </div>
                  )}

                  {message.analysis && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Intent: </span>
                      {message.analysis.intent} |
                      <span className="font-medium"> Sensitivity: </span>
                      {message.analysis.sensitivityLevel}
                      {message.analysis.entities.length > 0 && (
                        <>
                          <span className="font-medium"> | Entities: </span>
                          {message.analysis.entities.slice(0, 3).join(", ")}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {message.sender === "user" && (
                <div className="mt-2 text-xs text-muted-foreground text-right">
                  {formatTime(message.timestamp)}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-background border border-border rounded-lg p-4 max-w-[70%]">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Clock className="w-4 h-4 animate-spin" />
                <span className="text-sm">Processing your request...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Input Area */}
      <div className="border-t border-border p-4 bg-background sticky bottom-0">
        <div className="flex space-x-4">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about client portfolios, market insights, or compliance matters..."
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-2 text-xs text-muted-foreground text-center">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          All conversations are recorded for compliance and quality assurance
          purposes.
        </div>
      </div>
    </div>
  );
}
