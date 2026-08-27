import { API_BASE_URL } from "@/lib/api";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const salesPersons = [
  {
    id: "SP000",
    name: "Total Monthly Details",
    jobId: "totalMonthlyDetails",
    area: "Pan India",
  },
  // { id: "SP001", name: "Ravikumar N", jobId: "KIOL2238", area: "Bangalore" },
  // { id: "SP002", name: "Sugumar R", jobId: "KIOL2236", area: "Chennai, TN" },
  // { id: "SP003", name: "Vineesh Mehta", jobId: "KIOL2239", area: "Delhi" },
  {
    id: "SP001",
    name: "Soma Naveen",
    jobId: "KIOL2070",
    area: "Hyderabad",
  },
  {
    id: "SP002",
    name: "Bharat Lal",
    jobId: "KIOL2064",
    area: "Maharashtra",
  },
  { id: "SP003", name: "K. Senthil Kumar", jobId: "KIOL2323", area: "Hyderabad" },
  // { id: "SP004", name: "Rakesh Gayashankar Tripathi", jobId: "KIOL2322", area: "Gujarat" },
  { id: "SP005", name: "Shubham Sharma", jobId: "KIOL2319", area: "Delhi" },

  // { id: "SP006", name: "Sushila Shaw", jobId: "KIOL2225", area: "Kolkata" },
  // { id: "SP007", name: "Ardhendu Aditya", jobId: "KIOL2234", area: "Kolkata" },
  // { id: "SP008", name: "Yogesh Lahoti", jobId: "KIOL2049", area: "Pan India" },
  // { id: "SP009", name: "Krishnamoorthi", jobId: "KIOL2243", area: "Singapore" },
  // { id: "SP010", name: "Munin Saikia", jobId: "KIOL2246", area: "Pan India" },
  // { id: "SP011", name: "Shourajit Biswas", jobId: "KIOL2247", area: "Agartala" },
  { id: "SP006", name: "others", jobId: "others", area: "Pan India" }
];

export default function TargetHistory() {
  const [date, setDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSalesPerson, setSelectedSalesPerson] = useState("");
  const [targetData, setTargetData] = useState({
    totalAssignedTarget: 0,
    totalCompletedTarget: 0,
    totalPendingTarget: 0,
  });

  const handleMonthSelect = (monthIndex) => {
    setDate(new Date(date.getFullYear(), monthIndex, 1));
    setIsOpen(false);
    fetchTargetData(monthIndex + 1, date.getFullYear());
  };

  const handleYearChange = (increment) => {
    setDate(new Date(date.getFullYear() + increment, date.getMonth(), 1));
  };

  const getPayload = (month, year, jobId = "") => {
    return jobId === "totalMonthlyDetails"
      ? { month: month.toString(), year: year.toString() }
      : { jobId, month: month.toString(), year: year.toString() };
  };

  const fetchTargetData = async (month, year) => {
    const token = localStorage.getItem("accessToken");
    const selectedPerson = salesPersons.find(
      (sp) => sp.id === selectedSalesPerson
    );
    const payload = getPayload(month, year, selectedPerson.jobId);

    // console.log("selectedPersonJobIdmonthlystats", payload);

    if (selectedPerson) {
      const url =
        selectedPerson.jobId === "totalMonthlyDetails"
          ? `${API_BASE_URL}/admin/totalStatsOfSalesperson`
          : `${API_BASE_URL}/admin/monthlyStats`;

      try {
        const response = await axios.post(url, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // console.log("response.data", response.data);

        if (response.status === 200) {
          setTargetData({
            totalAssignedTarget:
              response.data.totalAssignedTargets ||
              response.data.totalAssignedTarget,
            totalCompletedTarget:
              response.data.totalCompletedTargets ||
              response.data.totalCompletedTarget,
            totalPendingTarget:
              response.data.totalPendingTargets ||
              response.data.totalPendingTarget,
          });
          toast.success("Target data fetched successfully");
        } else {
          toast.warning("Unexpected response status. Please try again later.");
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 404) {
            toast.error("Data not found for the specified month and year.");
          } else {
            toast.error(
              `Error: ${error.response.data.message || "Failed to fetch target data"
              }`
            );
          }
        } else if (error.request) {
          toast.error(
            "No response from server. Please check your network connection."
          );
        } else {
          toast.error("An unexpected error occurred. Please try again.");
        }
        console.error("Error fetching target data:", error);
      }
    }
  };

  useEffect(() => {
    if (selectedSalesPerson) {
      fetchTargetData(date.getMonth() + 1, date.getFullYear());
    }
  }, [selectedSalesPerson, date]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Person Target Assignment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "MMMM yyyy") : <span>Pick a month</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleYearChange(-1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">
                  {format(date, "yyyy")}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleYearChange(1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {months.map((month, index) => (
                  <Button
                    key={month}
                    variant="outline"
                    className={cn(
                      "h-9 w-full",
                      date.getMonth() === index &&
                      "bg-primary text-primary-foreground"
                    )}
                    onClick={() => handleMonthSelect(index)}
                  >
                    {month}
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Select onValueChange={setSelectedSalesPerson}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a salesperson" />
          </SelectTrigger>
          <SelectContent>
            {salesPersons.map((sp) => (
              <SelectItem key={sp.id} value={sp.id}>
                {sp.jobId === "totalMonthlyDetails"
                  ? sp.name
                  : `${sp.name} (Job ID: ${sp.jobId})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-2">
          <p>
            <strong>Total Assigned Targets:</strong> ₹
            {targetData.totalAssignedTarget}
          </p>
          <p>
            <strong>Pending Targets:</strong> ₹{targetData.totalPendingTarget}
          </p>
          <p>
            <strong>Completed Targets:</strong> ₹
            {targetData.totalCompletedTarget}
          </p>
        </div>
      </CardContent>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </Card>
  );
}
