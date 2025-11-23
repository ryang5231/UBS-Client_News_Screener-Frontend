"use client";
// pages/articles.tsx
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";

interface Sentiment {
  overall: string;
  score?: number;
  confidence: number;
}

interface KeyEntity {
  name: string;
  type: string;
  relevance: number;
  sentiment: string;
  mentions: number;
}

interface FinancialImpact {
  has_impact: boolean;
  affected_companies: string[];
  impact_type: string;
}

interface Summary {
  summary_text: string;
  model_type: string;
  is_relevant: boolean;
  created_at: string;
  business_area: string;
  content_type: string;
  sentiment: Sentiment;
  key_entities: KeyEntity[];
  topics: string[];
  financial_impact: FinancialImpact;
  source_credibility: string;
}

interface SimilarArticle {
  id: string;
  title: string;
  similarity: number;
  content_type: string;
  publish_date: string;
}

interface FactCheck {
  status: string;
  confidence?: number;
  evidence?: string;
  actionable_insight?: string;
  status_change?: string;
}

interface Article {
  person: string;
  title: string;
  url: string;
  source: string;
  content: string;
  publish_date?: string;
  id: string;
  summary: Summary;
  similar_articles?: SimilarArticle[];
  fact_check?: FactCheck;
}

interface HNWIPerson {
  person: string;
}

// Utility function to format date
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
};

const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hnwiPeople, setHnwiPeople] = useState<HNWIPerson[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [pagination, setPagination] = useState({
    total: 0,
    hasMore: false,
    skip: 0,
    limit: 10,
  });
  const pageSize = 10; // articles per page

  const toggleArticleExpand = (articleId: string) => {
    setExpandedArticles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const dbUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch HNWI people on mount
  useEffect(() => {
    const fetchHNWIPeople = async () => {
      setLoadingPeople(true);
      try {
        const res = await fetch(`${dbUrl}/db/hnwi/all`);
        const data = await res.json();
        // Handle different response structures
        const peopleArray = Array.isArray(data)
          ? data
          : data.people || data.hnwi || [];
        setHnwiPeople(peopleArray);
        // Set first person as default if available
        if (peopleArray.length > 0) {
          setSelectedPerson(peopleArray[0].person);
        }
      } catch (err) {
        console.error("Error fetching HNWI people:", err);
      } finally {
        setLoadingPeople(false);
      }
    };

    fetchHNWIPeople();
  }, [dbUrl]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch articles when selected person or search query changes
  useEffect(() => {
    if (!selectedPerson) return;

    const fetchArticles = async () => {
      setLoading(true);
      try {
        const url = new URL(
          `${dbUrl}/db/articles/${encodeURIComponent(selectedPerson)}`,
        );

        // Add query parameters
        if (debouncedSearchQuery) {
          url.searchParams.append("search", debouncedSearchQuery);
        }

        // Add pagination parameters
        const skip = (currentPage - 1) * pageSize;
        url.searchParams.append("limit", pageSize.toString());
        url.searchParams.append("skip", skip.toString());

        const res = await fetch(url.toString());
        const data = await res.json();

        // Always replace the articles with the new page's data
        setArticles(data.items || []);

        // Update pagination state
        setPagination({
          total: data.total || 0,
          hasMore: data.has_more || false,
          skip: skip,
          limit: pageSize,
        });
      } catch (err) {
        console.error("Error fetching articles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [dbUrl, selectedPerson, debouncedSearchQuery, currentPage, pageSize]);

  // Calculate total pages based on the total count from the API
  const totalPages = Math.max(1, Math.ceil(pagination.total / pageSize));

  // Current articles are always what's in state (current page)
  const currentArticles = articles;

  // Show next button if there are more pages or if we know there are more items
  const showNextButton = currentPage < totalPages;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recent Articles</h1>
          <p className="text-muted-foreground mt-1">Latest news and articles</p>
        </div>
        {selectedPerson && (
          <Badge variant="outline" className="text-lg px-4 py-2">
            {selectedPerson}
          </Badge>
        )}
      </div>

      {/* HNWI Person Dropdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <label htmlFor="person-select" className="block text-sm font-medium">
            Select Person
          </label>
          {loadingPeople ? (
            <p className="text-muted-foreground">Loading people...</p>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full max-w-md justify-between truncate"
                >
                  <span className="truncate capitalize">
                    {selectedPerson || "Select a person"}
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-[calc(100vw-2rem)] sm:w-full max-w-md p-0 capitalize"
                align="start"
                sideOffset={4}
                collisionPadding={16}
                style={{
                  maxHeight: "min(24rem, 70vh)",
                  overflowY: "auto",
                  width: "var(--radix-dropdown-menu-trigger-width)",
                  maxWidth: "calc(100vw - 2rem)",
                }}
              >
                {hnwiPeople.map((hnwi) => (
                  <DropdownMenuItem
                    key={hnwi.person}
                    onSelect={() => setSelectedPerson(hnwi.person)}
                    className="cursor-pointer px-4 py-2 hover:bg-muted/50 focus:bg-muted/50"
                  >
                    <span className="truncate">{hnwi.person}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="search-articles"
            className="block text-sm font-medium"
          >
            Search Articles
          </label>
          <div className="relative">
            <input
              id="search-articles"
              type="text"
              placeholder="Search by title..."
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {!selectedPerson ? (
        <p className="text-muted-foreground">
          Please select a person to view articles.
        </p>
      ) : loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                <div className="flex justify-between mt-4">
                  <div className="h-3 bg-muted rounded w-24"></div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No articles found for {selectedPerson}
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Try selecting a different person or check back later for updates.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Articles for {selectedPerson}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({articles.length} total)
              </span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages > 0 ? totalPages : 1}
                {pagination.total > 0 && (
                  <>
                    {" • "}
                    Showing {pagination.skip + 1}-
                    {Math.min(
                      pagination.skip + articles.length,
                      pagination.total,
                    )}
                    {pagination.total > 0
                      ? ` of ${pagination.total} articles`
                      : " articles"}
                  </>
                )}
                {pagination.total === 0 &&
                  articles.length > 0 &&
                  " (All available articles)"}
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            {currentArticles.map((article) => {
              const isExpanded = expandedArticles.has(article.id);
              const factCheckStatus =
                article.fact_check?.status?.toLowerCase() || "unverified";
              const factCheckColor =
                {
                  verified: "bg-green-100 text-green-800 border-green-200",
                  "partially verified":
                    "bg-yellow-100 text-yellow-800 border-yellow-200",
                  unverified: "bg-gray-100 text-gray-800 border-gray-200",
                  false: "bg-red-100 text-red-800 border-red-200",
                }[factCheckStatus] ||
                "bg-gray-100 text-gray-800 border-gray-200";

              return (
                <Card
                  key={article.id}
                  className={`transition-all duration-200 ${isExpanded ? "ring-2 ring-primary/20" : "hover:shadow-md"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className={`${factCheckColor} border rounded-full px-2.5 py-0.5 text-xs font-medium`}
                          >
                            {article.fact_check?.status || "Unverified"}
                            {article.fact_check?.confidence &&
                              ` (${article.fact_check.confidence}%)`}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(article.publish_date)}
                          </span>
                        </div>

                        <h3 className="text-lg font-medium leading-tight line-clamp-2">
                          {article.title}
                        </h3>

                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span className="truncate">
                            {new URL(article.url).hostname.replace("www.", "")}
                          </span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {article.summary.content_type
                              ? article.summary.content_type
                                  .charAt(0)
                                  .toUpperCase() +
                                article.summary.content_type.slice(1)
                              : "Unknown"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex space-x-1 ml-2">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-full hover:bg-muted"
                          onClick={(e) => e.stopPropagation()}
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleArticleExpand(article.id);
                          }}
                          className="p-1.5 rounded-full hover:bg-muted"
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t space-y-4">
                        {/* Summary Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm text-muted-foreground">
                              SUMMARY
                            </h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {article.summary.content_type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {article.summary.business_area}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">
                            {article.summary.summary_text}
                          </p>
                        </div>

                        {/* Sentiment & Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Sentiment */}
                          {article.summary.sentiment?.overall && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-muted-foreground">
                                SENTIMENT
                              </h4>
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`px-3 py-1.5 rounded-full font-medium text-sm ${
                                    article.summary.sentiment.overall ===
                                    "positive"
                                      ? "bg-green-50 text-green-800"
                                      : article.summary.sentiment.overall ===
                                          "negative"
                                        ? "bg-red-50 text-red-800"
                                        : "bg-gray-50 text-gray-800"
                                  }`}
                                >
                                  {article.summary.sentiment.overall
                                    .charAt(0)
                                    .toUpperCase() +
                                    article.summary.sentiment.overall.slice(1)}
                                  {article.summary.sentiment.score !==
                                    undefined && (
                                    <span className="ml-1 font-normal">
                                      (
                                      {Math.round(
                                        article.summary.sentiment.score * 100,
                                      )}
                                      %)
                                    </span>
                                  )}
                                </div>
                                {article.summary.sentiment.confidence !==
                                  undefined && (
                                  <div className="text-xs text-muted-foreground">
                                    Confidence:{" "}
                                    {Math.round(
                                      article.summary.sentiment.confidence *
                                        100,
                                    )}
                                    %
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Financial Impact */}
                          {article.summary.financial_impact?.has_impact && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-muted-foreground">
                                FINANCIAL IMPACT
                              </h4>
                              <div className="flex items-center space-x-2">
                                <div className="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-full text-sm font-medium">
                                  {article.summary.financial_impact.impact_type
                                    .split("_")
                                    .map(
                                      (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1),
                                    )
                                    .join(" ")}
                                </div>
                                <div className="text-sm">
                                  {article.summary.financial_impact.affected_companies.join(
                                    ", ",
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Key Entities */}
                        {article.summary.key_entities &&
                          article.summary.key_entities.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-muted-foreground">
                                KEY ENTITIES
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {article.summary.key_entities
                                  .sort((a, b) => b.relevance - a.relevance)
                                  .slice(0, 5)
                                  .map((entity, idx) => (
                                    <div
                                      key={idx}
                                      className="text-xs bg-muted/30 rounded-full px-3 py-1.5 border"
                                    >
                                      <span className="font-medium">
                                        {entity.name}
                                      </span>
                                      <span className="text-muted-foreground ml-1">
                                        ({entity.type})
                                      </span>
                                      <span className="ml-2 text-muted-foreground text-[11px]">
                                        {entity.sentiment} •{" "}
                                        {Math.round(entity.relevance * 100)}% •{" "}
                                        {entity.mentions}{" "}
                                        {entity.mentions === 1
                                          ? "mention"
                                          : "mentions"}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                        {/* Topics */}
                        {article.summary.topics &&
                          article.summary.topics.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-muted-foreground">
                                TOPICS
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {article.summary.topics.map((topic, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-muted/20 hover:bg-muted/30 transition-colors rounded-full px-3 py-1"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {article.fact_check && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">
                              FACT CHECK
                            </h4>
                            <div className="space-y-3">
                              {article.fact_check.evidence && (
                                <div className="bg-muted/30 p-3 rounded-md">
                                  <p className="text-sm">
                                    {article.fact_check.evidence}
                                  </p>
                                </div>
                              )}
                              {article.fact_check.actionable_insight && (
                                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                                  <p className="text-sm font-medium text-blue-800 mb-1">
                                    Insight
                                  </p>
                                  <p className="text-sm text-blue-700">
                                    {article.fact_check.actionable_insight}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {article.similar_articles &&
                          article.similar_articles.length > 0 && (
                            <div className="border rounded-md overflow-hidden">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const relatedId = `related-${article.id}`;
                                  const relatedEl =
                                    document.getElementById(relatedId);
                                  if (relatedEl) {
                                    relatedEl.classList.toggle("hidden");
                                    const icon =
                                      e.currentTarget.querySelector("svg");
                                    if (icon) {
                                      icon.classList.toggle("rotate-90");
                                    }
                                  }
                                }}
                                className="w-full text-left p-3 hover:bg-muted/30 flex items-center justify-between text-sm font-medium"
                              >
                                <span>
                                  Related Articles (
                                  {article.similar_articles.length})
                                </span>
                                <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                              </button>
                              <div
                                id={`related-${article.id}`}
                                className="hidden"
                              >
                                <div className="max-h-60 overflow-y-auto border-t">
                                  <div className="space-y-3 p-3">
                                    {article.similar_articles.map(
                                      (similar, idx) => (
                                        <div
                                          key={idx}
                                          className="border-l-2 border-muted-foreground/20 pl-3 py-1"
                                        >
                                          <div className="flex flex-col gap-1">
                                            <a
                                              href={`#${similar.id}`}
                                              className="text-sm font-medium break-words hover:underline"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            >
                                              {similar.title}
                                            </a>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                              <Badge
                                                variant="outline"
                                                className="text-xs"
                                              >
                                                {similar.content_type}
                                              </Badge>
                                              <span className="text-xs text-muted-foreground">
                                                {formatDate(
                                                  similar.publish_date,
                                                )}
                                              </span>
                                              <span className="text-xs text-muted-foreground">
                                                {(
                                                  similar.similarity * 100
                                                ).toFixed(0)}
                                                % similar
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              disabled={currentPage === 1 || totalPages <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {totalPages > 0 && (
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Calculate page numbers to show (current page in the middle when possible)
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="h-8 w-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="px-2 text-sm text-muted-foreground">
                    ...
                  </span>
                )}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!showNextButton || totalPages <= 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticlesPage;
