'use client';
import { API_BASE_URL } from "@/lib/api";
import React, { useEffect, useState, useMemo } from 'react';
import Loading from '@/components/ui/Loading';
import axios from 'axios';
import * as XLSX from 'xlsx';
import FilterBar from '@/components/Mes/components/Packing/FilterBar';
import Pagination from '@/components/ui/pagination';
import ReportLayout from '@/components/ui/ReportLayout';
import StatCard from '@/components/ui/StatCard';

const BreakdownReport = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const [dateFilter, setDateFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [enableFilter, setEnableFilter] = useState(false);
    const [materialCode, setMaterialCode] = useState('');

    const itemsPerPage = 10;

    // ── Fetch all breakdown records ──
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get(`${API_BASE_URL}/admin/fetchProductionMesData`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.data.success) {
                    // Each record may contain multiple breakdownItems — flatten them
                    const records = res.data.data || [];
                    setData(records);
                    setFilteredData(records);
                }
            } catch (err) {
                console.error('Failed to fetch breakdown data', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // ── Date filtering ──
    useEffect(() => {
        let temp = [...data];
        if (dateFilter) {
            temp = temp.filter(
                (r) =>
                    new Date(r.date).toLocaleDateString() ===
                    new Date(dateFilter).toLocaleDateString()
            );
        }
        if (startDate && endDate) {
            temp = temp.filter((r) => {
                const d = new Date(r.date);
                return d >= new Date(startDate) && d <= new Date(endDate);
            });
        }
        // Sort by date descending (recent first)
        temp.sort((a, b) => new Date(b.date) - new Date(a.date));
        setFilteredData(temp);
        setCurrentPage(1);
    }, [dateFilter, startDate, endDate, data]);

    const formatDate = (ds) => {
        const d = new Date(ds);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    // ── Stats ──
    const totalRecords = filteredData.length;

    // Total unique breakdown entries across all records
    const totalBreakdowns = useMemo(
        () => filteredData.reduce((sum, r) => sum + (r.breakdownItems?.length || 1), 0),
        [filteredData]
    );

    // Parse "8h 30m" or "2h" → minutes
    const parseDuration = (str = '') => {
        if (!str) return 0;
        const h = str.match(/(\d+)\s*h/);
        const m = str.match(/(\d+)\s*m/);
        return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
    };

    const totalDowntimeMinutes = useMemo(() => {
        return filteredData.reduce((sum, r) => {
            if (r.breakdownItems?.length) {
                return sum + r.breakdownItems.reduce((s, bd) => s + parseDuration(bd.duration || bd.totalDuration), 0);
            }
            return sum + parseDuration(r.totalDuration);
        }, 0);
    }, [filteredData]);

    const formatMinutes = (mins) => {
        const h = Math.floor(mins / 60);
        const m = Math.round(mins % 60);
        return `${h}h ${m}m`;
    };

    // Returns true if a description should be hidden (N/A, NA, empty)
    const isNA = (description) => {
        if (!description) return true;
        const normalized = description.toString().trim().toLowerCase();
        return normalized === 'n/a' || normalized === 'na';
    };

    // ── Excel Export ──
    const exportToExcel = () => {
        const rows = filteredData.flatMap((record) => {
            const items = record.workLogItems?.length ? record.workLogItems : [record];
            return items
                .filter((bd) => !isNA(bd.description))
                .map((bd, idx) => ({
                    Date: idx === 0 ? formatDate(record.date) : '',
                    Line: idx === 0 ? record.line : '',
                    Shift: idx === 0 ? record.shift : '',
                    'Start Time': bd.start || record.start || '',
                    'End Time': bd.end || record.end || '',
                    'Breakdown Reason': bd.description || '',
                    Duration: bd.totalDuration || record.totalDuration || '',
                }));
        });
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Breakdown_Report');
        XLSX.writeFile(wb, 'Breakdown_Report.xlsx');
    };

    // ── Pre-flatten all visible rows, then paginate by row count ──
    const allFlatRows = useMemo(() => {
        return filteredData.flatMap((record) => {
            const items = record.workLogItems?.length ? record.workLogItems : [record];
            return items
                .filter((bd) => !isNA(bd.description))
                .map((bd) => ({ record, bd }));
        });
    }, [filteredData]);

    const totalPages = Math.ceil(allFlatRows.length / itemsPerPage);
    const currentFlatRows = allFlatRows.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // ── Sub-components passed to ReportLayout ──
    const stats = (
        <div className="flex flex-wrap gap-4">
            <StatCard
                title="Total Records"
                value={totalRecords.toLocaleString('en-IN')}
                className="border-l-orange-500"
                iconClassName="bg-orange-100 text-orange-600"
            />
            <StatCard
                title="Total Downtime"
                value={formatMinutes(totalDowntimeMinutes)}
                className="border-l-red-500"
                iconClassName="bg-red-100 text-red-600"
            />
        </div>
    );

    const filterComponent = (
        <FilterBar
            enableFilter={enableFilter}
            setEnableFilter={setEnableFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            setMaterialCode={setMaterialCode}
            materialCode={materialCode}
            materialOptions={[]}
            exportToExcel={exportToExcel}
            reportName="Breakdown"
            filteredData={filteredData}
        />
    );

    // ── Table ──
    // Renders one row per breakdown item; merges Date/Line/Shift via rowSpan when breakdownItems exist
    const tableContent = (
        <>
            {/* Desktop table */}
            <table className="min-w-full text-sm text-left text-gray-700 border-collapse hidden md:table">
                <thead className="bg-orange-100 text-xs uppercase text-orange-900 sticky top-0 z-10">
                    <tr>
                        <th className="px-5 py-3 border-b font-semibold">Date</th>
                        <th className="px-5 py-3 border-b font-semibold">Line</th>
                        <th className="px-5 py-3 border-b font-semibold">Shift</th>
                        <th className="px-5 py-3 border-b font-semibold">Start Time</th>
                        <th className="px-5 py-3 border-b font-semibold">End Time</th>
                        <th className="px-5 py-3 border-b font-semibold">Breakdown Reason</th>
                        <th className="px-5 py-3 border-b font-semibold text-right">Duration</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {currentFlatRows.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center py-12 text-gray-500 font-medium text-lg">
                                No records found
                            </td>
                        </tr>
                    ) : (
                        currentFlatRows.map(({ record, bd }, rowIdx) => {
                            // Show Date/Line/Shift at start of each new record within the page
                            const isNewRecord =
                                rowIdx === 0 ||
                                currentFlatRows[rowIdx - 1].record._id !== record._id;
                            return (
                                <tr
                                    key={`${record._id}-${rowIdx}`}
                                    className="hover:bg-orange-50/50 transition-colors"
                                >
                                    <td className="px-5 py-3 whitespace-nowrap align-top font-medium text-gray-900">
                                        {isNewRecord ? formatDate(record.date) : ''}
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap align-top text-gray-600">
                                        {isNewRecord ? record.line : ''}
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap align-top text-gray-600">
                                        {isNewRecord ? record.shift : ''}
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap align-top text-gray-700">
                                        {bd.start || record.start || '—'}
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap align-top text-gray-700">
                                        {bd.end || record.end || '—'}
                                    </td>
                                    <td className="px-5 py-3 align-top text-gray-700">
                                        {bd.description || '—'}
                                    </td>
                                    <td className="px-5 py-3 align-top text-right font-semibold text-orange-700">
                                        {isNewRecord ? bd.totalDuration || record.totalDuration || '—' : ''}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-3 p-3">
                {currentFlatRows.length === 0 ? (
                    <p className="text-center py-12 text-gray-500 font-medium text-lg">No records found</p>
                ) : (
                    currentFlatRows.map(({ record, bd }, rowIdx) => {
                        const isNewRecord =
                            rowIdx === 0 ||
                            currentFlatRows[rowIdx - 1].record._id !== record._id;
                        return (
                            <div
                                key={`mob-${record._id}-${rowIdx}`}
                                className="bg-white border border-orange-100 rounded-xl shadow-sm p-4 flex flex-col gap-2"
                            >
                                {isNewRecord && (
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-gray-800 text-sm">{formatDate(record.date)}</span>
                                        <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">
                                            {record.line} · {record.shift}
                                        </span>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                    <div>
                                        <span className="text-gray-400 text-xs">Start Time</span>
                                        <p className="font-medium text-gray-700">{bd.start || record.start || '—'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-xs">End Time</span>
                                        <p className="font-medium text-gray-700">{bd.end || record.end || '—'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-400 text-xs">Breakdown Reason</span>
                                        <p className="font-medium text-gray-700">{bd.description || '—'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-400 text-xs">Duration</span>
                                        <p className="font-bold text-orange-700">{bd.totalDuration || record.totalDuration || '—'}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );

    if (isLoading) return <Loading text="Loading Report..." />;

    return (
        <ReportLayout
            title="Breakdown Report"
            description="Machine downtime and breakdown details by line and shift."
            stats={stats}
            filterBar={filterComponent}
            content={tableContent}
            themeColor="orange"
            pagination={
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            }
        />
    );
};

export default BreakdownReport;
