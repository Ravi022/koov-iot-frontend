'use client';
import axios from 'axios';
import React, { useEffect, useState, useMemo } from 'react';
import FilterBar from '@/components/Mes/components/Packing/FilterBar';
import { materialCodeOptions } from '@/app/constant';
import * as XLSX from 'xlsx';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/ui/pagination';
import ReportLayout from '@/components/ui/ReportLayout';
import StatCard from '@/components/ui/StatCard';
import Loading from '@/components/ui/Loading';

const DispatchOutTable = () => {
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
                const res = await axios.get('http://127.0.0.1:5001/production/dispatchOut/fetch', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setData(res.data.data);
                    setFilteredData(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch Dispatch data", err);
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
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    };

    const exportToExcel = () => {
        const flatData = filteredData.flatMap(record =>
            record.items.map(item => ({
                Date: new Date(record.date).toLocaleDateString(),
                InvoiceNo: item.invoiceNo || record.invoiceNo || '-',
                SalesOrder: item.salesOrderNo || '-',
                MaterialCode: item.materialCode,
                Grade: item.grade,
                PackagingType: item.packagingType,
                Pieces: item.pieces,
                Rate: item.rate || 0,
                InvoiceAmount: item.invoiceAmount || 0,
                TaxableValueGST: item.taxableValueForGST || 0,
                Customer: item.customer,
                ShipToParty: item.shipToParty || '-',
                TotalPieces: record.totalPieces
            }))
        );
        const ws = XLSX.utils.json_to_sheet(flatData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Dispatch_Report");
        XLSX.writeFile(wb, "Dispatch_Report.xlsx");
    };

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const totalDispatch = useMemo(() => {
        const total = filteredData.reduce((sum, curr) => curr.totalPieces + sum, 0)
        console.log(total);
        return total;
    }, [filteredData])

    const router = useRouter();

    // Stats for the report
    const stats = (
        <StatCard
            title="Total Dispatch"
            value={totalDispatch.toLocaleString('en-IN')}
            // icon={PackageCheck} 
            className="border-l-blue-500"
            iconClassName="bg-blue-100 text-blue-600"
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
            reportName={"Dispatch"}
            filteredData={filteredData}
            exportToExcel={exportToExcel}
        />
    );

    const tableContent = (
        <table className="min-w-full text-sm text-left text-gray-700 border-collapse">
            <thead className="bg-blue-100 text-xs uppercase text-blue-900 sticky top-0 z-10">
                <tr>
                    <th className="px-6 py-3 border-b font-semibold bg-indigo-50 text-indigo-900 rounded-tl-lg">Date</th>
                    <th className="px-6 py-3 border-b font-semibold bg-indigo-50 text-indigo-900">Invoice No</th>
                    <th className="px-6 py-3 border-b font-semibold text-center bg-indigo-50 text-indigo-900" colSpan="8">Items</th>
                    <th className="px-6 py-3 border-b font-semibold text-right bg-indigo-50 text-indigo-900 rounded-tr-lg">Total Pieces</th>
                </tr>
                <tr className="bg-white border-b shadow-sm">
                    <th className="px-4 py-2"></th>
                    <th className="px-4 py-2"></th>
                    <th className="px-4 py-2 font-medium text-gray-700">Sales Order</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Material</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Grade</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Pkg Type</th>
                    <th className="px-4 py-2 font-medium text-gray-700 text-right">Pieces</th>
                    <th className="px-4 py-2 font-medium text-gray-700 text-right">Rate</th>
                    <th className="px-4 py-2 font-medium text-gray-700 text-right">Amount</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Customer</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Ship To Party</th>
                    <th className="px-4 py-2"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                    <tr>
                        <td colSpan={8} className="text-center py-12 text-gray-500 font-medium text-lg">
                            No records found
                        </td>
                    </tr>
                ) : (
                    currentItems.map((record) =>
                        record.items.map((item, index) => (
                            <tr key={`${record._id}-${index}`} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap align-top font-medium text-gray-900">
                                    {index === 0 ? formatToDDMMYYYY(record.date) : ''}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap align-top text-gray-600">
                                    {item.invoiceNo || (index === 0 ? record.invoiceNo : '')}
                                </td>
                                <td className="px-4 py-4 align-top text-gray-600 text-sm">{item.salesOrderNo || '-'}</td>
                                <td className="px-4 py-4 align-top font-medium text-gray-800 text-sm">{item.materialCode}</td>
                                <td className="px-4 py-4 align-top">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.grade === 'A' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {item.grade}
                                    </span>
                                </td>
                                <td className="px-4 py-4 align-top text-gray-600 text-sm">{item.packagingType}</td>
                                <td className="px-4 py-4 align-top text-right text-gray-900 font-medium text-sm">{item.pieces.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-4 align-top text-right text-gray-600 text-sm">{item.rate ? '₹' + item.rate : '-'}</td>
                                <td className="px-4 py-4 align-top text-right text-gray-900 font-semibold text-sm">{item.invoiceAmount ? '₹' + item.invoiceAmount.toLocaleString('en-IN') : '-'}</td>
                                <td className="px-4 py-4 align-top text-gray-700 truncate max-w-[12rem] text-sm" title={item.customer}>{item.customer}</td>
                                <td className="px-4 py-4 align-top text-gray-600 truncate max-w-[10rem] text-sm" title={item.shipToParty}>{item.shipToParty || '-'}</td>
                                <td className="px-6 py-4 align-top text-right font-bold text-gray-900">
                                    {index === 0 ? record.totalPieces.toLocaleString('en-IN') : ''}
                                </td>
                            </tr>
                        ))
                    )
                )}
            </tbody>
        </table>
    );

    const paginationComponent = (
        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
        />
    );

    if (isLoading) {
        return <Loading text="Loading Dispatch Out Report..." />;
    }

    return (
        <ReportLayout
            title="Dispatch Out Report"
            description="Track and manage dispatch details including invoices, customers, and quantities."
            icon={ArrowLeft} // Using ArrowLeft temporarily as icon, we might want a Truck icon
            stats={stats}
            filterBar={filterComponent}
            content={tableContent}
            pagination={paginationComponent}
            themeColor="blue"
        />
    );
};

export default DispatchOutTable;
