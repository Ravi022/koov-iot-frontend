"use client"
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import {
    ChevronDown,
    FileSpreadsheet,
    Filter,
    Calendar
} from "lucide-react";
import { parseMaterialCode } from "@/app/constant";
// import { exportToExcelByMonth } from "@/app/constant";

export default function ExportDropdown({ reportName, exportToExcel, filteredData }) {
    // const [enableFilter, setEnableFilter] = useState(false);
    const [open, setOpen] = useState(false);
    const [showMonths, setShowMonths] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("January");

    const generateMonths = () => {
        const months = [];
        const now = new Date();

        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

            const value = `${d.getFullYear()}-${String(
                d.getMonth() + 1
            ).padStart(2, "0")}`;

            const label = d.toLocaleDateString("en-GB", {
                month: "short",
                year: "numeric",
            });

            months.push({ value, label });
        }

        return months;
    };

    const months = generateMonths();

    const exportToExcelByMonth = async (reportName, selectedMonth, filteredData) => {

        if (!selectedMonth) {
            alert("Please select month");
            return;
        }

        const [year, month] = selectedMonth.split("-");

        // ---- Filter Month Data ----
        const monthData = filteredData.filter(record => {
            const d = new Date(record.date);
            return (
                d.getFullYear() === Number(year) &&
                d.getMonth() + 1 === Number(month)
            );
        });

        if (!monthData.length) {
            alert("No data for selected month");
            return;
        }

        // ---- Collect Dates ----
        const allDates = [
            ...new Set(
                monthData.map(r =>
                    new Date(r.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                    })
                )
            ),
        ].sort((a, b) => new Date(a) - new Date(b));

        // ---- Pivot Structure ----
        const pivot = {};

        monthData.forEach(record => {
            const formattedDate = new Date(record.date).toLocaleDateString(
                "en-GB",
                { day: "2-digit", month: "short", year: "2-digit" }
            );

            record.items.forEach(item => {
                const parsed = parseMaterialCode(item.materialCode);

                const key = `${item.materialCode}-${item.grade}`;

                if (!pivot[key]) {
                    pivot[key] = {
                        materialCode: item.materialCode,
                        grade: item.grade,
                        texture: parsed.texture,
                        size: parsed.size,
                        mil: parsed.mil,
                        color: parsed.color,
                    };
                }

                pivot[key][formattedDate] =
                    (pivot[key][formattedDate] || 0) + item.pieces;
            });
        });

        // ---- Create Workbook ----
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Packing Report");

        // ---- Row 1: Main Title ----
        const reportTitle = `${reportName} Report - ${new Date(year, month - 1).toLocaleString('default', { month: 'short' }).toUpperCase()} ${year}`;
        const titleRow = sheet.addRow([reportTitle]);

        // Merge title across all columns
        const totalColumns = 6 + allDates.length + 1; // 6 static + dates + total
        sheet.mergeCells(1, 1, 1, totalColumns);

        // Style Main Title
        titleRow.getCell(1).font = {
            bold: true,
            size: 16,
            color: { argb: "FFFFFFFF" }
        };
        titleRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
        titleRow.getCell(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF0E5E6F" } // Dark Teal/Green
        };
        titleRow.height = 30;

        // ---- Row 2: Subheadings ----
        const headers = [
            "Material Code",
            "Grade",
            "Texture",
            "Size",
            "Mil",
            "Colour",
            ...allDates,
            "TOTAL",
        ];

        const headerRow = sheet.addRow(headers);

        // ---- Header Style (Light Yellow/Gold) ----
        headerRow.eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFFD966" }, // Light Yellow/Gold
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        let grandTotal = 0;
        const dateTotals = {};

        // ---- Helper for Indian Number Format ----
        const formatIndianNumber = (num) => {
            return num ? num.toLocaleString('en-IN') : "";
        };

        // ---- Data Rows ----
        Object.values(pivot).forEach(item => {
            let rowTotal = 0;

            const rowValues = [
                item.materialCode,
                item.grade,
                item.texture,
                item.size,
                item.mil,
                item.color,
            ];

            allDates.forEach(date => {
                const val = item[date] || 0;
                rowValues.push(val !== 0 ? formatIndianNumber(val) : ""); // Format as Indian Number String
                rowTotal += val;
                dateTotals[date] = (dateTotals[date] || 0) + val;
            });

            rowValues.push(formatIndianNumber(rowTotal));
            grandTotal += rowTotal;

            const row = sheet.addRow(rowValues);

            row.eachCell(cell => {
                cell.alignment = { horizontal: "center", vertical: "middle" };
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
            });
        });

        // ---- Total Row (Light Green) ----
        const totalRowValues = [
            "Total (Pcs)",
            "",
            "",
            "",
            "",
            "",
        ];

        allDates.forEach(date => {
            totalRowValues.push(formatIndianNumber(dateTotals[date] || 0));
        });

        totalRowValues.push(formatIndianNumber(grandTotal));

        const totalRow = sheet.addRow(totalRowValues);

        totalRow.eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFC6E0B4" }, // Light Green
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        // ---- Auto Column Width ----
        sheet.columns.forEach(column => {
            column.width = 15;
        });

        // ---- Filename Construction ----
        const shortMonth = new Date(year, month - 1).toLocaleString('default', { month: 'short' });
        const fileName = `${reportName}_${shortMonth}_${year}.xlsx`;

        // ---- Download ----
        const buffer = await workbook.xlsx.writeBuffer();

        saveAs(
            new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
            fileName
        );
    };

    // const handleExportByFilter = () => {
    //     console.log("Exporting by filter...");
    // };

    // const handleExportByMonth = (month) => {
    //     console.log("Exporting by month:", month);
    // };

    return (
        <div className="flex items-center justify-between gap-4">

            {/* Enable Filter */}
            {/* <Label className="flex items-center gap-2">
                <Switch checked={enableFilter} onCheckedChange={setEnableFilter} />
                Enable Filters
            </Label> */}

            {/* Split Button */}
            <div className="relative inline-flex">

                {/* Main Button */}
                <button
                    // onClick={handleExportByFilter}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-l-xl transition shadow"
                >
                    <FileSpreadsheet size={18} />
                    Export Excel
                </button>

                {/* Dropdown Toggle */}
                <button
                    onClick={() => {
                        setOpen(!open);
                        setShowMonths(false);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-r-xl border-l border-emerald-500"
                >
                    <ChevronDown size={18} />
                </button>

                {/* Dropdown */}
                {open && (
                    <div className="absolute right-0 top-12 w-42 bg-white shadow-xl rounded-xl border z-50 overflow-hidden">

                        {/* Export by Filter */}
                        <div
                            onClick={() => {
                                exportToExcel();
                                // handleExportByFilter();
                                setOpen(false);
                            }}
                            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 transition"
                        >
                            <Filter size={18} className="text-gray-600" />
                            <span className="text-sm font-medium">
                                Export by Filter
                            </span>
                        </div>

                        {/* Export by Month */}
                        <div
                            onClick={() => setShowMonths(!showMonths)}
                            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100 transition"
                        >
                            <div className="flex items-center gap-3">
                                <Calendar size={18} className="text-gray-600" />
                                <span className="text-sm font-medium">
                                    Export by Month
                                </span>
                            </div>
                            <ChevronDown size={16} />
                        </div>

                        {/* Month Selector */}
                        {showMonths && (
                            <div className="border-t bg-gray-50">
                                {months.map((month) => (
                                    <div
                                        key={month}
                                        onClick={() => {
                                            // setSelectedMonth(month);
                                            // handleExportByMonth(month);
                                            exportToExcelByMonth(reportName, month.value, filteredData);
                                            // exportToExcelByMonth(selectedMonth);
                                            // setOpen(false);
                                        }}
                                        className={`px-6 py-2 text-sm cursor-pointer hover:bg-gray-200 ${selectedMonth === month
                                            ? "font-semibold text-emerald-600"
                                            : ""
                                            }`}
                                    >
                                        {month.label}
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}
