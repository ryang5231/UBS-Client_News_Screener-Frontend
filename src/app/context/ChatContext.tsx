"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Message } from "@/types/index";

// Define the shape of your message

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Define the initial welcome message
const welcomeMessage: Message = {
  id: "1",
  content:
    "Hello! I'm your UBS Wealth Advisory Assistant. I can help you with client intelligence, portfolio analysis, and compliance checks. How can I assist you today?",
  sender: "assistant",
  timestamp: new Date(),
  // ... other properties
};

// const dummyMessage: Message = {
//     id: "dummy-advisory",
//     content: "Here's a sample client advisory report for demonstration purposes.",
//     sender: "assistant",
//     timestamp: new Date(),
//     meta: {
//       intent: "advisory_query",
//       advice: {
//         entity_name: "John Doe",
//         advice: {
//           "id": "9b95c376-a82f-4224-900f-b14bf0ba149f",
//           "Basic Profile": {
//             Background: { value: "John Doe is a high-net-worth individual with a background in technology entrepreneurship. He founded a successful software company that was acquired in 2018, leading to significant wealth accumulation." },
//             "Public Sentiment": { value: "Generally positive public sentiment based on his philanthropic activities and business success. Some media coverage highlights his innovative contributions to the tech industry." },
//           },
//           "Financial Profile": {
//             "Net Worth": {
//               value: "$50M - $100M",
//               sources: ["Forbes Billionaires List", "Public SEC filings"],
//             },
//             Portfolio: {
//               value: "Diversified portfolio including tech stocks, real estate investments, and venture capital funds. Heavy allocation to growth stocks and emerging markets.",
//               sources: ["Bloomberg", "Wall Street Journal"],
//             },
//             "Investment Activeness": {
//               value: "Highly active investor with frequent trading and new investment opportunities. Maintains a team of financial advisors and participates in angel investing.",
//               sources: ["Business Insider", "TechCrunch"],
//             },
//           },
//           Associations: {
//             "Companies Brands": ["TechCorp Inc.", "Innovate Ventures", "Green Energy Solutions"],
//             Individuals: ["Jane Smith (Business Partner)", "Michael Johnson (Mentor)"],
//             Sources: ["LinkedIn", "Company Websites", "News Articles"],
//           },
//           "Risk Assessment": {
//             "Reputational Risk": {
//               rating: 3,
//               justification: ["Past involvement in high-profile business deals", "Active in controversial tech industry sectors"],
//             },
//             "Illegal Activity Risk": {
//               rating: 1,
//               justification: ["No known legal issues or regulatory violations", "Clean background check"],
//             },
//             Controversies: ["Dispute with former business partner settled out of court in 2020"],
//           },
//           "Suitability Analysis": {
//             "Overall Rating": 8,
//             "Service Usage Likelihood": 9,
//             Justification: ["Strong financial position indicates need for sophisticated wealth management", "Active investment style suggests value in personalized advisory services", "Philanthropic interests align with impact investing opportunities"],
//           },
//         },
//         since_days: 7
//       },
//       signals: {
//         articles_considered: [
//           {
//             id: "article1",
//             title: "John Doe's Latest Investment Moves",
//             url: "https://example.com/article1",
//           },
//           {
//             id: "article2",
//             title: "Tech Entrepreneur's Philanthropy Initiatives",
//             url: "https://example.com/article2",
//           },
//         ],
//       },
//       since_days: 7
//     },
//     analysis: {
//       intent: "advisory_query",
//       sensitivityLevel: "High",
//       entities: ["John Doe"],
//     },
//     confidence: 0.95,
//     sources: ["Internal Database", "Public Records"],
//     compliance: true,
//     agentUsed: "advisory_agent",
//     requiresEscalation: false,
//   };

// Create the provider component

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const value = {
    messages,
    setMessages,
    sessionId,
    setSessionId,
    isLoading,
    setIsLoading,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// Create a custom hook to easily use the context
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
