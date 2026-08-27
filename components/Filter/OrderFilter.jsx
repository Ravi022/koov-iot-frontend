"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import React, { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function OrderFilter({ info, setInfo, originalData, dropdownOpen, setDropdownOpen }) {
    const [salesperson, setSalesperson] = useState("");
    const [orderStatus, setOrderStatus] = useState("");
    const [location, setLocation] = useState("");
    const [orderDate, setOrderDate] = useState("");
    const [isFilter, setIsFilter] = useState(false);

    // Apply filters function

    const indianStates = [
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chhattisgarh",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal",
        "Others"
    ];



    const applyFilters = () => {
        let data = originalData;

        if (salesperson) {
            data = data.filter((item) => item.salesPerson.toLowerCase().includes(salesperson.toLowerCase()));
        }
        if (orderStatus) {
            data = data.filter((item) => item.orderStatus === orderStatus);
        }
        if (location) {
            data = data.filter((item) => item.location.toLowerCase() === location.toLowerCase());

        }
        if (orderDate) {
            data = data.filter((item) => {
                // const itemDate = item.createdAt.split('T')[0]; // e.g., "2024-12-11"
                return item.orderDate === orderDate;
            });
        }

        if (!salesperson && !orderStatus && !orderDate && !location) {
            toast.error("Please enter at least one filter.");
        } else {
            setDropdownOpen(false);
            setIsFilter(true);
            toast.info("Filters applied successfully.");
        }
        setInfo(data); // Update the filtered data
    };

    const clearFilter = () => {
        setSalesperson("");
        setOrderStatus("");
        setLocation("")
        setOrderDate("");
        setIsFilter(false)
    }

    const removeFilter = () => {
       setInfo(originalData);
       clearFilter()
    }

    return (


        <>
            <ToastContainer />
            <div className="relative">
                {/* Filter Button */}
                {/* <div className="z-50 absolute right-1 top-1">
                    <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>

                </div> */}
                <AnimatePresence>
                    {isFilter && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => removeFilter()}
                            className="absolute right-0 bottom-[1.6rem] text-white bg-red-600 rounded-full"
                        >
                            <X strokeWidth={3} size={18} />
                        </motion.button>
                    )}
                </AnimatePresence>
                <button
                    className="border-2 font-semibold border-gray-400 px-2 py-1 md:px-4 md:py-2 rounded-lg hover:bg-gray-200 dark:border-gray-500 dark:bg-black dark:text-white dark:hover:bg-gray-700"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    Filter
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                    <div className="border-2 z-10 w-[20rem] bg-gray-200 absolute top-[4rem] right-0 h-auto rounded-lg shadow-lg p-4 dark:bg-black dark:border-gray-500">
                        <div className="flex flex-row justify-between">
                            <h3 className="text-lg font-bold mb-4 dark:text-white">
                                Filter Options
                            </h3>
                            <div onClick={() => setDropdownOpen((prev) => !prev)}>
                                <svg
                                    className="w-6 h-6 text-gray-800 dark:text-white"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18 17.94 6M18 18 6.06 6"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Salesperson Input */}
                        <div className="mb-4">
                            <label className="block mb-2 font-medium dark:text-white">Salesperson</label>
                            <input
                                type="text"
                                placeholder="Enter salesperson name"
                                className="w-full border rounded-lg px-3 py-2 dark:bg-black dark:border-gray-500 dark:text-white"
                                value={salesperson}
                                onChange={(e) => setSalesperson(e.target.value)}
                            />
                        </div>

                        {/* Order Status Dropdown */}
                        <div className="mb-4">
                            <label className="block mb-2 font-medium dark:text-white">Order Status</label>
                            <select
                                className="w-full border rounded-lg px-3 py-2 dark:bg-black dark:border-gray-500 dark:text-white"
                                value={orderStatus}
                                onChange={(e) => setOrderStatus(e.target.value)}
                            >
                                <option value="">Select Status</option>
                                <option value="PI">PI</option>
                                <option value="Order Cancelled">Order Cancelled</option>
                                <option value="PO">PO</option>
                                <option value="Payment Received">Payment Received</option>
                                <option value="Packing Process">Packing Process</option>
                                <option value="Packed">Packed</option>
                                <option value="Invoice">Invoice</option>
                                <option value="Dispatched">Dispatched</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 font-medium dark:text-white">Location</label>
                            <select
                                onChange={(e) => setLocation(e.target.value)}
                                value={location}
                                className="w-full overflow-y-scroll rounded-lg px-3 py-2 dark:bg-black dark:border-gray-500 dark:text-white" name="" id=""
                            >
                                <option value="">Select State</option>
                                {indianStates.map((state, index) => (
                                    <option key={index} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        {/* Order Date Input */}
                        <div className="mb-4">
                            <label className="block mb-2 font-medium dark:text-white">Order Date</label>
                            <input
                                type="date"
                                className="w-full border rounded-lg px-3 py-2 dark:bg-black dark:border-gray-500 dark:text-white"
                                // className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-900 dark:bg-black dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                                value={orderDate}
                                onChange={(e) => setOrderDate(e.target.value)}
                            />
                        </div>

                        {/* Apply Button */}
                        <div className="flex justify-between">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                                onClick={applyFilters}
                            >
                                Apply
                            </button>
                            <button onClick={clearFilter} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white">
                                Clear
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>

    );
}

export default OrderFilter;
