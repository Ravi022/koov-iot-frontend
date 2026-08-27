"use client";
import { API_BASE_URL } from "@/lib/api";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Target } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TaskManager from "../TaskManager/TaskManager";
import TargetInformation from "../TargetInformation/TargetInformation";
import TargetPieChart from "./TargetPieChart";
import LoadingSkeleton from "./LoadingSkeleton";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SalesManagerDashboard() {
  const [date, setDate] = useState(new Date());
  const [assignedTarget, setAssignedTarget] = useState(0);
  const [completedTarget, setCompletedTarget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [todayCompletedTarget, setTodayCompletedTarget] = useState(0);
  const [salesManager, setSalesManager] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const response = await axios.post(
        `${API_BASE_URL}/user/getMonthlyStatsAndDailyTasks`,
        { day, month, year },
        config
      );

      setAssignedTarget(response.data.monthlyAssignedTarget || 0);
      setCompletedTarget(response.data.monthlyCompletedTarget || 0);
      setTodayCompletedTarget(response.data.dailyCompletedTarget || 0);
    } catch (error) {
      console.error("Error fetching target data:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to fetch target data.");
      }
      setAssignedTarget(0);
      setCompletedTarget(0);
      setTodayCompletedTarget(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  useEffect(() => {
    const salespersonDetails = localStorage.getItem("userDetails");
    if (salespersonDetails) {
      const salesManager = JSON.parse(salespersonDetails);
      setSalesManager(salesManager);
    }
  }, []);

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
  };

  const targetCompletionPercentage = assignedTarget
    ? (completedTarget / assignedTarget) * 100
    : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // if (loading) {
  //   return <LoadingSkeleton />;
  // }

  return (
    <div className="flex flex-col md:flex-row bg-background text-foreground">
      {/* Left Section */}
      <div className="w-full md:w-2/3 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <div className="flex flex-row gap-5">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart for Performance */}
          <Card>
            <CardContent>
              <TargetPieChart
                completedTarget={completedTarget}
                assignedTarget={assignedTarget}
              />
            </CardContent>
          </Card>

          {/* Target Information */}
          <TargetInformation
            assignedTarget={assignedTarget}
            completedTarget={completedTarget}
            fetchData={fetchData}
            todayCompletedTarget={todayCompletedTarget}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/3 p-6 border-r border-border">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Sales Manager Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">{salesManager.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{salesManager.area}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-muted-foreground" />
                <span>
                  Total Target Completed:{" "}
                  {targetCompletionPercentage.toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>
          <TaskManager />
        </div>
      </div>

      {/* Toast Container for Notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}
