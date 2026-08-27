'use client';
import { materialCodeOptions } from '@/app/constant';
import FilterBar from '@/components/Mes/components/Packing/FilterBar';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import Loading from '@/components/ui/Loading';
import * as XLSX from 'xlsx';
import Pagination from '@/components/ui/pagination';
import ReportLayout from '@/components/ui/ReportLayout';
import StatCard from '@/components/ui/StatCard';

const FgRecheckingRejectionTable = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const [dateFilter, setDateFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [enableFilter, setEnableFilter] = useState(false);
    const [materialCode, setMaterialCode] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get('http://127.0.0.1:5001/packing/fgRecheckingRejection/fetch', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.success) {
                    setData(res.data.data);
                    setFilteredData(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch FG Rechecking Rejection data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let tempData = [...data];

        if (dateFilter) {
            tempData = tempData.filter(record =>
                new Date(record.date).toLocaleDateString() === new Date(dateFilter).toLocaleDateString()
            );
        }

        if (startDate && endDate) {
            tempData = tempData.filter(record => {
                const d = new Date(record.date);
                return d >= new Date(startDate) && d <= new Date(endDate);
            });
        }

        if (enableFilter && materialCode) {
            tempData = tempData.filter(record =>
                record.items.some(item => item.materialCode.includes(materialCode))
            );
        }

        setFilteredData(tempData);
        setCurrentPage(1);
    }, [dateFilter, startDate, endDate, enableFilter, materialCode, data]);

    const formatToDDMMYYYY = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const exportToExcel = () => {
        const flatData = filteredData.flatMap(record =>
            record.items.map((item, itemIndex) => ({
                Date: itemIndex === 0 ? new Date(record.date).toLocaleDateString() : "",
                // BatchID: item.batchId,
                MaterialCode: item.materialCode,
                PackingType: item.packingType,
                Pieces: item.pieces,
                Reason: item.reason,
                TotalRejection: itemIndex === 0 ? record.totalRejection : "",
            }))
        );
        const ws = XLSX.utils.json_to_sheet(flatData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "FG Rechecking Rejection Report");
        XLSX.writeFile(wb, "FgRecheckingRejection_Report.xlsx");
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const totalRejectionCount = useMemo(() => {
        return filteredData.reduce((sum, curr) => sum + (curr.totalRejection || 0), 0)
    }, [filteredData]);

    const stats = (
        <StatCard
            title="Total Rejection"
            value={totalRejectionCount.toLocaleString()}
            className="border-l-yellow-500"
            iconClassName="bg-yellow-100 text-yellow-600"
        />
    );

    const filterComponent = (
        <FilterBar
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            enableFilter={enableFilter}
            setEnableFilter={setEnableFilter}
            materialCode={materialCode}
            setMaterialCode={setMaterialCode}
            materialOptions={materialCodeOptions}
            reportName={"FG Recheck Rejection"}
            filteredData={filteredData}
            exportToExcel={exportToExcel}
        />
    );

    const tableContent = (
        <table className="min-w-full text-sm text-left text-gray-700 border-collapse">
            <thead className="bg-yellow-100 text-xs uppercase text-yellow-900 sticky top-0 z-10">
                <tr>
                    <th className="px-6 py-3 border-b font-semibold">Date</th>
                    <th className="px-6 py-3 border-b font-semibold text-center" colSpan="4">Items</th>
                    <th className="px-6 py-3 border-b font-semibold text-right">Total Rejection</th>
                </tr>
                <tr className="bg-yellow-100 border-b">
                    {/* <th className="px-4 py-2">Batch ID</th> */}
                    <th className="px-6 py-2 font-medium"></th>
                    <th className="px-6 py-2 font-medium">Material Code</th>
                    <th className="px-6 py-2 font-medium">Packing Type</th>
                    <th className="px-6 py-2 font-medium">Pieces</th>
                    <th className="px-6 py-2 font-medium">Reason</th>
                    <th className="px-6 py-2 font-medium"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-500 font-medium text-lg">
                            Result not found
                        </td>
                    </tr>
                ) : (
                    currentItems.map((record) =>
                        record.items.map((item, index) => (
                            <tr
                                key={`${record._id}-${index}`}
                                className="hover:bg-yellow-50/50 transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap align-top font-medium text-gray-900">
                                    {index === 0 ? formatToDDMMYYYY(record.date) : ''}
                                </td>
                                {/* <td className="px-4 py-2">{item.batchId}</td> */}
                                {/* <td className="px-6 py-4 align-top"></td> */}
                                <td className="px-6 py-4 align-top">{item.materialCode}</td>
                                <td className="px-6 py-4 align-top">{item.packingType}</td>
                                <td className="px-6 py-4 align-top text-gray-900 font-medium">{item.pieces}</td>
                                <td className="px-6 py-4 align-top text-red-500">{item.reason}</td>
                                <td className="px-6 py-4 align-top text-right font-bold text-red-600">
                                    {index === 0 ? record.totalRejection : ''}
                                </td>
                            </tr>
                        ))
                    )
                )}
            </tbody>
        </table>
    );

    if (isLoading) return <Loading text="Loading Report..." />;

    return (
        <ReportLayout
            title="FG Rechecking Rejection"
            description="Tracking rejected finished goods during rechecking."
            stats={stats}
            filterBar={filterComponent}
            content={tableContent}
            themeColor="yellow"
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

export default FgRecheckingRejectionTable;
