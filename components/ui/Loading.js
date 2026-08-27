import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ text = "Loading data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full h-full text-blue-800">
      <Loader2 className="w-12 h-12 animate-spin mb-4" />
      <p className="text-lg font-semibold animate-pulse">{text}</p>
    </div>
  );
};

export default Loading;
