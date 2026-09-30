"use client";
import { API_BASE_URL } from "@/lib/api";
import React, { useState, useEffect, useMemo, useCallback } from "react";

import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Factory,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Layers,
  Calendar as CalendarIcon,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Layers3,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  AreaChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Utility for Indian currency / number formatting
const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return "0";
  return Number(num).toLocaleString("en-IN");
};

// Distinct color palettes
const LINE_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];
const MIL_COLORS = {
  "3 Mil": "#3b82f6",
  "4 Mil": "#06b6d4",
  "5 Mil": "#10b981",
  "6 Mil": "#f59e0b",
  "7 Mil": "#8b5cf6",
  "8 Mil": "#ec4899",
  "Unknown Mil": "#94a3b8",
};

const COLOR_MAP_PALETTE = {
  Black: "#1f2937",
  Blue: "#2563eb",
  "Cobalt Blue": "#1d4ed8",
  "Violet Blue": "#4f46e5",
  Orange: "#f97316",
  White: "#94a3b8",
  Unknown: "#64748b",
};

const SIZE_COLORS = {
  XS: "#06b6d4",
  Small: "#3b82f6",
  Medium: "#10b981",
  Large: "#f59e0b",
  "Extra Large": "#8b5cf6",
  XXL: "#ec4899",
  "3XL": "#64748b",
  Unknown: "#94a3b8",
};

export default function ProductionAnalyticsDashboard() {
  const [preset, setPreset] = useState("6m");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");

  // Calculate default dates based on preset
  // useEffect(() => {
  //   const now = new Date();
  //   let start;
  //   if (preset === "3m") {
  //     start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  //   } else if (preset === "6m") {
  //     start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  //   } else if (preset === "12m") {
  //     start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  //   }

  //   if (preset !== "custom" && start) {
  //     const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  //     const fromStr = start.toISOString().split("T")[0];
  //     const toStr = end.toISOString().split("T")[0];
  //     setFromDate(fromStr);
  //     setToDate(toStr);
  //   }

  // }, [preset]);


  useEffect(() => {
    const now = new Date(); let start; if (preset === "3m") { start = new Date(now.getFullYear(), now.getMonth() - 2, 1); }
    else if (preset === "6m") {
      start = new Date(now.getFullYear(),
        now.getMonth() - 5, 1);
    }
    else if (preset === "12m") {
      start = new Date(now.getFullYear(),
        now.getMonth() - 11, 1);
    }
    if (preset !== "custom" && start) {
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Format date in local timezone to avoid UTC date shifting 
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      const fromStr = formatDate(start);
      const toStr = formatDate(end);
      setFromDate(fromStr); setToDate(toStr);
    }
  }, [preset]);



  // Fetch aggregated data
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("accessToken");
      let url = `${API_BASE_URL}/admin/productionAnalytics`;
      if (fromDate && toDate) {
        url += `?from=${fromDate}&to=${toDate}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && res.data.success) {
        setAnalyticsData(res.data);
        if (res.data.availableMonths && res.data.availableMonths.length > 0) {
          // Default to latest month
          setSelectedMonth(res.data.availableMonths[res.data.availableMonths.length - 1]);
        }
      } else {
        setError("Failed to load production analytics data.");
      }
    } catch (err) {
      console.error("Error loading production analytics:", err);
      setError("An error occurred while fetching analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    if (fromDate && toDate) {
      fetchAnalytics();
    }
  }, [fromDate, toDate, fetchAnalytics]);


  // Daily breakdown details for selected month
  const activeMonthData = useMemo(() => {
    if (!analyticsData || !selectedMonth || !analyticsData.monthlyDailyBreakdown) {
      return null;
    }
    return analyticsData.monthlyDailyBreakdown[selectedMonth] || null;
  }, [analyticsData, selectedMonth]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const seen = new Set();
      const uniquePayload = payload.filter((entry) => {
        if (seen.has(entry.name)) return false;
        seen.add(entry.name);
        return true;
      });

      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-lg shadow-xl text-xs space-y-1 z-50 relative">
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2 border-b border-gray-100 dark:border-gray-800 pb-1">{label}</p>
          {uniquePayload.map((entry, index) => {
            const isLineProd = entry.name && entry.name.endsWith(" Production") && entry.name !== "Net Production" && entry.name !== "Total Production";
            return (
              <React.Fragment key={`item-${index}`}>
                <div className="flex items-center justify-between gap-6 py-0.5">
                  <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                    <span className="w-2.5 h-2.5 rounded-full inline-block shadow-sm" style={{ backgroundColor: entry.color }} />
                    {entry.name}:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatNumber(entry.value)} Pcs
                  </span>
                </div>
                {entry.name === "Rejection" && entry.payload && entry.payload.production > 0 && (
                  <div className="flex items-center justify-between gap-6 py-0.5 pl-4">
                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      Rejection Percentage:
                    </span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {((entry.payload.rejection / entry.payload.production) * 100).toFixed(2)}%
                    </span>
                  </div>
                )}
                {isLineProd && entry.payload && (
                  (() => {
                    const lineName = entry.name.replace(" Production", "");
                    const prod = entry.payload[`${lineName}_production`];
                    const rej = entry.payload[`${lineName}_rejection`];
                    const bkHrs = entry.payload[`${lineName}_breakdownHours`] || 0;
                    if (prod !== undefined && rej !== undefined) {
                      const rejPerc = prod > 0 ? ((rej / prod) * 100).toFixed(2) : "0.00";
                      const bkDays = (bkHrs / 24).toFixed(2);
                      return (
                        <div className="pl-4 pb-1 mb-1 border-b border-gray-100 dark:border-gray-800 last:border-0 last:mb-0 last:pb-0">
                          <div className="flex items-center justify-between gap-6 text-[11px] py-0.5 text-gray-500 dark:text-gray-400">
                            <span>Rejection Rate:</span>
                            <span className="font-bold text-red-500">{rejPerc}%</span>
                          </div>
                          <div className="flex items-center justify-between gap-6 text-[11px] py-0.5 text-gray-500 dark:text-gray-400">
                            <span>Down Time:</span>
                            <span className="font-semibold text-orange-600 dark:text-orange-400">
                              {bkHrs.toFixed(1)} hrs <span className="text-gray-400 font-normal">({bkDays} days)</span>
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()
                )}
              </React.Fragment>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (loading && !analyticsData) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-14 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 my-6">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{error}</h3>
        <Button onClick={fetchAnalytics} className="mt-4 bg-primary text-white">
          <RefreshCw className="w-4 h-4 mr-2" /> Retry Loading
        </Button>
      </div>
    );
  }

  const { summary, overallMonthly, lineWiseMonthly, availableMonths } = analyticsData || {};

  return (
    <div className="space-y-6 pb-8">
      {/* ── Filter Bar ── */}
      <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Production Analytics Dashboard
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Range:</span>
              <Select value={preset} onValueChange={setPreset}>
                <SelectTrigger className="w-[160px] h-9 text-xs">
                  <SelectValue placeholder="Select Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="12m">Last 12 Months</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {preset === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-9 px-2 text-xs border rounded-md dark:bg-gray-800 dark:border-gray-700"
                />
                <span className="text-xs text-gray-400">to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-9 px-2 text-xs border rounded-md dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnalytics}
              className="h-9 text-xs gap-1.5"
              disabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Gross Production</p>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                {formatNumber(summary?.totalProduction)} <span className="text-xs font-normal text-gray-500">Pcs</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {formatNumber(summary?.totalProductionKg)} Kg
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600">
              <Factory className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Rejection</p>
              <h3 className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">
                {formatNumber(summary?.totalRejection)} <span className="text-xs font-normal text-gray-500">Pcs</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {formatNumber(summary?.totalRejectionKg)} Kg
              </p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Net Good Production</p>
              <h3 className="text-2xl font-extrabold text-green-600 dark:text-green-400 mt-1">
                {formatNumber(summary?.netProduction)} <span className="text-xs font-normal text-gray-500">Pcs</span>
              </h3>
              <p className="text-xs text-green-600 font-semibold mt-1">
                Production - Rejection
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950/40 rounded-xl text-green-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Rejection Rate</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {summary?.rejectionRate}%
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${summary?.rejectionRate <= 3
                    ? "bg-green-100 text-green-700"
                    : summary?.rejectionRate <= 5
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                    }`}
                >
                  {summary?.rejectionRate <= 3 ? "Good" : summary?.rejectionRate <= 5 ? "Moderate" : "High"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Top Line: <span className="font-semibold text-gray-800 dark:text-gray-200">{summary?.topLine}</span>
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-purple-600">
              <TrendingDown className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Section 2: Overall Monthly Analytics ── */}
      <Card className="shadow-sm border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Overall Monthly Analytics</CardTitle>
              <CardDescription>Production vs Rejection by Month with Net Production</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {overallMonthly && overallMonthly.length > 0 ? (
            <div className="h-[360px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={overallMonthly} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="monthLabel" tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="production" name="Total Production" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  <Bar dataKey="netProduction" name="Net Production" fill="#62e689" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  <Bar dataKey="rejection" name="Rejection" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  <Line type="monotone" dataKey="netProduction" name="Net Production" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No monthly production data available for the selected period.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section 3: Line-Wise Analytics ── */}
      <Card className="shadow-sm border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Line-Wise Production Performance</CardTitle>
          <CardDescription>Compare monthly production quantity across lines</CardDescription>
        </CardHeader>
        <CardContent>
          {lineWiseMonthly && lineWiseMonthly.length > 0 && summary?.linesList?.length > 0 ? (
            <div className="h-[360px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lineWiseMonthly} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="monthLabel" tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "12px" }} />
                  {summary.linesList.map((line, idx) => (
                    <Bar
                      key={line}
                      dataKey={`${line}_production`}
                      name={`${line} Production`}
                      fill={LINE_COLORS[idx % LINE_COLORS.length]}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={35}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No line-wise data available for the selected period.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section 4: Month-Specific Product Analytics ── */}
      <Card className="shadow-sm border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
        <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Layers3 className="w-5 h-5 text-indigo-600" /> Month-Specific Daily Analytics
            </CardTitle>
            <CardDescription>Daily product breakdown by Thickness/Mil, Color, and Size</CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Select Month:</span>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px] h-9 text-xs bg-white dark:bg-gray-800">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths &&
                  availableMonths.map((mKey) => (
                    <SelectItem key={mKey} value={mKey}>
                      {analyticsData?.monthlyDailyBreakdown?.[mKey]?.monthLabel || mKey}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-8">
          {activeMonthData && activeMonthData.hasData ? (
            <>
              {/* 4A: Mil-wise vs Date */}
              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> A. Thickness / Mil-wise vs Date
                  </h4>
                  <span className="text-xs text-gray-500">Daily Quantity (Pcs)</span>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeMonthData.milWise} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 11 }} label={{ value: "Date of Month", position: "insideBottom", offset: -10, fontSize: 11 }} />
                      <YAxis tickLine={false} tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px" }} />
                      {activeMonthData.milList.map((milKey) => (
                        <Bar
                          key={milKey}
                          dataKey={milKey}
                          name={milKey}
                          stackId="a"
                          fill={MIL_COLORS[milKey] || "#64748b"}
                          radius={activeMonthData.milList.indexOf(milKey) === activeMonthData.milList.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 4B: Color-wise vs Date */}
              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> B. Color-wise vs Date
                  </h4>
                  <span className="text-xs text-gray-500">Stacked Area Distribution</span>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeMonthData.colorWise} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 11 }} label={{ value: "Date of Month", position: "insideBottom", offset: -10, fontSize: 11 }} />
                      <YAxis tickLine={false} tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px" }} />
                      {activeMonthData.colorList.map((colorKey) => (
                        <Area
                          key={colorKey}
                          type="monotone"
                          dataKey={colorKey}
                          name={colorKey}
                          stackId="1"
                          stroke={COLOR_MAP_PALETTE[colorKey] || "#64748b"}
                          fill={COLOR_MAP_PALETTE[colorKey] || "#64748b"}
                          fillOpacity={0.6}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 4C: Size-wise vs Date */}
              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> C. Size-wise vs Date
                  </h4>
                  <span className="text-xs text-gray-500">Daily Size Breakdown</span>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeMonthData.sizeWise} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 11 }} label={{ value: "Date of Month", position: "insideBottom", offset: -10, fontSize: 11 }} />
                      <YAxis tickLine={false} tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px" }} />
                      {activeMonthData.sizeList.map((sizeKey) => (
                        <Bar
                          key={sizeKey}
                          dataKey={sizeKey}
                          name={sizeKey}
                          fill={SIZE_COLORS[sizeKey] || "#64748b"}
                          radius={[4, 4, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-gray-500 bg-white dark:bg-gray-900 rounded-xl border">
              No daily product breakdown data found for {activeMonthData?.monthLabel || selectedMonth}.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
