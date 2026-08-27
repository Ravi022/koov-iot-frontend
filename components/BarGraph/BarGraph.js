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
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

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

export default function TargetHistory() {
  const [date, setDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [targetData, setTargetData] = useState([]);
  const [chartData, setChartData] = useState([]);

  const handleMonthSelect = (monthIndex) => {
    const newDate = new Date(date.getFullYear(), monthIndex, 1);
    setDate(newDate);
    setIsOpen(false);
    fetchTargetData(monthIndex + 1, newDate.getFullYear());
  };

  const handleYearChange = (increment) => {
    const newDate = new Date(
      date.getFullYear() + increment,
      date.getMonth(),
      1
    );
    setDate(newDate);
  };

  const fetchTargetData = async (month, year) => {
    const token = localStorage.getItem("accessToken"); // Retrieve the Bearer token from local storage

    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/barchart`,
        {
          month: month.toString(),
          year: year.toString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add the Bearer token to the headers
          },
        }
      );

      if (response.status === 200) {
        const validData = response.data.stats
          .filter((item) => item.totalAssignedTarget > 0) // Exclude those with no target data
          .map((item) => ({
            name: item.name,
            totalAssignedTarget: item.totalAssignedTarget,
            totalCompletedTarget: item.totalCompletedTarget,
          }));
        setChartData(validData);
      } else {
        alert("Warning: Unexpected response from the server.");
      }
    } catch (error) {
      console.error("Error fetching target data:", error);
      alert("Error: Failed to fetch target data. Please try again.");
    }
  };

  useEffect(() => {
    fetchTargetData(date.getMonth() + 1, date.getFullYear());
  }, [date]);

  return (
    <Card className="">
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
                  <span className="sr-only">Previous year</span>
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
                  <span className="sr-only">Next year</span>
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

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400} className="p-5">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="totalAssignedTarget"
                fill="#8884d8"
                name="Total Assigned Target"
              />
              <Bar
                dataKey="totalCompletedTarget"
                fill="#82ca9d"
                name="Total Completed Target"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center">
            No target data available for the selected month and year.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
