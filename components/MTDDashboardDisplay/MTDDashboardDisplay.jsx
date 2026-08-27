import { API_BASE_URL } from "@/lib/api";
import React, { useState, useEffect, useRef, useActionState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, CalendarIcon, Package, Factory, BarChart, Truck } from "lucide-react";
import { format, setMonth } from "date-fns";
import Image from "next/image";
import productionSvgImage from '../../assets/admin/mtd/production.png'
import packingSvgImage from '../../assets/admin/mtd/packing.png'
import dispatchSvgImage from '../../assets/admin/mtd/dispatch.png'
import salesSvgImage from '../../assets/admin/mtd/sales.png'
import headingSvgImage from '../../assets/admin/mtd/headingReport.png'


// Reusable MetricCard component
const MetricCard = ({ title, todayValue, mtdValue, info, color, svgIcon, isLoading }) => {

  let [monthCount, setMonthCount] = useState(0);
  let [dateCount, setDateCount] = useState(0);

  const prevValue = useRef(0);

  useEffect(() => {
    const counting = setInterval(() => {
      if (isLoading) {
        if (prevValue.current > 0) {
          setMonthCount(0);
          setDateCount(0)
          prevValue.current = 0;
        }
        setMonthCount(prev => prev + 1000);
        setDateCount(prev => prev + 1000);
      }
      else {
        setMonthCount(mtdValue);
        setDateCount(todayValue);
        prevValue.current = mtdValue;
        clearInterval(counting);
      }
    }, 10);
    return () => clearInterval(counting);
  }, [isLoading])

  const bgColorMap = {
    purple: 'bg-purple-100',
    green: 'bg-green-100',
    blue: 'bg-blue-100',
    yellow: 'bg-yellow-100',
  };

  const borderColorMap = {
    purple: 'border-b-purple-600',
    green: 'border-b-green-600',
    blue: 'border-b-blue-600',
    yellow: 'border-b-yellow-600',
  };

  // console.log("color", color);


  return (
    <Card className={`shadow-xl flex flex-row items-center md:items-start justify-between cursor-pointer hover:bg-gradient-to-l hover:from-gray-50 hover:to-gray-100 hover:scale-105 duration-300 border-b-4 ${borderColorMap[color]}`}>
      <div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg text-gray-600 font-medium">
            {title}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="ml-1">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{info}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl text-black font-bold">{monthCount.toLocaleString('en-IN')}</div>
          <p className="text-xs text-muted-foreground text-cyan-600">Month-to-Date</p>
          <div className="mt-4 text-lg text-black font-semibold">
            {dateCount.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-cyan-600 text-muted-foreground">Today</p>
        </CardContent>
      </div>
      {/* <div className="rounded-2xl h-[5rem] md:mr-10 md:mt-8 m-4 p-4 duration-300 hover:scale-105 hover:bg-violet-200"> */}
      <div className={`shadow-lg h-[4.6rem] md:mr-10 md:mt-8 m-4 p-4  ${bgColorMap[color]} rounded-full flex items-center justify-center transition`}>
        {svgIcon}
        {/* <Package className="w-20 h-20 text-blue-500" /> */}
        {/* <Image
          src={svgIcon}
          height={80}
          className=""
        /> */}
      </div>
      {/* </div> */}
    </Card>
  )
}

// Main Dashboard Component
const AdminMetricsDashboard = ({ selectedDateByMain }) => {
  // State to manage the selected date; initialized as null to indicate fetching the latest report
  const [selectedDate, setSelectedDate] = useState(null);

  // console.log("selectedDateByMain", selectedDateByMain)

  // State to store metrics data
  const [metrics, setMetrics] = useState({
    "Total Dispatch": { today: 0, mtd: 0 },
    Production: { today: 0, mtd: 0 },
    Packing: { today: 0, mtd: 0 },
    Sales: { today: 0, mtd: 0 },
  });

  // State to manage loading state (optional for better UX)
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch metrics data from the backend API.
   * @param {Date|null} date - The date for which to fetch the report. If null, fetches the latest report.
   */
  const fetchMetrics = async (date = null) => {
    let payload = {};

    // If a specific date is provided, construct the payload with year, month, day
    if (date) {
      const year = date.getFullYear();
      const month = date.toLocaleString("default", { month: "long" });
      const day = date.getDate();
      payload = { year, month, day: day.toString().padStart(2, "0") };
    }

    const accessToken = localStorage.getItem("accessToken");

    setIsLoading(true); // Start loading

    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/mtd/values`,
        date ? payload : {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.status === 200) {
        const data = response.data;
        // console.log("Response data:", data);

        // Update metrics state with the fetched data
        setMetrics({
          "Total Dispatch": {
            today: data?.dayReport?.totaldispatch || 0,
            mtd: data?.monthReportTillDate?.totaldispatch || 0,
          },
          Production: {
            today: data?.dayReport?.production || 0,
            mtd: data?.monthReportTillDate?.production || 0,
          },
          Packing: {
            today: data?.dayReport?.packing || 0,
            mtd: data?.monthReportTillDate?.packing || 0,
          },
          Sales: {
            today: data?.dayReport?.sales || 0,
            mtd: data?.monthReportTillDate?.sales || 0,
          },
        });

        // If fetching the latest report, update the selectedDate to the report's date
        if (!date && data.date) {
          const [yearStr, monthName, dayStr] = data.date.split("-");
          const monthIndex = new Date(`${monthName} 1, 2000`).getMonth(); // Zero-based index
          const reportDate = new Date(yearStr, monthIndex, parseInt(dayStr, 10));
          console.log("reportDate", reportDate);
          setSelectedDate(reportDate);
        }
      } else {
        console.warn(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error.message || error);
      // Optionally, you can set error states here to display to the user
    } finally {
      setIsLoading(false); // End loading
    }
  };

  // Fetch the latest report on component mount
  useEffect(() => {
    // console.log("selectedByMain", selectedDateByMain)
    if (selectedDateByMain) {
      fetchMetrics(selectedDateByMain);
      setSelectedDate(selectedDateByMain)
    }
    else {
      // console.log("else chal raha")
      fetchMetrics();
    }

  }, [selectedDateByMain]);

  /**
   * Handle date selection from the calendar.
   * @param {Date} date - The date selected by the admin. 
   */
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    fetchMetrics(date);
  };

  return (
    <div className="w-full mx-auto p-4">
      {/* Header Section with Title and Date Picker */}
      <div className="flex justify-between space-x-2 items-center mb-4 ">
        <div className="flex justify-start space-x-2 md:text-2xl text-[1rem] font-semibold p-2 rounded-lg shadow-lg bg-white">
          {/* <Image
            src={headingSvgImage}
            height={30}
            // width={20}
            className=""
          /> */}
          <Factory strokeWidth={1.4} className="w-10 h-10 text-white p-2 bg-blue-400 rounded-full" />
          <h2> Metrics Overview</h2>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="md:w-[240px] justify-start p-6 md:p-4 bg-white text-left font-normal"
            >
              <CalendarIcon className="mr-2 md:h-4 md:w-4 h-5 w-5 " />
              <div className="hidden md:block">
                {selectedDate ? format(selectedDate, "PPP") : "Select Date"}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) handleDateSelect(date);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          // className='hover:animate-bounce'
          title="Production"
          todayValue={metrics.Production.today}
          mtdValue={metrics.Production.mtd}
          info="Number of items produced"
          color="purple"
          svgIcon={<Factory strokeWidth={1.4} className="w-10 h-10 text-purple-600" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Packing"
          todayValue={metrics.Packing.today}
          mtdValue={metrics.Packing.mtd}
          info="Number of items packed"
          color="green"
          svgIcon={<Package strokeWidth={1.4} className="w-10 h-10 text-green-600" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Total Dispatch"
          todayValue={metrics["Total Dispatch"].today}
          mtdValue={metrics["Total Dispatch"].mtd}
          info="Number of items dispatched"
          color="blue"
          svgIcon={<Truck strokeWidth={1.4} className="w-10 h-10 text-blue-600" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Sales"
          todayValue={metrics.Sales.today}
          mtdValue={metrics.Sales.mtd}
          info="Total sales amount in rupees"
          color="yellow"
          svgIcon={<BarChart strokeWidth={1.4} className="w-10 h-10 text-yellow-600" />}
          isLoading={isLoading}
        />
      </div>

      {/* Optional: Loading Indicator */}
      {/* {isLoading && (
        <div className="flex justify-center items-center">
          <p className="text-gray-500">Loading metrics...</p>
        </div>
      )} */}
    </div>
  );
};

export default AdminMetricsDashboard;

