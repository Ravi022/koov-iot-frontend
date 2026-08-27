"use client";
import { API_BASE_URL } from "@/lib/api";

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

const ManPowerCostingTable = () => {



    const [date, setDate] = useState(new Date())
    const [manpowerCostingData, setManpowerCostingData] = useState({
        payroll: 0,
        contractorLabour: 0,
        otherLabour: 0,
        totalCost: 0,
        production: 0
    });
    const [error, setError] = useState("");
    // console.log(data);


    /**
 * Handles date change event from the calendar
 * @param {Date} newDate
 * * @param {Date | null} selectedDate
 */

    const fetchManpowerCostingData = async (selectedDate = null) => {
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
                `${API_BASE_URL}/admin/manPowerCosting`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {

                console.log("Response ManPowerData:", response.data);

                const {
                    payroll,
                    contractorLabour,
                    otherLabour,
                    totalCost,
                    production,
                    date: responseDate,
                } = response.data.data;

                // Update manpower costing data with response values
                setManpowerCostingData({ payroll, contractorLabour, otherLabour, totalCost, production });

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

                toast.success("Manpower costing data retrieved successfully");
            } else {
                toast.error("Unexpected response status.");
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                "Failed to retrieve manpower costing data. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        fetchManpowerCostingData();
    }, [])

    const handleDateChange = (newDate) => {
        console.log("newDate", newDate);
        setDate(newDate);
        fetchManpowerCostingData(newDate)
        // fetchStockData(newDate);
    };

    const data = [
        { item: "Payroll (Staff + Operator)", salary: new Intl.NumberFormat("en-IN").format(manpowerCostingData.payroll), netProduction: "", costPerGlove: "" },
        { item: "Contract Labour", salary: new Intl.NumberFormat("en-IN").format(manpowerCostingData.contractorLabour), netProduction: new Intl.NumberFormat("en-IN").format(manpowerCostingData.production), costPerGlove: Math.round((manpowerCostingData.totalCost / manpowerCostingData.production) * 100) / 100 },
        { item: "Other Labour", salary: new Intl.NumberFormat("en-IN").format(manpowerCostingData.otherLabour), netProduction: "", costPerGlove: "" },
        { item: "Total", salary: new Intl.NumberFormat("en-IN").format(manpowerCostingData.totalCost), netProduction: "", costPerGlove: "" },
    ];

    return (
        // <div className="w-full border-2 rounded-lg">
        //     <div className="font-bold text-center text-2xl pt-2 bg-gray-200">KOOVE IOT Pvt.Ltd. (GLOVES Factory)</div>
        //     <div className="flex flex-wrap justify-center md:justify-between m-4">
        //         <div className="font-bold text-center md:text-right md:mb-0 mb-2 text-xl">Manpower cost</div>
        //         <div>
        //             <Popover>
        //                 <PopoverTrigger asChild>
        //                     <Button
        //                         variant="outline"
        //                         className={cn(
        //                             "w-[240px] justify-start text-left font-normal",
        //                             !date && "text-muted-foreground"
        //                         )}
        //                     >
        //                         <CalendarIcon className="mr-2 h-4 w-4" />
        //                         {date && date instanceof Date && !isNaN(date.getTime()) ? (
        //                             format(date, "PPP")
        //                         ) : (
        //                             <span>Pick a date</span>
        //                         )}
        //                     </Button>
        //                 </PopoverTrigger>
        //                 <PopoverContent className="w-auto p-0" align="start">
        //                     <Calendar
        //                         mode="single"
        //                         selected={date}
        //                         onSelect={handleDateChange}
        //                         initialFocus
        //                     />
        //                 </PopoverContent>
        //             </Popover>
        //         </div>
        //     </div>
        //     <div className="overflow-x-auto">
        //         <table className="w-full overflow-x-scroll  border-collapse border border-gray-200">
        //             <thead>
        //                 <tr className="bg-gray-100">
        //                     <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Item</th>
        //                     <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Salary/Day</th>
        //                     <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Net Production</th>
        //                     <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Cost/Gloves</th>
        //                 </tr>
        //             </thead>
        //             <tbody>
        //                 {data.map((row, index) => (
        //                     <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
        //                         <td className="border border-gray-200 px-4 py-2">{row.item}</td>
        //                         <td className="border border-gray-200 px-4 py-2">{row.salary}</td>
        //                         <td className="px-4 py-2">{row.netProduction}</td>
        //                         <td className="px-4 py-2">{row.costPerGlove}</td>
        //                     </tr>
        //                 ))}
        //             </tbody>
        //         </table>
        //     </div>
        // </div>
        // <div className="w-full border-2 rounded-lg dark:border-gray-700">
        //     <div className="font-bold text-center text-2xl pt-2 bg-gray-200 dark:bg-black dark:text-white">
        //         KOOVE IOT Pvt.Ltd. (GLOVES Factory)
        //     </div>
        //     <div className="flex flex-wrap justify-center md:justify-between m-4">
        //         <div className="font-bold text-center md:text-right md:mb-0 mb-2 text-xl dark:text-white">Manpower cost</div>
        //         <div>
        //             <Popover>
        //                 <PopoverTrigger asChild>
        //                     <Button
        //                         variant="outline"
        //                         className={cn(
        //                             "w-[240px] justify-start text-left font-normal",
        //                             !date && "text-muted-foreground dark:text-gray-400"
        //                         )}
        //                     >
        //                         <CalendarIcon className="mr-2 h-4 w-4 dark:text-white" />
        //                         {date && date instanceof Date && !isNaN(date.getTime()) ? (
        //                             format(date, "PPP")
        //                         ) : (
        //                             <span className="dark:text-gray-400">Pick a date</span>
        //                         )}
        //                     </Button>
        //                 </PopoverTrigger>
        //                 <PopoverContent className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700" align="start">
        //                     <Calendar
        //                         mode="single"
        //                         selected={date}
        //                         onSelect={handleDateChange}
        //                         initialFocus
        //                         className="dark:bg-gray-800 dark:text-white"
        //                     />
        //                 </PopoverContent>
        //             </Popover>
        //         </div>
        //     </div>
        //     <div className="overflow-x-auto">
        //         <table className="w-full overflow-x-scroll border-collapse border border-gray-200 dark:border-gray-700">
        //             <thead>
        //                 <tr className="bg-gray-100 dark:bg-gray-800">
        //                     <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-semibold dark:text-white">Item</th>
        //                     <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-semibold dark:text-white">Salary/Day</th>
        //                     <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-semibold dark:text-white">Net Production</th>
        //                     <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-semibold dark:text-white">Cost/Gloves</th>
        //                 </tr>
        //             </thead>
        //             <tbody>
        //                 {data.map((row, index) => (
        //                     <tr key={index} className={index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}>
        //                         <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 dark:text-white">{row.item}</td>
        //                         <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 dark:text-white">{row.salary}</td>
        //                         <td className="px-4 py-2 dark:text-white">{row.netProduction}</td>
        //                         <td className="px-4 py-2 dark:text-white">{row.costPerGlove}</td>
        //                     </tr>
        //                 ))}
        //             </tbody>
        //         </table>
        //     </div>
        // </div>

        <div className="w-full border-[1px] rounded-lg dark:border-gray-700">
            <div className="font-bold text-center rounded-t -lg text-2xl pt-2 bg-gray-200 dark:bg-black dark:text-white">
                KOOVE IOT Pvt.Ltd. (GLOVES Factory)
            </div>
            <div className="flex flex-wrap justify-center md:justify-between m-4">
                <div className="font-bold text-center md:text-right md:mb-0 mb-2 text-xl dark:text-white">Manpower cost</div>
                <div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground",
                                    "dark:bg-black dark:text-white dark:border-gray-700"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 dark:text-white" />
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
                                className="dark:bg-black dark:text-white"
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className="overflow-x-auto rounded-b-lg">
                <table className="w-full overflow-x-scroll md:table-fixed border-collapse border border-gray-200 dark:border-gray-700">
                    <thead>
                        <tr className="bg-gray-100 text-center dark:bg-black">
                            <th className="border border-gray-200 px-4 py-2 text-center font-semibold dark:border-gray-700 dark:text-white">Item</th>
                            <th className="border border-gray-200 px-4 py-2 text-center font-semibold dark:border-gray-700 dark:text-white">Salary/Day</th>
                            <th className="border border-gray-200 px-4 py-2 text-center font-semibold dark:border-gray-700 dark:text-white">Net Production</th>
                            <th className="border border-gray-200 px-4 py-2 text-center font-semibold dark:border-gray-700 dark:text-white">Cost/Gloves</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr
                                key={index}
                                className={index % 2 === 0 ? "bg-white dark:bg-black" : "bg-gray-50 dark:bg-black"}
                            >
                                <td className="border border-gray-200 px-4 py-2 text-center align-middle dark:border-gray-700 dark:text-white">
                                    {row.item}
                                </td>
                                <td className="border border-gray-200 px-4 py-2 text-center align-middle dark:border-gray-700 dark:text-white">
                                    {row.salary}
                                </td>
                                <td className="px-4 py-2 text-center align-middle dark:text-white">
                                    {row.netProduction}
                                </td>
                                <td className="px-4 py-2 text-center align-middle dark:text-white">
                                    {row.costPerGlove}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>


    );
};

export default ManPowerCostingTable;
