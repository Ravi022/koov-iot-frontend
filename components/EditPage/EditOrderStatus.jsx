"use client";

import axios from 'axios';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
// import { Toast } from 'react-toastify/dist/components';

const EditPage = ({ selectedOrder, setShowEdit, setSaveChange, showEdit }) => {

    const [selectedProcess, setSelectedProcess] = useState(selectedOrder.orderStatus);
    const handleChange = (e) => {
        // console.log(selectedOrder);
        setSelectedProcess(e.target.value);
    };

    const orderStatusList = [
        'PI',
        'Order Cancelled',
        'PO',
        'Payment Received',
        'Packing in Process',
        'Packed',
        'Invoice',
        'Dispatched',
    ];

    const handleSubmit = async () => {
        const userDetail = JSON.parse(localStorage.getItem("userDetails"));
        console.log(userDetail)
        if (selectedProcess && userDetail.role === 'admin') {
            const accessToken = localStorage.getItem("accessToken")
            //   console.log(selectedProcess);
            try {
                // const userId = selectedOrder.userId;
                const Id = selectedOrder._id
                // console.log(userId, Id)
                const orderStatus = selectedProcess;
                const res = await axios.put('http://127.0.0.1:5001/common/updateOrderStatus',
                    { Id, orderStatus }, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`, // Send the token in the Authorization header
                    },
                })


                // console.log(res);
                toast.success(`Status is updated`)
                // alert(`You selected: ${selectedProcess}`);
                setShowEdit(prev => !prev);
                setSaveChange(prev => !prev);

            }
            catch (error) {
                console.log(error)
            }

            // Here, you can send the selected process to a backend, for example.
        } else {
            alert('Please select a process stage.');
        }
    };

    return (
        // <div className="mx-auto p-6 bg-white shadow-md rounded-md">
        //     <div className='flex flex-row justify-between'>
        //         <h2 className="text-xl font-semibold mb-4">Edit Order Status</h2>
        //         <div onClick={() => setShowEdit((prev) => !prev)} >
        //             <svg class="w-6 h-6 text-gray-800 hover:text-gray-950 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        //                 <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6" />
        //             </svg>

        //         </div>
        //     </div>
        //     <div className="space-y-4">
        //         <div>
        //             <input
        //                 type="radio"
        //                 id="performaInvoice"
        //                 name="process"
        //                 value="Sending Performa Invoice"
        //                 checked={selectedProcess === 'Sending Performa Invoice'}
        //                 onChange={handleChange}
        //                 className="mr-2"
        //             />
        //             <label htmlFor="performaInvoice" className="text-lg">Sending Performa Invoice</label>
        //         </div>

        //         <div>
        //             <input
        //                 type="radio"
        //                 id="piSend"
        //                 name="process"
        //                 value="PI Send"
        //                 checked={selectedProcess === 'PI Send'}
        //                 onChange={handleChange}
        //                 className="mr-2"
        //             />
        //             <label htmlFor="piSend" className="text-lg">PI Send</label>
        //         </div>

        //         <div>
        //             <input
        //                 type="radio"
        //                 id="paymentReceived"
        //                 name="process"
        //                 value="Payment Received"
        //                 checked={selectedProcess === 'Payment Received'}
        //                 onChange={handleChange}
        //                 className="mr-2"
        //             />
        //             <label htmlFor="paymentReceived" className="text-lg">Payment Received</label>
        //         </div>

        //         <div>
        //             <input
        //                 type="radio"
        //                 id="packingInProcess"
        //                 name="process"
        //                 value="Packing in Process"
        //                 checked={selectedProcess === 'Packing in Process'}
        //                 onChange={handleChange}
        //                 className="mr-2"
        //             />
        //             <label htmlFor="packingProcess" className="text-lg">Packing in Process</label>
        //         </div>

        //         <div>
        //             <input
        //                 type="radio"
        //                 id="packed"
        //                 name="process"
        //                 value="Packed"
        //                 checked={selectedProcess === 'Packed'}
        //                 onChange={handleChange}
        //                 className="mr-2"
        //             />
        //             <label htmlFor="packed" className="text-lg">Packed</label>
        //         </div>

        //         <div>
        //             <input
        //                 type="radio"
        //                 id="dispatchInProcess"
        //                 name="process"
        //                 value="Dispatch in Process"
        //                 checked={selectedProcess === 'Dispatch in Process'}
        //                 onChange={handleChange}
        //                 className="mr-2"
        //             />
        //             <label htmlFor="dispatchInProcess" className="text-lg">Dispatch in Process</label>
        //         </div>

        //         <div>
        //             <input
        //                 type="radio"
        //                 id="dispatched"
        //                 name="process"
        //                 value="Dispatched"
        //                 checked={selectedProcess === 'Dispatched'}
        //                 onChange={handleChange}
        //                 className="mr-2"
        //             />
        //             <label htmlFor="dispatchAdmin" className="text-lg">Dispatched</label>
        //         </div>
        //     </div>

        //     <button
        //         onClick={handleSubmit}
        //         className="mt-6 w-full py-2 px-4 bg-gray-900 font-semibold text-white rounded-md hover:bg-gray-800 focus:outline-none"
        //     >
        //         Submit
        //     </button>
        // </div>



        // <div className="mx-auto p-6 bg-white shadow-md rounded-md dark:bg-black dark:text-white">
        //     <div className="flex flex-row justify-between">
        //         <h2 className="text-xl font-semibold mb-4 dark:text-white">Edit Order Status</h2>
        //         <div onClick={() => setShowEdit((prev) => !prev)}>
        //             <svg
        //                 className="w-6 h-6 text-gray-800 hover:text-gray-950 dark:text-white dark:hover:text-gray-400"
        //                 aria-hidden="true"
        //                 xmlns="http://www.w3.org/2000/svg"
        //                 width="24"
        //                 height="24"
        //                 fill="none"
        //                 viewBox="0 0 24 24"
        //             >
        //                 <path
        //                     stroke="currentColor"
        //                     strokeLinecap="round"
        //                     strokeLinejoin="round"
        //                     strokeWidth="2"
        //                     d="M6 18 17.94 6M18 18 6.06 6"
        //                 />
        //             </svg>
        //         </div>
        //     </div>
        //     <div className="space-y-4">
        //         {[
        //             'PI',
        //             'PO',
        //             'Payment Received',
        //             'Packing in Process',
        //             'Packed',
        //             'Invoice',
        //             'Dispatched',
        //         ].map((process, index) => (
        //             <div key={index}>
        //                 <input
        //                     type="radio"
        //                     id={process}
        //                     name="process"
        //                     value={process}
        //                     checked={selectedProcess === process}
        //                     onChange={handleChange}
        //                     className="p-4"
        //                 />
        //                 <label htmlFor={process} className="text-lg dark:text-white">{process}</label>
        //             </div>
        //         ))}
        //     </div>

        //     <button
        //         onClick={handleSubmit}
        //         className="mt-6 w-full py-2 px-4 bg-gray-900 font-semibold text-white rounded-md hover:bg-gray-800 focus:outline-none dark:bg-gray-700 dark:hover:bg-gray-600"
        //     >
        //         Submit
        //     </button>
        // </div>


        // --- Some background edit in edit page

        <div className="mx-auto p-3 bg-white shadow-md rounded-md dark:bg-black dark:text-white">
            <div className="flex flex-row justify-between">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Edit Order Status</h2>
                <div onClick={() => setShowEdit((prev) => !prev)}>
                    <svg
                        className="w-6 h-6 text-gray-800 hover:text-gray-950 dark:text-white dark:hover:text-gray-400"
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
            <div className="">
                {orderStatusList.map((process, index) => (
                    <div className={`flex m-1 p-[0.4rem] ${process === selectedProcess ? "bg-gray-200" : ""} flex-row justify-between`} onClick={() => setSelectedProcess(process)} key={index}>
                        <div className=''>
                            <input
                                type="radio"
                                id={process}
                                name="process"
                                value={process}
                                checked={process === selectedProcess}
                                // onChange={handleChange}
                                className="p-4"
                            />
                            <label htmlFor={process} className="text-lg pl-2 dark:text-white">{process}</label>
                        </div>
                        {/* {(process === 'PI' || process === 'PO') && <div className='bg-green-500 hover:bg-green-600 p-1 text-white rounded-lg'>
                            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m8.032 12 1.984 1.984 4.96-4.96m4.55 5.272.893-.893a1.984 1.984 0 0 0 0-2.806l-.893-.893a1.984 1.984 0 0 1-.581-1.403V7.04a1.984 1.984 0 0 0-1.984-1.984h-1.262a1.983 1.983 0 0 1-1.403-.581l-.893-.893a1.984 1.984 0 0 0-2.806 0l-.893.893a1.984 1.984 0 0 1-1.403.581H7.04A1.984 1.984 0 0 0 5.055 7.04v1.262c0 .527-.209 1.031-.581 1.403l-.893.893a1.984 1.984 0 0 0 0 2.806l.893.893c.372.372.581.876.581 1.403v1.262a1.984 1.984 0 0 0 1.984 1.984h1.262c.527 0 1.031.209 1.403.581l.893.893a1.984 1.984 0 0 0 2.806 0l.893-.893a1.985 1.985 0 0 1 1.403-.581h1.262a1.984 1.984 0 0 0 1.984-1.984V15.7c0-.527.209-1.031.581-1.403Z" />
                            </svg>

                        </div>} */}
                    </div>
                ))}
            </div>

            <button
                onClick={handleSubmit}
                className="mt-6 w-full py-2 px-4 bg-gray-900 font-semibold text-white rounded-md hover:bg-gray-800 focus:outline-none dark:bg-gray-700 dark:hover:bg-gray-600"
            >
                Submit
            </button>
        </div>

    );
};

export default EditPage;
