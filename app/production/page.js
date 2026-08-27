"use client";
import { API_BASE_URL } from "@/lib/api";
import React, { useState } from "react";
import axios from "axios";
import { Upload, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header/Header";
import Loading from "./loading";
import ProductionInput from "@/components/ProductionInput/ProductionInput";
import TotalStocksCard from "@/components/StocksCard/StocksCard";
import ProtectedRouteProduction from "@/components/ProtectedRouteProduction/ProtectedRouteProduction"
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import Payroll from "@/components/Payroll/Payroll";
import RejectionReportForm from "@/components/RejectionReportForm.jsx/RejectionReportForm";
import { useRouter } from "next/navigation";

// Exportable document types
export const DOCUMENT_TYPE = [
  "glovesProduction",
  "fgStocks",
  "dispatchDetails",
  "productionReport",
];

const ProductionDashboard = () => {
  const [xlsxFiles, setXlsxFiles] = useState([
    { name: DOCUMENT_TYPE[0], file: null, uiName: "Gloves Production" },
    { name: DOCUMENT_TYPE[1], file: null, uiName: "FG Stocks" },
    { name: DOCUMENT_TYPE[2], file: null, uiName: "Dispatch Details" },
  ]);
  const [xlsmFile, setXlsmFile] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(false);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Handle file selection
  const handleFileSelection = (index, file) => {
    const newFiles = [...xlsxFiles];
    newFiles[index].file = file;
    setXlsxFiles(newFiles);
  };

  // Handle file upload for xlsx files
  const handleXlsxFileUpload = async (index) => {
    const file = xlsxFiles[index].file;
    const accessToken = localStorage.getItem("accessToken");
    setLoading(true);

    if (!file) {
      alert("Please select a file to upload.");
      setLoading(false);
      return;
    }

    if (!accessToken) {
      console.error("Access token is missing");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("fileType", xlsxFiles[index].name);
      formData.append("file", file);

      await axios.post(`${API_BASE_URL}/production/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      alert(`${xlsxFiles[index].name} file uploaded successfully!`);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(`Error uploading ${xlsxFiles[index].name}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleXlsxFileDelete = (index) => {
    const newFiles = [...xlsxFiles];
    newFiles[index].file = null;
    setXlsxFiles(newFiles);
  };

  // Handle upload for the .xlsm production report file
  const handleXlsmFileUpload = async () => {
    const accessToken = localStorage.getItem("accessToken");
    setLoading(true);

    if (!xlsmFile || !selectedMonth || !selectedYear) {
      alert("Please select a file, month, and year for upload.");
      setLoading(false);
      return;
    }

    if (!accessToken) {
      console.error("Access token is missing");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("fileType", DOCUMENT_TYPE[3]); // productionReport
      formData.append("file", xlsmFile);
      formData.append(
        "reportMonth",
        (months.indexOf(selectedMonth) + 1).toString()
      );

      formData.append("reportYear", selectedYear);

      await axios.post(`${API_BASE_URL}/production/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      alert("Production report uploaded successfully!");
    } catch (error) {
      console.error("Error uploading production report:", error);
      alert("Error uploading production report.");
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();

  if (loading)
    return <Loading />;

  return (
    <ProtectedRoute>
      <div>
        <Header saleperson={{ jobId: "productionPerson", name: "production" }} />
        <div>
          <button
            onClick={() => router.push('/mes/production')}
            className="absolute top-16 right-2 gap-2 px-4 py-2 text-sm bg-blue-800 hover:bg-blue-900 text-white mt-4 ml-2 font-bold rounded-lg transition"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex flex-row justify-start items-center max-w-6xl mx-auto py-6">
            {" "}
            <span className="text-3xl font-bold">
              {" "}
              Update Metrics: Dispatch, Production, Packing, and Sales
            </span>
          </div>
          <ProductionInput />
        </div>
        <div className=" p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Production Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {xlsxFiles.map((file, index) => (
                <Card key={file.name}>
                  <CardHeader>
                    <CardTitle>{file.uiName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept=".xlsx"
                        onChange={(e) =>
                          handleFileSelection(index, e.target.files[0])
                        }
                        className="flex-grow"
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => handleXlsxFileUpload(index)}
                        disabled={!file.file} // Only enable button if a file is selected
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      {file.file && (
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleXlsxFileDelete(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {file.file && (
                      <p className="mt-2 text-sm">{file.file.name}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Production Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: 10 },
                        (_, i) => new Date().getFullYear() - i
                      ).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2 flex-grow">
                    <Input
                      type="file"
                      accept=".xlsx"
                      onChange={(e) => setXlsmFile(e.target.files[0])}
                      className="flex-grow"
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={handleXlsmFileUpload}
                      disabled={!xlsmFile}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    {xlsmFile && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => setXlsmFile(null)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {xlsmFile && <p className="mt-2 text-sm">{xlsmFile.name}</p>}
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="">
          <TotalStocksCard />
          <RejectionReportForm />
          {/* <Payroll/> */}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProductionDashboard;
