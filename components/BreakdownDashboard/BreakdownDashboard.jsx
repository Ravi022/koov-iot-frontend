"use client";
import { API_BASE_URL } from "@/lib/api";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
    AlertTriangle,
    Clock,
    Layers,
    Cpu,
    WifiOff,
    TrendingDown,
    CalendarClock,
    CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Parse "8h", "4h 30m", "2h 0m" → total minutes
function parseDuration(str = "") {
    if (!str) return 0;
    const h = str.match(/(\d+)\s*h/);
    const m = str.match(/(\d+)\s*m/);
    return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
}

// Format total minutes → "8h 30m"
function formatMinutes(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = Math.round(totalMinutes % 60);
    if (h === 0 && m === 0) return "0h 0m";
    return `${h}h ${m}m`;
}

// Normalize line value → "line1", "line2", etc.
// Handles: "1", "2", "Line 1", "Line A", "Line B"
function normalizeLineKey(lineVal = "") {
    const s = lineVal.toString().trim();
    // If it's a plain number like "1", "2"
    if (/^\d+$/.test(s)) return `line${s}`;
    // If it's "Line 1", "Line 2" etc.
    const numMatch = s.match(/\d+/);
    if (numMatch) return `line${numMatch[0]}`;
    // If it's "Line A", "Line B" etc. — map A→1, B→2 ...
    const letterMatch = s.match(/([A-Za-z])$/);
    if (letterMatch) {
        const idx = letterMatch[1].toUpperCase().charCodeAt(0) - 64; // A=1, B=2...
        return `line${idx}`;
    }
    return null;
}

// Extract YYYY-MM key from a date
function getMonthKey(date) {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}

// Get year and month (1-indexed) from a date
function getYearMonth(date) {
    const d = new Date(date);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

// Check if an ISO date string (record.date) matches a given JS Date (day-level)
function isSameDay(isoString, jsDate) {
    const rec = new Date(isoString);
    return (
        rec.getFullYear() === jsDate.getFullYear() &&
        rec.getMonth() === jsDate.getMonth() &&
        rec.getDate() === jsDate.getDate()
    );
}

// ─── Aggregate records → { total, line1, line2, line3, ... } ─────────────────

function aggregateRecords(records, selectedDate) {
    const agg = {};

    const initEntry = () => ({ month: 0, date: 0, dateDetails: [] });

    // Upper bound: end of the selected day (23:59:59)
    const selectedEnd = selectedDate ? new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        23, 59, 59, 999
    ) : null;

    // Helper: is description N/A or empty?
    const isNA = (desc) => {
        if (!desc) return true;
        const n = desc.toString().trim().toLowerCase();
        return n === 'n/a' || n === 'na';
    };

    records.forEach((record) => {
        const minutes = parseDuration(record.totalDuration);
        const lineKey = normalizeLineKey(record.line);
        const isToday = selectedDate ? isSameDay(record.date, selectedDate) : false;

        // Include in month range only if record date ≤ selected date (1 → selected day)
        const recDate = new Date(record.date);
        const isInMonthRange = selectedEnd ? recDate <= selectedEnd : true;

        // Total
        if (!agg.total) agg.total = initEntry();
        if (isInMonthRange) agg.total.month += minutes;
        if (isToday) {
            agg.total.date += minutes;
            // Collect breakdown details for the selected date
            const items = record.workLogItems?.length ? record.workLogItems : [record];
            items.forEach((item) => {
                if (!isNA(item.description)) {
                    agg.total.dateDetails.push({
                        start: item.start || record.start || '—',
                        end: item.end || record.end || '—',
                        reason: item.description || '—',
                    });
                }
            });
        }

        // Per-line
        if (lineKey) {
            if (!agg[lineKey]) agg[lineKey] = initEntry();
            if (isInMonthRange) agg[lineKey].month += minutes;
            if (isToday) {
                agg[lineKey].date += minutes;
                const items = record.workLogItems?.length ? record.workLogItems : [record];
                items.forEach((item) => {
                    if (!isNA(item.description)) {
                        agg[lineKey].dateDetails.push({
                            start: item.start || record.start || '—',
                            end: item.end || record.end || '—',
                            reason: item.description || '—',
                        });
                    }
                });
            }
        }
    });

    return agg;
}

// ─── Card Config ──────────────────────────────────────────────────────────────

const CARD_CONFIG = [
    {
        key: "total",
        title: "Total Breakdown",
        icon: AlertTriangle,
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        borderColor: "border-b-red-600",
    },
    {
        key: "line1",
        title: "Line 1",
        icon: Cpu,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        borderColor: "border-b-blue-600",
    },
    {
        key: "line2",
        title: "Line 2",
        icon: Layers,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        borderColor: "border-b-green-600",
    },
    {
        key: "line3",
        title: "Line 3",
        icon: WifiOff,
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
        borderColor: "border-b-orange-600",
    },
];

// ─── BreakdownCard ────────────────────────────────────────────────────────────

function BreakdownCard({ title, icon: Icon, iconBg, iconColor, borderColor, monthMinutes, dateMinutes, isLoading, selectedDate, dateDetails = [], cardKey }) {
    const [showPopup, setShowPopup] = useState(false);
    const popupTimeout = useRef(null);

    const handleMouseEnter = () => {
        clearTimeout(popupTimeout.current);
        setShowPopup(true);
    };
    const handleMouseLeave = () => {
        popupTimeout.current = setTimeout(() => setShowPopup(false), 200);
    };

    // Build label like "1 – 21 Feb"
    const monthRangeLabel = React.useMemo(() => {
        const d = selectedDate ? new Date(selectedDate) : new Date();
        const day = d.getDate();
        const monthName = d.toLocaleString("default", { month: "short" });
        return `1 – ${day} ${monthName}`;
    }, [selectedDate]);

    return (
        <Card className={`shadow-xl flex flex-row items-center justify-between cursor-pointer hover:bg-gradient-to-l hover:from-gray-50 hover:to-gray-100 hover:scale-105 duration-300 border-b-4 ${borderColor}`}>
            {/* Left: text content */}
            <div>
                <CardHeader className="pb-2 pt-4 px-5">
                    <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                    {/* Month total */}
                    <div className="mb-3">
                        <div className={`text-2xl font-bold text-gray-800 ${isLoading ? "opacity-30 animate-pulse" : ""}`}>
                            {formatMinutes(monthMinutes)}
                        </div>
                        <p className="text-xs text-cyan-600 font-medium mt-0.5 flex items-center gap-1">
                            <CalendarClock className="w-3 h-3" />
                            {monthRangeLabel}
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-gray-100 mb-3" />

                    {/* Selected date total + info icon */}
                    <div>
                        <div className="flex items-center gap-2">
                            <div className={`text-lg font-semibold text-gray-700 ${isLoading ? "opacity-30 animate-pulse" : ""}`}>
                                {formatMinutes(dateMinutes)}
                            </div>
                            {/* Animated breakdown summary icon with hover popup (per-line cards only) */}
                            {cardKey !== "total" && (
                                <div
                                    className="relative"
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div className="p-1.5 rounded-full hover:bg-amber-50 transition-all duration-300 cursor-pointer group">
                                        <style>{`
                                        @keyframes breakdownPulse {
                                            0%, 100% { transform: scale(1); opacity: 0.7; }
                                            50% { transform: scale(1.18); opacity: 1; }
                                        }
                                        @keyframes glowRing {
                                            0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
                                            50% { box-shadow: 0 0 0 4px rgba(245, 158, 11, 0); }
                                        }
                                    `}</style>
                                        <div
                                            className="relative flex items-center justify-center"
                                            style={{
                                                animation: dateMinutes > 0 ? 'breakdownPulse 2s ease-in-out infinite, glowRing 2s ease-in-out infinite' : 'none',
                                            }}
                                        >
                                            <AlertTriangle
                                                className={`w-4 h-4 transition-colors duration-300 ${dateMinutes > 0
                                                    ? 'text-amber-500 group-hover:text-red-500'
                                                    : 'text-gray-400 group-hover:text-amber-500'
                                                    }`}
                                                strokeWidth={2}
                                            />
                                        </div>
                                    </div>

                                    {/* Popup */}
                                    {showPopup && (
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                                            {/* Popup header */}
                                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2.5 border-b border-amber-100">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Breakdown Summary</p>
                                                </div>
                                            </div>

                                            {/* Popup content */}
                                            <div className="max-h-48 overflow-y-auto">
                                                {dateMinutes === 0 || dateDetails.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center py-6 px-4">
                                                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-2">
                                                            <Clock className="w-5 h-5 text-green-500" />
                                                        </div>
                                                        <p className="text-sm font-semibold text-gray-500">No Breakdown</p>
                                                        <p className="text-[0.7rem] text-gray-400 mt-0.5">All systems running normally</p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-gray-50">
                                                        {dateDetails.map((detail, idx) => (
                                                            <div key={idx} className="px-4 py-2.5 hover:bg-gray-50/50 transition-colors">
                                                                <p className="text-xs font-semibold text-gray-700 mb-1.5 truncate">
                                                                    {detail.reason}
                                                                </p>
                                                                <div className="flex items-center gap-3 text-[0.7rem] text-gray-500">
                                                                    <span className="flex items-center gap-1">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                                                        {detail.start}
                                                                    </span>
                                                                    <span className="text-gray-300">→</span>
                                                                    <span className="flex items-center gap-1">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                                        {detail.end}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-cyan-600 font-medium mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Selected Date
                        </p>
                    </div>
                </CardContent>
            </div>

            {/* Right: large icon */}
            <div className={`shadow-lg h-[4.6rem] md:mr-6 md:mt-4 m-4 p-4 ${iconBg} rounded-full flex items-center justify-center transition`}>
                <Icon className={`w-10 h-10 ${iconColor}`} strokeWidth={1.4} />
            </div>
        </Card>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BreakdownDashboard({ selectedDateByMain }) {
    const [isLoading, setIsLoading] = useState(false);
    const [effectiveDate, setEffectiveDate] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [breakdown, setBreakdown] = useState({
        total: { month: 0, date: 0 },
        line1: { month: 0, date: 0 },
        line2: { month: 0, date: 0 },
        line3: { month: 0, date: 0 },
    });

    // Cache: monthKey → records[]
    const cache = useRef({});

    // Find the most recent record date from the records
    const getLatestRecordDate = (records) => {
        if (!records.length) return new Date();
        return records.reduce((max, r) => {
            const d = new Date(r.date);
            return d > max ? d : max;
        }, new Date(records[0].date));
    };

    const computeAndSet = (records, dateForAggregation) => {
        const agg = aggregateRecords(records, dateForAggregation);
        setBreakdown({
            total: agg.total || { month: 0, date: 0, dateDetails: [] },
            line1: agg.line1 || { month: 0, date: 0, dateDetails: [] },
            line2: agg.line2 || { month: 0, date: 0, dateDetails: [] },
            line3: agg.line3 || { month: 0, date: 0, dateDetails: [] },
        });
        setEffectiveDate(dateForAggregation);
    };

    useEffect(() => {
        const isDateSelected = !!selectedDateByMain;
        const now = new Date();
        const refDate = isDateSelected ? new Date(selectedDateByMain) : now;
        const { year, month } = getYearMonth(refDate);
        const monthKey = getMonthKey(refDate);

        // If we already have this month's data in cache, just re-aggregate
        if (cache.current[monthKey]) {
            const records = cache.current[monthKey];
            const targetDate = isDateSelected ? new Date(selectedDateByMain) : getLatestRecordDate(records);
            computeAndSet(records, targetDate);
            return;
        }

        // Otherwise fetch from API
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const accessToken = localStorage.getItem("accessToken");
                const res = await axios.get(
                    `${API_BASE_URL}/admin/productionMesData`,
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                        params: { year, month },
                    }
                );
                console.log("res", res);
                const records = res.data?.data || [];
                // Store in cache
                cache.current[monthKey] = records;
                // If no date selected, use the most recent record date
                const targetDate = isDateSelected ? new Date(selectedDateByMain) : getLatestRecordDate(records);
                computeAndSet(records, targetDate);
            } catch (err) {
                console.error("Error fetching breakdown data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedDateByMain]);

    // Handle local date picker selection
    const handleDateSelect = (date) => {
        setSelectedDate(date);
        const now = new Date();
        const refDate = date || now;
        const monthKey = getMonthKey(refDate);

        if (cache.current[monthKey]) {
            computeAndSet(cache.current[monthKey], date);
        } else {
            // Fetch data for the new month if not cached
            const { year, month } = getYearMonth(refDate);
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const accessToken = localStorage.getItem("accessToken");
                    const res = await axios.get(
                        `${API_BASE_URL}/admin/productionMesData`,
                        {
                            headers: { Authorization: `Bearer ${accessToken}` },
                            params: { year, month },
                        }
                    );
                    const records = res.data?.data || [];
                    cache.current[monthKey] = records;
                    computeAndSet(records, date || getLatestRecordDate(records));
                } catch (err) {
                    console.error("Error fetching breakdown data:", err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    };

    return (
        <div className="w-full px-4 pt-2 pb-4">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                        <TrendingDown className="w-6 h-6 text-red-600" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Machine Breakdown</h2>
                        <p className="text-xs text-gray-500">Non-working / downtime hours by line</p>
                    </div>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="md:w-[240px] justify-start p-6 md:p-4 bg-white text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 md:h-4 md:w-4 h-5 w-5" />
                            <div className="hidden md:block">
                                {(selectedDate || effectiveDate)
                                    ? format(selectedDate || effectiveDate, "PPP")
                                    : "Select Date"
                                }
                            </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={selectedDate || effectiveDate}
                            onSelect={(date) => {
                                if (date) handleDateSelect(date);
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {CARD_CONFIG.map((cfg) => (
                    <BreakdownCard
                        key={cfg.key}
                        cardKey={cfg.key}
                        title={cfg.title}
                        icon={cfg.icon}
                        iconBg={cfg.iconBg}
                        iconColor={cfg.iconColor}
                        borderColor={cfg.borderColor}
                        monthMinutes={breakdown[cfg.key]?.month ?? 0}
                        dateMinutes={breakdown[cfg.key]?.date ?? 0}
                        dateDetails={breakdown[cfg.key]?.dateDetails ?? []}
                        isLoading={isLoading}
                        selectedDate={effectiveDate || selectedDateByMain}
                    />
                ))}
            </div>
        </div>
    );
}
