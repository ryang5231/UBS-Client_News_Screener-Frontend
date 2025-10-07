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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Article {
  person: string;
  title: string;
  url: string;
  source: string;
  content: string;
  summary: {
    summary_text: string;
    summary_title: string;
    summary_url: string;
  };
  publish_date?: string;
  birthdate?: string;
  age?: number;
  net_worth?: string;
  id: string;
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
  const pageSize = 10; // articles per page

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

  // Fetch articles when selected person changes
  useEffect(() => {
    if (!selectedPerson) return;

    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${dbUrl}/db/articles/${encodeURIComponent(selectedPerson)}`,
        );
        const data = await res.json();
        setArticles(data.articles || []);
        setCurrentPage(1); // Reset to first page when person changes
      } catch (err) {
        console.error("Error fetching articles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [dbUrl, selectedPerson]);

  // Pagination
  const totalPages = Math.ceil(articles.length / pageSize);
  const currentArticles = articles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

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
      <div className="mb-6">
        <label
          htmlFor="person-select"
          className="block text-sm font-medium mb-2"
        >
          Select Person:
        </label>
        {loadingPeople ? (
          <p className="text-muted-foreground">Loading people...</p>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full max-w-md justify-between"
              >
                {selectedPerson || "Select a person"}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-full max-w-md p-0"
              align="start"
              style={{
                maxHeight: "12rem", // roughly fits ~5 items
                overflowY: "auto", // enables scrolling when >5 items
                width: "var(--radix-dropdown-menu-trigger-width)", // same width as trigger
              }}
            >
              {hnwiPeople.map((hnwi) => (
                <DropdownMenuItem
                  key={hnwi.person}
                  onClick={() => setSelectedPerson(hnwi.person)}
                  className="cursor-pointer"
                >
                  {hnwi.person}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {!selectedPerson ? (
        <p className="text-muted-foreground">
          Please select a person to view articles.
        </p>
      ) : loading ? (
        <p className="text-muted-foreground">Loading articles...</p>
      ) : articles.length === 0 ? (
        <p className="text-muted-foreground">
          No articles found for {selectedPerson}
        </p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Articles for {selectedPerson}</CardTitle>
            <CardDescription>
              Showing {currentArticles.length} of {articles.length} articles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[10%] text-base">Title</TableHead>
                  <TableHead className="w-[5%] text-base">Source</TableHead>
                  <TableHead className="w-[30%] text-base">Summary</TableHead>
                  <TableHead className="w-[5%] text-base">
                    Publish Date
                  </TableHead>
                  <TableHead className="w-[5%] text-base">URL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium text-base whitespace-normal break-words">
                      {article.title}
                    </TableCell>

                    <TableCell className="text-base">
                      {article.source}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <textarea
                        readOnly
                        value={article.summary.summary_text}
                        className="w-full min-h-[80px] p-2 text-base border rounded resize-none bg-muted/50 focus:outline-none"
                        rows={5}
                      />
                    </TableCell>
                    <TableCell className="text-base">
                      {formatDate(article.publish_date)}
                    </TableCell>
                    <TableCell>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline font-medium text-base"
                      >
                        Link
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination controls */}
            <div className="mt-6 flex justify-center items-center gap-4">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ArticlesPage;
