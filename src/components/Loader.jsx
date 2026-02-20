import React from 'react';

const Loader = ({ tip = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-4"></div>
    {tip && <span className="text-slate-500 text-base font-medium">{tip}</span>}
  </div>
);

export default Loader;
