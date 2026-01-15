export interface Message {
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
  meta?: {
    intent?: string;
    entity?: string;
    are_articles_recent?: boolean;
    since_days?: number;
    articles?: Article[];
    advice?: AdvisoryData;
    decision?: "save" | "edit";
    advice_list?: AdvisoryData[];
    financial_data?: FinancialData;
    signals?: {
      articles_considered: Array<{
        id: string;
        title: string;
        url: string;
      }>;
    };
    docs?: number;
    has_summary?: boolean;
    needs_clarification?: boolean;
  };
}

export interface Doc {
  url: string;
  title?: string;
}

export interface AdvisoryBubbleProps {
  message: Message;
  onDecision: (action: "save" | "edit", data: AdvisoryData) => Promise<void>;
}

export interface Article {
  title: string;
  url: string;
  source: string;
  publish_date?: number;
  summary: {
    summary_text: string;
    sentiment: {
      overall: string;
      confidence: number;
    };
    topics?: string[];
    financial_impact: {
      has_impact: boolean;
      affected_companies: string[];
      impact_type: string;
    };
  };
  similar_articles?: {
    content_type: string;
    id: string;
    publish_date: string;
    similarity: number;
    title: string;
    url?: string;
  }[];
  fact_check?: {
    actionable_insight: string;
    confidence: number;
    evidence: string;
    status: string;
  };
}

export interface FinancialData {
  symbol: string;
  fiscal_year: string;
  financials: {
    revenue: string;
    net_income: string;
    total_assets: string;
  };
  formatted: {
    revenue: string;
    net_income: string;
    total_assets: string;
  };
  meta: {
    timestamp: string;
    currency: string;
  };
}

export interface AdvisoryData {
  entity_name: string;
  advice: {
    "Basic Profile": {
      Background: { value: string };
      "Public Sentiment": { value: string };
    };
    "Financial Profile": {
      "Net Worth": {
        value: string;
        sources: string[];
      };
      Portfolio?: {
        value: string;
        sources: string[];
      };

      "Investment Activeness": {
        value: string;
        sources: string[];
      };
    };
    Associations: {
      "Companies Brands": string[];
      Individuals: string[];
      Sources: string[];
    };
    "Risk Assessment": {
      "Reputational Risk": {
        rating: number;
        justification: string[];
      };
      "Illegal Activity Risk": {
        rating: number;
        justification: string[];
      };
      Controversies: string[];
    };
    "Suitability Analysis": {
      "Overall Rating": number;
      "Service Usage Likelihood": number;
      Justification: string[];
    };
  };
}

// unused interfaces from src/components/page/ChatPage/Chat.tsx
