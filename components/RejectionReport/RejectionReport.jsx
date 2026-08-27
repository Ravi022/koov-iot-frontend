'use client'
import { API_BASE_URL } from "@/lib/api";

import React, { useState, useEffect, useRef } from "react";
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
import { Info, CalendarIcon, CircleX, AlertCircle, Package2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import lineRejSvgIcon from '../../assets/admin/rejection/lineRejection.png'
import packingRejSvgIcon from '../../assets/admin/rejection/packingRejection.png'
import totalRejSvgIcon from '../../assets/admin/rejection/totalRejection.png'
import scrapSvgIcon from '../../assets/admin/rejection/scrap.png'
import rejReportSvgIcon from '../../assets/admin/rejection/rejectionReport.gif'



const MetricCard = ({ title, todayValue, monthValue, info, svgIcon, color, isLoading }) => {
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
        setMonthCount(prev => prev + 100);
        setDateCount(prev => prev + 100);
      }
      else {
        setMonthCount(monthValue);
        setDateCount(todayValue);
        prevValue.current = monthValue;
        clearInterval(counting);
      }
    }, 10);
    return () => clearInterval(counting);
  }, [isLoading])


  const bgColorMap = {
    red: 'bg-red-100',
    yellow: 'bg-yellow-100',
    blue: 'bg-blue-100',
    zinc: 'bg-zinc-100', // or 'gray-400' depending on your Tailwind setup
  };

  const borderColorMap = {
    red: 'border-b-red-600',
    yellow: 'border-b-yellow-600',
    blue: 'border-b-blue-600',
    zinc: 'border-b-zinc-600', // or 'gray-400'
  };

  // console.log("color", color);

  return (
    <Card
      className={`shadow-xl flex flex-row items-center md:items-start justify-between cursor-pointer hover:bg-gradient-to-l hover:from-gray-50 hover:to-gray-100 hover:scale-105 duration-300 border-b-4 ${borderColorMap[color]}`}
    // className="flex justify-between shadow-xl"
    >
      <div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex flex-row text-lg text-gray-600 font-medium">
            <div className="">{title}</div>
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
          <div className="text-2xl font-bold ">{monthCount.toLocaleString('en-IN')}</div>
          <p className="text-xs text-muted-foreground ">Month-to-Date</p>
          <div className="mt-4 text-2xl font-bold">{dateCount.toLocaleString('en-IN')}</div>
          <p className="text-xs text-muted-foreground">Today</p>
        </CardContent>
      </div>
      <div className={`h-[4.6rem] shadow-lg md:mr-10 md:mt-8 m-4 p-4 ${bgColorMap[color]} rounded-full flex items-center justify-center shadow-xl`}>

        {svgIcon}
        {/* <Image
          src={svgIcon}
          height={80}
          className=""
        /> */}
      </div>
    </Card>
  )
};

const RejectionReport = ({ selectedDateByMain }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [metrics, setMetrics] = useState({
    today: { total: 0, line: 0, packing: 0, scrap: 0 },
    month: { total: 0, line: 0, packing: 0, scrap: 0 },
  });

  const [isLoading, setIsLoading] = useState(false);

  const fetchMetrics = async (date = null) => {
    let payload = {};

    // console.log("date", date);

    if (date) {
      const dateInMonth = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      ));
      // console.log("dateInMonth", dateInMonth);
      const formattedDate = dateInMonth.toISOString().split("T")[0]
      payload = formattedDate;
      date = payload;
    }

    const accessToken = localStorage.getItem("accessToken");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/rejectionReport`,
        date ? { payload } : {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.status === 200) {
        const data = response.data;
        if (data.lastUpdatedDate) {
          const dateObj = new Date(data.lastUpdatedDate);
          setSelectedDate(dateObj)
        }

        const todayData = data.selectedDateData || {};
        const monthData = data.monthToDateSum || {};


        setMetrics({
          today: {
            total: (todayData.lineRejection || 0) + (todayData.packingRejection || 0),
            line: todayData.lineRejection || 0,
            packing: todayData.packingRejection || 0,
            scrap: todayData.scrap || 0,
          },
          month: {
            total: (monthData.totalLineRejection || 0) + (monthData.totalPackingRejection || 0),
            line: monthData.totalLineRejection || 0,
            packing: monthData.totalPackingRejection || 0,
            scrap: monthData.totalScrap || 0,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching metrics:", error || error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDateByMain) {
      fetchMetrics(selectedDateByMain);
      setSelectedDate(selectedDateByMain)
    }
    else
      fetchMetrics();
  }, [selectedDateByMain]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    fetchMetrics(date);
  };

  return (
    <div className="w-full mx-auto p-4">
      <div className="flex justify-between space-x-2 items-center mb-4">
        <div className="flex bg-white rounded-lg showdow-xl p-2 shadow-xl">
          {/* <Image
            src={rejReportSvgIcon}
            height={40}
          /> */}
          <AlertCircle strokeWidth={1.4} className="w-10 h-10 text-white bg-red-400 rounded-full" />
          <h2 className="md:text-2xl text-[1rem] ml-1 font-semibold">Rejection Report</h2>
        </div>
        <Popover className="">
          <PopoverTrigger asChild>
            <Button variant="outline" className="md:w-[240px] justify-start text-left font-normal p-6 md:p-4 overflow-hidden">
              <CalendarIcon className=" h-4 w-4 mr-2" />
              <div className="md:block hidden">
                {selectedDate ? format(selectedDate, "PPP") : "Select Date"}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Rejection" todayValue={metrics.today.total} monthValue={metrics.month.total}

          info="Total number of rejections"
          color="red"
          svgIcon={<CircleX strokeWidth={1.4} className="w-10 h-10 text-red-600" />} isLoading={isLoading} />
        <MetricCard title="Line Rejection" todayValue={metrics.today.line} monthValue={metrics.month.line} info="Number of rejections on the production line"
          // svgIcon={lineRejSvgIcon}  
          color="yellow"
          svgIcon={<AlertCircle strokeWidth={1.4} className="w-10 h-10 text-yellow-600" />}
          isLoading={isLoading} />
        <MetricCard title="Packing Rejection" todayValue={metrics.today.packing} monthValue={metrics.month.packing} info="Number of rejections during packing"
          // svgIcon={packingRejSvgIcon} 
          color="blue"
          svgIcon={<Package2 strokeWidth={1.4} className="w-10 h-10 text-blue-600" />}
          isLoading={isLoading} />
        <MetricCard title="Scrap In MT" todayValue={metrics.today.scrap} monthValue={metrics.month.scrap} info="Number of items scrapped"
          //  svgIcon={scrapSvgIcon}
          color="zinc"
          svgIcon={<Trash2 strokeWidth={1.4} className="w-10 h-10 text-zinc-600" />}
          isLoading={isLoading} />
      </div>

      {/* {isLoading && (
        <div className="flex justify-center items-center">
          <p className="text-gray-500">Loading metrics...</p>
        </div>
      )} */}
    </div>
  );
};

export default RejectionReport;
