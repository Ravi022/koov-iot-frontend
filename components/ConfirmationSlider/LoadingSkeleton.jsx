import React from "react";

const LoadingSkeleton = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-background border rounded-lg shadow-md p-4">
      <div className="w-full h-6 bg-gray-200 animate-pulse rounded mb-4"></div>
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-full"></div>
        <div className="w-3/4 h-6 bg-gray-200 animate-pulse rounded"></div>
      </div>
      <div className="mt-2 w-1/2 h-4 bg-gray-200 animate-pulse rounded"></div>
    </div>
  );
};

export default LoadingSkeleton;
