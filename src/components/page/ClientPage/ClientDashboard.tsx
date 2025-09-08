"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  TrendingUp,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  Building,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientData {
  id: string;
  name: string;
  netWorth: number;
  riskProfile: "Conservative" | "Moderate" | "Aggressive";
  complianceStatus: "Clear" | "Under Review" | "Flagged";
  lastActivity: Date;
  portfolio: {
    totalValue: number;
    allocation: {
      stocks: number;
      bonds: number;
      alternatives: number;
      cash: number;
    };
    performance: {
      ytd: number;
      oneYear: number;
    };
  };
  profile: {
    industry: string;
    location: string;
    joinDate: Date;
    contact: {
      phone: string;
      email: string;
    };
  };
  recentTransactions: Array<{
    id: string;
    type: "Buy" | "Sell" | "Transfer";
    asset: string;
    amount: number;
    date: Date;
  }>;
  riskFlags: string[];
  opportunities: string[];
}

const mockClients: ClientData[] = [
  {
    id: "1",
    name: "Sarah Chen",
    netWorth: 15750000,
    riskProfile: "Moderate",
    complianceStatus: "Clear",
    lastActivity: new Date("2024-01-15"),
    portfolio: {
      totalValue: 12500000,
      allocation: { stocks: 60, bonds: 25, alternatives: 10, cash: 5 },
      performance: { ytd: 8.5, oneYear: 12.3 },
    },
    profile: {
      industry: "Technology",
      location: "Zurich, Switzerland",
      joinDate: new Date("2019-03-15"),
      contact: { phone: "+41 44 123 4567", email: "s.chen@techcorp.com" },
    },
    recentTransactions: [
      {
        id: "t1",
        type: "Buy",
        asset: "AAPL",
        amount: 250000,
        date: new Date("2024-01-10"),
      },
      {
        id: "t2",
        type: "Sell",
        asset: "TSLA",
        amount: 180000,
        date: new Date("2024-01-08"),
      },
    ],
    riskFlags: [],
    opportunities: ["ESG Investment Options", "Private Equity Allocation"],
  },
  {
    id: "2",
    name: "Marcus Weber",
    netWorth: 8900000,
    riskProfile: "Conservative",
    complianceStatus: "Under Review",
    lastActivity: new Date("2024-01-12"),
    portfolio: {
      totalValue: 7200000,
      allocation: { stocks: 40, bonds: 45, alternatives: 5, cash: 10 },
      performance: { ytd: 4.2, oneYear: 6.8 },
    },
    profile: {
      industry: "Manufacturing",
      location: "Geneva, Switzerland",
      joinDate: new Date("2021-07-22"),
      contact: { phone: "+41 22 987 6543", email: "m.weber@manufacturing.ch" },
    },
    recentTransactions: [
      {
        id: "t3",
        type: "Transfer",
        asset: "Cash",
        amount: 500000,
        date: new Date("2024-01-05"),
      },
    ],
    riskFlags: ["Large Cash Transfer"],
    opportunities: ["Fixed Income Laddering", "Currency Hedging"],
  },
];

export default function Clients() {
  const [selectedClient, setSelectedClient] = useState<ClientData>(
    mockClients[0]
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = mockClients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case "Clear":
        return "text-green-600 bg-green-100";
      case "Under Review":
        return "text-yellow-600 bg-yellow-100";
      case "Flagged":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getRiskColor = (profile: string) => {
    switch (profile) {
      case "Conservative":
        return "text-blue-600 bg-blue-100";
      case "Moderate":
        return "text-yellow-600 bg-yellow-100";
      case "Aggressive":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="flex h-full">
      {/* Client List Sidebar */}
      <div className="w-80 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-y-auto">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className={cn(
                "p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors",
                selectedClient.id === client.id && "bg-muted"
              )}
              onClick={() => setSelectedClient(client)}
            >
              <div className="flex items-start space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={`/client-${client.id}.jpg`} />
                  <AvatarFallback>
                    {client.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{client.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(client.netWorth)}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge
                      className={cn(
                        "text-xs",
                        getComplianceColor(client.complianceStatus)
                      )}
                    >
                      {client.complianceStatus}
                    </Badge>
                    {client.riskFlags.length > 0 && (
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Client Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={`/client-${selectedClient.id}.jpg`} />
                <AvatarFallback className="text-lg">
                  {selectedClient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {selectedClient.name}
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building className="w-4 h-4 mr-1" />
                    {selectedClient.profile.industry}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    {selectedClient.profile.location}
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge
                    className={cn(
                      "text-xs",
                      getRiskColor(selectedClient.riskProfile)
                    )}
                  >
                    {selectedClient.riskProfile} Risk
                  </Badge>
                  <Badge
                    className={cn(
                      "text-xs",
                      getComplianceColor(selectedClient.complianceStatus)
                    )}
                  >
                    {selectedClient.complianceStatus}
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="outline">Generate Report</Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(selectedClient.netWorth)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Portfolio:{" "}
                  {formatCurrency(selectedClient.portfolio.totalValue)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  YTD Performance
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +{selectedClient.portfolio.performance.ytd}%
                </div>
                <p className="text-xs text-muted-foreground">
                  1Y: +{selectedClient.portfolio.performance.oneYear}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Risk Flags
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedClient.riskFlags.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedClient.riskFlags.length === 0
                    ? "No active flags"
                    : "Requires attention"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Opportunities
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedClient.opportunities.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Investment recommendations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue="portfolio" className="space-y-4">
            <TabsList>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Asset Allocation</CardTitle>
                    <CardDescription>
                      Current portfolio distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(selectedClient.portfolio.allocation).map(
                        ([asset, percentage]) => (
                          <div
                            key={asset}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm font-medium capitalize">
                              {asset}
                            </span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground w-8">
                                {percentage}%
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Assessment</CardTitle>
                    <CardDescription>
                      Current risk factors and flags
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedClient.riskFlags.length === 0 ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm">No risk flags detected</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedClient.riskFlags.map((flag, index) => (
                          <div
                            key={index}
                            className="flex items-center text-amber-600"
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            <span className="text-sm">{flag}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest portfolio activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedClient.recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                              transaction.type === "Buy"
                                ? "bg-green-100 text-green-600"
                                : transaction.type === "Sell"
                                ? "bg-red-100 text-red-600"
                                : "bg-blue-100 text-blue-600"
                            )}
                          >
                            {transaction.type[0]}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {transaction.type} {transaction.asset}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {transaction.date.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Client Profile</CardTitle>
                  <CardDescription>
                    Personal and business information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Industry
                        </label>
                        <p className="text-sm">
                          {selectedClient.profile.industry}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Location
                        </label>
                        <p className="text-sm">
                          {selectedClient.profile.location}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Client Since
                        </label>
                        <p className="text-sm">
                          {selectedClient.profile.joinDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Phone
                        </label>
                        <p className="text-sm">
                          {selectedClient.profile.contact.phone}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Email
                        </label>
                        <p className="text-sm">
                          {selectedClient.profile.contact.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Last Activity
                        </label>
                        <p className="text-sm">
                          {selectedClient.lastActivity.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Opportunities</CardTitle>
                  <CardDescription>
                    Personalized recommendations based on client profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedClient.opportunities.map((opportunity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium">
                            {opportunity}
                          </span>
                        </div>
                        <Button variant="outline" size="sm">
                          Learn More
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
