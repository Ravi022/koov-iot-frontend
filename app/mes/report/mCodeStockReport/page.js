'use client'

import { API_BASE_URL } from "@/lib/api";

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { materialCodeOptions, parseMaterialCode } from '@/app/constant'; // adjust path as needed
import FilterBar from '@/components/Mes/components/Packing/FilterBar';
// import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Download, DownloadIcon, FileSpreadsheet, FileSpreadsheetIcon, X } from 'lucide-react';
import ReportLayout from '@/components/ui/ReportLayout';
import StatCard from '@/components/ui/StatCard';
import { FaLastfmSquare, FaSadCry } from 'react-icons/fa';


const categoryFields = [
    'piecesFgBox',
    'piecesFgBulk',
    'piecesWipA',
    'piecesWipB',
    'piecesFgRejection',
    'piecesWipRejection',
    'piecesProduction',
    'piecesDispatch',
];

// Column options for the download modal
const DOWNLOAD_COLUMN_OPTIONS = [
    { key: 'fgWip', label: 'FG WIP', defaultSelected: true },
    { key: 'fgBox', label: 'FG Box', defaultSelected: false },
    { key: 'fgBulk', label: 'FG Bulk', defaultSelected: false },
    { key: 'wipA', label: 'WIP A', defaultSelected: false },
    { key: 'wipB', label: 'WIP B', defaultSelected: false },
    { key: 'fgRejection', label: 'FG Rejection', defaultSelected: false },
    { key: 'wipRejection', label: 'WIP Rejection', defaultSelected: false },
    { key: 'production', label: 'Production', defaultSelected: false },
    { key: 'dispatch', label: 'Dispatch', defaultSelected: false },
];

export default function StockReportPage() {
    const [actualData, setAtualData] = useState([])
    const [aggregatedData, setAggregatedData] = useState({});
    const [materialCode, setMaterialCode] = useState('');
    const [filteredCodes, setFilteredCodes] = useState([]);
    const [enableFilter, setEnableFilter] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [dateFilter, setDateFilter] = useState();
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState(
        DOWNLOAD_COLUMN_OPTIONS.filter(c => c.defaultSelected).map(c => c.key)
    );

    // Advanced filter states
    const [searchCode, setSearchCode] = useState('');
    const [milFilter, setMilFilter] = useState('');
    const [sizeFilter, setSizeFilter] = useState('');
    const [textureFilter, setTextureFilter] = useState('');
    const [colorFilter, setColorFilter] = useState('');
    const [gradeFilter, setGradeFilter] = useState('');

    // Derive unique filter options from materialCodeOptions
    const filterOptions = useMemo(() => {
        const options = { mil: new Set(), size: new Set(), texture: new Set(), color: new Set(), grade: new Set() };
        materialCodeOptions.forEach((code) => {
            const parsed = parseMaterialCode(code);
            if (parsed.mil) options.mil.add(parsed.mil);
            if (parsed.size) options.size.add(parsed.size);
            if (parsed.texture) options.texture.add(parsed.texture);
            if (parsed.color) options.color.add(parsed.color);
            if (parsed.grade) options.grade.add(parsed.grade);
        });
        return {
            mil: [...options.mil].sort(),
            size: [...options.size].sort(),
            texture: [...options.texture].sort(),
            color: [...options.color].sort(),
            grade: [...options.grade].sort(),
        };
    }, []);


    useEffect(() => {
        const fetchStockData = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get(`${API_BASE_URL}/admin/fetchBatchStockData`);
                const rawData = res.data.data;

                // console.log(`rawData", rawData);
                setAtualData(rawData);
                // Initialize materialMap with all material codes from constant.js
                const materialMap = {};
                materialCodeOptions.forEach((code) => {
                    materialMap[code] = categoryFields.reduce((acc, field) => {
                        acc[field] = 0;
                        return acc;
                    }, {});
                });

                // Aggregate backend data into materialMap
                rawData.forEach((batch) => {
                    batch.materials.forEach((mat) => {
                        const code = mat.materialCode;
                        // Skip if materialCode is not in the predefined list
                        if (!materialMap[code]) return;
                        categoryFields.forEach((field) => {
                            materialMap[code][field] += mat[field] || 0;
                        });
                    });
                });

                setAggregatedData(materialMap);
                setFilteredCodes(Object.keys(materialMap));
            } catch (err) {
                console.error('Error fetching stock data:', err);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchStockData();
    }, []);


    const calculateMaterialWiseStock = () => {
        let materialArr = []
        materialCodeOptions.forEach((code) => {
            const materialCode = code;
            const materialWithCtg = { materialCode, ...categoryFields };
            materialArr = [materialWithCtg, ...materialArr];
        })
        console.log("materialArr", materialArr);
    }

    useEffect(() => {
        if (isLoading) return;

        if (dateFilter) {
            const givenFilteredDate = new Date(dateFilter)
            const filterActualData = actualData.filter((data) => {
                //   console.log("data", data);
                const dataDate = new Date(data.date);
                return givenFilteredDate >= dataDate;
            })

            calculateMaterialWiseStock();


        }
        let codes = Object.keys(aggregatedData);

        // Apply search filter
        if (searchCode.trim()) {
            codes = codes.filter(c => c.toLowerCase().includes(searchCode.trim().toLowerCase()));
        }

        // Apply attribute dropdown filters
        codes = codes.filter((c) => {
            const parsed = parseMaterialCode(c);

            return (
                (!milFilter || parsed.mil === milFilter) &&
                (!sizeFilter || parsed.size === sizeFilter) &&
                (!textureFilter || parsed.texture === textureFilter) &&
                (!colorFilter || parsed.color === colorFilter) &&
                (!gradeFilter || parsed.grade === gradeFilter)
            );
        });

        setFilteredCodes(codes);
    }, [materialCode, aggregatedData, dateFilter, searchCode, milFilter, sizeFilter, textureFilter, colorFilter, gradeFilter, isLoading, actualData]);



    const useTotals = (filteredCodes, aggregatedData) => {
        return useMemo(() => {
            const categoryTotals = {};
            const descriptionTotals = {
                mil: {},
                size: {},
                texture: {},
                color: {},
                grade: {},
            };

            categoryFields.forEach(f => (categoryTotals[f] = 0));

            filteredCodes.forEach(code => {
                const parsed = parseMaterialCode(code);

                // Count description-wise totals
                Object.entries(parsed).forEach(([key, value]) => {
                    if (descriptionTotals[key]) {
                        descriptionTotals[key][value] =
                            (descriptionTotals[key][value] || 0) + 1;
                    }
                });

                // Sum category fields
                categoryFields.forEach(field => {
                    categoryTotals[field] += aggregatedData[code]?.[field] || 0;
                });
            });

            return { categoryTotals, descriptionTotals };
        }, [filteredCodes, aggregatedData]);
    };

    const { categoryTotals } = useTotals(filteredCodes, aggregatedData);

    const totalNettFG = (categoryTotals?.piecesFgBox || 0) + (categoryTotals?.piecesFgBulk || 0);
    const totalNettWIP = (categoryTotals?.piecesWipA || 0) + (categoryTotals?.piecesWipB || 0);

    const handleClearFilters = () => {
        setSearchCode('');
        setMilFilter('');
        setSizeFilter('');
        setTextureFilter('');
        setColorFilter('');
        setGradeFilter('');
    };

    const hasActiveFilters = searchCode || milFilter || sizeFilter || textureFilter || colorFilter || gradeFilter;

    const selectClass = "h-9 text-sm border border-gray-200 rounded-lg px-3 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 cursor-pointer transition-all duration-150 hover:border-purple-300 appearance-none w-full";

    const filterComponent = (
        <div className="flex flex-wrap justify-between gap-2 items-end">

            {/* Search Bar */}
            <div className="relative flex-1 max-w-[14rem]">
                <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide block mb-1">Search</label>
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Material code..."
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 placeholder-gray-400 transition-all duration-150 hover:border-purple-300"
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-2 items-end">
                {/* MIL */}
                <div className="flex flex-col min-w-[100px]">
                    <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">MIL</label>
                    <select value={milFilter} onChange={(e) => setMilFilter(e.target.value)} className={selectClass}>
                        <option value="">Select</option>
                        {filterOptions.mil.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>

                {/* Size */}
                <div className="flex flex-col min-w-[100px]">
                    <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Size</label>
                    <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} className={selectClass}>
                        <option value="">Select</option>
                        {filterOptions.size.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>

                {/* Texture */}
                <div className="flex flex-col min-w-[100px]">
                    <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Texture</label>
                    <select value={textureFilter} onChange={(e) => setTextureFilter(e.target.value)} className={selectClass}>
                        <option value="">Select</option>
                        {filterOptions.texture.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>

                {/* Color */}
                <div className="flex flex-col min-w-[100px]">
                    <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Color</label>
                    <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)} className={selectClass}>
                        <option value="">Select</option>
                        {filterOptions.color.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>

                {/* Grade */}
                <div className="flex flex-col min-w-[100px]">
                    <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Grade</label>
                    <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className={selectClass}>
                        <option value="">Select</option>
                        {filterOptions.grade.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>

                {/* Clear Button + Result Badge */}
                <div className="flex items-end gap-2 ml-auto flex-wrap">
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="h-9 px-4 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-400 transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear
                        </button>
                    )}
                    <span className="h-9 px-3 inline-flex items-center text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg whitespace-nowrap">
                        {filteredCodes.length} / {materialCodeOptions.length}
                    </span>
                </div>
            </div>
        </div>
    );

    const tableContent = (
        <table className="min-w-full text-sm text-left text-gray-700 border-collapse">
            <thead className="bg-purple-100 text-xs uppercase text-purple-900 sticky top-0 z-10">
                <tr>
                    <th className="px-4 py-3 border-b font-semibold">Material Code</th>
                    <th className="px-4 py-3 border-b font-semibold">MIL</th>
                    <th className="px-4 py-3 border-b font-semibold">Size</th>
                    <th className="px-4 py-3 border-b font-semibold">Texture</th>
                    <th className="px-4 py-3 border-b font-semibold">Color</th>
                    <th className="px-4 py-3 border-b font-semibold">Grade</th>
                    {categoryFields.map((cat) => (
                        <th key={cat} className="px-4 py-3 border-b font-semibold text-center">
                            {cat.replace('pieces', '').replace(/([A-Z])/g, ' $1')}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                    <tr>
                        <td colSpan={categoryFields.length + 6} className="text-center py-12 text-purple-600 font-semibold text-lg animate-pulse">
                            Loading stock data...
                        </td>
                    </tr>
                ) : filteredCodes.length === 0 ? (
                    <tr>
                        <td colSpan={categoryFields.length + 6} className="text-center py-12 text-gray-500 font-medium text-lg">
                            No data found
                        </td>
                    </tr>
                ) : (
                    <>
                        {filteredCodes.map((code, idx) => (
                            <tr
                                key={code}
                                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-purple-50/50 transition-colors`}
                            >
                                <td className="px-4 py-3 font-medium text-gray-900 border-r">{code}</td>
                                <td className="px-4 py-3 font-medium text-gray-900 border-r">{parseMaterialCode(code).mil}</td>
                                <td className="px-4 py-3 font-medium text-gray-900 border-r">{parseMaterialCode(code).size}</td>
                                <td className="px-4 py-3 font-medium text-gray-900 border-r">{parseMaterialCode(code).texture}</td>
                                <td className="px-4 py-3 font-medium text-gray-900 border-r">{parseMaterialCode(code).color}</td>
                                <td className="px-4 py-3 font-medium text-gray-900 border-r">{parseMaterialCode(code).grade}</td>
                                {categoryFields.map((cat) => (
                                    <td key={cat} className="px-4 py-3 text-center text-gray-700">
                                        {aggregatedData[code]?.[cat].toLocaleString('en-In') || 0}
                                    </td>
                                ))}
                            </tr>
                        ))}

                        <tr className="bg-purple-100 font-bold sticky bottom-0 text-purple-900 shadow-inner">
                            <td className="px-4 py-3 border-t border-purple-300">TOTAL</td>
                            <td colSpan={5} className="border-t border-purple-300"></td>
                            {categoryFields.map(cat => (
                                <td key={cat} className="px-4 py-3 text-center border-t border-purple-300">
                                    {categoryTotals[cat].toLocaleString('en-In')}
                                </td>
                            ))}
                        </tr>
                    </>
                )}
            </tbody>
        </table>
    );

    const toggleColumn = (key) => {
        setSelectedColumns(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const handleDownloadClick = () => {
        setShowDownloadModal(true);
    };

    const exportToExcel = async () => {
        if (!filteredCodes?.length) {
            alert("No data to export");
            return;
        }

        setShowDownloadModal(false);

        // Compute yesterday's date formatted as DD-MMM-YYYY
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dd = String(yesterday.getDate()).padStart(2, '0');
        const mmm = months[yesterday.getMonth()];
        const yyyy = yesterday.getFullYear();
        const reportTitle = `Stock_Report_Upto_${dd}-${mmm}-${yyyy}`;

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Stock Report");

        // Build dynamic headers based on selected columns
        const headers = ["Material Code", "MIL", "Size", "Texture", "Color", "Grade"];
        const colKeyMap = {
            fgWip: ["FG", "WIP"],
            fgBox: ["Fg Box"],
            fgBulk: ["Fg Bulk"],
            wipA: ["Wip A"],
            wipB: ["Wip B"],
            fgRejection: ["Fg Rejection"],
            wipRejection: ["Wip Rejection"],
            production: ["Production"],
            dispatch: ["Dispatch"],
        };
        DOWNLOAD_COLUMN_OPTIONS.forEach(opt => {
            if (selectedColumns.includes(opt.key)) {
                headers.push(...colKeyMap[opt.key]);
            }
        });
        const TOTAL_COLUMNS = headers.length;

        // Row 1: Merged title heading
        const titleRow = sheet.addRow([reportTitle]);
        sheet.mergeCells(1, 1, 1, TOTAL_COLUMNS);
        const titleCell = titleRow.getCell(1);
        titleCell.value = reportTitle;
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        titleCell.fill = {
            type: 'pattern', pattern: 'solid',
            // fgColor: { argb: 'FFC6EFCE' } 
            // fgColor: { argb: '9BBB59' }
            fgColor: { argb: 'C4D79B' }
        };
        titleCell.font = { bold: true, size: 13, color: { argb: 'FF000000' } };
        titleCell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } },
        };
        titleRow.height = 28;

        // Row 2: Column headers
        sheet.addRow(headers);

        // Add data rows
        filteredCodes.forEach(code => {
            const parsed = parseMaterialCode(code);
            if (!parsed) return;

            const fgBox = aggregatedData?.[code]?.piecesFgBox || 0;
            const fgBulk = aggregatedData?.[code]?.piecesFgBulk || 0;
            const wipA = aggregatedData?.[code]?.piecesWipA || 0;
            const wipB = aggregatedData?.[code]?.piecesWipB || 0;
            const nettFG = fgBox + fgBulk;
            const nettWIP = wipA + wipB;

            const dataValueMap = {
                fgWip: [nettFG, nettWIP],
                fgBox: [fgBox],
                fgBulk: [fgBulk],
                wipA: [wipA],
                wipB: [wipB],
                fgRejection: [aggregatedData?.[code]?.piecesFgRejection || 0],
                wipRejection: [aggregatedData?.[code]?.piecesWipRejection || 0],
                production: [aggregatedData?.[code]?.piecesProduction || 0],
                dispatch: [aggregatedData?.[code]?.piecesDispatch || 0],
            };

            const row = [code, parsed.mil, parsed.size, parsed.texture, parsed.color, parsed.grade];
            DOWNLOAD_COLUMN_OPTIONS.forEach(opt => {
                if (selectedColumns.includes(opt.key)) {
                    row.push(...dataValueMap[opt.key]);
                }
            });
            sheet.addRow(row);
        });

        // Total row
        const totalNettFG = (categoryTotals?.piecesFgBox || 0) + (categoryTotals?.piecesFgBulk || 0);
        const totalNettWIP = (categoryTotals?.piecesWipA || 0) + (categoryTotals?.piecesWipB || 0);

        const totalValueMap = {
            fgWip: [totalNettFG, totalNettWIP],
            fgBox: [categoryTotals?.piecesFgBox || 0],
            fgBulk: [categoryTotals?.piecesFgBulk || 0],
            wipA: [categoryTotals?.piecesWipA || 0],
            wipB: [categoryTotals?.piecesWipB || 0],
            fgRejection: [categoryTotals?.piecesFgRejection || 0],
            wipRejection: [categoryTotals?.piecesWipRejection || 0],
            production: [categoryTotals?.piecesProduction || 0],
            dispatch: [categoryTotals?.piecesDispatch || 0],
        };

        const totalRow = ["TOTAL", "", "", "", "", ""];
        DOWNLOAD_COLUMN_OPTIONS.forEach(opt => {
            if (selectedColumns.includes(opt.key)) {
                totalRow.push(...totalValueMap[opt.key]);
            }
        });
        const totalExcelRow = sheet.addRow(totalRow);
        totalExcelRow.font = { bold: true };

        // Style total row
        for (let col = 1; col <= TOTAL_COLUMNS; col++) {
            const cell = totalExcelRow.getCell(col);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFC6EFCE' },
            };
            cell.font = { bold: true };
        }

        // Style header row (row 2, since row 1 is the title)
        sheet.getRow(2).eachCell(cell => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                // fgColor: { argb: 'D1C4E9' },
                // fgColor: { argb: 'B3E5FC' } // Sky Light Blue
                // fgColor: { argb: '#84bc6c' }
                fgColor: { argb: 'B7DEE8' }
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // Indian number format string for ExcelJS
        const indianNumFmt = '#,##,##0';

        // Apply formatting to ALL cells: center+middle align, black borders, number format
        sheet.eachRow({ includeEmpty: false }, (row) => {
            row.height = 20;
            for (let col = 1; col <= TOTAL_COLUMNS; col++) {
                const cell = row.getCell(col);
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } },
                };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                // Apply Indian comma format to number cells (skip first 6 text columns)
                if (col > 6 && typeof cell.value === 'number') {
                    cell.numFmt = indianNumFmt;
                }
            }
        });

        // Auto-fit column widths — skip row 1 (merged title) to avoid inflated width
        const colWidths = new Array(TOTAL_COLUMNS).fill(0);
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // skip merged title row
            for (let col = 1; col <= TOTAL_COLUMNS; col++) {
                const cell = row.getCell(col);
                const val = cell.value != null ? cell.value.toString() : '';
                if (val.length > colWidths[col - 1]) colWidths[col - 1] = val.length;
            }
        });
        colWidths.forEach((len, i) => {
            sheet.getColumn(i + 1).width = len + 3 || 8;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(
            new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
            `${reportTitle}.xlsx`
        );
    };

    const stats = (
        <div className="flex gap-4">
            <StatCard
                title="Total FG Stock"
                value={totalNettFG.toLocaleString('en-IN')}
                className="border-l-purple-500"
                iconClassName="bg-purple-100 text-purple-600"
            />
            <StatCard
                title="Total WIP Stock"
                value={totalNettWIP.toLocaleString('en-IN')}
                className="border-l-indigo-500"
                iconClassName="bg-indigo-100 text-indigo-600"
            />
            <div className="relative">
                <Button
                    onClick={handleDownloadClick}
                    className="group flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 md:mt-0 mt-4"
                >
                    <FileSpreadsheetIcon className="w-4 h-4 transition-transform duration-300 group-hover:rotate-6" />
                    Download
                </Button>
            </div>
        </div>
    );


    const downloadModal = showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowDownloadModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <FileSpreadsheetIcon className="w-5 h-5" />
                        Select Columns for Export
                    </h3>
                    <button onClick={() => setShowDownloadModal(false)} className="text-white/80 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Column Options */}
                <div className="px-6 py-5 space-y-3 max-h-[350px] overflow-y-auto">
                    {DOWNLOAD_COLUMN_OPTIONS.map(opt => (
                        <label
                            key={opt.key}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border transition-all duration-200 ${selectedColumns.includes(opt.key)
                                ? 'bg-green-50 border-green-300 shadow-sm'
                                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedColumns.includes(opt.key)}
                                onChange={() => toggleColumn(opt.key)}
                                className="w-4 h-4 accent-green-600 rounded"
                            />
                            <span className={`text-sm font-medium ${selectedColumns.includes(opt.key) ? 'text-green-800' : 'text-gray-600'
                                }`}>
                                {opt.label}
                            </span>
                        </label>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                        {selectedColumns.length} column group{selectedColumns.length !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowDownloadModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={exportToExcel}
                            disabled={selectedColumns.length === 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export Excel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {downloadModal}
            <ReportLayout
                title="Stock Report (Material Wise)"
                description="Detailed stock breakdown by material code and category."
                stats={stats}
                filterBar={filterComponent}
                content={tableContent}
                themeColor="purple"
            />
        </>
    );
}
