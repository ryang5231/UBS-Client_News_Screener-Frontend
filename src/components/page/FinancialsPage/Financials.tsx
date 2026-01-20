"use client";
import React, { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

// Utility function to format large numbers
const formatNumber = (value: string | number | null): string => {
  if (value === null || value === undefined || value === "None") return "N/A";

  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return value.toString();

  const absNum = Math.abs(num);

  if (absNum >= 1e12) {
    return `$${(num / 1e12).toFixed(2)}T`;
  } else if (absNum >= 1e9) {
    return `$${(num / 1e9).toFixed(2)}B`;
  } else if (absNum >= 1e6) {
    return `$${(num / 1e6).toFixed(2)}M`;
  } else if (absNum >= 1e3) {
    return `$${(num / 1e3).toFixed(2)}K`;
  }

  return `$${num.toFixed(2)}`;
};

// Utility to format field names
const formatFieldName = (key: string): string => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const FinancialsPage: React.FC = () => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [loadingSymbols, setLoadingSymbols] = useState(true);
  const dbUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch all symbols on mount
  useEffect(() => {
    const fetchSymbols = async () => {
      setLoadingSymbols(true);
      try {
        const res = await fetch(`${dbUrl}/db/financials/all`);
        const data = await res.json();
        // Extract the financial_data array
        const symbolsArray = data.financial_data || [];
        setSymbols(symbolsArray);
        // Set first symbol as default if available
        if (symbolsArray.length > 0) {
          setSelectedSymbol(symbolsArray[0]);
        }
      } catch (err) {
        console.error("Error fetching symbols:", err);
      } finally {
        setLoadingSymbols(false);
      }
    };

    fetchSymbols();
  }, [dbUrl]);

  // Fetch financials when selected symbol changes
  useEffect(() => {
    if (!selectedSymbol) return;

    const fetchFinancials = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${dbUrl}/db/financials/${selectedSymbol}`);
        const json = await res.json();

        // Extract the inner financial data
        const financial = json.financial_data?.results?.[0]?.data || null;
        setData(financial);
      } catch (err) {
        console.error("Error fetching financials:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancials();
  }, [dbUrl, selectedSymbol]);

  if (loadingSymbols) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading symbols...</p>
      </div>
    );
  }

  // console.log(data);

  const history = data?.earnings_estimates?.history || [];
  const historyToShow = showFullHistory ? history : history.slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Overview</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive financial data
          </p>
        </div>
        {data && (
          <Badge variant="outline" className="text-lg px-4 py-2">
            {data.symbol}
          </Badge>
        )}
      </div>

      {/* Symbol Dropdown */}
      <div className="mb-6">
        <label
          htmlFor="symbol-select"
          className="block text-sm font-medium mb-2"
        >
          Select Symbol:
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full max-w-md justify-between"
            >
              {selectedSymbol || "Select a symbol"}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-full max-w-md p-0"
            align="start"
            style={{
              maxHeight: "12rem",
              overflowY: "auto",
              width: "var(--radix-dropdown-menu-trigger-width)",
            }}
          >
            {symbols.map((symbol) => (
              <DropdownMenuItem
                key={symbol}
                onClick={() => setSelectedSymbol(symbol)}
                className="cursor-pointer"
              >
                {symbol}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {!selectedSymbol ? (
        <p className="text-muted-foreground">
          Please select a symbol to view financials.
        </p>
      ) : loading ? (
        <p className="text-muted-foreground">Loading financials...</p>
      ) : !data ? (
        <p className="text-muted-foreground">No financial data found</p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Income Statement Card */}
            <Card className="col-span-full lg:col-span-1">
              <CardHeader>
                <CardTitle>Income Statement</CardTitle>
                <CardDescription>
                  {data.income_statement.fiscal_date || "Latest Period"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {Object.entries(data.income_statement)
                      .filter(([key]) => key !== "fiscal_date")
                      .map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium">
                            {formatFieldName(key)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {key === "eps" && value !== null
                              ? `$${value}`
                              : formatNumber(value)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Balance Sheet Card */}
            <Card className="col-span-full lg:col-span-1">
              <CardHeader>
                <CardTitle>Balance Sheet</CardTitle>
                <CardDescription>Assets, Liabilities & Equity</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {Object.entries(data.balance_sheet).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">
                          {formatFieldName(key)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatNumber(value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Cash Flow Card */}
            <Card className="col-span-full lg:col-span-1">
              <CardHeader>
                <CardTitle>Cash Flow</CardTitle>
                <CardDescription>Operating & Free Cash Flow</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {Object.entries(data.cash_flow).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">
                          {formatFieldName(key)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatNumber(value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Earnings History Card */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Earnings History</CardTitle>
              <CardDescription>
                Historical earnings per share (EPS) data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fiscal Date</TableHead>
                    <TableHead className="text-right">Reported EPS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyToShow.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {item.fiscalDateEnding}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${item.reportedEPS}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.earnings_estimates.history &&
                data.earnings_estimates.history.length > 5 && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowFullHistory((prev) => !prev)}
                    >
                      {showFullHistory ? "Show Less" : "Show All History"}
                    </Button>
                  </div>
                )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default FinancialsPage;
