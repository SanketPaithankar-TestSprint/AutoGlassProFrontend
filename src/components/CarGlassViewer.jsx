"use client";

import React, { useEffect, useState } from "react";

export default function CarGlassViewer({ modelId, onPartSelect })
{
  const [loading, setLoading] = useState(true);
  const [glassData, setGlassData] = useState([]);
  const [selectedGlasses, setSelectedGlasses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() =>
  {
    if (!modelId) return;

    const fetchGlassTypes = async () =>
    {
      try
      {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `http://44.198.158.71:8000/agp/v1/glass-types?model=${modelId}`,
          { headers: { accept: "application/json" } }
        );
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        const data = await res.json();
        setGlassData(data?.glass_types || []);
      } catch (err)
      {
        console.error(err);
        setError(err.message || "Failed to fetch glass data");
      } finally
      {
        setLoading(false);
      }
    };

    fetchGlassTypes();
  }, [modelId]);

  const toggleGlass = (glass) =>
  {
    setSelectedGlasses((prev) =>
    {
      const isSelected = prev.find((g) => g.code === glass.code);
      if (isSelected)
      {
        return prev.filter((g) => g.code !== glass.code);
      } else
      {
        onPartSelect?.(glass); // Notify parent when a part is selected
        return [...prev, glass];
      }
    });
  };

  const isSelected = (code) => selectedGlasses.some((g) => g.code === code);

  // Map NAGS type to color
  const getGlassColor = (type) =>
  {
    const colorMap = {
      Door_Glass: "#3B82F6",
      Door_Vent_Glass: "#8B5CF6",
      DQ: "#F59E0B",
      DR: "#10B981",
      Door_Back_Glass: "#EF4444",
      Door_Window: "#06B6D4",
    };
    return colorMap[type] || "#6B7280";
  };

  // Position glass on SVG based on NAGS position/side
  const getGlassPosition = (glass) =>
  {
    const { type, position, side } = glass;

    // Door Glass (DD prefix in NAGS)
    if (type === "Door_Glass")
    {
      if (position === "Front" && side === "Left")
        return { x: 140, y: 100, w: 70, h: 75, label: "FL" };
      if (position === "Front" && side === "Right")
        return { x: 140, y: 25, w: 70, h: 75, label: "FR" };
      if (position === "Rear" && side === "Left")
        return { x: 340, y: 100, w: 70, h: 75, label: "RL" };
      if (position === "Rear" && side === "Right")
        return { x: 340, y: 25, w: 70, h: 75, label: "RR" };
    }

    // Door Vent Glass (DV prefix in NAGS)
    if (type === "Door_Vent_Glass")
    {
      if (position === "Front" && side === "Left")
        return { x: 90, y: 100, w: 40, h: 40, label: "VFL", shape: "triangle" };
      if (position === "Front" && side === "Right")
        return { x: 90, y: 25, w: 40, h: 40, label: "VFR", shape: "triangle" };
      if (position === "Rear" && side === "Left")
        return { x: 420, y: 100, w: 40, h: 40, label: "VRL", shape: "triangle" };
      if (position === "Rear" && side === "Right")
        return { x: 420, y: 25, w: 40, h: 40, label: "VRR", shape: "triangle" };
    }

    // Quarter Glass (DQ prefix in NAGS)
    if (type === "DQ")
    {
      if (side === "Left")
        return { x: 470, y: 100, w: 50, h: 60, label: "QL", shape: "quad" };
      if (side === "Right")
        return { x: 470, y: 25, w: 50, h: 60, label: "QR", shape: "quad" };
    }

    // Roof Glass / Sunroof (DR prefix in NAGS)
    if (type === "DR")
    {
      if (position === "Front")
        return { x: 180, y: 90, w: 80, h: 20, label: "RF", shape: "roof" };
      if (position === "Rear")
        return { x: 300, y: 90, w: 80, h: 20, label: "RR", shape: "roof" };
    }

    // Back Glass / Rear Windshield (DB prefix in NAGS)
    if (type === "Door_Back_Glass")
      return { x: 530, y: 50, w: 60, h: 100, label: "BG", shape: "back" };

    // Windshield (DW prefix in NAGS)
    if (type === "Door_Window")
      return { x: 30, y: 50, w: 60, h: 100, label: "WS", shape: "wind" };

    // Default fallback
    return { x: 250, y: 75, w: 60, h: 50, label: "?" };
  };

  const renderGlassPart = (glass, idx) =>
  {
    const pos = getGlassPosition(glass);
    const color = getGlassColor(glass.type);
    const selected = isSelected(glass.code);
    const opacity = selected ? 0.9 : 0.3;

    const shapeProps = {
      fill: color,
      stroke: selected ? "#FFFFFF" : color,
      strokeWidth: selected ? 3 : 1,
      opacity,
      className: "cursor-pointer transition-all duration-200 hover:opacity-100",
      onClick: () => toggleGlass(glass),
    };

    // Render different shapes based on glass type
    if (pos.shape === "triangle")
    {
      return (
        <g key={idx}>
          <polygon
            points={`${pos.x},${pos.y + pos.h} ${pos.x + pos.w},${pos.y + pos.h} ${pos.x + pos.w / 2},${pos.y}`}
            {...shapeProps}
          />
          <text
            x={pos.x + pos.w / 2}
            y={pos.y + pos.h - 10}
            textAnchor="middle"
            fill="white"
            fontSize="8"
            fontWeight="bold"
            className="pointer-events-none select-none"
          >
            {pos.label}
          </text>
        </g>
      );
    }

    if (pos.shape === "quad")
    {
      return (
        <g key={idx}>
          <path
            d={`M ${pos.x} ${pos.y + pos.h} L ${pos.x + pos.w} ${pos.y + pos.h / 2} L ${pos.x + pos.w} ${pos.y} L ${pos.x} ${pos.y + pos.h / 3} Z`}
            {...shapeProps}
          />
          <text
            x={pos.x + pos.w / 2}
            y={pos.y + pos.h / 2}
            textAnchor="middle"
            fill="white"
            fontSize="8"
            fontWeight="bold"
            className="pointer-events-none select-none"
          >
            {pos.label}
          </text>
        </g>
      );
    }

    if (pos.shape === "back")
    {
      return (
        <g key={idx}>
          <path
            d={`M ${pos.x} ${pos.y + 20} Q ${pos.x + pos.w / 2} ${pos.y} ${pos.x + pos.w} ${pos.y + 20} L ${pos.x + pos.w} ${pos.y + pos.h - 20} Q ${pos.x + pos.w / 2} ${pos.y + pos.h} ${pos.x} ${pos.y + pos.h - 20} Z`}
            {...shapeProps}
          />
          <text
            x={pos.x + pos.w / 2}
            y={pos.y + pos.h / 2}
            textAnchor="middle"
            fill="white"
            fontSize="9"
            fontWeight="bold"
            className="pointer-events-none select-none"
          >
            {pos.label}
          </text>
        </g>
      );
    }

    if (pos.shape === "wind")
    {
      return (
        <g key={idx}>
          <path
            d={`M ${pos.x} ${pos.y + pos.h} L ${pos.x} ${pos.y + 20} Q ${pos.x + pos.w / 2} ${pos.y} ${pos.x + pos.w} ${pos.y + 20} L ${pos.x + pos.w} ${pos.y + pos.h} Z`}
            {...shapeProps}
          />
          <text
            x={pos.x + pos.w / 2}
            y={pos.y + pos.h / 2}
            textAnchor="middle"
            fill="white"
            fontSize="9"
            fontWeight="bold"
            className="pointer-events-none select-none"
          >
            {pos.label}
          </text>
        </g>
      );
    }

    if (pos.shape === "roof")
    {
      return (
        <g key={idx}>
          <rect x={pos.x} y={pos.y} width={pos.w} height={pos.h} rx="4" {...shapeProps} />
          <text
            x={pos.x + pos.w / 2}
            y={pos.y + pos.h / 2 + 3}
            textAnchor="middle"
            fill="white"
            fontSize="7"
            fontWeight="bold"
            className="pointer-events-none select-none"
          >
            {pos.label}
          </text>
        </g>
      );
    }

    // Default rectangle
    return (
      <g key={idx}>
        <rect x={pos.x} y={pos.y} width={pos.w} height={pos.h} rx="4" {...shapeProps} />
        <text
          x={pos.x + pos.w / 2}
          y={pos.y + pos.h / 2 + 3}
          textAnchor="middle"
          fill="white"
          fontSize="8"
          fontWeight="bold"
          className="pointer-events-none select-none"
        >
          {pos.label}
        </text>
      </g>
    );
  };

  if (loading)
  {
    return (
      <div className="flex justify-center items-center h-[500px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading glass catalog...</p>
        </div>
      </div>
    );
  }

  if (error)
  {
    return (
      <div className="flex flex-col justify-center items-center h-[500px] bg-red-50 rounded-2xl border border-red-200 shadow-sm">
        <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-600 font-semibold mb-2">Unable to load glass data</p>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!glassData.length)
  {
    return (
      <div className="flex flex-col justify-center items-center h-[500px] bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
        <svg className="w-16 h-16 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-slate-600 font-medium">No glass parts available for this model</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 border-b border-blue-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Select Glass Parts
        </h2>
        <p className="text-blue-100 text-sm mt-1">Model #{modelId} · {glassData.length} parts available</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 p-6">
        {/* Left: Car Top View Diagram */}
        <div className="space-y-4">
          <div className="relative h-[500px] bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden border border-slate-300 shadow-inner">
            <svg
              viewBox="0 0 620 200"
              className="w-full h-full p-4"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Car body outline (top view) */}
              <g id="car-body">
                {/* Main body */}
                <rect x="20" y="30" width="580" height="140" rx="15" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" opacity="0.6" />

                {/* Hood/Front section */}
                <rect x="20" y="30" width="80" height="140" rx="10" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1.5" opacity="0.5" />

                {/* Cabin area */}
                <rect x="120" y="45" width="380" height="110" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="1.5" opacity="0.4" />

                {/* Rear/Trunk section */}
                <rect x="520" y="40" width="80" height="120" rx="10" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1.5" opacity="0.5" />

                {/* Door separators */}
                <line x1="220" y1="45" x2="220" y2="155" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.5" />
                <line x1="420" y1="45" x2="420" y2="155" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.5" />

                {/* Labels */}
                <text x="310" y="100" textAnchor="middle" fill="#6B7280" fontSize="10" fontWeight="500" opacity="0.6">TOP VIEW</text>
              </g>

              {/* Glass parts positioned by NAGS data */}
              {glassData.map((glass, idx) => renderGlassPart(glass, idx))}
            </svg>
          </div>

          {/* Legend */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-xs text-slate-600 mb-2 font-medium">Click on glass parts to select</p>
            <div className="flex flex-wrap gap-2">
              {glassData.map((glass, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleGlass(glass)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all duration-200 border ${isSelected(glass.code)
                      ? "border-white shadow-md scale-105 opacity-100"
                      : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                  style={{
                    backgroundColor: getGlassColor(glass.type),
                    color: "white",
                  }}
                >
                  {glass.code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Selected Glass List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">
              Selected Parts ({selectedGlasses.length})
            </h3>
            {selectedGlasses.length > 0 && (
              <button
                onClick={() => setSelectedGlasses([])}
                className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All
              </button>
            )}
          </div>

          {selectedGlasses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[480px] bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
              <svg className="w-16 h-16 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <p className="text-slate-500 font-medium">No parts selected</p>
              <p className="text-slate-400 text-sm mt-1">Click on the diagram to add</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
              {selectedGlasses.map((glass) => (
                <div
                  key={glass.code}
                  className="bg-white rounded-lg p-3.5 border-l-4 hover:shadow-md transition-all duration-200 shadow-sm"
                  style={{ borderLeftColor: getGlassColor(glass.type) }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-bold text-white"
                          style={{ backgroundColor: getGlassColor(glass.type) }}
                        >
                          {glass.code}
                        </span>
                        <h4 className="font-semibold text-slate-800 text-sm truncate">
                          {glass.description}
                        </h4>
                      </div>
                      <div className="text-xs text-slate-600 space-y-0.5">
                        <p>
                          <span className="font-medium">Type:</span> {glass.type.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleGlass(glass)}
                      className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
