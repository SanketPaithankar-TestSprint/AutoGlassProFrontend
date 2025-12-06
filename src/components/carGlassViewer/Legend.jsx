import React from "react";

const Legend = () => (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 text-[10px] font-medium text-slate-500">
        <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-sky-300 rounded-full border border-slate-600"></div>
            <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-600 rounded-full border border-blue-800"></div>
            <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-slate-300 rounded-full border border-slate-400"></div>
            <span>Unavailable</span>
        </div>
    </div>
);

export default Legend;
