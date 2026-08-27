"use client";
import { API_BASE_URL } from "@/lib/api";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

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
import TargetHistory from "@/components/ShowAssignTargetToAdmin/TargetHistory";
import ConfirmationSlider from "@/components/ConfirmationSlider/ConfirmationSlider.jsx";
import AdminTasks from "../../../components/AdminTasks/AdminTasks.jsx";
import ProtectedRouteAdmin from "@/components/ProtectedRouteAdmin/ProtectedRouteAdmin.js";
import TargetVsSalespersonChart from "@/components/BarGraph/BarGraph.js";

// Mock data
const salespeople = [
  // { name: "Ravikumar N", jobId: "KIOL2238", area: "Bangalore" },
  // { name: "Sugumar R", jobId: "KIOL2236", area: "Chennai, TN" },
  // { name: "Vineesh Mehta", jobId: "KIOL2239", area: "Delhi" },
  { name: "Soma Naveen Chandra", jobId: "KIOL2070", area: "Hyderabad" },
  { name: "Bharat Lal Dubey", jobId: "KIOL2064", area: "Maharashtra" },
  { name: "K. Senthil Kumar", jobId: "KIOL2323", area: "Hyderabad" },
  // { name: "Rakesh Gayashankar Tripathi", jobId: "KIOL2322", area: "Gujarat" },
  { name: "Shubham Sharma", jobId: "KIOL2319", area: "Delhi" },
  // { name: "Yogesh Lahoti", jobId: "KIOL2049", area: "Pan India" },
  // { name: "Munin Saikia", jobId: "KIOL2246", area: "Pan India" }, // Added in 29/02/2025
  // { name: "Shourajit Biswas", jobId: "KIOL2247", area: "Agartala" },
];

export default function TargetAssignmentDashboard() {
  const [selectedSalesperson, setSelectedSalesperson] = useState(
    salespeople[0]
  );
  const [targetValue, setTargetValue] = useState("");
  const [canAssignTasks, setCanAssignTasks] = useState();

  const fetchPermissionStatus = async () => {
    const token = localStorage.getItem("accessToken"); // Retrieve the Bearer token from local storage
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/canSalespersonAddTasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add the Bearer token to the headers
          },
        }
      );
      if (response.status === 200) {
        setCanAssignTasks(response.data.canAssignTasks);
        console.log("canAssignTasks :", response.data.canAssignTasks);
      }
    } catch (error) {
      console.error("Error fetching permission status:", error);
    }
  };
  // Fetch salesperson's permission status
  useEffect(() => {
    fetchPermissionStatus();
  }, []); // Fetch on component mount

  console.log(canAssignTasks);

  const handleSalespersonSelect = (value) => {
    setSelectedSalesperson(salespeople.find((sp) => sp.name === value));
  };

  const handleTargetAssign = async () => {
    const token = localStorage.getItem("accessToken"); // Retrieve the Bearer token from local storage
    const day = new Date();
    const month = String(day.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed; add 1 and pad to 2 digits
    const year = String(day.getFullYear()).padStart(4, "0");
    const payload = {
      year,
      month,
      target: parseInt(targetValue, 10), // Convert string to number
      jobId: selectedSalesperson.jobId, // Include jobId in the payload
    };
    console.log("payload of monthlyTarget", payload);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/monthlyTarget`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add the Bearer token to the headers
          },
        }
      );

      if (response.status === 200) {
        alert(
          `Successfully assigned target of ${targetValue} for ${selectedSalesperson.name}`
        );
        setTargetValue(""); // Clear the input after successful assignment
      }
    } catch (error) {
      console.error("Error assigning target:", error);
      alert("Failed to assign target. Please try again.");
    }
  };




  // Trigger download via JavaScript (e.g., on button click)
  // function handleDownloadReport() {
  //   console.log("click")
  //   fetch(`${API_BASE_URL}/export-tasks`, {
  //     method: "GET",
  //   })
  //   .then(response => response.blob())  // Convert response to blob
  //   .then(blob => {
  //     const link = document.createElement("a");
  //     link.href = URL.createObjectURL(blob); // Create a URL for the blob
  //     link.download = "Tasks_Report.xlsx";  // Set download file name
  //     link.click();  // Trigger the download
  //   })
  //   .catch(error => console.error("Error downloading report:", error));
  // }






  return (
    <div>
      <Header saleperson={{ name: "Admin", jobId: "ADMIN001" }} />
      <div className="container mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ConfirmationSlider
            initialPermission={canAssignTasks}
            fetchPermissionStatus={fetchPermissionStatus}
          />
          <Card>
            <CardHeader>
              <CardTitle>Assign Target</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select onValueChange={handleSalespersonSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Salesperson" />
                </SelectTrigger>
                <SelectContent>
                  {salespeople.map((sp) => (
                    <SelectItem key={sp.jobId} value={sp.name}>
                      {sp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSalesperson && (
                <div className="space-y-2">
                  <p>
                    <strong>Job ID:</strong> {selectedSalesperson.jobId}
                  </p>
                  <p>
                    <strong>Area Coverage:</strong> {selectedSalesperson.area}
                  </p>
                </div>
              )}
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Enter target value"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                />
                <Button onClick={handleTargetAssign}>Assign</Button>
              </div>
            </CardContent>
          </Card>
          <TargetHistory />
        </div>

        <div>
          <AdminTasks />
        </div>
        {/* <button className="bg-gray-500 text-xl w-48 h-28" onclick={handleDownloadReport()}>Download Report</button> */}
        {/* Section 3: Bar Chart (Target vs Salesperson) */}
        <div>
          <TargetVsSalespersonChart />
        </div>
      </div>
    </div>
  );
}
