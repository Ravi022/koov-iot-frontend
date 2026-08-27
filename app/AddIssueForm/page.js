"use client";

import React, { useState } from 'react';
import axios from 'axios';
import Header from '@/components/Header/Header';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Page = () => {
    let [issue, setIssue] = useState('');
    let [assignedTo, setAssignedTo] = useState('');
    let [relatedTo, setRelatedTo] = useState('');
    let [currentStatus, setCurrentStatus] = useState('Open');


    const handleSubmit = async (e) => {
        e.preventDefault();
        const accessToken = localStorage.getItem("accessToken")

        if (!issue.trim() || !assignedTo.trim() || !relatedTo.trim() || !currentStatus.trim()) {
            toast.error("Enter All Field");
            setIssue('');
            setAssignedTo('');
            setRelatedTo('');
            setCurrentStatus('Open');
            return;
        }

        try {
            const res = await axios.post('http://127.0.0.1:5001/common/addIssue', {
                issue: issue.trim(),
                assignedTo: assignedTo.trim(),
                relatedTo: relatedTo.trim(),
                currentStatus: currentStatus.trim()
            },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`, // Send the token in the Authorization header
                    },
                });
            toast.success("Issue Added Successfully!")
            // navigate('/issuetracker')

        } catch (err) {
            console.error('Error:', err);
            toast.error('Failed to add issue.');
        }
        // setVari(prev => !prev)
        // setChange(prev => !prev)
        setIssue('');
        setAssignedTo('');
        setRelatedTo('');
        setCurrentStatus('Open');
    };

    return (
        // <>
        //     <ToastContainer />
        //     <Header />
        //     <div className="max-w-lg mt-[5rem] mx-auto p-6 bg-white shadow-lg rounded-lg">
        //         <h2 className="text-2xl font-semibold text-center mb-6">Add New Issue</h2>
        //         <form onSubmit={handleSubmit}>
        //             {/* Issue Field */}
        //             <div className="mb-4">
        //                 <label htmlFor="issue" className="block text-sm font-medium text-gray-700">
        //                     Issue
        //                 </label>
        //                 <input
        //                     type="text"
        //                     id="issue"
        //                     value={issue}
        //                     onChange={(e) => setIssue(e.target.value)}
        //                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
        //                     placeholder="Enter the issue"
        //                     required
        //                 />
        //             </div>

        //             {/* Assigned To Field */}
        //             <div className="mb-4">
        //                 <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
        //                     Assigned To
        //                 </label>
        //                 <input
        //                     type="text"
        //                     id="assignedTo"
        //                     value={assignedTo}
        //                     onChange={(e) => setAssignedTo(e.target.value)}
        //                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
        //                     placeholder="Enter assignee's name"
        //                     required
        //                 />
        //             </div>

        //             {/* Related To Field */}
        //             <div className="mb-4">
        //                 <label htmlFor="relatedTo" className="block text-sm font-medium text-gray-700">
        //                     Related To
        //                 </label>
        //                 <input
        //                     type="text"
        //                     id="relatedTo"
        //                     value={relatedTo}
        //                     onChange={(e) => setRelatedTo(e.target.value)}
        //                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
        //                     placeholder="Enter related to"
        //                     required
        //                 />
        //             </div>

        //             {/* Current Status Field */}
        //             <div className="mb-4">
        //                 <label htmlFor="currentStatus" className="block text-sm font-medium text-gray-700">
        //                     Current Status
        //                 </label>
        //                 <select
        //                     id="currentStatus"
        //                     value={currentStatus}
        //                     onChange={(e) => setCurrentStatus(e.target.value)}
        //                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
        //                     required
        //                 >
        //                     <option value="Open">Open</option>
        //                     <option value="In Progress">In Progress</option>
        //                     <option value="Resolved">Resolved</option>
        //                     <option value="Closed">Closed</option>
        //                 </select>
        //             </div>

        //             {/* Submit Button */}
        //             <div className="mb-4">
        //                 <button
        //                     type="submit"
        //                     className="w-full py-2 px-4 bg-gray-950 text-white font-semibold rounded-md shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800"
        //                 >
        //                     Add Issue
        //                 </button>
        //             </div>
        //         </form>
        //     </div>
        // </>

        <>
            <ToastContainer />
            <Header />
            <div className="w-full h-[90.8vh] border-2 bg-cover">
                <div className="max-w-lg mt-[5rem] mx-auto p-6  bg-white shadow-lg rounded-lg dark:bg-gray-800 dark:shadow-gray-700">
                    <div className='flex justify-center'>
                        <span className='mr-2' >
                            <svg class="w-[31px] h-[31px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path fill-rule="evenodd" d="M18 5.05h1a2 2 0 0 1 2 2v2H3v-2a2 2 0 0 1 2-2h1v-1a1 1 0 1 1 2 0v1h3v-1a1 1 0 1 1 2 0v1h3v-1a1 1 0 1 1 2 0v1Zm-15 6v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8H3ZM11 18a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1v-1a1 1 0 1 0-2 0v1h-1a1 1 0 1 0 0 2h1v1Z" clip-rule="evenodd" />
                            </svg>
                        </span>
                        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-900 dark:text-gray-100">
                            Add New Issue
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Issue Field */}
                        <div className="mb-4">
                            <label
                                htmlFor="issue"
                                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                            >
                                Issue
                            </label>
                            <input
                                type="text"
                                id="issue"
                                value={issue}
                                onChange={(e) => setIssue(e.target.value)}
                                className="mt-1 block w-full  px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-gray-400"
                                placeholder="Enter the issue"
                                required
                            />
                        </div>

                        {/* Assigned To Field */}
                        <div className="mb-4">
                            <label
                                htmlFor="assignedTo"
                                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                            >
                                Assigned To
                            </label>
                            <input
                                type="text"
                                id="assignedTo"
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-gray-400"
                                placeholder="Enter assignee's name"
                                required
                            />
                        </div>

                        {/* Related To Field */}
                        <div className="mb-4">
                            <label
                                htmlFor="relatedTo"
                                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                            >
                                Related To
                            </label>
                            <input
                                type="text"
                                id="relatedTo"
                                value={relatedTo}
                                onChange={(e) => setRelatedTo(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-gray-400"
                                placeholder="Enter related to"
                                required
                            />
                        </div>

                        {/* Current Status Field */}
                        <div className="mb-4">
                            <label
                                htmlFor="currentStatus"
                                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                            >
                                Current Status
                            </label>
                            <select
                                id="currentStatus"
                                value={currentStatus}
                                onChange={(e) => setCurrentStatus(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-gray-400"
                                required
                            >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <div className="mb-4">
                            <button
                                type="submit"
                                className="w-full py-2 px-4 bg-gray-950 text-white font-semibold rounded-md shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-500"
                            >
                                Add Issue
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>


    );
};

export default Page;
