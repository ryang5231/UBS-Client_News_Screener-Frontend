"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface InsightData {
  id: string;
  hnwi_name: string;
  updated_at: string;
  session_id?: string;
  articles_considered?: string[];

  advice: {
    financial_profile?: {
      net_worth?: {
        value?: string;
        sources?: string[];
      };
      portfolio?: {
        value?: string;
        sources?: string[];
      };
      investment_activeness?: {
        value?: string;
        sources?: string[];
      };
    };

    associations?: {
      companies_brands?: string[];
      individuals?: string[];
      sources?: string[];
    };

    risk_assessment?: {
      controversies?: string[];
      illegal_activity_risk?: {
        rating?: number;
        justification?: string[];
      };
      reputational_risk?: {
        rating?: number;
        justification?: string[];
      };
    };

    suitability_analysis?: {
      overall_rating?: number;
      service_usage_likelihood?: number;
      justification?: string[];
    };

    model_type?: string;
    success?: boolean;
  };
}
type ResponseType = {
  [key: string]: InsightData | InsightData[] | undefined;
};
type GroupedInsights = Record<string, InsightData[]>;

const safeExtractArray = (resp: InsightData[]): InsightData[] => {
  // If it's already an array, return it
  if (Array.isArray(resp)) return resp;

  // Common wrappers that some APIs use
  const candidates = ["value", "items", "documents", "docs", "results", "data"];
  for (const key of candidates) {
    if (Array.isArray(resp?.[key])) return resp[key];
  }

  if (resp && typeof resp === "object") {
    const maybeInsightKeys = [
      "id",
      "hnwi_name",
      "advice",
      "session_id",
      "updated_at",
    ];
    const hasInsightShape = maybeInsightKeys.some((k) => k in resp);
    if (hasInsightShape) return [resp as InsightData];
  }

  if (resp && typeof resp === "object") {
    const values = Object.values(resp as ResponseType).flatMap((v) =>
      Array.isArray(v) ? v : [],
    );
    if (values.length > 0) return values as InsightData[];
  }

  console.warn(
    "safeExtractArray: could not parse response into array. Response:",
    resp,
  );
  return [];
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";

  try {
    // Remove double timezone: `+00:00Z` -> `Z`
    const cleaned = dateString.replace(/\+00:00Z$/, "Z");

    const date = new Date(cleaned);
    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  } catch {
    return dateString;
  }
};

const groupBySession = (items: InsightData[] = []): GroupedInsights => {
  if (!Array.isArray(items)) {
    console.warn("groupBySession expected array but got:", items);
    return {};
  }

  return items.reduce((acc: GroupedInsights, item: InsightData) => {
    const session = item.session_id || "unknown";
    if (!acc[session]) acc[session] = [];
    acc[session].push(item);
    return acc;
  }, {});
};

const renderRating = (rating: number | undefined, max = 10) => {
  const safeRating = Number.isFinite(rating) ? rating : 0;
  return (
    <span className="text-sm font-medium">
      {safeRating}/{max}
    </span>
  );
};

const Insights = () => {
  const [grouped, setGrouped] = useState<GroupedInsights>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not set");

        const res = await fetch(`${apiUrl}/db/insights`);
        if (!res.ok)
          throw new Error(
            `Failed to fetch insights: ${res.status} ${res.statusText}`,
          );

        const raw = await res.json();

        const arr = safeExtractArray(raw);
        if (arr.length === 0) {
          if (raw && typeof raw === "object") {
            const maybeGrouped = Object.entries(raw).every(
              ([, v]) =>
                Array.isArray(v) &&
                v.every((x: unknown) => typeof x === "object"),
            );
            if (maybeGrouped) {
              setGrouped(raw as GroupedInsights);
              return;
            }
          }

          setGrouped({});
          setError(
            "No insights found (server returned unexpected response shape).",
          );
          return;
        }

        const groupedMap = groupBySession(arr);
        setGrouped(groupedMap);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
        setGrouped({});
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          ></svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No advice history
          </h3>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-1/3 mb-6" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  const sessionIds = Object.keys(grouped);
  if (sessionIds.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">No insights available</h2>
        <p>No insights data found for this client.</p>
      </div>
    );
  }

  const sortedSessions = sessionIds.map((sid) => {
    const items = grouped[sid].slice().sort((a, b) => {
      const ta = new Date(a.updated_at || 0).getTime();
      const tb = new Date(b.updated_at || 0).getTime();
      return tb - ta;
    });
    return { sid, items };
  });

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Client Insights (Grouped by Session)
        </h1>
        <span className="text-sm text-gray-500">
          Sessions: {sessionIds.length}
        </span>
      </div>

      <div className="space-y-6">
        {sortedSessions.map(({ sid, items }, idx) => (
          <details key={sid} className="rounded-md shadow-sm p-4">
            <summary className="cursor-pointer font-semibold flex justify-between items-center space-x-4">
              <span>
                {items[0]?.updated_at
                  ? formatDate(items[0].updated_at)
                  : "Unknown date"}
                <span className="text-gray-500 font-normal">
                  {" • "}
                  {items.length} insight{items.length > 1 ? "s" : ""}
                </span>
              </span>
              <span className="text-sm font-normal capitalize text-gray-600  max-w-[50%]">
                {Array.from(new Set(items.map((item) => item.hnwi_name))).join(
                  ", ",
                )}
              </span>
            </summary>

            <div className="space-y-6 mt-4">
              {items.map((insight) => {
                const { advice = {}, hnwi_name = "Unknown" } = insight;

                return (
                  <Card key={insight.id || Math.random()}>
                    <CardHeader>
                      <div className="flex justify-between items-start w-full">
                        <div>
                          <CardTitle className="truncate capitalize">
                            {hnwi_name}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Financial Profile */}
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm text-gray-600">
                          FINANCIAL PROFILE
                        </h3>
                        <div className="pl-2 space-y-2 border-l-2 border-gray-100">
                          <div>
                            <p className="text-sm font-medium">Net Worth</p>
                            <p className="text-sm">
                              {advice?.financial_profile?.net_worth?.value ??
                                "N/A"}
                            </p>
                          </div>

                          {advice?.financial_profile?.portfolio?.value && (
                            <div>
                              <p className="text-sm font-medium">Portfolio</p>
                              <p className="text-sm">
                                {advice.financial_profile.portfolio.value}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Risk Assessment */}
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm text-gray-600">
                          RISK ASSESSMENT
                        </h3>
                        <div className="pl-2 space-y-2 border-l-2 border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Illegal Activity Risk
                            </span>
                            {renderRating(
                              advice?.risk_assessment?.illegal_activity_risk
                                ?.rating,
                            )}
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Reputational Risk
                            </span>
                            {renderRating(
                              advice?.risk_assessment?.reputational_risk
                                ?.rating,
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Controversies */}
                      {advice?.risk_assessment?.controversies?.length ? (
                        <div className="space-y-2">
                          <h3 className="font-medium text-sm text-gray-600">
                            NOTABLE CONTROVERSIES
                          </h3>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {advice.risk_assessment.controversies
                              .slice(0, 3)
                              .map((controversy, i) => (
                                <li key={i} className="text-sm">
                                  {controversy}
                                </li>
                              ))}
                          </ul>
                        </div>
                      ) : null}

                      {/* Suitability Analysis */}
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm text-gray-600">
                          SUITABILITY
                        </h3>
                        <div className="pl-2 space-y-2 border-l-2 border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Overall Rating
                            </span>
                            {renderRating(
                              advice?.suitability_analysis?.overall_rating,
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Service Usage Likelihood
                            </span>
                            {renderRating(
                              advice?.suitability_analysis
                                ?.service_usage_likelihood,
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Justification */}
                      {advice?.suitability_analysis?.justification?.length ? (
                        <div className="space-y-2">
                          <h3 className="font-medium text-sm text-gray-600">
                            JUSTIFICATION
                          </h3>
                          <p className="text-sm text-gray-700">
                            {advice.suitability_analysis.justification[0]}
                          </p>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

export default Insights;
