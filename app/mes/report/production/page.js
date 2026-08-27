'use client';
import { API_BASE_URL } from "@/lib/api";

import React, { useEffect, useState, useMemo } from 'react';
import Loading from '@/components/ui/Loading';
import axios from 'axios';
import * as XLSX from 'xlsx';
import FilterBar from '@/components/Mes/components/Packing/FilterBar';
import { materialCodeOptions } from '@/app/constant';
import Pagination from '@/components/ui/pagination';
import ReportLayout from '@/components/ui/ReportLayout';
import StatCard from '@/components/ui/StatCard';

const ProductionTable = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [materialCode, setMaterialCode] = useState('')
  const [enableFilter, setEnableFilter] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API_BASE_URL}/admin/fetchProductionMesData`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          console.log("res.data.data", res.data.data);
          const sortedData = res.data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
          setData(sortedData);
          setFilteredData(sortedData);
        }
      } catch (err) {
        console.error("Failed to fetch production data", err);
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

    // Sort by date descending (recent first)
    tempData.sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log("tempData", tempData)
    setFilteredData(tempData);
    setCurrentPage(1);
  }, [dateFilter, startDate, endDate, data]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const exportToExcel = () => {
    const flatData = filteredData.flatMap(record =>
      record.productionItems.map((item, itemIndex) => ({
        Date: formatDate(record.date),
        Shift: itemIndex === 0 ? record.shift : "",
        Line: itemIndex === 0 ? record.line : "",
        // BatchID: item.batchId,
        MaterialCode: item.materialCode,
        Pieces: item.pieces,
        ProductionInKg: item.productionInKg,
        TotalPieces: itemIndex === 0 ? record.totalPieces : "",
        TotalKg: itemIndex === 0 ? record.totalProductionInKg : ""
      }))
    );

    const ws = XLSX.utils.json_to_sheet(flatData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Production_Report");
    XLSX.writeFile(wb, "Production_Report.xlsx");
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalProductionPieces = useMemo(() => {
    return filteredData.reduce((sum, curr) => sum + (curr.totalPieces || 0), 0);
  }, [filteredData]);

  const totalProductionKg = useMemo(() => {
    return filteredData.reduce((sum, curr) => sum + (curr.totalProductionInKg || 0), 0);
  }, [filteredData]);

  const stats = (
    <div className='flex gap-4'>
      <StatCard
        title="Total Production (Pcs)"
        value={totalProductionPieces.toLocaleString('en-IN')}
        className="border-l-red-500"
        iconClassName="bg-red-100 text-red-600"
      />
      <StatCard
        title="Total Production (Kg)"
        value={totalProductionKg.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        className="border-l-orange-500"
        iconClassName="bg-orange-100 text-orange-600"
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
      materialOptions={materialCodeOptions}
      exportToExcel={exportToExcel}
      reportName="Production"
      filteredData={filteredData}
    />
  );

  const tableContent = (
    <table className="min-w-full text-sm text-left text-gray-700 border-collapse">
      <thead className="bg-red-100 text-xs uppercase text-red-900 sticky top-0 z-10">
        <tr>
          <th className="px-6 py-3 border-b font-semibold" rowSpan="2">Date</th>
          <th className="px-6 py-3 border-b font-semibold" rowSpan="2">Shift</th>
          <th className="px-6 py-3 border-b font-semibold" rowSpan="2">Line</th>
          <th className="px-6 py-3 border-b font-semibold text-center" colSpan="3">Production Details</th>
          <th className="px-6 py-3 border-b font-semibold text-right" rowSpan="2">Total (Pieces)</th>
          <th className="px-6 py-3 border-b font-semibold text-right" rowSpan="2">Total (Kg)</th>
        </tr>
        <tr className="bg-red-100 border-b">
          <th className="px-6 py-2 font-medium">Material Code</th>
          <th className="px-6 py-2 font-medium">Qty (Pcs)</th>
          <th className="px-6 py-2 font-medium">Qty (Kg)</th>
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
          currentItems.map((record, index) =>
            record.productionItems.map((item, itemIndex) => (
              <tr key={`${record._id}-${index}-${itemIndex}`} className="hover:bg-red-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap align-top font-medium text-gray-900">
                  {itemIndex === 0 ? formatDate(record.date) : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap align-top text-gray-600">
                  {itemIndex === 0 ? record.shift : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap align-top text-gray-600">
                  {itemIndex === 0 ? record.line : ''}
                </td>
                {/* <td className="px-4 py-2">{item.batchId}</td> */}
                <td className="px-6 py-4 align-top">{item.materialCode}</td>
                <td className="px-6 py-4 align-top text-gray-900">{item.pieces.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 align-top text-gray-600">{item.productionInKg.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-6 py-4 align-top text-right font-bold text-gray-900">
                  {itemIndex === 0 ? record.totalPieces.toLocaleString('en-IN') : ''}
                </td>
                <td className="px-6 py-4 align-top text-right font-bold text-gray-600">
                  {itemIndex === 0 ? record.totalProductionInKg.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
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
      title="Production Report"
      description="Daily production records by shift and line."
      stats={stats}
      filterBar={filterComponent}
      content={tableContent}
      themeColor="red"
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

export default ProductionTable;
