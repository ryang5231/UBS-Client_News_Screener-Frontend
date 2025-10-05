'use client'
// pages/articles.tsx
import React, { useEffect, useState } from "react";

interface Article {
  person: string;
  title: string;
  url: string;
  source: string;
  content: string;
  publish_date?: string;
  birthdate?: string;
  age?: number;
  net_worth?: string;
  id: string;
}

const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // articles per page
  const person = "elon musk"; // fixed person

  const dbUrl = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${dbUrl}/db/articles/${encodeURIComponent(person)}`);
        const data = await res.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Pagination
  const totalPages = Math.ceil(articles.length / pageSize);
  const currentArticles = articles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Recent Articles for {person}</h1>

      {loading ? (
        <p>Loading articles...</p>
      ) : articles.length === 0 ? (
        <p>No articles found for {person}</p>
      ) : (
        <>
          <table className="border-collapse border border-gray-300 w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Title</th>
                <th className="border border-gray-300 p-2">Source</th>
                <th className="border border-gray-300 p-2">Content</th>
                <th className="border border-gray-300 p-2">Publish Date</th>
                <th className="border border-gray-300 p-2">URL</th>
              </tr>
            </thead>
            <tbody>
              {currentArticles.map((article) => (
                <tr key={article.id}>
                  <td className="border border-gray-300 p-2">
                    {article.title}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {article.source}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {article.content}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {article.publish_date || "N/A"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Link
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div className="mt-4 flex justify-center items-center gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ArticlesPage;
