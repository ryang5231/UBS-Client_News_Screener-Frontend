"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/app/context/ChatContext";
import {
  Send,
  AlertCircle,
  Clock,
  Bot,
  User,
  ExternalLink,
  RefreshCw,
  Newspaper,
  DollarSign,
  Building2,
  Users,
  ShieldAlert,
  AlertTriangle,
  BarChart3,
  Info,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@radix-ui/react-accordion";

interface Article {
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

interface FinancialData {
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
interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  meta?: {
    intent?: string;
    entity?: string;
    are_articles_recent?: boolean;
    since_days?: number;
    articles?: Article[];
    advice?: AdvisoryData;
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

interface AdvisoryData {
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

interface Doc {
  url: string;
  title?: string;
}

function BubbleTimestamp({ timestamp }: { timestamp?: string | Date }) {
  if (!timestamp) return null;

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

  // Format the time as "HH:MM AM/PM"
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return <div className="text-xs text-muted-foreground">{formattedTime}</div>;
}
// News Lookup Bubble Component
function NewsLookupBubble({ message }: { message: Message }) {
  if (message.content?.includes("Which person/company do you mean?")) {
    return <DefaultMessageBubble message={message} />;
  }

  const articles = message.meta?.articles || [];
  const entity = message.meta?.entity || "Unknown";

  if (articles.length === 0) {
    return (
      <Card className="max-w-[85%]">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Newspaper className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900">
              Latest News: {entity}
            </h3>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500">
              No recent news articles found for {entity}.
            </p>
            {message.content && (
              <p className="text-sm text-gray-400 mt-2">{message.content}</p>
            )}
          </div>
          <BubbleTimestamp timestamp={message.timestamp} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-[85%]">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Newspaper className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            {message.meta?.are_articles_recent ? (
              <h3 className="font-semibold text-lg text-gray-900 capitalize">
                Latest news for {entity} in the past {message.meta?.since_days}{" "}
                days
              </h3>
            ) : (
              <div>
                <h3 className="font-semibold text-lg text-gray-900 capitalize">
                  No articles were published in the last{" "}
                  {message.meta?.since_days} days.
                </h3>
                <p>Showing the 4 most recent articles instead.</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Message */}
        {message.content && (
          <p className="text-sm text-gray-600 mb-5 leading-relaxed bg-gray-50 p-4 rounded-lg">
            {message.content}
          </p>
        )}

        {/* Articles */}
        <div className="space-y-5">
          {articles.map((article, index) => (
            <div
              key={index}
              className="group p-4 border border-gray-200 rounded-lg"
            >
              {/* Article Title */}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-semibold text-gray-900 hover:text-blue-600 block mb-2 leading-snug transition-colors"
              >
                {article.title}
              </a>

              {/* Article Summary */}
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                {article.summary.summary_text}
              </p>

              {/* Topics */}
              {article.summary.topics && article.summary.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  Tags:
                  <Badge
                    className={`px-2.5 py-1 rounded-full font-medium capitalize ${
                      article.summary.sentiment.overall === "positive"
                        ? "bg-emerald-50 text-emerald-700 "
                        : article.summary.sentiment.overall === "negative"
                          ? "bg-rose-50 text-rose-700 "
                          : "bg-gray-50 text-gray-600 "
                    }`}
                  >
                    {article.summary.sentiment.overall}
                  </Badge>
                  {article.summary.topics.slice(0, 3).map((topic, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium capitalize"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              {/* Fact Check Accordion */}
              {(article.similar_articles || article.fact_check) && (
                <div className="mt-4">
                  <Accordion
                    type="single"
                    collapsible
                    className=" border-gray-100"
                  >
                    <AccordionItem value="details" className="border-0">
                      <AccordionTrigger className="py-3 text-sm hover:bg-gray-50 rounded-lg px-3 transition-colors cursor-pointer w-full">
                        <div className="w-full flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Info className="w-4 h-4 text-gray-400" />
                            <span>Fact Check</span>
                            {article.similar_articles && (
                              <span className="text-xs text-gray-500 font-normal">
                                ({article.similar_articles.length} related
                                articles)
                              </span>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {article.fact_check && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="font-medium text-gray-900">
                                  {article.fact_check.status}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500">
                                  {article.fact_check.confidence}% confidence
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3 space-y-4">
                        {/* Fact Check Section */}
                        {article.fact_check && (
                          <div>
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <p className="text-sm font-semibold mb-1">
                                  Evidence
                                </p>
                                <p className="text-sm text-gray-700 ">
                                  {article.fact_check.evidence}
                                </p>
                                {article.fact_check.actionable_insight && (
                                  <div className=" mt-3">
                                    <p className="text-sm font-semibold mb-1">
                                      Insight
                                    </p>
                                    <p className="text-sm ">
                                      {article.fact_check.actionable_insight}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Similar Articles Section */}
                        {article.similar_articles &&
                          article.similar_articles.length > 0 && (
                            <div>
                              <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                Related Articles
                              </h5>
                              <div className="space-y-2.5">
                                {article.similar_articles
                                  .slice(0, 3)
                                  .map((similar, idx) => (
                                    <div key={idx} className="flex gap-2">
                                      <span className="text-blue-400 text-xs mt-1">
                                        •
                                      </span>
                                      <div className="flex-1">
                                        {similar.url ? (
                                          <a
                                            href={similar.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-gray-700 hover:text-blue-600 hover:underline leading-snug transition-colors"
                                          >
                                            {similar.title}
                                          </a>
                                        ) : (
                                          <p className="text-sm text-gray-700 leading-snug">
                                            {similar.title}
                                          </p>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                          <span>{similar.content_type}</span>
                                          <span>•</span>
                                          <span>
                                            {new Date(
                                              similar.publish_date,
                                            ).toLocaleDateString()}
                                          </span>
                                          <span>•</span>
                                          <span className="text-blue-600 font-medium">
                                            {(similar.similarity * 100).toFixed(
                                              0,
                                            )}
                                            % match
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

              {/* Published date */}
              {article.publish_date && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                  <span>Published on:</span>
                  <span>
                    {new Date(article.publish_date * 1000).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <BubbleTimestamp timestamp={message.timestamp} />
      </CardContent>
    </Card>
  );
}

// Advisory Bubble Component
function AdvisoryBubble({
  message,
  onApprove,
}: {
  message: Message;
  onApprove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const advisory = message.meta?.advice;
  if (!advisory) return <DefaultMessageBubble message={message} />;

  const entityName = advisory.entity_name;
  const advice = advisory.advice;
  const financialProfile = advice["Financial Profile"];
  const associations = advice.Associations;
  const riskAssessment = advice["Risk Assessment"];
  const suitability = advice["Suitability Analysis"];
  const articlesConsidered = message.meta?.signals?.articles_considered || [];
  const basicInformation = advice["Basic Profile"];

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (rating >= 5) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  const getRiskColor = (rating: number) => {
    if (rating <= 2) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (rating <= 5) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <Card className="max-w-[90%]">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-5 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-xl text-gray-900">
                Client Advisory Report
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">{entityName}</p>
              {message.meta?.intent === "hitl" && (
                <p className="text-xs text-amber-600 mt-1 italic">
                  Advisory re-evaluated with latest information
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Overall Suitability - Hero Section */}
        <div className="mb-6 p-5 bg-gradient-to-br rounded-xl border">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Suitability Assessment
              </h4>
              <p className="text-xs text-gray-600">
                Comprehensive evaluation for wealth management services
              </p>
            </div>
            <Badge
              className={cn(
                "text-xl px-4 py-2 font-bold border",
                getRatingColor(suitability["Overall Rating"]),
              )}
            >
              {suitability["Overall Rating"]}/10
            </Badge>
          </div>

          <div className="mt-4 pt-4 border-t ">
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="text-gray-700 font-medium">
                Service Usage Likelihood
              </span>
              <span className="font-bold text-gray-900">
                {suitability["Service Usage Likelihood"]}/10
              </span>
            </div>
            <div className="space-y-2">
              {suitability.Justification.map((just, idx) => (
                <p key={idx} className="text-sm text-gray-700 leading-relaxed">
                  • {just}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Accordion for detailed sections */}
        <Accordion type="multiple" className="space-y-3">
          {/* Basic Profile */}
          <AccordionItem value="financial" className="border rounded-lg px-4">
            <AccordionTrigger className="w-full  py-4 hover:bg-gray-50 transition-colors rounded-lg cursor-pointer">
              <div className="flex items-center gap-2 w-full">
                <User className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">
                  Client Profile
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3 mt-2">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-700 block mb-2">
                    Background
                  </span>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {basicInformation["Background"].value}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-700 block mb-2">
                    Public Sentiment
                  </span>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {basicInformation["Public Sentiment"].value}
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Financial Profile */}
          <AccordionItem value="financial" className="border rounded-lg px-4">
            <AccordionTrigger className="w-full  py-4 hover:bg-gray-50 transition-colors rounded-lg cursor-pointer">
              <div className="flex items-center gap-2 w-full">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-gray-900">
                  Financial Profile
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3 mt-2">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Net Worth</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {financialProfile["Net Worth"].value}
                    </span>
                  </div>
                  {financialProfile["Net Worth"]?.sources?.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Source: {financialProfile["Net Worth"]?.sources}
                    </p>
                  )}
                </div>

                {financialProfile?.Portfolio?.value && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-700 block mb-2">
                      Portfolio Overview
                    </span>
                    <p className="text-sm text-gray-600 mb-2">
                      {financialProfile.Portfolio.value}
                    </p>
                    {financialProfile.Portfolio.sources?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1.5">Sources:</p>
                        <ul className="space-y-1">
                          {financialProfile.Portfolio.sources.map(
                            (source, index) => (
                              <li
                                key={index}
                                className="text-xs text-gray-600 flex items-start gap-1.5"
                              >
                                <span className="text-blue-400 mt-0.5">•</span>
                                {source}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-700 block mb-2">
                    Investment Activity
                  </span>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {financialProfile["Investment Activeness"].value}
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Associations */}
          <AccordionItem
            value="associations"
            className="border rounded-lg px-4"
          >
            <AccordionTrigger className="w-full  py-4 hover:bg-gray-50 transition-colors rounded-lg cursor-pointer">
              <div className="flex items-center gap-2 w-full">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">
                  Key Associations
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3 mt-2">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-700 block mb-3">
                    Companies & Brands
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {associations["Companies Brands"].map((company, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {company}
                      </Badge>
                    ))}
                    {associations["Companies Brands"].length > 8 && (
                      <Badge
                        variant="outline"
                        className="bg-gray-100 text-gray-600 border-gray-300"
                      >
                        +{associations["Companies Brands"].length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>

                {associations.Individuals.length > 0 && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Key Individuals
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {associations.Individuals.map((person, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="bg-indigo-50 text-indigo-700 border-indigo-200"
                        >
                          {person}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Risk Assessment */}
          <AccordionItem value="risk" className="border rounded-lg px-4">
            <AccordionTrigger className="w-full  py-4 hover:bg-gray-50 transition-colors rounded-lg cursor-pointer">
              <div className="flex items-center gap-2 w-full">
                <ShieldAlert className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-gray-900">
                  Risk Assessment
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3 mt-2">
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Reputational Risk
                      </span>
                      <Badge
                        className={cn(
                          "text-base font-bold border",
                          getRiskColor(
                            riskAssessment["Reputational Risk"].rating,
                          ),
                        )}
                      >
                        {riskAssessment["Reputational Risk"].rating}/10
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {riskAssessment["Reputational Risk"].justification.map(
                        (just, idx) => (
                          <p
                            key={idx}
                            className="text-xs text-gray-600 leading-relaxed"
                          >
                            • {just}
                          </p>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Illegal Activity Risk
                      </span>
                      <Badge
                        className={cn(
                          "text-base font-bold border",
                          getRiskColor(
                            riskAssessment["Illegal Activity Risk"].rating,
                          ),
                        )}
                      >
                        {riskAssessment["Illegal Activity Risk"].rating}/10
                      </Badge>
                    </div>
                    {riskAssessment["Illegal Activity Risk"].justification && (
                      <p className="text-xs text-gray-600 leading-relaxed">
                        •{" "}
                        {Array.isArray(
                          riskAssessment["Illegal Activity Risk"].justification,
                        )
                          ? riskAssessment["Illegal Activity Risk"]
                              .justification[0]
                          : riskAssessment["Illegal Activity Risk"]
                              .justification}
                      </p>
                    )}
                  </div>
                </div>

                {riskAssessment.Controversies.length > 0 && (
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-900">
                        Controversies
                      </span>
                    </div>
                    <div className="space-y-2">
                      {riskAssessment.Controversies.map((controversy, idx) => (
                        <p
                          key={idx}
                          className="text-xs text-amber-800 leading-relaxed"
                        >
                          • {controversy}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Sources Considered */}
          {articlesConsidered.length > 0 && (
            <AccordionItem value="sources" className="border rounded-lg px-4">
              <AccordionTrigger className="w-full  py-4 hover:bg-gray-50 transition-colors rounded-lg cursor-pointer">
                <div className="flex items-center gap-2 w-full">
                  <Newspaper className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">
                    Sources Considered ({articlesConsidered.length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-2 mt-2">
                  {articlesConsidered.map((article) => (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline p-2 rounded hover:bg-blue-50 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {article.title || `Source ${article.id}`}
                      </span>
                    </a>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t flex justify-between items-center">
          {message.meta?.since_days && (
            <div className="text-xs text-gray-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Analysis based on data from the last {
                message.meta.since_days
              }{" "}
              days
            </div>
          )}
          <Button
            onClick={onApprove}
            className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
          >
            Save Advice
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DefaultMessageBubble({ message }: { message: Message }) {
  return (
    <Card className="max-w-[80%] shadow-sm bg-background">
      <CardContent className="p-4">
        <div className="text-sm leading-relaxed space-y-2 break-words whitespace-pre-wrap">
          {message.content.split("\n").map((line, idx) => {
            if (idx === 0) {
              return (
                <h3 key={idx} className="font-bold text-lg break-words">
                  {line.replace(/\*\*/g, "")}
                </h3>
              );
            }

            if (line.startsWith("**") && line.endsWith("**")) {
              return (
                <h3 key={idx} className="font-bold text-lg break-words">
                  {line.replace(/\*\*/g, "")}
                </h3>
              );
            }

            if (line.startsWith("• ")) {
              const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
              const text = line
                .replace("• ", "")
                .replace(urlMatch?.[0] ?? "", "")
                .trim();
              return (
                <ul key={idx} className="ml-4 list-disc break-words w-full">
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

            const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
            if (urlMatch) {
              const text = line.replace(urlMatch[0], "").trim() || "link";
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
                {message.analysis.intent}
                {message.analysis.entities.length > 0 && (
                  <>
                    {" | "}
                    <span className="font-medium">Entity: </span>
                    {message.analysis.entities.slice(0, 3).join(", ")}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function FinancialLookupBubble({ message }: { message: Message }) {
  const financialData = message.meta?.financial_data;

  if (!financialData) return null;

  // Format large numbers for display
  const formatNumber = (num: string) => {
    const numValue = parseFloat(num);
    if (isNaN(numValue)) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: financialData.meta?.currency || "USD",
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  // Get the fiscal year from the date string
  const fiscalYear = financialData?.fiscal_year?.split("-")[0] || "N/A";

  return (
    <Card className="max-w-[80%] shadow-sm bg-background">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">
          💰 {financialData?.symbol} - Financial Overview
        </CardTitle>
        {fiscalYear && (
          <p className="text-sm text-muted-foreground">
            Fiscal Year: {fiscalYear}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground">Revenue</p>
            <p className="text-lg font-semibold">
              {formatNumber(financialData?.financials?.revenue)}
            </p>
            {financialData?.formatted?.revenue &&
              financialData?.formatted?.revenue !== "N/A" && (
                <p className="text-xs text-muted-foreground mt-1">
                  {financialData?.formatted?.revenue}
                </p>
              )}
          </div>

          <div className="p-4 bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground">Net Income</p>
            <p className="text-lg font-semibold">
              {formatNumber(financialData?.financials?.net_income)}
            </p>
            {financialData?.formatted?.net_income &&
              financialData?.formatted?.net_income !== "N/A" && (
                <p className="text-xs text-muted-foreground mt-1">
                  {financialData?.formatted?.net_income}
                </p>
              )}
          </div>

          <div className="p-4 bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <p className="text-lg font-semibold">
              {formatNumber(financialData?.financials?.total_assets)}
            </p>
            {financialData?.formatted?.total_assets &&
              financialData?.formatted?.total_assets !== "N/A" && (
                <p className="text-xs text-muted-foreground mt-1">
                  {financialData?.formatted?.total_assets}
                </p>
              )}
          </div>
        </div>

        {financialData?.meta?.timestamp && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Data as of x
            {new Date(financialData?.meta?.timestamp).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function OverviewBubble({ message }: { message: Message }) {
  const adviceList = message?.meta?.advice_list || [];
  if (adviceList.length === 0) {
    return <div>No advice data available</div>;
  }

  const renderRating = (rating: number, max: number = 10) => (
    <div className="flex items-center gap-1">
      <span className="font-medium">{rating}</span>
      <span className="text-muted-foreground">/ {max}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {adviceList.map((adviceData, index) => {
        const financials = adviceData.advice?.["Financial Profile"];
        const risk = adviceData.advice?.["Risk Assessment"];
        const suitability = adviceData.advice?.["Suitability Analysis"];

        return (
          <Card
            key={index}
            className="max-w-[80%] shadow-sm bg-background mb-6"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">
                📊 {adviceData.entity_name || "Entity"} - Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {financials && (
                <div>
                  <h4 className="font-semibold mb-2">Financial Profile</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Net Worth</p>
                      <p className="font-medium">
                        {financials["Net Worth"]?.value || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Portfolio</p>
                      <p className="font-medium">
                        {financials.Portfolio?.value || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {risk && (
                <div>
                  <h4 className="font-semibold mb-3">Risk Assessment</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Illegal Activity Risk
                      </p>
                      {renderRating(risk["Illegal Activity Risk"]?.rating || 0)}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Reputational Risk
                      </p>
                      {renderRating(risk["Reputational Risk"]?.rating || 0)}
                    </div>
                  </div>
                </div>
              )}

              {suitability && (
                <div>
                  <h4 className="font-semibold mb-2">Suitability Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Overall Rating
                      </p>
                      {renderRating(suitability["Overall Rating"] || 0)}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground font-bold">
                        Service Usage Likelihood
                      </p>
                      {renderRating(
                        suitability["Service Usage Likelihood"] || 0,
                      )}
                    </div>
                    {suitability.Justification && (
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground mb-1">
                          Justification
                        </p>
                        <ul className="space-y-1 text-sm">
                          {suitability.Justification.map((item, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Main component to render the appropriate bubble based on intent
function AssistantMessageBubble({
  message,
  onSendMessage,
}: {
  message: Message;
  onSendMessage: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const intent = message.meta?.intent;

  switch (intent) {
    case "news_lookup":
      return <NewsLookupBubble message={message} />;
    case "advisory_query":
    case "hitl":
      return <AdvisoryBubble message={message} onApprove={onSendMessage} />;
    case "overview":
      return <OverviewBubble message={message} />;
    case "financial_lookup":
      return <FinancialLookupBubble message={message} />;
    default:
      return <DefaultMessageBubble message={message} />;
  }
}

export default function Chat() {
  const {
    messages,
    setMessages,
    sessionId,
    setSessionId,
    isLoading,
    setIsLoading,
  } = useChat();

  const [inputValue, setInputValue] = useState("");
  const [pendingApprove, setPendingApprove] = useState(false);

  useEffect(() => {
    if (pendingApprove && inputValue === "approve") {
      handleSendMessage();
      setPendingApprove(false);
    }
  }, [inputValue, pendingApprove]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initSession = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        const response = await fetch(`${apiUrl}/welcome`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        setSessionId(data.session_id);
        console.log("Session initialized:", data.session_id);
      } catch (error) {
        console.error("Failed to initialize session:", error);
        setSessionId("Error");
      }
    };

    initSession();
  }, []);

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
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: currentInput,
          session_id: sessionId,
        }),
      });

      const data = await response.json();

      if (data.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id);
        console.log("Session updated:", data.session_id);
      }

      // Handle nested structure: data.text contains the actual response
      const textData = data.text || {};
      const metaData = data.meta || {};

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          typeof textData === "string"
            ? textData
            : textData.text || textData.message || "",
        sender: "assistant",
        timestamp: new Date(),
        meta: {
          intent: metaData.intent,
          entity: metaData.entity,
          since_days: metaData.since_days,
          are_articles_recent: textData.meta?.are_articles_recent || false,
          articles: textData.articles || [],
          advice: textData.advice || null,
          advice_list: textData.advice_list || [],
          financial_data: textData.financial_data || [],
          docs: metaData.docs,
          has_summary: metaData.has_summary,
          needs_clarification: metaData.needs_clarification,
          signals: metaData.signals || [],
        },
        analysis: {
          intent: metaData.intent || "unknown",
          sensitivityLevel: "N/A",
          entities: metaData.entity ? [metaData.entity] : [],
        },
        confidence: undefined,
        sources:
          typeof metaData.docs === "number"
            ? [`${metaData.docs} source(s) retrieved`]
            : Array.isArray(metaData.docs)
              ? metaData.docs.map((d: Doc) => d.url).filter(Boolean)
              : [],
        agentUsed: "orchestrator",
        requiresEscalation: metaData.needs_clarification,
      };
      console.log(
        "Assistant message:",
        assistantMessage.meta?.are_articles_recent,
      );
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

  const handleNewSession = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      await fetch(`${apiUrl}/session/delete`, {
        method: "POST",
        credentials: "include",
      });

      window.location.reload();
    } catch (error) {
      console.error("Failed to delete session:", error);
      window.location.reload();
    }
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
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1 text-xs font-mono">
              Chat ID:{" "}
              {sessionId
                ? sessionId.substring(0, 20) + "..."
                : "Initializing..."}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewSession}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              New Session
            </Button>
            <Badge variant="outline" className="gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Online
            </Badge>
          </div>
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

              {/* Message Content */}
              {message.sender === "user" ? (
                <Card className="max-w-[80%] shadow-sm bg-primary text-primary-foreground">
                  <CardContent className="p-4">
                    <div className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div className="mt-2 text-xs text-right opacity-70">
                      {formatTime(message.timestamp)}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <AssistantMessageBubble
                  message={message}
                  onSendMessage={() => {
                    setInputValue("approve");
                    setPendingApprove(true);
                  }}
                />
              )}

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
