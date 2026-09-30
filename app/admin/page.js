"use client";
import { API_BASE_URL } from "@/lib/api";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useTheme } from "next-themes";
import {
  FileSpreadsheet,
  Box,
  TruckIcon,
  BarChart3,
  Download,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Layers } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/Header/Header";
import MTDDashboardDisplay from "@/components/MTDDashboardDisplay/MTDDashboardDisplay";
import StockCard from "@/components/AdminStockCard/AdminStockCard";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import ManPowerCostingTable from "@/components/ManPowerCostingTable/ManPowerCostingTable";
import RejectionReport from "@/components/RejectionReport/RejectionReport";
import MaterialStockReport from "@/components/Mes/admin/MaterialStockReport";
import BatchWiseStockReport from "@/components/Mes/admin/BatchStockReport";
import BreakdownDashboard from "@/components/BreakdownDashboard/BreakdownDashboard";
import ProductionAnalyticsDashboard from "@/components/Admin/ProductionAnalyticsDashboard";

import { motion } from "framer-motion";

const categories = [
  { name: "glovesProduction", title: "Gloves Production", icon: FileSpreadsheet, color: "from-blue-500 to-cyan-400" },
  { name: "fgStocks", title: "FG Stocks", icon: Box, color: "from-emerald-500 to-green-400" },
  { name: "dispatchDetails", title: "Dispatch Details", icon: TruckIcon, color: "from-orange-500 to-amber-400" },
  { name: "productionReport", title: "Production Report", icon: BarChart3, color: "from-purple-600 to-fuchsia-500" },
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 }
  }
};

export default function AdminDashboard() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [s3Key, setS3Key] = useState("");
  const [selectedDate, setSelectedDate] = useState();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    if (category !== "productionReport") {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const response = await axios.post(
          `${API_BASE_URL}/admin/files`,
          { fileType: category },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setFileUrl(response.data.s3FileUrl);
        setS3Key(response.data.s3Key);
      } catch (error) {
        console.error("Error fetching file:", error);
      }
    }
  };

  const handleDownload = () => {
    if (!fileUrl) return;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", s3Key.split("/").pop());
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProductionReportSubmit = async () => {
    if (selectedMonth && selectedYear) {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const response = await axios.post(
          `${API_BASE_URL}/admin/files`,
          { fileType: "productionReport", month: selectedMonth, year: selectedYear },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setFileUrl(response.data.s3FileUrl);
        setS3Key(response.data.s3Key);
      } catch (error) {
        console.error("Error fetching production report:", error);
      }
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  if (!mounted) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-foreground pb-12">
        <Header />

        {/* Sticky Control Header */}
        <div className="sticky top-0 z-40 px-4 md:px-8 py-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-300">
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              onClick={() => setActiveTab("overview")}
              className={`text-sm font-semibold rounded-full px-5 ${activeTab === "overview" ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20" : "hover:bg-indigo-50 text-indigo-600 dark:hover:bg-indigo-950/50"
                }`}
            >
              <Layers className="w-4 h-4 mr-2" />
              MES Overview
            </Button>
            <Button
              variant={activeTab === "production-analytics" ? "default" : "ghost"}
              onClick={() => setActiveTab("production-analytics")}
              className={`text-sm font-semibold rounded-full px-5 ${activeTab === "production-analytics"
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                  : "hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-950/50"
                }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-full p-1 pl-4 border border-gray-200 dark:border-gray-800">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-2">Filter Date:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-8 rounded-full md:w-[180px] w-36 justify-start text-left font-semibold text-xs border-0 bg-white dark:bg-gray-800 shadow-sm hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Today"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-xl overflow-hidden shadow-2xl border-gray-200 dark:border-gray-800" align="end">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      className="bg-white dark:bg-gray-950"
                    />
                  </PopoverContent>
                </Popover>
              </motion.div>
            )}
            <Button
              onClick={() => mounted && router.push("/admin/sales")}
              className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-gray-200 text-xs rounded-full px-5 shadow-sm transition-all hover:shadow-md"
            >
              Sales <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mx-auto max-w-[1600px] mt-6">
          {activeTab === "production-analytics" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="px-4 md:px-8 w-full"
            >
              <ProductionAnalyticsDashboard />
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="px-4 md:px-8 space-y-6"
            >
              {/* Top Dashboards */}
              <motion.div variants={itemVariants}>
                <MTDDashboardDisplay selectedDateByMain={selectedDate} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <BreakdownDashboard selectedDateByMain={selectedDate} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <RejectionReport selectedDateByMain={selectedDate} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <StockCard selectedDateByMain={selectedDate} />
              </motion.div>

              {/* Split Stock Reports */}
              <motion.div variants={itemVariants} className="grid md:grid-cols-2 grid-cols-1 gap-6">
                <div className="h-full"><MaterialStockReport /></div>
                <div className="h-full"><BatchWiseStockReport /></div>
              </motion.div>

              {/* Data Export / Reports Section */}
              <motion.div variants={itemVariants} className="pt-8 pb-4">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Data Export & Reports</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Download operational metrics and production sheets</p>
                  </div>
                  <Button variant="outline" size="sm" className="hidden md:flex rounded-full text-xs gap-2">
                    <Download className="w-3.5 h-3.5" /> Download All Recent
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  {categories.map((category) => (
                    <Dialog key={category.name}>
                      <DialogTrigger asChild>
                        <Card
                          className="group relative overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-transparent dark:hover:border-transparent rounded-2xl bg-white dark:bg-gray-900/50"
                          onClick={() => handleCategoryClick(category.name)}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${category.color} rounded-full blur-3xl opacity-5 dark:opacity-10 -mr-16 -mt-16 transition-all duration-500 group-hover:scale-150 group-hover:opacity-20`} />

                          <CardContent className="p-6">
                            <div className="flex flex-col h-full justify-between gap-6">
                              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} shadow-lg shadow-gray-200 dark:shadow-none flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                <category.icon className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 dark:group-hover:from-white dark:group-hover:to-gray-300 transition-colors">
                                  {category.title}
                                </h3>
                                <div className="mt-2 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                                  <span>Generate Report</span>
                                  <svg className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] rounded-2xl overflow-hidden border-gray-200 dark:border-gray-800 p-0">
                        <div className={`h-2 w-full bg-gradient-to-r ${category.color}`} />
                        <div className="p-6">
                          <DialogHeader className="mb-4">
                            <DialogTitle className="flex items-center gap-3 text-xl">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                                <category.icon className="h-4 w-4 text-white" />
                              </div>
                              {category.title}
                            </DialogTitle>
                          </DialogHeader>

                          {category.name === "productionReport" && (
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 mb-4 space-y-4">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                  <label className="text-xs font-semibold text-gray-500">Month</label>
                                  <Select onValueChange={setSelectedMonth}>
                                    <SelectTrigger className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {months.map((month) => (
                                        <SelectItem key={month} value={month}>{month}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-semibold text-gray-500">Year</label>
                                  <Select onValueChange={setSelectedYear}>
                                    <SelectTrigger className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {years.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <Button
                                onClick={handleProductionReportSubmit}
                                className={`w-full bg-gradient-to-r ${category.color} hover:opacity-90 text-white shadow-md`}
                              >
                                Generate File
                              </Button>
                            </div>
                          )}

                          <div className="h-[250px] w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden relative flex flex-col items-center justify-center">
                            {fileUrl ? (
                              /\.(pdf|jpg|jpeg|png)$/.test(s3Key) ? (
                                <iframe src={fileUrl} className="w-full h-full border-0" title="File Viewer" />
                              ) : (
                                <div className="text-center p-6 flex flex-col items-center">
                                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${category.color} opacity-10 absolute`} />
                                  <FileSpreadsheet className={`w-12 h-12 mb-3 text-gray-700 dark:text-gray-300 relative z-10`} />
                                  <p className="text-sm font-medium text-gray-900 dark:text-white relative z-10">File generated successfully</p>
                                  <p className="text-xs text-gray-500 mt-1 relative z-10 max-w-[200px] truncate">{s3Key.split("/").pop()}</p>
                                </div>
                              )
                            ) : (
                              <div className="text-center text-gray-400 dark:text-gray-600">
                                <category.icon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-medium">Ready to download</p>
                              </div>
                            )}
                          </div>

                          <Button
                            onClick={handleDownload}
                            disabled={!fileUrl}
                            className="w-full mt-4 h-11 text-sm font-semibold shadow-sm"
                            variant={fileUrl ? "default" : "secondary"}
                          >
                            <Download className="mr-2 h-4 w-4" /> {fileUrl ? "Download Now" : "Waiting for file..."}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
