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
  AlertTriangle,
  Activity,
  TrendingDown,
  Clock,
  RefreshCw,
  BarChart3,
  Zap,
  Timer,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// ─── Constants ──────────────────────────────────────────────────────────────
const LINE_COLORS = {
  "Line 1": "#f97316",
  "Line 2": "#3b82f6",
  "Line 3": "#10b981",
};
const LINE_NAMES = ["Line 1", "Line 2", "Line 3"];

const MONTHS = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

const PERIODS = [
  { label: "Last 3 Months", value: "3months" },
  { label: "Last 6 Months", value: "6months" },
  { label: "Last 8 Months", value: "8months" },
  { label: "Last 12 Months", value: "12months" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 4 }, (_, i) => CURRENT_YEAR - i);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (mins) => {
  if (!mins || mins <= 0) return "0h 0m";
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${h}h ${m}m`;
};

const toHours = (mins) => parseFloat((mins / 60).toFixed(1));

// ─── Tooltips ─────────────────────────────────────────────────────────────────
const PieTooltipContent = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-bold text-gray-800 mb-2">{d.name}</p>
      <div className="flex items-center gap-2 text-gray-600">
        <span className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
        <span>Downtime: <span className="font-semibold text-gray-900">{fmt(d.downtime)}</span></span>
      </div>
      <div className="flex items-center gap-2 text-gray-600 mt-1">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span>Uptime: <span className="font-semibold text-gray-900">{fmt(d.uptime)}</span></span>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
        <span className="text-green-600 font-bold">{d.uptimePct}%</span> up &nbsp;·&nbsp;
        <span className="text-red-500 font-bold">{d.downtimePct}%</span> down
      </div>
    </div>
  );
};

const BarTooltipContent = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-bold text-gray-800 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-gray-600 mt-1">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
          <span>{entry.name}: <span className="font-semibold text-gray-900">{fmt(entry.value)}</span></span>
        </div>
      ))}
    </div>
  );
};

const ReasonTooltipContent = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm max-w-[280px]">
      <p className="font-bold text-gray-800 mb-2 break-words leading-tight">{label}</p>
      {payload.map((entry) => entry.value > 0 && (
        <div key={entry.name} className="flex items-center gap-2 text-gray-600 mt-1">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
          <span>{entry.name}: <span className="font-semibold text-gray-900">{fmt(entry.value)}</span></span>
        </div>
      ))}
      <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
        Combined: <span className="text-orange-600 font-bold">{fmt(total)}</span>
      </div>
    </div>
  );
};

// ─── Uptime Bar ───────────────────────────────────────────────────────────────
const UptimeBar = ({ line, uptimePct, downtimePct, uptime, downtime }) => (
  <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-100/60 transition-colors">
    <div className="flex items-center justify-between mb-2.5">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ background: LINE_COLORS[line] }} />
        <span className="text-sm font-semibold text-gray-800">{line}</span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="text-green-600 font-bold">{uptimePct}% up</span>
        <span className="text-red-500 font-semibold">{downtimePct}% down</span>
      </div>
    </div>
    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden flex gap-0.5">
      <div
        className="h-full bg-green-500 rounded-l-full transition-all duration-700"
        style={{ width: `${uptimePct}%` }}
      />
      <div
        className="h-full bg-red-400 rounded-r-full transition-all duration-700"
        style={{ width: `${downtimePct}%` }}
      />
    </div>
    <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
      <span className="flex items-center gap-1"><span className="text-green-500">↑</span> {fmt(uptime)}</span>
      <span className="flex items-center gap-1"><span className="text-red-400">↓</span> {fmt(downtime)}</span>
    </div>
  </div>
);

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function DowntimeAnalyticsDashboard() {
  const now = new Date();
  const [filterMode, setFilterMode] = useState("month");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [period, setPeriod] = useState("3months");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLine, setActiveLine] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      let url = `${API_BASE_URL}/admin/downtimeAnalytics?`;
      if (filterMode === "month") {
        url += `month=${month}&year=${year}`;
      } else {
        url += `period=${period}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) setData(res.data);
      else setError("No data returned from server.");
    } catch (err) {
      setError("Failed to fetch downtime analytics. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [filterMode, month, year, period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    if (!data) return null;
    const { lineTotal, uptimeData } = data;
    const totalDown = LINE_NAMES.reduce((s, l) => s + (lineTotal?.[l] || 0), 0);
    const highestLine = LINE_NAMES.reduce((a, b) =>
      (lineTotal?.[a] || 0) >= (lineTotal?.[b] || 0) ? a : b
    );
    const avgUptime = (
      LINE_NAMES.reduce((s, l) => s + (uptimeData?.[l]?.uptimePct || 0), 0) / 3
    ).toFixed(1);
    return { totalDown, highestLine, avgUptime };
  }, [data]);

  // Pie: one segment per line showing downtime vs uptime slices
  const pieData = useMemo(() => {
    if (!data?.uptimeData) return [];
    return LINE_NAMES.flatMap((l) => {
      const u = data.uptimeData[l];
      if (!u || (u.downtime === 0 && u.uptime === 0)) return [];
      return [
        {
          name: `${l} — Down`,
          value: u.downtime,
          fill: LINE_COLORS[l],
          downtime: u.downtime,
          uptime: u.uptime,
          uptimePct: u.uptimePct,
          downtimePct: u.downtimePct,
        },
        {
          name: `${l} — Up`,
          value: u.uptime,
          fill: `${LINE_COLORS[l]}30`,
          downtime: u.downtime,
          uptime: u.uptime,
          uptimePct: u.uptimePct,
          downtimePct: u.downtimePct,
        },
      ];
    });
  }, [data]);

  // Date-wise: single line or all lines
  const dateWiseFiltered = useMemo(() => {
    if (!data) return [];
    if (activeLine) {
      return (data.lineDateArrays?.[activeLine] || []).map((d) => ({
        date: d.date.slice(5),
        [activeLine]: d.downtime,
      }));
    }
    return (data.dateWiseData || []).map((d) => ({
      ...d,
      date: d.date.slice(5),
    }));
  }, [data, activeLine]);

  const reasonData = useMemo(
    () =>
      (data?.reasonWiseData || []).map((r) => ({
        ...r,
        shortReason: r.reason.length > 38 ? r.reason.slice(0, 36) + "…" : r.reason,
        fullReason: r.reason,
      })),
    [data]
  );

  const reasonChartHeight = Math.max(380, reasonData.length * 52);

  const reverseDate = (date) => {
    return date.split('-').reverse().join('-');
  }

  // ── States ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
        <p className="text-gray-500 font-medium">Loading downtime analytics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-red-600 font-semibold text-lg">{error}</p>
        <Button onClick={fetchData} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" /> Retry
        </Button>
      </div>
    );
  }

  const noData = !data || Object.values(data.lineTotal || {}).every((v) => v === 0);

  const selectedMonthLabel =
    MONTHS.find((m) => m.value === month)?.label ?? "";

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Downtime Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {data?.dateRange
              ? `${reverseDate(data.dateRange.from)} → ${reverseDate(data.dateRange.to)}`
              : "Select a filter to load data"}
            {data?.totalDays ? (
              <span className="ml-2 font-medium text-gray-400">
                ({data.totalDays} days)
              </span>
            ) : null}
          </p>
        </div>

        {/* ── Filters ────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode toggle */}
          <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setFilterMode("month")}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${filterMode === "month"
                ? "bg-orange-500 text-white"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
            >
              By Month
            </button>
            <button
              onClick={() => setFilterMode("period")}
              className={`px-4 py-2 text-sm font-semibold transition-colors border-l border-gray-200 dark:border-gray-700 ${filterMode === "period"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
            >
              By Period
            </button>
          </div>

          {filterMode === "month" ? (
            <>
              <Select
                value={String(month)}
                onValueChange={(v) => setMonth(Number(v))}
              >
                <SelectTrigger className="w-36 h-9 text-sm">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(year)}
                onValueChange={(v) => setYear(Number(v))}
              >
                <SelectTrigger className="w-24 h-9 text-sm">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : (
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Summary Cards ─────────────────────────────────────────────── */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: TrendingDown,
              label: "Total Downtime",
              value: fmt(summary.totalDown),
              desc: "All lines combined",
              iconBg: "bg-red-100 dark:bg-red-900/30",
              iconColor: "text-red-500",
              valueBorder: "border-l-red-500",
            },
            {
              icon: Activity,
              label: "Avg Line Uptime",
              value: `${summary.avgUptime}%`,
              desc: "Across 3 lines",
              iconBg: "bg-green-100 dark:bg-green-900/30",
              iconColor: "text-green-600",
              valueBorder: "border-l-green-500",
            },
            {
              icon: AlertTriangle,
              label: "Most Affected",
              value: summary.highestLine,
              desc: fmt(data?.lineTotal?.[summary.highestLine] || 0),
              iconBg: "bg-orange-100 dark:bg-orange-900/30",
              iconColor: "text-orange-500",
              valueBorder: "border-l-orange-500",
            },
            {
              icon: Clock,
              label: "Days in Period",
              value: data?.totalDays ?? "—",
              desc: data?.dateRange
                ? `${reverseDate(data.dateRange.from).slice(0, 5)} → ${reverseDate(data.dateRange.to).slice(0, 5)}`
                : "",
              iconBg: "bg-blue-100 dark:bg-blue-900/30",
              iconColor: "text-blue-600",
              valueBorder: "border-l-blue-500",
            },
          ].map(({ icon: Icon, label, value, desc, iconBg, iconColor, valueBorder }) => (
            <Card
              key={label}
              className={`border-l-4 ${valueBorder} shadow-sm hover:shadow-md transition-shadow`}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
                    {label}
                  </p>
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5 truncate">
                    {value}
                  </p>
                  {desc && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{desc}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {noData ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-semibold text-lg">
              No downtime records for this period
            </p>
            <p className="text-gray-400 text-sm">
              Try selecting a different month or period using the filters above.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Row 1: Pie + Uptime bars ──────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Pie */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-orange-500"
                  />
                  Line-Wise Downtime Distribution
                </CardTitle>
                <CardDescription>
                  Solid arc = downtime &nbsp;·&nbsp; Faded arc = uptime
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={105}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltipContent />} />
                      <Legend
                        formatter={(val, entry) => (
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            {entry.payload.name}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Per-line downtime totals below pie */}
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                  {LINE_NAMES.map((l) => {
                    const mins = data?.lineTotal?.[l] || 0;
                    return (
                      <div key={l} className="text-center">
                        <div
                          className="text-lg font-bold"
                          style={{ color: LINE_COLORS[l] }}
                        >
                          {toHours(mins)}h
                        </div>
                        <div className="text-xs text-gray-500 font-medium">{l}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Uptime bars */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  Uptime vs Downtime by Line
                </CardTitle>
                <CardDescription>
                  Period availability — green = up, red = down
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {LINE_NAMES.map((l) => {
                  const u = data?.uptimeData?.[l];
                  if (!u) return null;
                  return (
                    <UptimeBar
                      key={l}
                      line={l}
                      uptimePct={u.uptimePct}
                      downtimePct={u.downtimePct}
                      uptime={u.uptime}
                      downtime={u.downtime}
                    />
                  );
                })}

                {/* Legend row */}
                <div className="flex items-center gap-4 pt-2 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-full bg-green-500 inline-block" />
                    Uptime
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-full bg-red-400 inline-block" />
                    Downtime
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Row 2: Date-wise bar chart ──────────────────────────────── */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    Date-Wise Downtime
                  </CardTitle>
                  <CardDescription>
                    Daily downtime — use tabs to focus on a single line
                  </CardDescription>
                </div>

                {/* Line selector tabs */}
                <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden text-xs font-semibold flex-shrink-0">
                  <button
                    onClick={() => setActiveLine(null)}
                    className={`px-3 py-1.5 transition-colors ${!activeLine
                      ? "bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-900"
                      : "bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                  >
                    All
                  </button>
                  {LINE_NAMES.map((l) => (
                    <button
                      key={l}
                      onClick={() => setActiveLine(activeLine === l ? null : l)}
                      className="px-3 py-1.5 border-l border-gray-200 dark:border-gray-700 transition-colors"
                      style={
                        activeLine === l
                          ? { background: LINE_COLORS[l], color: "#fff" }
                          : {}
                      }
                    >
                      {l.replace("Line ", "L")}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dateWiseFiltered}
                    margin={{ top: 5, right: 16, left: 0, bottom: 24 }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(0,0,0,0.06)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      tickLine={false}
                      axisLine={false}
                      angle={-35}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      tickFormatter={(v) => `${toHours(v)}h`}
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <Tooltip content={<BarTooltipContent />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                    />
                    {activeLine ? (
                      <Bar
                        dataKey={activeLine}
                        fill={LINE_COLORS[activeLine]}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                    ) : (
                      LINE_NAMES.map((l) => (
                        <Bar
                          key={l}
                          dataKey={l}
                          fill={LINE_COLORS[l]}
                          radius={[3, 3, 0, 0]}
                          maxBarSize={16}
                        />
                      ))
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* ── Row 3: Reason analysis ──────────────────────────────────── */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Top Downtime Reasons
              </CardTitle>
              <CardDescription>
                Top {reasonData.length} reasons by total duration — hover bars for per-line breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Chart — scrollable container with dynamic height */}
              <div
                className="overflow-y-auto pr-2 -mr-2"
                style={{ maxHeight: 520 }}
              >
                <div style={{ height: reasonChartHeight }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reasonData}
                      layout="vertical"
                      margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                      barCategoryGap="18%"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(0,0,0,0.06)"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        tickFormatter={(v) => `${toHours(v)}h`}
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(0,0,0,0.1)" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="shortReason"
                        width={170}
                        tick={{ fontSize: 11, fill: "#374151", fontWeight: 500 }}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                      />
                      <Tooltip
                        content={<ReasonTooltipContent />}
                        cursor={{ fill: "rgba(0,0,0,0.04)" }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: "12px", paddingBottom: "4px" }}
                        verticalAlign="top"
                      />
                      {LINE_NAMES.map((l, idx) => (
                        <Bar
                          key={l}
                          dataKey={l}
                          name={l}
                          stackId="a"
                          fill={LINE_COLORS[l]}
                          radius={
                            idx === LINE_NAMES.length - 1
                              ? [0, 4, 4, 0]
                              : [0, 0, 0, 0]
                          }
                          maxBarSize={30}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Ranked reason list */}
              <div className="mt-5 border-t border-gray-100 dark:border-gray-800 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Ranked by Total Downtime
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {reasonData.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 px-3 py-2.5 gap-2 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <span
                          className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate"
                          title={r.fullReason}
                        >
                          {r.fullReason}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-orange-600 flex-shrink-0 ml-1">
                        {fmt(r.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
