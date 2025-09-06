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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Search,
  FileText,
  Clock,
  User,
  Eye,
  Download,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplianceAlert {
  id: string;
  type: "AML" | "Sanctions" | "KYC" | "Regulatory" | "Suspicious Activity";
  severity: "Low" | "Medium" | "High" | "Critical";
  clientName: string;
  description: string;
  timestamp: Date;
  status: "Open" | "Under Review" | "Resolved" | "Escalated";
  assignedTo?: string;
  details: {
    riskScore: number;
    triggers: string[];
    relatedTransactions: number;
    jurisdiction: string;
  };
}

interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  clientId?: string;
  details: string;
  ipAddress: string;
  complianceRelevant: boolean;
}

const mockAlerts: ComplianceAlert[] = [
  {
    id: "CA001",
    type: "AML",
    severity: "High",
    clientName: "Marcus Weber",
    description: "Large cash transfer from high-risk jurisdiction",
    timestamp: new Date("2024-01-15T10:30:00"),
    status: "Under Review",
    assignedTo: "Sarah Johnson",
    details: {
      riskScore: 85,
      triggers: [
        "Large Cash Transfer",
        "High-Risk Country",
        "Pattern Deviation",
      ],
      relatedTransactions: 3,
      jurisdiction: "Offshore Entity",
    },
  },
  {
    id: "CA002",
    type: "Sanctions",
    severity: "Critical",
    clientName: "Global Trading Corp",
    description: "Potential sanctions list match detected",
    timestamp: new Date("2024-01-14T15:45:00"),
    status: "Escalated",
    assignedTo: "Michael Chen",
    details: {
      riskScore: 95,
      triggers: ["Name Match", "Address Similarity", "Business Association"],
      relatedTransactions: 1,
      jurisdiction: "Sanctioned Region",
    },
  },
  {
    id: "CA003",
    type: "KYC",
    severity: "Medium",
    clientName: "Tech Innovations Ltd",
    description: "KYC documentation requires update",
    timestamp: new Date("2024-01-13T09:15:00"),
    status: "Open",
    details: {
      riskScore: 45,
      triggers: ["Expired Documentation", "Beneficial Owner Change"],
      relatedTransactions: 0,
      jurisdiction: "Switzerland",
    },
  },
];

const mockAuditLogs: AuditLog[] = [
  {
    id: "AL001",
    timestamp: new Date("2024-01-15T14:30:00"),
    userId: "john.doe@ubs.com",
    action: "Client Portfolio Access",
    clientId: "C001",
    details: "Accessed Sarah Chen portfolio dashboard",
    ipAddress: "192.168.1.100",
    complianceRelevant: true,
  },
  {
    id: "AL002",
    timestamp: new Date("2024-01-15T14:25:00"),
    userId: "jane.smith@ubs.com",
    action: "Compliance Alert Review",
    details: "Reviewed AML alert CA001 for Marcus Weber",
    ipAddress: "192.168.1.101",
    complianceRelevant: true,
  },
  {
    id: "AL003",
    timestamp: new Date("2024-01-15T14:20:00"),
    userId: "mike.wilson@ubs.com",
    action: "Chat Query",
    details: "Asked about client net worth information",
    ipAddress: "192.168.1.102",
    complianceRelevant: false,
  },
];

export default function AlertDashboard() {
  const [selectedAlert, setSelectedAlert] = useState<ComplianceAlert>(
    mockAlerts[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredAlerts = mockAlerts.filter((alert) => {
    const matchesSearch =
      alert.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      alert.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "text-red-600 bg-red-100 border-red-200";
      case "High":
        return "text-orange-600 bg-orange-100 border-orange-200";
      case "Medium":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "Low":
        return "text-blue-600 bg-blue-100 border-blue-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "text-blue-600 bg-blue-100";
      case "Under Review":
        return "text-yellow-600 bg-yellow-100";
      case "Resolved":
        return "text-green-600 bg-green-100";
      case "Escalated":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "AML":
        return <Shield className="w-4 h-4" />;
      case "Sanctions":
        return <Flag className="w-4 h-4" />;
      case "KYC":
        return <User className="w-4 h-4" />;
      case "Regulatory":
        return <FileText className="w-4 h-4" />;
      case "Suspicious Activity":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {mockAlerts.filter((a) => a.status !== "Resolved").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockAlerts.filter((a) => a.severity === "Critical").length}{" "}
              Critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {mockAlerts.filter((a) => a.status === "Under Review").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg. review time: 2.5 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolved Today
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
            <p className="text-xs text-muted-foreground">This month: 12</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Score
            </CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <p className="text-xs text-muted-foreground">Above target (90%)</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts Banner */}
      {mockAlerts.some(
        (alert) => alert.severity === "Critical" && alert.status !== "Resolved"
      ) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            Critical Compliance Alert
          </AlertTitle>
          <AlertDescription className="text-red-700">
            You have{" "}
            {
              mockAlerts.filter(
                (a) => a.severity === "Critical" && a.status !== "Resolved"
              ).length
            }{" "}
            critical compliance alert(s) requiring immediate attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Compliance Alerts</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="under review">Under Review</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alerts List */}
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-muted/50",
                    selectedAlert.id === alert.id && "ring-2 ring-primary",
                    getSeverityColor(alert.severity)
                  )}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">{getTypeIcon(alert.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge
                              className={cn(
                                "text-xs",
                                getSeverityColor(alert.severity)
                              )}
                            >
                              {alert.severity}
                            </Badge>
                            <Badge
                              className={cn(
                                "text-xs",
                                getStatusColor(alert.status)
                              )}
                            >
                              {alert.status}
                            </Badge>
                          </div>
                          <p className="font-medium text-sm">
                            {alert.clientName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {alert.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {alert.timestamp.toLocaleDateString()} • Risk Score:{" "}
                            {alert.details.riskScore}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Alert Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    {getTypeIcon(selectedAlert.type)}
                    <span>{selectedAlert.type} Alert</span>
                  </CardTitle>
                  <Badge
                    className={cn(
                      "text-xs",
                      getSeverityColor(selectedAlert.severity)
                    )}
                  >
                    {selectedAlert.severity}
                  </Badge>
                </div>
                <CardDescription>Alert ID: {selectedAlert.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">
                    Client Information
                  </h4>
                  <p className="text-sm">{selectedAlert.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedAlert.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Risk Assessment</h4>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm">Risk Score:</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full",
                          selectedAlert.details.riskScore >= 80
                            ? "bg-red-500"
                            : selectedAlert.details.riskScore >= 60
                            ? "bg-orange-500"
                            : selectedAlert.details.riskScore >= 40
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        )}
                        style={{ width: `${selectedAlert.details.riskScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {selectedAlert.details.riskScore}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Triggers</h4>
                  <div className="space-y-1">
                    {selectedAlert.details.triggers.map((trigger, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <AlertTriangle className="w-3 h-3 mr-2 text-amber-500" />
                        {trigger}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge
                      className={cn(
                        "ml-2 text-xs",
                        getStatusColor(selectedAlert.status)
                      )}
                    >
                      {selectedAlert.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Assigned To:</span>
                    <span className="ml-2">
                      {selectedAlert.assignedTo || "Unassigned"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Related Transactions:</span>
                    <span className="ml-2">
                      {selectedAlert.details.relatedTransactions}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Jurisdiction:</span>
                    <span className="ml-2">
                      {selectedAlert.details.jurisdiction}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Investigate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Escalate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Complete log of all system activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          log.complianceRelevant ? "bg-red-500" : "bg-green-500"
                        )}
                      />
                      <div>
                        <p className="font-medium text-sm">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.details}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.userId} • {log.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {log.ipAddress}
                      </p>
                      {log.complianceRelevant && (
                        <Badge className="text-xs bg-red-100 text-red-600 mt-1">
                          Compliance Relevant
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Regulatory Reports</CardTitle>
                <CardDescription>
                  Generate compliance reports for regulators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Monthly AML Report
                </Button>
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  KYC Status Report
                </Button>
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Sanctions Screening Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Internal Reports</CardTitle>
                <CardDescription>
                  Reports for internal compliance monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Risk Assessment Summary
                </Button>
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Alert Resolution Report
                </Button>
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Audit Trail Export
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Settings</CardTitle>
              <CardDescription>
                Configure compliance monitoring parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Risk Thresholds</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">
                      AML Risk Threshold
                    </label>
                    <Input type="number" defaultValue="75" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">
                      Transaction Limit (USD)
                    </label>
                    <Input
                      type="number"
                      defaultValue="50000"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">
                  Notification Settings
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">
                      Email alerts for critical compliance issues
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">
                      Real-time sanctions screening
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">
                      Weekly compliance summary reports
                    </span>
                  </label>
                </div>
              </div>

              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
