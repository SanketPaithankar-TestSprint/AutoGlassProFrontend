import React, { useEffect, useState, useRef } from "react";
import config from "../config";

export default function CarGlassViewer({
  modelId,
  vehicleInfo,
  onPartSelect,
}) {
  // 1) Glass catalog (left column)
  const [loading, setLoading] = useState(true);
  const [glassData, setGlassData] = useState([]);
  const [error, setError] = useState(null);

  // Multi-selection state: Array of { glass, label, parts, loading, error, isExpanded }
  const [selectedGlassTypes, setSelectedGlassTypes] = useState([]);

  // 3) Selected parts + extra info (bottom)
  const [selectedParts, setSelectedParts] = useState([]); // Array of { glass, part, glassInfo }
  const [glassInfoLoading, setGlassInfoLoading] = useState(false);
  const [glassInfoError, setGlassInfoError] = useState(null);

  // 4) Tooltip state
  const [hoveredZone, setHoveredZone] = useState(null); // { label, x, y }
  const svgRef = useRef(null);

  // 5) Expanded parts state (Global set of expanded part IDs)
  const [expandedPartIds, setExpandedPartIds] = useState(new Set());

  const togglePartExpansion = (id) => {
    setExpandedPartIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleGlassTypeExpansion = (glassCode) => {
    setSelectedGlassTypes((prev) =>
      prev.map((item) =>
        item.glass.code === glassCode
          ? { ...item, isExpanded: !item.isExpanded }
          : item
      )
    );
  };

  // ---------- helpers: convert backend data → API params ----------
  const getPrefixCd = (glass) => glass.prefix || glass.code.substring(0, 2).toUpperCase();

  const getPosCd = (glass) => {
    const prefix = getPrefixCd(glass);
    if (prefix === "DW" || prefix === "DB") return "NULL";

    const raw = (glass.position || "").toUpperCase();
    if (raw.startsWith("FRONT") || raw === "F") return "F";
    if (raw.startsWith("REAR") || raw === "R") return "R";
    return "NULL";
  };

  const getSideCd = (glass) => {
    const prefix = getPrefixCd(glass);
    if (prefix === "DW" || prefix === "DB") return "NULL";

    const raw = (glass.side || "").toUpperCase();
    if (raw.startsWith("LEFT") || raw === "L") return "L";
    if (raw.startsWith("RIGHT") || raw === "R") return "R";
    return "NULL";
  };

  // Helper to format glass name
  const formatGlassName = (glass) => {
    const prefix = getPrefixCd(glass);
    const pos = (glass.position || "").toUpperCase();
    const side = (glass.side || "").toUpperCase();

    const GLASS_CODE_NAMES = {
      DW: "Windshield",
      DB: "Back Glass",
      DD: "Door Drop Glass",
      DQ: "Door Quarter Glass",
      DR: "Door Rear Glass",
      DV: "Door Vent Glass",
    };

    const baseName = GLASS_CODE_NAMES[prefix] || glass.description || "Glass Part";

    // For Windshield and Back Glass, return just the name
    if (prefix === "DW" || prefix === "DB") return baseName;

    // Build parts: [Side] [Position] [BaseName]
    let parts = [];

    // Side
    if (side.startsWith("L")) parts.push("Left");
    else if (side.startsWith("R")) parts.push("Right");

    // Position
    if (pos.startsWith("F")) parts.push("Front");
    else if (pos.startsWith("R")) parts.push("Rear");
    else if (pos.startsWith("M")) parts.push("Middle");

    parts.push(baseName);

    return parts.join(" ");
  };

  // ---------- 1) load glass types for this model ----------
  useEffect(() => {
    if (!modelId) return;

    const fetchGlassTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `${config.pythonApiUrl}agp/v1/glass-types?model=${modelId}`,
          { headers: { accept: "application/json" } }
        );
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        const data = await res.json();
        setGlassData(data?.glass_types || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch glass data");
      } finally {
        setLoading(false);
      }
    };

    fetchGlassTypes();
  }, [modelId]);

  // ---------- 2) when a glass is selected, load its parts ----------
  const handleSelectGlass = async (glass, label) => {
    if (!glass) return;

    // Check if already selected
    if (selectedGlassTypes.some((item) => item.glass.code === glass.code)) {
      // Optional: Scroll to it or just expand it?
      // Let's just ensure it's expanded
      toggleGlassTypeExpansion(glass.code);
      return;
    }

    // Add to list with loading state
    const newItem = {
      glass,
      label: label || formatGlassName(glass), // Use formatted name if label not provided
      parts: [],
      loading: true,
      error: null,
      isExpanded: true,
    };

    setSelectedGlassTypes((prev) => [...prev, newItem]);

    try {
      const prefix_cd = getPrefixCd(glass);
      const pos_cd = getPosCd(glass);
      const side_cd = getSideCd(glass);

      const params = new URLSearchParams();
      params.append("make_model_id", modelId);
      params.append("prefix_cd", prefix_cd);

      // For Windshield (DW) and Back Glass (DB), omit pos_cd and side_cd
      if (prefix_cd !== "DW" && prefix_cd !== "DB") {
        params.append("pos_cd", pos_cd);
        params.append("side_cd", side_cd);
      }

      const url = `${config.pythonApiUrl}agp/v1/glass-parts?${params.toString()}`;
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (!res.ok) throw new Error("Failed to fetch glass parts");
      const data = await res.json();
      const glassParts = Array.isArray(data?.glass_parts)
        ? data.glass_parts
        : Array.isArray(data)
          ? data
          : [];

      // Update item with parts
      setSelectedGlassTypes((prev) =>
        prev.map((item) =>
          item.glass.code === glass.code
            ? { ...item, parts: glassParts, loading: false }
            : item
        )
      );
    } catch (e) {
      console.error(e);
      // Update item with error
      setSelectedGlassTypes((prev) =>
        prev.map((item) =>
          item.glass.code === glass.code
            ? { ...item, error: e.message || "Failed to fetch parts", loading: false }
            : item
        )
      );
    }
  };

  const handleSelectPart = async (part, glass) => {
    const partKey = `${part.nags_glass_id || ""}|${part.oem_glass_id || ""}`;
    const glassKey = glass ? glass.code : "";
    const alreadySelected = selectedParts.some(
      (p) =>
        p.part.nags_glass_id === part.nags_glass_id &&
        p.part.oem_glass_id === part.oem_glass_id &&
        p.glass.code === glassKey
    );
    if (alreadySelected) return; // Prevent duplicate selection

    let info = null;
    if (part?.nags_glass_id) {
      try {
        setGlassInfoLoading(true);
        setGlassInfoError(null);
        const res = await fetch(
          `${config.pythonApiUrl}agp/v1/glass-info?nags_glass_id=${part.nags_glass_id}`,
          { headers: { accept: "application/json" } }
        );
        if (!res.ok) throw new Error("Failed to fetch glass info");
        info = await res.json();
      } catch (e) {
        console.error(e);
        setGlassInfoError(e.message || "Failed to fetch glass info.");
      } finally {
        setGlassInfoLoading(false);
      }
    }

    onPartSelect?.({ glass: glass, part, glassInfo: info });

    setSelectedParts((prev) => [
      ...prev,
      { glass: glass, part, glassInfo: info },
    ]);
  };

  // Remove selected part by unique key
  const handleRemoveSelectedPart = (partKey) => {
    setSelectedParts((prev) =>
      prev.filter(
        (p) =>
          `${p.part.nags_glass_id || ""}|${p.part.oem_glass_id || ""}|${p.glass.code
          }` !== partKey
      )
    );
  };

  // Helper to find glass by code prefix/position/side
  const findGlass = (prefix, pos = "N/A", side = "N/A") => {
    return glassData.find((g) => {
      // Match prefix (use helper to be safe)
      const gPrefix = getPrefixCd(g);
      if (gPrefix !== prefix) return false;

      // Match position (handle null/undefined as "N/A", case-insensitive)
      const gPos = (g.position || "N/A").toUpperCase();
      const targetPos = (pos || "N/A").toUpperCase();
      if (gPos !== targetPos) return false;

      // Match side (handle null/undefined as "N/A", case-insensitive)
      const gSide = (g.side || "N/A").toUpperCase();
      const targetSide = (side || "N/A").toUpperCase();
      if (gSide !== targetSide) return false;

      return true;
    });
  };

  // Define clickable zones (7 per side + DW + DB)
  // Using a 300x520 coordinate system
  const zones = [
    {
      id: "windshield",
      label: "Windshield",
      glass: findGlass("DW", "N/A", "N/A"),
      path: "M85,140 C85,140 110,120 150,120 C190,120 215,140 215,140 L225,175 C225,175 190,185 150,185 C110,185 75,175 75,175 L85,140 Z",
    },
    {
      id: "back_glass",
      label: "Back Glass",
      glass: findGlass("DB", "N/A", "N/A"),
      path: "M80,405 C80,405 110,395 150,395 C190,395 220,405 220,405 L210,445 C210,445 180,455 150,455 C120,455 90,445 90,445 L80,405 Z",
    },

    // --- LEFT SIDE ---
    {
      id: "l_fq",
      label: "Front Quarter (left)",
      // Mapping DQ (N/A pos) to Front Quarter as fallback, or check if specific code exists
      glass: findGlass("DQ", "N/A", "Left"),
      path: "M68,170 L72,185 L52,185 C51,180 55,175 68,170 Z",
    },
    {
      id: "l_fv",
      label: "Front Vent (left)",
      glass: findGlass("DV", "Front", "Left"),
      path: "M72,188 L72,210 L52,210 L52,188 Z",
    },
    {
      id: "l_fd",
      label: "Front Door (left)",
      glass: findGlass("DD", "Front", "Left"),
      path: "M72,213 L72,270 L50,270 C48,250 48,230 52,213 Z",
    },
    {
      id: "l_md",
      label: "Middle Door (left)",
      glass: findGlass("DD", "Middle", "Left"), // Assuming "Middle" if it exists
      path: "M72,273 L72,295 L50,295 L50,273 Z",
    },
    {
      id: "l_rd",
      label: "Rear Door (left)",
      glass: findGlass("DD", "Rear", "Left"),
      path: "M72,298 L72,355 L52,355 C50,335 50,315 50,298 Z",
    },
    {
      id: "l_rv",
      label: "Rear Vent (left)",
      glass: findGlass("DV", "Rear", "Left"),
      path: "M72,358 L72,380 L54,380 L52,358 Z",
    },
    {
      id: "l_rq",
      label: "Rear Quarter (left)",
      // Using DQ again? Or maybe DR? 
      // User JSON has DQ with N/A pos. We'll map it to Rear Quarter too if needed, or just Front.
      // Let's try to map DQ to Rear Quarter primarily if Front Quarter is less common with DQ code.
      // But for now, mapping DQ to both might be ambiguous. 
      // Given the JSON, DQ is likely the Quarter glass.
      glass: findGlass("DQ", "N/A", "Left"),
      path: "M72,383 L68,400 C58,395 55,390 54,383 Z",
    },

    // --- RIGHT SIDE ---
    {
      id: "r_fq",
      label: "Front Quarter (right)",
      glass: findGlass("DQ", "N/A", "Right"),
      path: "M232,170 L228,185 L248,185 C249,180 245,175 232,170 Z",
    },
    {
      id: "r_fv",
      label: "Front Vent (right)",
      glass: findGlass("DV", "Front", "Right"),
      path: "M228,188 L228,210 L248,210 L248,188 Z",
    },
    {
      id: "r_fd",
      label: "Front Door (right)",
      glass: findGlass("DD", "Front", "Right"),
      path: "M228,213 L228,270 L250,270 C252,250 252,230 248,213 Z",
    },
    {
      id: "r_md",
      label: "Middle Door (right)",
      glass: findGlass("DD", "Middle", "Right"),
      path: "M228,273 L228,295 L250,295 L250,273 Z",
    },
    {
      id: "r_rd",
      label: "Rear Door (right)",
      glass: findGlass("DD", "Rear", "Right"),
      path: "M228,298 L228,355 L248,355 C250,335 250,315 250,298 Z",
    },
    {
      id: "r_rv",
      label: "Rear Vent (right)",
      glass: findGlass("DV", "Rear", "Right"),
      path: "M228,358 L228,380 L246,380 L248,358 Z",
    },
    {
      id: "r_rq",
      label: "Rear Quarter (right)",
      glass: findGlass("DQ", "N/A", "Right"),
      path: "M228,383 L232,400 C242,395 245,390 246,383 Z",
    },
  ];

  const handleZoneHover = (e, zone) => {
    if (!zone.glass) {
      setHoveredZone(null);
      return;
    }
    const rect = e.target.getBoundingClientRect();
    setHoveredZone({
      label: zone.label,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleZoneLeave = () => {
    setHoveredZone(null);
  };

  const renderDiagram = () => {
    return (
      <div className="relative w-full max-w-[300px] mx-auto" ref={svgRef}>
        <svg viewBox="0 0 300 520" className="w-full h-auto drop-shadow-xl">
          {/* Car Body Outline - Smooth Sedan Shape */}
          <path
            d="M75,100 
               C75,100 150,70 225,100 
               C250,110 260,130 260,160 
               L260,420 
               C260,450 250,470 225,480 
               C150,500 75,480 75,480 
               C50,470 40,450 40,420 
               L40,160 
               C40,130 50,110 75,100 Z"
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="2"
          />

          {/* Roof / Cabin Area */}
          <path
            d="M75,175 
               L225,175 
               L225,405 
               L75,405 Z"
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
                onClick={() => isAvailable && handleSelectGlass(zone.glass)}
                onMouseEnter={(e) => handleZoneHover(e, zone)}
                onMouseLeave={handleZoneLeave}
                className={`${isAvailable
                  ? "cursor-pointer hover:opacity-80"
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

  const renderPartsColumn = () => {
    if (selectedGlassTypes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 italic p-8 text-center">
          <p>
            Select a highlighted glass part on the diagram to view available
            options.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col p-4 space-y-4">
        {selectedGlassTypes.map((item) => (
          <div key={item.glass.code} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Glass Type Header (Accordion) */}
            <div
              onClick={() => toggleGlassTypeExpansion(item.glass.code)}
              className="flex items-center justify-between p-4 bg-slate-50/80 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  {item.label || formatGlassName(item.glass)}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {item.loading ? "Loading..." : `${item.parts.length} options`}
                </p>
              </div>
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${item.isExpanded ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Parts List */}
            {item.isExpanded && (
              <div className="border-t border-slate-100">
                {item.loading ? (
                  <div className="p-4 text-slate-400 text-sm">Loading parts...</div>
                ) : item.error ? (
                  <div className="p-4 text-red-400 text-sm">{item.error}</div>
                ) : !item.parts.length ? (
                  <div className="p-4 text-slate-400 text-sm">No parts available.</div>
                ) : (
                  <div className="p-3 space-y-3 bg-white">
                    {item.parts.map((part) => {
                      const partId = part.nags_glass_id || part.oem_glass_id;
                      const isExpanded = expandedPartIds.has(partId);
                      const isSelected = selectedParts.some(
                        (p) =>
                          p.part.nags_glass_id === part.nags_glass_id &&
                          p.part.oem_glass_id === part.oem_glass_id &&
                          p.glass.code === item.glass.code
                      );

                      return (
                        <div
                          key={partId}
                          className={`
                            rounded-xl border transition-all duration-200 overflow-hidden
                            ${isSelected
                              ? "border-blue-500 bg-blue-50/30 shadow-sm"
                              : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
                            }
                          `}
                        >
                          {/* Part Header */}
                          <div
                            onClick={() => togglePartExpansion(partId)}
                            className="flex items-center justify-between p-3 cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-blue-500 bg-blue-500" : "border-slate-300 bg-white"}`}>
                                {isSelected && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              <span className="font-medium text-slate-700 text-sm">
                                {part.nags_glass_id || part.part_description || "Glass Part"}
                              </span>
                            </div>
                            <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>

                          {/* Part Details */}
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-0 animate-[fadeIn_0.2s_ease-out]">
                              <div className="mt-2 pt-3 border-t border-slate-100 grid grid-cols-1 gap-2">
                                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                                  <span className="text-xs font-semibold text-slate-500">NAGS ID</span>
                                  <span className="text-sm font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">{part.nags_glass_id || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                                  <span className="text-xs font-semibold text-slate-500">OEM ID</span>
                                  <span className="text-sm font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">{part.oem_glass_id || "N/A"}</span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectPart(part, item.glass);
                                  }}
                                  className={`w-full mt-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${isSelected ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow"}`}
                                >
                                  {isSelected ? "Remove Selection" : "Select Part"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };



  // ---------- main render ----------
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-slate-50 rounded-3xl border border-slate-200">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading glass catalog…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-3xl border border-red-200 p-6 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm relative">
      {/* Header with Vehicle Info */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-900">
          {vehicleInfo?.year} {vehicleInfo?.make} {vehicleInfo?.model}
        </h3>
        <p className="text-slate-500 text-sm">
          Select a glass part from the diagram below
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column: Diagram */}
        <div className="flex flex-col items-center justify-start border-r border-slate-100 pr-0 md:pr-8">
          {renderDiagram()}

          {/* Fallback list for unmapped parts */}
          <div className="mt-8 w-full">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-medium text-slate-500 hover:text-violet-600 transition-colors">
                <span>Other Glass Parts</span>
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-2 space-y-2 pl-2 border-l-2 border-slate-100">
                {glassData
                  .filter((g) => !zones.some((z) => z.glass?.code === g.code))
                  .map((glass) => (
                    <button
                      key={glass.code}
                      onClick={() => handleSelectGlass(glass)}
                      className={`block w-full text-left text-xs py-1 px-2 rounded hover:bg-slate-50 ${selectedGlassTypes.some(item => item.glass.code === glass.code)
                        ? "text-violet-600 font-bold bg-violet-50"
                        : "text-slate-600"
                        }`}
                    >
                      {formatGlassName(glass)} ({glass.code})
                    </button>
                  ))}
                {glassData.filter(
                  (g) => !zones.some((z) => z.glass?.code === g.code)
                ).length === 0 && (
                    <div className="text-xs text-slate-400 italic py-1">
                      All parts mapped to diagram.
                    </div>
                  )}
              </div>
            </details>
          </div>
        </div>

        {/* Right column: Parts Selection */}
        <div className="flex flex-col h-full">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-100/50">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                Selected Glass Parts
              </h4>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              {renderPartsColumn()}
            </div>
          </div>


        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredZone && (
        <div
          className="fixed z-50 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: hoveredZone.x,
            top: hoveredZone.y,
          }}
        >
          {hoveredZone.label}
          <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-slate-800 transform -translate-x-1/2 rotate-45"></div>
        </div>
      )}
    </div>
  );
}
