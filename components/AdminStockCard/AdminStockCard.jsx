"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Package, PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns"; // Import parseISO to handle ISO date format


// const StockItem = ({ title, agradeStocks, bgradeStocks, nonMovingStocks, wipAgradeStocks, wipBgradeStocks, value, icon: Icon }) =>{

//   return  (
//   <div className={`flex flex-col ${title !== 'Packed Stocks' ? "items-center" : ""} space-y-2 p-4 border rounded-lg`}>
//     <Icon className="h-6 w-6 mx-auto text-muted-foreground" />

//     <div className="text-center">
//       <h3 className="text-lg font-medium">{title}</h3>
//       <p className="text-2xl font-bold">{value}</p>
//     </div>

//     {title === 'Packed Stocks' && (
//       <div className="flex flex-col sm:flex-row flex-wrap mt-2 w-full justify-center md:justify-between">
//         {[
//           { label: 'A-grade', value: agradeStocks },
//           { label: 'B-grade', value: bgradeStocks },
//           { label: 'Non Moving', value: nonMovingStocks }
//         ].map((item, index) => (
//           <div key={index} className="text-center md:mt-0 mt-2 md:pr-0 pr-2">
//             <h3 className="text-sm text-muted-foreground font-medium">{item.label}</h3>
//             <p className="text-xl font-bold">{item.value ?? <div className="font-mono">N?A</div>}</p>
//           </div>
//         ))}
//       </div>
//     )}
//     {title === 'Unpacked Stocks' && (
//       <div className="flex flex-col sm:flex-row flex-wrap mt-2 w-full justify-center md:justify-between">
//         {[
//           { label: 'Wip A', value: (wipAgradeStocks === 0 && wipBgradeStocks === 0 && value !== 0) ? 'N/A' : wipAgradeStocks },
//           { label: 'Wip B', value: (wipAgradeStocks === 0 && wipBgradeStocks === 0 && value !== 0) ? 'N/A' : wipBgradeStocks }
//         ].map((item, index) => (
//           <div key={index} className="text-center md:mt-0 mt-2 md:pr-0 pr-2">
//             <h3 className="text-sm text-muted-foreground font-medium">{item.label}</h3>
//             <p className="text-xl font-bold">
//               {item.value === 'N/A' ? <div className="font-mono">N/A</div> : item.value}
//             </p>
//           </div>
//         ))}
//       </div>
//     )}

//   </div>
// )};

const iconStyles = {
  "Total Stocks": {
    color: "text-blue-600",
    border: "border-b-4 border-blue-600",
    bg: "bg-blue-100",
  },
  "Packed Stocks": {
    color: "text-green-600",
    border: "border-b-4 border-green-600",
    bg: "bg-green-100",
  },
  "Unpacked Stocks": {
    color: "text-yellow-600",
    border: "border-b-4 border-yellow-600",
    bg: "bg-yellow-100",
  },
};

const StockItem = ({ title, agradeStocks, bgradeStocks, nonMovingStocks, wipAgradeStocks, wipBgradeStocks, value, icon: Icon }) => {
  const styles = iconStyles[title] || {};

  return (
    <div
      className={cn(
        "group flex flex-col space-y-4 p-5 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer",
        styles.border,
        "bg-white"
      )}
    >
      <div className="flex flex-col justify-between items-center">
        <div className={`p-4 rounded-full mb-2 ${styles.bg}`}>
          <Icon className={cn("h-8 w-8", styles.color)} />
        </div>
        <div className="text-right">
          <h3 className="text-xl font-semibold text-center text-gray-600">{title}</h3>
          <p className="text-2xl text-center font-bold text-gray-900">{value}</p>
        </div>
      </div>

      {title === 'Packed Stocks' && (
        <div className="grid md:grid-cols-3 grid-cols-1 gap-3 text-sm text-center">
          {[
            { label: 'A-grade', value: agradeStocks },
            { label: 'B-grade', value: bgradeStocks },
            { label: 'Non Moving', value: nonMovingStocks }
          ].map((item, idx) => (
            <div key={idx}>
              <h4 className="text-muted-foreground font-medium">{item.label}</h4>
              <p className="font-bold text-lg">{item.value ?? "N/A"}</p>
            </div>
          ))}
        </div>
      )}

      {title === 'Unpacked Stocks' && (
        <div className="flex justify-between flex-col md:flex-row text-sm text-center">
          {[
            { label: 'Wip A', value: (wipAgradeStocks === 0 && wipBgradeStocks === 0 && value !== 0) ? 'N/A' : wipAgradeStocks },
            { label: 'Wip B', value: (wipAgradeStocks === 0 && wipBgradeStocks === 0 && value !== 0) ? 'N/A' : wipBgradeStocks }
          ].map((item, idx) => (
            <div key={idx}>
              <h4 className="text-muted-foreground font-medium">{item.label}</h4>
              <p className="font-bold text-lg">{item.value === 'N/A' ? 'N/A' : item.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



const StockCard = ({ selectedDateByMain }) => {
  const [date, setDate] = useState(new Date()); // Date displayed on the calendar
  const [stockData, setStockData] = useState({
    totalStocks: 0,
    packedStocks: 0,
    agradeStocks: 0,
    bgradeStocks: 0,
    nonMovingStocks: 0,
    wipAgradeStocks: 0,
    wipBgradeStocks: 0,
    unpackedStocks: 0,
  });
  const [error, setError] = useState("");

  /**
   * Fetches stock data from the backend for a specific date
   * If no date is provided, it fetches the latest available stock data
   * @param {Date | null} selectedDate
   */
  const fetchStockData = async (selectedDate = null) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("Access token not found. Please log in again.");
      toast.error("Access token not found. Please log in again.");
      return;
    }

    const payload = selectedDate
      ? {
        date: selectedDate.getDate(),
        month: selectedDate.getMonth() + 1,
        year: selectedDate.getFullYear(),
      }
      : {};

    try {
      const response = await axios.post(
        "http://127.0.0.1:5001/admin/stocks/retrieve",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {

        console.log("Response:", response.data);

        const {
          agradeStocks,
          bgradeStocks,
          nonMovingStocks,
          packedStocks,
          wipAgradeStocks,
          wipBgradeStocks,
          unpackedStocks,
          totalStocks,
          date: responseDate,
        } = response.data.data;

        // Update stock data with response values
        setStockData({ agradeStocks, bgradeStocks, nonMovingStocks, packedStocks, unpackedStocks, totalStocks, wipAgradeStocks, wipBgradeStocks });

        // If the API returns a valid date, update the calendar to show that date

        if (responseDate) {
          const formattedDate = parseISO(responseDate); // Parse ISO date (e.g., "2024-12-12T00:00:00.000Z")
          if (!isNaN(formattedDate.getTime())) {
            setDate(formattedDate); // Set the date if valid
          } else {
            console.warn(
              "Invalid date from API, falling back to today's date."
            );
            setDate(new Date()); // Fallback to today's date if the response date is invalid
          }
        } else {
          setDate(new Date()); // Fallback to today's date if no date is provided
        }

        toast.success("Stocks data retrieved successfully");
      } else {
        toast.error("Unexpected response status.");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to retrieve stocks data. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  /**
   * Runs on initial page load to fetch the latest available stock data
   */
  useEffect(() => {
    if (selectedDateByMain)
      fetchStockData(selectedDateByMain); // No date is sent to fetch the latest available data
    else
      fetchStockData();
  }, [selectedDateByMain]);

  /**
   * Handles date change event from the calendar
   * @param {Date} newDate
   */
  const handleDateChange = (newDate) => {
    // console.log("newDate", newDate);
    setDate(newDate);
    fetchStockData(newDate);
  };

  return (
    <Card className="w-full max-w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl font-bold">Stock Overview</CardTitle>
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
              {date && date instanceof Date && !isNaN(date.getTime()) ? (
                format(date, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </CardHeader>
      {/* <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <StockItem
            title="Total Stocks"
            value={stockData.totalStocks !== 0 ? stockData.totalStocks?.toLocaleString('en-IN') : stockData.totalStocks}
            icon={Package}
          />
          <StockItem
            title="Packed Stocks"
            value={stockData.packedStocks !== 0 ? stockData.packedStocks?.toLocaleString('en-IN') : stockData.packedStocks}
            agradeStocks={stockData.agradeStocks !== 0 ? stockData.agradeStocks?.toLocaleString('en-IN') : stockData.agradeStocks}
            bgradeStocks={stockData.bgradeStocks !== 0 ? stockData.bgradeStocks?.toLocaleString('en-IN') : stockData.bgradeStocks}
            nonMovingStocks={stockData.nonMovingStocks !== 0 ? stockData.nonMovingStocks?.toLocaleString('en-IN') : stockData.nonMovingStocks}
            unpackedStocks={stockData.unpackedStocks !== 0 ? stockData.unpackedStocks?.toLocaleString('en-IN') : stockData.unpackedStocks}
            icon={Package}
          />
          <StockItem
            title="Unpacked Stocks"
            value={stockData.unpackedStocks !== 0 ? stockData.unpackedStocks?.toLocaleString('en-IN') : stockData.unpackedStocks}
            wipAgradeStocks={stockData.wipAgradeStocks !== 0 ? stockData.wipAgradeStocks?.toLocaleString('en-IN') : stockData.wipAgradeStocks}
            wipBgradeStocks={stockData.wipBgradeStocks !== 0 ? stockData.wipBgradeStocks?.toLocaleString('en-IN') : stockData.wipBgradeStocks}
            icon={PackageOpen}
          />

        </div>
        {error && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}
      </CardContent> */}

      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          <StockItem
            title="Total Stocks"
            value={stockData.totalStocks?.toLocaleString('en-IN')}
            icon={Package}
          />
          <StockItem
            title="Packed Stocks"
            value={stockData.packedStocks?.toLocaleString('en-IN')}
            agradeStocks={stockData.agradeStocks?.toLocaleString('en-IN')}
            bgradeStocks={stockData.bgradeStocks?.toLocaleString('en-IN')}
            nonMovingStocks={stockData.nonMovingStocks?.toLocaleString('en-IN')}
            icon={Package}
          />
          <StockItem
            title="Unpacked Stocks"
            value={stockData.unpackedStocks?.toLocaleString('en-IN')}
            wipAgradeStocks={stockData.wipAgradeStocks?.toLocaleString('en-IN')}
            wipBgradeStocks={stockData.wipBgradeStocks?.toLocaleString('en-IN')}
            icon={PackageOpen}
          />
        </div>
      </CardContent>

    </Card>
  );
};

export default StockCard;
