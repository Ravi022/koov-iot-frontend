"use client";

import React, { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function IssueFilter({ info, setInfo, originalData, dropdownOpen, setDropdownOpen }) {
  const [issueStatus, setIssueStatus] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const applyFilters = () => {
    let data = originalData;
    // console.log(data);
    // console.log(1)
    if (assignedTo) {
      data = data.filter((item) => item.assignedTo === assignedTo);
    }
    console.log(issueStatus);
    if (issueStatus) {
      data = data.filter((item) => item.currentStatus === issueStatus); // Adjust the key as per your data
    }
    if (createdAt) {
      data = data.filter((item) => {
        // Extract date part from ISO string
        const itemDate = item.createdAt.split('T')[0]; // e.g., "2024-12-11"
        return itemDate === createdAt;
      });
    }

    if (!assignedTo && !issueStatus && !createdAt) {
      toast.error("Enter Some Field")
    }
    else {
      setDropdownOpen(false);
      toast.info("Filter is Applied")
    }
    console.log(data);
    
    setInfo(data);

  };

  const clearFilter = () => {
    setAssignedTo("");
    setIssueStatus("");
    setCreatedAt("");
  }

  return (
    // <>
    //   <ToastContainer />
    //   <div className="relative">
    //     {/* Filter Button */}
    //     <button
    //       className="border-2 font-semibold border-gray-400 px-4 py-2 rounded-lg hover:bg-gray-200"
    //       onClick={() => setDropdownOpen(!dropdownOpen)}
    //     >
    //       Filter
    //     </button>

    //     {/* Dropdown */}
    //     {dropdownOpen && (
    //       <div className="border-2 z-10 w-[20rem] bg-gray-200 absolute top-[4rem] right-0 h-auto rounded-lg shadow-lg p-4">
    //         <div className="flex flex-row justify-between">
    //           <h3 className="text-lg font-bold mb-4">Filter Options</h3>
    //           <div onClick={() => setDropdownOpen(prev => !prev)}>
    //             <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    //               <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6" />
    //             </svg>
    //           </div>
    //         </div>


    //         {/* Assigned To Input */}
    //         <div className="mb-4">
    //           <label className="block mb-2 font-medium">Assigned To</label>
    //           <input
    //             type="text"
    //             placeholder="Enter assignee name"
    //             className="w-full border rounded-lg px-3 py-2"
    //             value={assignedTo}
    //             onChange={(e) => setAssignedTo(e.target.value)}
    //           />
    //         </div>
    //         {/* Issue Status Dropdown */}
    //         <div className="mb-4">
    //           <label className="block mb-2 font-medium">Issue Status</label>
    //           <select
    //             className="w-full border rounded-lg px-3 py-2"
    //             value={issueStatus}
    //             onChange={(e) => setIssueStatus(e.target.value)}
    //           >
    //             <option value="">Select Status</option>
    //             <option value="Open">Open</option>
    //             <option value="In Progress">In Progress</option>
    //             <option value="Resolved">Resolved</option>
    //             <option value="Closed">Closed</option>
    //           </select>
    //         </div>

    //         {/* Created At Input */}
    //         <div className="mb-4">
    //           <label className="block mb-2 font-medium">Created At</label>
    //           <input
    //             type="date"
    //             className="w-full border rounded-lg px-3 py-2"
    //             value={createdAt}
    //             onChange={(e) => setCreatedAt(e.target.value)}
    //           />
    //         </div>

    //         {/* Apply Button */}
    //         <div>
    //           <button
    //             className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
    //             onClick={applyFilters}
    //           >
    //             Apply
    //           </button>
    //         </div>
    //       </div>
    //     )}
    //   </div>
    // </>
    <>
      <ToastContainer />
      <div className="relative">
        {/* Filter Button */}
        <button
          className="border-2 font-semibold border-gray-400 px-4 py-2 rounded-lg hover:bg-gray-200 dark:border-gray-500 dark:bg-black dark:text-white dark:hover:bg-gray-700"
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

            {/* Assigned To Input */}
            <div className="mb-4">
              <label className="block mb-2 font-medium dark:text-white">
                Assigned To
              </label>
              <input
                type="text"
                placeholder="Enter assignee name"
                className="w-full border rounded-lg px-3 py-2 dark:bg-black dark:border-gray-500 dark:text-white"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </div>

            {/* Issue Status Dropdown */}
            <div className="mb-4">
              <label className="block mb-2 font-medium dark:text-white">
                Issue Status
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 dark:bg-black dark:border-gray-500 dark:text-white"
                value={issueStatus}
                onChange={(e) => setIssueStatus(e.target.value)}
              >
                <option value="">Select Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Created At Input */}
            <div className="mb-4">
              <label className="block mb-2 font-medium dark:text-white">
                Created At
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 dark:bg-black dark:border-gray-500 dark:text-white"
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
              />
            </div>

            {/* Apply Button */}
            <div className="flex flex-row  justify-between">
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

export default IssueFilter;

