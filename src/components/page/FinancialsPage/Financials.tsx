"use client";
import React, { useEffect, useState } from "react";

interface IncomeStatement {
  fiscal_date: string;
  EBITDA: string;
  totalRevenue: string;
  grossProfit: string;
  netIncome: string;
  eps: string | null;
}

interface BalanceSheet {
  totalAssets: string;
  totalLiabilities: string;
  totalEquity: string;
}

interface CashFlow {
  operatingCashFlow: string;
  capitalExpenditures: string;
  freeCashFlow: string;
}

interface EarningsHistoryItem {
  fiscalDateEnding: string;
  reportedEPS: string;
}

interface FinancialData {
  symbol: string;
  income_statement: IncomeStatement;
  balance_sheet: BalanceSheet;
  cash_flow: CashFlow;
  earnings_estimates: {
    history: EarningsHistoryItem[];
  };
}

const FinancialsPage: React.FC = () => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const dbUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchFinancials = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${dbUrl}/db/financials/AAPL`);
        const json = await res.json();

        // Extract the inner financial data
        const financial = json.financial_data?.results?.[0]?.data || null;
        setData(financial);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancials();
  }, []);

  if (loading) return <p>Loading financials...</p>;
  if (!data) return <p>No financial data found</p>;

  const history = data?.earnings_estimates?.history || [];

  const historyToShow = showFullHistory ? history : history.slice(0, 5);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Financials: {data.symbol}</h1>

      {/* Income Statement */}
      <h2 className="text-xl font-semibold mt-4 mb-2">Income Statement</h2>
      <table className="border border-gray-300 w-full mb-4">
        <tbody>
          {Object.entries(data.income_statement).map(([key, value]) => (
            <tr key={key}>
              <td className="border p-2 font-semibold">{key}</td>
              <td className="border p-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Balance Sheet */}
      <h2 className="text-xl font-semibold mt-4 mb-2">Balance Sheet</h2>
      <table className="border border-gray-300 w-full mb-4">
        <tbody>
          {Object.entries(data.balance_sheet).map(([key, value]) => (
            <tr key={key}>
              <td className="border p-2 font-semibold">{key}</td>
              <td className="border p-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Cash Flow */}
      <h2 className="text-xl font-semibold mt-4 mb-2">Cash Flow</h2>
      <table className="border border-gray-300 w-full mb-4">
        <tbody>
          {Object.entries(data.cash_flow).map(([key, value]) => (
            <tr key={key}>
              <td className="border p-2 font-semibold">{key}</td>
              <td className="border p-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Earnings History */}
      <h2 className="text-xl font-semibold mt-4 mb-2">Earnings History</h2>
      <table className="border border-gray-300 w-full mb-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Fiscal Date</th>
            <th className="border p-2">Reported EPS</th>
          </tr>
        </thead>
        <tbody>
          {historyToShow.map((item, idx) => (
            <tr key={idx}>
              <td className="border p-2">{item.fiscalDateEnding}</td>
              <td className="border p-2">{item.reportedEPS}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.earnings_estimates.history.length > 5 && (
        <button
          className="px-3 py-1 border rounded"
          onClick={() => setShowFullHistory((prev) => !prev)}
        >
          {showFullHistory ? "Show Less" : "Show All"}
        </button>
      )}
    </div>
  );
};

export default FinancialsPage;
