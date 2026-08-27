import React from 'react'

function SortDropdown({ info, setInfo, originalData }) {

  const handleChange = (e) => {
    // console.log(e.target.value);
    // Function to sort data
    const sortData = (data, sortType) => {
      switch (sortType) {
        case 'issueDateLatest':
          return [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        case 'issueDateOldest':
          return [...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        default:
          return data; // Return unsorted data if no valid sortType is provided
      }
    };

    const sortedData = sortData(originalData, e.target.value);
    setInfo(sortedData);

  }

  return (
    <div className="flex flex-row justify-center">
      <div className="py-2 text-gray-800 dark:text-white">Sort By</div>
      <select
        onChange={(e) => handleChange(e)}
        className="w-[11rem] ml-4 h-[2.5rem] bg-white border border-gray-300 rounded-md text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        name=""
        id=""
      >
        <option value="" className="text-gray-800 dark:text-white">Select</option>
        <option value="issueDateLatest" className="text-gray-800 dark:text-white">By Issue Date (Latest)</option>
        <option value="issueDateOldest" className="text-gray-800 dark:text-white">By Issue Date (Oldest)</option>
      </select>
    </div>

  )
}

export default SortDropdown
