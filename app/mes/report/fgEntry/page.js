'use client';
import { materialCodeOptions } from '@/app/constant';
import FilterBar from '@/components/Mes/components/Packing/FilterBar';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Loading from '@/components/ui/Loading';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import * as XLSX from 'xlsx';
import Pagination from '@/components/ui/pagination';
import ReportLayout from '@/components/ui/ReportLayout';
import StatCard from '@/components/ui/StatCard';
import { useMemo } from 'react';

const PackingTable = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const [dateFilter, setDateFilter] = useState('');

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [enableFilter, setEnableFilter] = useState(false);
    const [materialCode, setMaterialCode] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState("");
    // const [reportType, setReportType] = useState("general");

    // format: "2026-01"

    const itemsPerPage = 10;

    useEffect(() => {
        const fetchPackingData = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get("http://127.0.0.1:5001/admin/report/fetchPackingMesData");
                if (res.data.success) {
                    setData(res.data.data);
                    setFilteredData(res.data.data);
                }
            } catch (error) {
                console.log("Failed to fetch packing data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPackingData();
    }, []);

    useEffect(() => {
        let tempData = [...data];

        if (dateFilter) {
            tempData = tempData.filter(record => new Date(record.date).toLocaleDateString() === new Date(dateFilter).toLocaleDateString());
        }

        if (startDate && endDate) {
            tempData = tempData.filter(record => {
                const recordDate = new Date(record.date);
                return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
            });
        }

        if (enableFilter && materialCode) {
            tempData = tempData.filter(record =>
                record.items.some(item => item.materialCode.includes(materialCode))
            );
        }

        setFilteredData(tempData);
        setCurrentPage(1); // reset to first page on filter change
    }, [dateFilter, startDate, endDate, enableFilter, materialCode, data]);


    const formatToDDMMYYYY = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };


    const exportToExcel = () => {
        // console.log("filteredData", filteredData)
        const flattenedData = filteredData.flatMap((record, index) => {
            const items = record.items.map((item, itemIndex) => ({
                Date: itemIndex === 0 ? new Date(record.date).toLocaleDateString() : "",
                // BatchID: item.batchId,
                MaterialCode: item.materialCode,
                Grade: item.grade,
                PackingType: item.packingType,
                GloveCount: item.gloveCount,
                Pieces: item.pieces,
                TotalPieces: itemIndex === 0 ? record.totalPacking : ""
            }));
            // Add empty row after each block
            return [...items];
        });

        console.log("flattenData", flattenedData);

        const ws = XLSX.utils.json_to_sheet(flattenedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Packing Report");
        XLSX.writeFile(wb, "Packing_Report.xlsx");
    };

    // const exportToExcel = () => {
    //     if (!filteredData.length) {
    //         alert("No data found");
    //         return;
    //     }

    //     if (!selectedMonth) {
    //         alert("Please select a month");
    //         return;
    //     }

    //     const [year, month] = selectedMonth.split("-");

    //     // ---- 1️⃣ Filter Only Selected Month Data ----
    //     const monthData = filteredData.filter(record => {
    //         const recordDate = new Date(record.date);
    //         return (
    //             recordDate.getFullYear() === Number(year) &&
    //             recordDate.getMonth() + 1 === Number(month)
    //         );
    //     });

    //     if (!monthData.length) {
    //         alert("No data available for selected month");
    //         return;
    //     }

    //     // ---- 2️⃣ Collect Unique Dates (Only That Month) ----
    //     const allDates = [
    //         ...new Set(
    //             monthData.map(r =>
    //                 new Date(r.date).toLocaleDateString("en-GB", {
    //                     day: "2-digit",
    //                     month: "short",
    //                     year: "2-digit",
    //                 })
    //             )
    //         ),
    //     ].sort((a, b) => new Date(a) - new Date(b));

    //     // ---- 3️⃣ Pivot Structure ----
    //     const pivot = {};

    //     monthData.forEach(record => {
    //         const formattedDate = new Date(record.date).toLocaleDateString(
    //             "en-GB",
    //             { day: "2-digit", month: "short", year: "2-digit" }
    //         );

    //         record.items.forEach(item => {
    //             const parsed = parseMaterialCode(item.materialCode);

    //             const key = `${parsed.texture}-${parsed.size}-${parsed.mil}-${parsed.color}`;

    //             if (!pivot[key]) {
    //                 pivot[key] = {
    //                     TEXTURE: parsed.texture,
    //                     Size: parsed.size,
    //                     Mil: parsed.mil,
    //                     Colour: parsed.color,
    //                 };
    //             }

    //             pivot[key][formattedDate] =
    //                 (pivot[key][formattedDate] || 0) + item.pieces;
    //         });
    //     });

    //     // ---- 4️⃣ Build Excel Rows ----
    //     const rows = [];
    //     const dateTotals = {};
    //     let grandTotal = 0;

    //     Object.values(pivot).forEach(row => {
    //         let rowTotal = 0;

    //         allDates.forEach(date => {
    //             const value = row[date] || 0;
    //             row[date] = value ? value.toLocaleString("en-IN") : "";
    //             rowTotal += value;

    //             dateTotals[date] = (dateTotals[date] || 0) + value;
    //         });

    //         row["TOTAL"] = rowTotal.toLocaleString("en-IN");
    //         grandTotal += rowTotal;

    //         rows.push(row);
    //     });

    //     // ---- 5️⃣ Bottom Total Row ----
    //     const totalRow = {
    //         TEXTURE: "Total (Pcs)",
    //         Size: "",
    //         Mil: "",
    //         Colour: "",
    //     };

    //     allDates.forEach(date => {
    //         totalRow[date] = (dateTotals[date] || 0).toLocaleString("en-IN");
    //     });

    //     totalRow["TOTAL"] = grandTotal.toLocaleString("en-IN");

    //     rows.push(totalRow);

    //     // ---- 6️⃣ Export ----
    //     const ws = XLSX.utils.json_to_sheet(rows, {
    //         header: ["TEXTURE", "Size", "Mil", "Colour", ...allDates, "TOTAL"],
    //     });

    //     const wb = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(
    //         wb,
    //         ws,
    //         `Packing Report ${selectedMonth}`
    //     );

    //     XLSX.writeFile(
    //         wb,
    //         `Packing_Report_${selectedMonth}.xlsx`
    //     );
    // };




    // const exportToExcelByMonth = async (selectedMonth) => {

    //     console.log("selectedMonth", selectedMonth);

    //     if (!selectedMonth) {
    //         alert("Please select month");
    //         return;
    //     }

    //     const [year, month] = selectedMonth.split("-");

    //     // ---- Filter Month Data ----
    //     const monthData = filteredData.filter(record => {
    //         const d = new Date(record.date);
    //         return (
    //             d.getFullYear() === Number(year) &&
    //             d.getMonth() + 1 === Number(month)
    //         );
    //     });

    //     if (!monthData.length) {
    //         alert("No data for selected month");
    //         return;
    //     }

    //     // ---- Collect Dates ----
    //     const allDates = [
    //         ...new Set(
    //             monthData.map(r =>
    //                 new Date(r.date).toLocaleDateString("en-GB", {
    //                     day: "2-digit",
    //                     month: "short",
    //                     year: "2-digit",
    //                 })
    //             )
    //         ),
    //     ].sort((a, b) => new Date(a) - new Date(b));

    //     // ---- Pivot Structure ----
    //     const pivot = {};

    //     monthData.forEach(record => {
    //         const formattedDate = new Date(record.date).toLocaleDateString(
    //             "en-GB",
    //             { day: "2-digit", month: "short", year: "2-digit" }
    //         );

    //         record.items.forEach(item => {
    //             const parsed = parseMaterialCode(item.materialCode);

    //             const key = `${item.materialCode}-${item.grade}`;

    //             if (!pivot[key]) {
    //                 pivot[key] = {
    //                     materialCode: item.materialCode,
    //                     grade: item.grade,
    //                     texture: parsed.texture,
    //                     size: parsed.size,
    //                     mil: parsed.mil,
    //                     color: parsed.color,
    //                 };
    //             }

    //             pivot[key][formattedDate] =
    //                 (pivot[key][formattedDate] || 0) + item.pieces;
    //         });
    //     });

    //     // ---- Create Workbook ----
    //     const workbook = new ExcelJS.Workbook();
    //     const sheet = workbook.addWorksheet("Packing Report");

    //     const headers = [
    //         "Material Code",
    //         "Grade",
    //         "Texture",
    //         "Size",
    //         "Mil",
    //         "Colour",
    //         ...allDates,
    //         "TOTAL",
    //     ];

    //     sheet.addRow(headers);

    //     // ---- Header Style (Light Orange) ----
    //     sheet.getRow(1).eachCell(cell => {
    //         cell.font = { bold: true };
    //         cell.alignment = { horizontal: "center", vertical: "middle" };
    //         cell.fill = {
    //             type: "pattern",
    //             pattern: "solid",
    //             fgColor: { argb: "FFF8CBAD" }, // Light Orange
    //         };
    //         cell.border = {
    //             top: { style: "thin" },
    //             left: { style: "thin" },
    //             bottom: { style: "thin" },
    //             right: { style: "thin" },
    //         };
    //         if (typeof cell.value === "number") {
    //             cell.numFmt = '#,##,##0';
    //         }
    //     });

    //     let grandTotal = 0;
    //     const dateTotals = {};

    //     // ---- Data Rows ----
    //     Object.values(pivot).forEach(item => {
    //         let rowTotal = 0;

    //         const rowValues = [
    //             item.materialCode,
    //             item.grade,
    //             item.texture,
    //             item.size,
    //             item.mil,
    //             item.color,
    //         ];

    //         allDates.forEach(date => {
    //             const val = item[date] || 0;
    //             rowValues.push(val);
    //             rowTotal += val;
    //             dateTotals[date] = (dateTotals[date] || 0) + val;
    //         });

    //         rowValues.push(rowTotal);
    //         grandTotal += rowTotal;

    //         const row = sheet.addRow(rowValues);

    //         row.eachCell(cell => {
    //             cell.alignment = { horizontal: "center", vertical: "middle" };
    //             cell.border = {
    //                 top: { style: "thin" },
    //                 left: { style: "thin" },
    //                 bottom: { style: "thin" },
    //                 right: { style: "thin" },
    //             };
    //         });
    //     });

    //     // ---- Total Row (Light Green) ----
    //     const totalRowValues = [
    //         "Total (Pcs)",
    //         "",
    //         "",
    //         "",
    //         "",
    //         "",
    //     ];

    //     allDates.forEach(date => {
    //         totalRowValues.push(dateTotals[date] || 0);
    //     });

    //     totalRowValues.push(grandTotal);

    //     const totalRow = sheet.addRow(totalRowValues);

    //     totalRow.eachCell(cell => {
    //         cell.font = { bold: true };
    //         cell.alignment = { horizontal: "center", vertical: "middle" };
    //         cell.fill = {
    //             type: "pattern",
    //             pattern: "solid",
    //             fgColor: { argb: "FFC6E0B4" }, // Light Green
    //         };
    //         cell.border = {
    //             top: { style: "thin" },
    //             left: { style: "thin" },
    //             bottom: { style: "thin" },
    //             right: { style: "thin" },
    //         };
    //     });

    //     // ---- Auto Column Width ----
    //     sheet.columns.forEach(column => {
    //         column.width = 18;
    //     });

    //     // ---- Download ----
    //     const buffer = await workbook.xlsx.writeBuffer();

    //     saveAs(
    //         new Blob([buffer], {
    //             type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    //         }),
    //         `Packing_Report_${selectedMonth}.xlsx`
    //     );
    // };
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Calculate Grand Total for StatCard
    const totalPackingCount = useMemo(() => {
        return filteredData.reduce((sum, record) => sum + (record.totalPacking || 0), 0);
    }, [filteredData]);

    const stats = (
        <StatCard
            title="Total Packing"
            value={totalPackingCount.toLocaleString('en-IN')}
            className="border-l-green-500"
            iconClassName="bg-green-100 text-green-600"
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
            reportName={"Packing"}
            filteredData={filteredData}
            exportToExcel={exportToExcel} // Enhanced export
            // exportToExcelByMonth={exportToExcelByMonth}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            showExportDate={true}
        />
    );

    const tableContent = (
        <table className="min-w-full text-sm text-left text-gray-700 border-collapse">
            <thead className="bg-green-100 text-xs uppercase text-green-900 sticky top-0 z-10">
                <tr>
                    <th className="px-6 py-3 border-b font-semibold">Date</th>
                    {/* <th className="px-6 py-3 border-b font-semibold">Batch ID</th> */}
                    <th className="px-6 py-3 border-b font-semibold text-center" colSpan="5">Items</th>
                    <th className="px-6 py-3 border-b font-semibold text-right">Total Packing</th>
                </tr>
                <tr className="bg-green-100 border-b">
                    <th className="px-6 py-2 font-medium"></th>
                    <th className="px-6 py-2 font-medium">Material Code</th>
                    <th className="px-6 py-2 font-medium">Grade</th>
                    <th className="px-6 py-2 font-medium">Packing Type</th>
                    <th className="px-6 py-2 font-medium">Glove Count</th>
                    <th className="px-6 py-2 font-medium">Pieces</th>
                    <th className="px-6 py-2 font-medium"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-500 font-medium text-lg">
                            Result not found
                        </td>
                    </tr>
                ) : (
                    currentItems.map((record) =>
                        record.items.map((item, index) => (
                            <tr
                                key={`${record._id}-${index}`}
                                className="hover:bg-indigo-50/50 transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap align-top font-medium text-gray-900">
                                    {index === 0 ? formatToDDMMYYYY(record.date) : ''}
                                </td>
                                {/* <td className="px-6 py-4 align-top">{item.batchId}</td> */}
                                <td className="px-6 py-4 align-top">{item.materialCode}</td>
                                <td className="px-6 py-4 align-top">
                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-600">
                                        {item.grade}
                                    </span>
                                </td>
                                <td className="px-6 py-4 align-top">{item.packingType}</td>
                                <td className="px-6 py-4 align-top text-gray-500">{item.gloveCount}</td>
                                <td className="px-6 py-4 align-top text-gray-900 font-medium">{item.pieces.toLocaleString('en-IN')}</td>
                                <td className="px-6 py-4 align-top text-right font-bold text-gray-900">
                                    {index === 0 ? record.totalPacking.toLocaleString('en-IN') : ''}
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
            title="FG Entry Report"
            description="Tracking finished goods entry into inventory."
            // icon={Package}
            stats={stats}
            filterBar={filterComponent}
            content={tableContent}
            themeColor="green"
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

export default PackingTable;
