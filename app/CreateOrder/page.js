"use client"

import React, { useState } from 'react'
import axios from 'axios';
import Header from '@/components/Header/Header';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Page() {


    let [clientName, setClientName] = useState("");
    let [salesPerson, setSalesPerson] = useState("");
    let [location, setLocation] = useState("");
    let [noOfPcs, setNoOfPcs] = useState("");
    let [amount, setAmount] = useState("");
    let [remark, setRemark] = useState("");

    // State to manage validation errors
    const [errors, setErrors] = useState({
        clientName: "",
        salesPerson: "",
        location: "",
        noOfPcs: "",
        amount: "",
    });

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const accessToken = localStorage.getItem("accessToken")
        // Simple validation

        //   const userId = '23920123465';
        let isValid = true;
        const newErrors = {};

        const trimAllDetails = () => {
            clientName = clientName.trim();
            salesPerson = salesPerson.trim();
            location = location.trim();
            noOfPcs = noOfPcs.trim();
            amount = amount.trim();
            remark = remark.trim();
            setClientName(clientName);
            setSalesPerson(salesPerson);
            setLocation(location);
            setNoOfPcs(noOfPcs);
            setAmount(amount);
            setRemark(remark);
        }

        trimAllDetails();

        // console.log(clientName)

        if (!clientName.trim()) {
            newErrors.clientName = "Client name is required";
            isValid = false;
        }
        if (!salesPerson) {
            newErrors.salesPerson = "Sales person is required";
            isValid = false;
        }
        if (!location) {
            newErrors.location = "Location is required";
            isValid = false;
        }
        if (noOfPcs < 0) {
            newErrors.noOfPcs = "Please Enter Valid Number"
        }
        if (!noOfPcs) {
            newErrors.noOfPcs = "No of pcs is required";
            isValid = false;
        }
        if (amount < 0) {
            newErrors.amount = "Please Enter valid Amount"
            isValid = false;
        }
        if (!amount) {
            newErrors.amount = "Amount is required";
            isValid = false;
        }

        // If invalid, set errors
        if (!isValid) {
            setErrors(newErrors);
            return;
        } else {
            // If valid, submit the form
            setErrors({});
            console.log(clientName);
            try {
                await axios.post('http://127.0.0.1:5001/common/addOrder', {
                    clientName,
                    salesPerson,
                    location,
                    noOfPcs,
                    amount,
                    remark
                },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`, // Send the token in the Authorization header
                        },
                    }
                )
                    .then(res => console.log(res))
                toast.success("Order is Placed")
                // alert("Form Submitted Successfully");
                setClientName("");
                setSalesPerson("");
                setLocation("");
                setNoOfPcs("")
                setAmount("");
                setRemark("");
            }
            catch (error) {
                console.log(error);
            }
        }
    };

    return (
        <div>
            <ToastContainer />
            <Header />
            <div className="max-w-lg max-h-auto mt-[1rem] mx-auto px-6 bg-white shadow-lg rounded-lg dark:bg-gray-800 dark:shadow-gray-700 flex flex-col justify-center items-center">
                <div>
                    <h2 className="text-2xl font-semibold text-center mt-2 mb-2 text-gray-900 dark:text-gray-100">
                        Add New Order
                    </h2>
                </div>
                <form onSubmit={handleSubmit} >
                    <div className="mb-4">
                        <label
                            htmlFor="clientName"
                            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                        >
                            Client Name
                        </label>
                        <input
                            type="text"
                            id="clientName"
                            value={clientName}
                            onChange={(e) => {
                                setClientName(e.target.value);
                                setErrors({});
                            }}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${errors.clientName
                                ? "border-red-600 border-2 mt-0"
                                : "border-gray-300 mt-1 focus:ring-gray-800 focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-gray-400"
                                }`}
                            placeholder="Enter client's name"
                        />
                        {errors.clientName && (
                            <p className="text-red-600 text-sm">{errors.clientName}</p>
                        )}
                    </div>

                    {/* Sales Person Field */}
                    <div className="mb-4">
                        <label
                            htmlFor="salesPerson"
                            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                        >
                            Sales Person
                        </label>
                        <input
                            type="text"
                            id="salesPerson"
                            value={salesPerson}
                            onChange={(e) => {
                                setSalesPerson(e.target.value);
                                setErrors({});
                            }}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${errors.salesPerson
                                ? "border-red-600 border-2 mt-0"
                                : "border-gray-300 mt-1 focus:ring-gray-800 focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-gray-400"
                                }`}
                            placeholder="Enter sales person's name"
                        />
                        {errors.salesPerson && (
                            <p className="text-red-600 text-sm">{errors.salesPerson}</p>
                        )}
                    </div>
                    <div className='grid grid-cols-2 gap-6'>
                        {/* Client Name Field */}


                        {/* Amount Field */}
                        <div className="">
                            <label
                                htmlFor="amount"
                                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                            >
                                Amount
                            </label>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                    setErrors({});
                                }}
                                className={`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${errors.amount
                                    ? "border-red-600 border-2 mt-0"
                                    : "border-gray-300 mt-1 focus:ring-gray-800 focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-gray-400"
                                    }`}
                                placeholder="Enter amount"
                            />
                            {errors.amount && (
                                <p className="text-red-600 text-sm">{errors.amount}</p>
                            )}
                        </div>

                        {/* No of Pcs Field */}
                        <div className="mb-4">
                            <label
                                htmlFor="noOfPcs"
                                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                            >
                                No of Pcs
                            </label>
                            <input
                                type="number"
                                id="noOfPcs"
                                value={noOfPcs}
                                onChange={(e) => {
                                    setNoOfPcs(e.target.value);
                                    setErrors({});
                                }}
                                className={`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${errors.noOfPcs
                                    ? "border-red-600 border-2 mt-0"
                                    : "border-gray-300 mt-1 focus:ring-gray-800 focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-gray-400"
                                    }`}
                                placeholder="Enter number of pieces"
                            />
                            {errors.noOfPcs && (
                                <p className="text-red-600 text-sm">{errors.noOfPcs}</p>
                            )}
                        </div>

                    </div>

                    {/* Location Field */}
                    <div className="mb-4">
                        <label
                            htmlFor="location"
                            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                        >
                            Location
                        </label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => {
                                setLocation(e.target.value);
                                setErrors({});
                            }}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${errors.location
                                ? "border-red-600 border-2 mt-0"
                                : "border-gray-300 mt-1 focus:ring-gray-800 focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-gray-400"
                                }`}
                            placeholder="Enter location"
                        />
                        {errors.location && (
                            <p className="text-red-600 text-sm">{errors.location}</p>
                        )}
                    </div>

                    {/* Remark Field */}
                    <div className="mb-4">
                        <label
                            htmlFor="remark"
                            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                        >
                            Remark
                        </label>
                        <textarea
                            id="remark"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            className="mt-1 block w-full resize-none px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-gray-400"
                            placeholder="Enter any remarks"
                            rows="4"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="mb-4">
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-gray-950 text-white font-semibold rounded-md shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-500"
                        >
                            Add Order
                        </button>
                    </div>
                </form>
            </div>
        </div>

    )
}

export default Page