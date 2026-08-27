import React from "react";

const Loading = () => {
  return (
    <div className="min-h-screen p-8 animate-pulse">
      <div className="max-w-6xl mx-auto">
        {/* Title Placeholder */}
        <div className="h-8 w-1/4 bg-gray-300 rounded mb-8"></div>
        
        {/* Cards Placeholder */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-100">
              <div className="h-6 bg-gray-300 rounded mb-4"></div>
              <div className="flex items-center space-x-2">
                <div className="h-10 w-full bg-gray-300 rounded"></div>
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Production Report Section Placeholder */}
        <div className="mt-6 border rounded-lg p-4 bg-gray-100">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="w-full md:w-[180px] h-10 bg-gray-300 rounded"></div>
            <div className="w-full md:w-[180px] h-10 bg-gray-300 rounded"></div>
            <div className="flex items-center space-x-2 flex-grow">
              <div className="w-full h-10 bg-gray-300 rounded"></div>
              <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
              <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
