"use client";
import { API_BASE_URL } from "@/lib/api";

import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
import axios from 'axios';
import EditPage from '@/components/EditPage/EditOrderStatus';
import OrderFilter from '@/components/Filter/OrderFilter';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import { useRouter } from "next/navigation";
import EditRemark from '@/components/EditPage/EditRemark';
// import EditPage from '../components/EditPage';
// import OrderFilter from '../components/OrderFilter';

const OrderDetails = () => {
    // State variables
    const [info, setInfo] = useState([]); // Stores the filtered order data
    const [loading, setLoading] = useState(true); // Loading state
    const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown state
    const [searchQuery, setSearchQuery] = useState(""); // Search query input
    const [originalData, setOriginalData] = useState([]); // Original unfiltered data
    const [showEdit, setShowEdit] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState([]);
    const [selectedRemarkData, setSelectedRemarkData] = useState([])
    const [showEditRemark, setShowEditRemark] = useState(false);
    const [showEditIcon, setshowEditIcon] = useState(false);
    const [saveChange, setSaveChange] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Simulating fetching data
        const fetchData = async () => {
            try {
                const accessToken = localStorage.getItem("accessToken")
                const res = await axios.get(`${API_BASE_URL}/common/getAllOrder`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`, // Send the token in the Authorization header
                        },
                    }
                )
                // console.log(res);
                setOriginalData(res.data);
                setInfo(res.data);
            }
            catch (error) {
                console.log(error);
            }
            setLoading(false);
        };
        fetchData();
    }, [saveChange]);

    useEffect(() => {
        const userDetails = JSON.parse(localStorage.getItem('userDetails'));
        if (userDetails.role === 'admin')
            setshowEditIcon(true);
    }, [])


    // Handle dropdown toggle
    const handleDropdown = () => {
        if (dropdownOpen) setDropdownOpen(!dropdownOpen);
    };

    // Handle search input change
    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Filter info based on the search query
        const filteredInfo = originalData.filter((order) =>
            order.clientName.toLowerCase().includes(query.toLowerCase()) ||
            order.userId.toString().includes(query)
        );
        setInfo(filteredInfo);
    };

    const handleEditStatus = (data) => {
        // console.log(data);
        setSelectedOrder(data);
        setShowEdit(prev => !prev);
    };

    const handleEditRemark = (data) => {
        // console.log("data1", data);
        setSelectedRemarkData(data);
        setShowEditRemark(prev => !prev);
    }

    return (
        <div className="">
            <Header />
            <div className="min-h-[90vh] bg-gray-100 relative dark:bg-black">
                <header
                    onClick={handleDropdown}
                    className="bg-white shadow dark:bg-black dark:border-b dark:border-gray-500"
                >
                    <div className="px-4 py-3">
                        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                            Order Details
                        </h1>
                    </div>
                </header>
                <div className="px-4 md:py-4 py-2">
                    <div className="flex justify-between items-center">
                        <div className="flex md:space-x-4 space-x-1">
                            {/* <Link href="/CreateOrder"> */}
                            <button onClick={() => router.push('/CreateOrder')} className="bg-gray-950 text-white px-2 py-1 md:h-auto h-10 overflow-hidden  md:px-4 md:py-2 rounded hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600">
                                + Add Order
                            </button>
                            {/* </Link> */}
                            <input
                                onChange={handleSearch}
                                value={searchQuery}
                                type="text"
                                placeholder="Search by Client name"
                                className="border border-gray-300 rounded md:px-4 w-[12rem] md:w-auto md:py-2 py-0 dark:border-gray-500 dark:bg-black dark:text-white"
                            />
                        </div>
                        <OrderFilter
                            onClick={handleDropdown}
                            info={info}
                            setInfo={setInfo}
                            originalData={originalData}
                            dropdownOpen={dropdownOpen}
                            setDropdownOpen={setDropdownOpen}
                        />
                    </div>
                </div>

                {/* Blur Background Overlay when showEdit is true */}
                {showEdit && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-20 "></div>
                )}

                {showEdit && (
                    <div className="absolute md:top-[6rem] left-10 md:left-[34rem] md:w-[30rem]  w-[20rem] h-auto bg-gray-100 shadow-lg z-30 rounded-lg dark:bg-black dark:border dark:border-gray-500">
                        <EditPage
                            selectedOrder={selectedOrder}
                            setShowEdit={setShowEdit}
                            showEdit={showEdit}
                            setSaveChange={setSaveChange}
                        />
                    </div>
                )}

                {showEditRemark && (
                    <>
                        <EditRemark
                            data={selectedRemarkData}
                            setShowEditRemark={setShowEditRemark}
                            showEditRemark={showEditRemark}
                            setSaveChange={setSaveChange}
                        />
                    </>
                )}


                <div className="mx-auto relative z-0 px-4">
                    <div className="overflow-y-auto md:h-[70vh] h-[76vh] bg-white shadow rounded-lg dark:bg-black dark:border dark:border-gray-500">
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-gray-500 dark:text-white">Loading orders...</p>
                            </div>
                        ) : (
                            <table className="w-full backdrop-blur-sm text-center border-collapse">
                                <thead className="sticky top-0">
                                    <tr className="bg-gray-100 sticky top-0 border dark:bg-black dark:border-gray-500">
                                        <th className="px-6 py-4 border text-sm font-medium text-gray-600 dark:text-white">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-4 border text-sm font-medium text-gray-600 dark:text-white">
                                            Client Name
                                        </th>
                                        <th className="px-6 py-4 border text-sm font-medium text-gray-600 dark:text-white">
                                            Sales Person
                                        </th>
                                        <th className="px-6 py-4 border text-sm font-medium text-gray-600 dark:text-white">
                                            Location
                                        </th>
                                        <th className="px-6 py-4 border text-sm font-medium text-gray-600 dark:text-white">
                                            No of Pcs
                                        </th>
                                        <th className="px-6 py-4 border text-sm font-medium text-gray-600 dark:text-white">
                                            Amount
                                        </th>
                                        <th className="px-6 py-4 border text-sm font-medium text-gray-600 dark:text-white">
                                            Remark
                                        </th>
                                        <th className="px-6 py-4 border text-sm font-medium text-gray-600 dark:text-white">
                                            Order Status
                                        </th>
                                        <th className="px-6 py-4 border text-sm font-medium text-gray-600 dark:text-white">
                                            Order Date
                                        </th>
                                    </tr>
                                </thead>

                                {info.length > 0 ? (
                                    <tbody>
                                        {info.map((data, index) => (
                                            <tr key={index} className={`${data.orderStatus === 'Order Cancelled' ? "bg-red-400 text-white" : "text-gray-500"}`} >
                                                <td className="px-2 border-b-2 border-gray-200 py-4 dark:text-white dark:border-gray-500">
                                                    {data.orderId}
                                                </td>
                                                <td className="px-2 border-b-2 border-gray-200 py-4 break-words whitespace-normal max-w-[150px]   dark:text-white dark:border-gray-500">
                                                    {data.clientName}
                                                </td>
                                                <td className="px-2 border-b-2 border-gray-200 py-4 break-words whitespace-normal max-w-[150px]   dark:text-white dark:border-gray-500">
                                                    {data.salesPerson}
                                                </td>
                                                <td className="px-2 py-4 border-b-2 border-gray-200 break-words whitespace-normal max-w-[150px]  dark:text-white dark:border-gray-500">
                                                    {data.location}
                                                </td>
                                                <td className="px-2 py-4 border-b-2 border-gray-200  dark:text-white dark:border-gray-500">
                                                    {data.noOfPcs.toLocaleString("en-IN")}
                                                </td>
                                                <td className="px-2 py-4 border-b-2 border-gray-200  dark:text-white dark:border-gray-500">
                                                    {data.amount.toLocaleString("en-IN")}
                                                </td>
                                                {/* <EditRemark data = {data}/> */}
                                                <td className="px-2 py-4 border-b-2 border-gray-200 break-words whitespace-normal max-w-[160px] dark:text-white dark:border-gray-500">
                                                    <div className={`flex ${showEditIcon === true ? "justify-between" : "justify-center"}`}>
                                                        <div className='pl-2 text-left'>
                                                            {data.remark}
                                                        </div>
                                                        {showEditIcon && <div
                                                            onClick={() => handleEditRemark(data)}
                                                        >
                                                            <span
                                                                title="Edit Remark"
                                                                className='pl-2'
                                                            >
                                                                <svg
                                                                    className="w-6 h-6  dark:text-white inline-block align-middle"
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
                                                                        d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                                                                    />
                                                                </svg>
                                                            </span>
                                                        </div>}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-4 border-b-2 border-gray-200  dark:text-white dark:border-gray-500">
                                                    <div className={`flex ${showEditIcon === true ? "justify-between" : "justify-center"}  pl-2`}>
                                                        <div>
                                                            {data.orderStatus}
                                                        </div>
                                                        {showEditIcon && <div
                                                            onClick={() => handleEditStatus(data)}
                                                        >
                                                            <span
                                                                title="Edit Order Status"
                                                            >
                                                                <svg
                                                                    className="w-6 h-6  dark:text-white inline-block align-middle"
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
                                                                        d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                                                                    />
                                                                </svg>
                                                            </span>
                                                        </div>}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-4 border-b-2 border-gray-200 dark:text-white dark:border-gray-500">
                                                    {data.orderDate}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                ) : (
                                    <tbody>
                                        <tr>
                                            <td colSpan="9" className="px-6 py-12">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="text-2xl font-bold text-gray-600 dark:text-white">
                                                        Result Not Found
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                )}
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default OrderDetails;

