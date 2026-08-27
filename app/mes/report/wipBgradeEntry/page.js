'use client';
import { API_BASE_URL } from "@/lib/api";
import { materialCodeOptions } from '@/app/constant';
import FilterBar from '@/components/Mes/components/Packing/FilterBar';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import Loading from '@/components/ui/Loading';
import * as XLSX from 'xlsx';
import Pagination from '@/components/ui/pagination';
import ReportLayout from '@/components/ui/ReportLayout';
import StatCard from '@/components/ui/StatCard';

const WipBgradeTable = () => {
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
        // console.log("token", token);
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get(`${API_BASE_URL}/packing/wipBgradeEntry/fetch`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                // console.log("res", res);

                if (res.data.success) {
                    console.log("atData", res.data.data);
                    setData(res.data.data);
                    setFilteredData(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch Wip B Grade data:", error);
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
                Pieces: item.pieces,
                TotalWipBgrade: itemIndex === 0 ? record.totalWipBgrade : "",
            }))
        );
        const ws = XLSX.utils.json_to_sheet(flatData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "WIP BGrade Report");
        XLSX.writeFile(wb, "WipBgrade_Report.xlsx");
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const totalFilteredWipBgrade = useMemo(() => {
        return filteredData.reduce((sum, curr) => sum + (curr.totalWipBgrade || 0), 0)
    }, [filteredData])

    const stats = (
        <StatCard
            title="Total WIP B-Grade"
            value={totalFilteredWipBgrade.toLocaleString()}
            className="border-l-purple-500"
            iconClassName="bg-purple-100 text-purple-600"
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
            filteredData={filteredData}
            reportName={"Wip B grade"}
            exportToExcel={exportToExcel}
        />
    );

    const tableContent = (
        <table className="min-w-full text-sm text-left text-gray-700 border-collapse">
            <thead className="bg-purple-100 text-xs uppercase text-purple-900 sticky top-0 z-10">
                <tr>
                    <th className="px-6 py-3 border-b font-semibold" rowSpan="2">Date</th>
                    <th className="px-6 py-3 border-b font-semibold text-center" colSpan="2">Items</th>
                    <th className="px-6 py-3 border-b font-semibold text-right" rowSpan="2">Total WIP B Grade</th>
                </tr>
                <tr className="bg-purple-100 border-b">
                    {/* <th className="px-4 py-2">Batch ID</th> */}
                    <th className="px-6 py-2 font-medium">Material Code</th>
                    <th className="px-6 py-2 font-medium">Pieces</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-500 font-medium text-lg">
                            Result not found
                        </td>
                    </tr>
                ) : (
                    currentItems.map((record) =>
                        record.items.map((item, index) => (
                            <tr
                                key={`${record._id}-${index}`}
                                className="hover:bg-purple-50/50 transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap align-top font-medium text-gray-900">
                                    {index === 0 ? formatToDDMMYYYY(record.date) : ''}
                                </td>
                                {/* <td className="px-4 py-2">{item.batchId}</td> */}
                                <td className="px-6 py-4 align-top">{item.materialCode}</td>
                                <td className="px-6 py-4 align-top text-gray-900 font-medium">{item.pieces}</td>
                                <td className="px-6 py-4 align-top text-right font-bold text-purple-700">
                                    {index === 0 ? record.totalWipBgrade : ''}
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
            title="WIP B-Grade Report"
            description="Tracking B-grade items in Work In Progress."
            stats={stats}
            filterBar={filterComponent}
            content={tableContent}
            themeColor="purple"
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

export default WipBgradeTable;
