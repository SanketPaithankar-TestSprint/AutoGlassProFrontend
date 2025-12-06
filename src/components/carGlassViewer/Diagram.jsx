import React from "react";

const Diagram = ({ zones, selectedGlassTypes, onZoneHover, onZoneLeave }) => {
    return (
        <div className="relative w-full max-w-[300px] mx-auto">
            <svg viewBox="0 0 300 520" className="w-full h-auto drop-shadow-xl">
                {/* Car Body Outline - Smooth Sedan Shape */}
                <path
                    d="M75,100 C75,100 150,70 225,100 C250,110 260,130 260,160 L260,420 C260,450 250,470 225,480 C150,500 75,480 75,480 C50,470 40,450 40,420 L40,160 C40,130 50,110 75,100 Z"
                    fill="#e2e8f0"
                    stroke="#94a3b8"
                    strokeWidth="2"
                />

                {/* Roof / Cabin Area */}
                <path
                    d="M75,175 L225,175 L225,405 L75,405 Z"
                    fill="#f1f5f9"
                    stroke="none"
                />

                {/* Glass Zones */}
                {zones.map((zone) => {
                    const isAvailable = !!zone.glass;
                    const isSelected = selectedGlassTypes.some(item => item.glass.code === zone.glass?.code);

                    // Fill color logic
                    let fill = "#cbd5e1"; // Default gray (unavailable)
                    if (isAvailable) fill = "#7dd3fc"; // Light blue (available)
                    if (isSelected) fill = "#2563eb"; // Dark blue (selected)

                    return (
                        <g
                            key={zone.id}
                            onMouseEnter={(e) => onZoneHover(e, zone)}
                            onMouseLeave={onZoneLeave}
                            className={`${isAvailable
                                ? "hover:opacity-80"
                                : "cursor-not-allowed opacity-50"
                                } transition-all duration-200`}
                        >
                            <path
                                d={zone.path}
                                fill={fill}
                                stroke={isSelected ? "#1e40af" : "#0f172a"}
                                strokeWidth={isSelected ? "2" : "1"}
                                strokeLinejoin="round"
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Legend / Status */}
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
        </div>
    );
};

export default Diagram;
