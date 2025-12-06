import React from "react";
import ZONES from "../../const/zones";

const Diagram = ({ selectedGlassTypes, handleSelectGlass, handleZoneHover, handleZoneLeave }) => {
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
                {ZONES.map((zone) => {
                    const isAvailable = !!zone.code;
                    const isSelected = selectedGlassTypes.some(item => item.glass.code === zone.code);
                    let fill = "#cbd5e1";
                    if (isAvailable) fill = "#7dd3fc";
                    if (isSelected) fill = "#2563eb";
                    return (
                        <g
                            key={zone.id}
                            onClick={() => isAvailable && handleSelectGlass(zone)}
                            onMouseEnter={(e) => handleZoneHover(e, zone)}
                            onMouseLeave={handleZoneLeave}
                            className={`${isAvailable ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed opacity-50"} transition-all duration-200`}
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
        </div>
    );
};

export default Diagram;
