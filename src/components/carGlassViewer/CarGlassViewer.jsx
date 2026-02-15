import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Select, Modal, Dropdown } from "antd";
import config from "../../config";

const { Option, OptGroup } = Select;
import { DeleteOutlined, DownOutlined } from "@ant-design/icons";
import GLASS_CODE_NAMES from "../../const/glassCodeNames";
import {
  getPrefixCd,
  getPosCd,
  getSideCd
} from "./carGlassHelpers";

export default function CarGlassViewer({
  modelId,
  vehId,
  vehicleInfo,
  onPartSelect,
  onPartDeselect,
  externalRemovedPartKey, // New prop: when set, remove this part from internal state
  preSelectedGlassCodes = [], // New prop: array of glass codes to auto-select
}) {
  // 1) Glass catalog (left column)
  const [loading, setLoading] = useState(false); // Don't show loading on initial mount
  const [initialLoadDone, setInitialLoadDone] = useState(false); // Track if initial glass types load is done
  const [glassData, setGlassData] = useState([]);
  const [glassGroups, setGlassGroups] = useState({});
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const triggerRef = useRef(null);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });

  // Update coords when menu opens
  useEffect(() => {
    if (isMenuOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      setDropdownCoords({
        top: rect.bottom + scrollY + 4,
        left: rect.left + scrollX
      });
    }
  }, [isMenuOpen]);

  // Active viewing state (master-detail pattern)
  const [selectedGlassCodes, setSelectedGlassCodes] = useState([]); // Array of strings (codes)
  const [loadedPartsMap, setLoadedPartsMap] = useState({}); // { [code]: { loading, error, data } }

  // Helper to handle image load with minimum display time
  const handleImageLoad = () => {
    setTimeout(() => {
      setImageLoading(false);
    }, 300); // Show loader for at least 300ms
  };

  const handleImageError = () => {
    setImageLoading(false);
  };

  // 3) Selected parts + extra info (bottom)
  const [selectedParts, setSelectedParts] = useState([]); // Array of { glass, part, glassInfo }

  // Handle external removal from QuotePanel
  useEffect(() => {
    if (externalRemovedPartKey) {
      setSelectedParts((prev) =>
        prev.filter(
          (p) => {
            const nagsId = p.part.nags_id || p.part.nags_glass_id;
            const oemId = p.part.oem_glass_id;
            const featureSpan = p.part.feature_span || "";
            return `${nagsId || ""}|${featureSpan}|${oemId || ""}|${p.glass.code}` !== externalRemovedPartKey;
          }
        )
      );
    }
  }, [externalRemovedPartKey]);

  // ---------- helpers: convert backend data → API params ----------

  const imageSrc = vehicleInfo?.image ? `data:image/png;base64,${vehicleInfo.image}` : null;

  // Helper to format glass name
  const formatGlassName = (glass) => {
    const prefix = getPrefixCd(glass);
    const pos = (glass.position || "").toUpperCase();
    const side = (glass.side || "").toUpperCase();

    const codeObj = GLASS_CODE_NAMES.find(obj => obj.code === prefix);
    const baseName = codeObj ? codeObj.name : (glass.description || "");

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

  // Helper to format glass name to match Mega Menu logic
  const getFormattedLabel = (code) => {
    const item = glassData.find(g => g.code === code);
    if (!item) return code;

    // Build label from API fields: [Side] [Position] [Type]
    const parts = [];

    // Add side if present
    if (item.side) {
      parts.push(item.side);
    }

    // Add position if present
    if (item.position) {
      parts.push(item.position);
    }

    // Add type (always present)
    if (item.type) {
      parts.push(item.type);
    }

    // Join parts with spaces, or fallback to code
    return parts.length > 0 ? parts.join(" ") : code;
  };

  // ---------- 1) load glass types for this model ----------
  useEffect(() => {
    if (!modelId) return;

    const fetchGlassTypes = async () => {
      try {
        // Don't show loading spinner on initial load - do it silently
        setError(null);

        // Build URL with veh_id and make_model_id parameters
        const params = new URLSearchParams();
        if (vehId) params.append("veh_id", vehId);
        params.append("make_model_id", modelId);

        const url = `${config.pythonApiUrl}agp/v1/glass-types?${params.toString()}`;
        const res = await fetch(url, { headers: { accept: "application/json" } });

        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        const data = await res.json();

        // New API returns data already grouped by type
        // Map API group names to frontend display names
        const groupMapping = {
          "Windshield": "Primary Glass",
          "Back Window": "Primary Glass",
          "Flat Windshield": "Primary Glass",
          "Door": "Side Glass",
          "Side": "Side Glass",
          "Vent": "Vent Glass",
          "Quarter": "Quarter Glass",
          "Roof": "Roof Glass",
          "Partition": "Roof Glass",
          "Flat": "Roof Glass",
          "Slider": "Roof Glass",
          "Special Part": "Roof Glass"
        };

        const newGroups = {
          "Primary Glass": [],
          "Side Glass": [],
          "Vent Glass": [],
          "Quarter Glass": [],
          "Roof Glass": []
        };

        const allGlassTypes = [];

        // Process grouped data from API
        Object.keys(data).forEach(apiGroupName => {
          const items = data[apiGroupName];
          if (Array.isArray(items)) {
            items.forEach(item => {
              // Add to flat array for backward compatibility
              allGlassTypes.push(item);

              // Map to frontend group
              const frontendGroup = groupMapping[apiGroupName] || "Side Glass";
              if (newGroups[frontendGroup]) {
                newGroups[frontendGroup].push(item);
              }
            });
          }
        });

        setGlassData(allGlassTypes);
        setGlassGroups(newGroups);
        setInitialLoadDone(true); // Mark initial load as complete

      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch glass data");
        setInitialLoadDone(true); // Mark as done even on error
      }
    };

    fetchGlassTypes();
  }, [modelId, vehId]);

  // ---------- 1.5) Handle Pre-selection ----------
  useEffect(() => {
    if (!preSelectedGlassCodes || preSelectedGlassCodes.length === 0 || glassData.length === 0) return;

    const newSelections = [];
    preSelectedGlassCodes.forEach(code => {
      // Find matching glass object
      const glass = glassData.find(g => g.code === code);
      if (glass && !selectedGlassCodes.includes(code)) {
        newSelections.push(code);

        // Trigger fetch if not loaded
        if (!loadedPartsMap[code] || loadedPartsMap[code].error) {
          fetchGlassParts(glass);
        }
      }
    });

    if (newSelections.length > 0) {
      setSelectedGlassCodes(prev => [...prev, ...newSelections]);
    }

  }, [glassData, preSelectedGlassCodes]);

  // ---------- 2) when a glass is selected, load its parts ----------
  const toggleGlassSelection = async (glass) => {
    if (!glass) return;
    const code = glass.code;

    // Check if currently selected
    const isSelected = selectedGlassCodes.includes(code);

    if (isSelected) {
      // Deselect: Remove from selected list
      setSelectedGlassCodes(prev => prev.filter(c => c !== code));
    } else {
      // Select: Add to list
      setSelectedGlassCodes(prev => [...prev, code]);

      // If data not loaded yet, fetch it
      if (!loadedPartsMap[code] || loadedPartsMap[code].error) {
        fetchGlassParts(glass);
      }
    }
  };

  const fetchGlassParts = async (glass) => {
    const code = glass.code;
    // Set loading state for this glass
    setLoadedPartsMap(prev => ({ ...prev, [code]: { loading: true, error: null, data: [] } }));

    try {
      const prefix_cd = getPrefixCd(glass);
      const pos_cd = getPosCd(glass);
      const side_cd = getSideCd(glass);

      const params = new URLSearchParams();
      params.append("make_model_id", modelId);

      // Add veh_id if available (overrides make_model_id per API docs)
      if (vehId) {
        params.append("veh_id", vehId);
      }

      if (prefix_cd) params.append("prefix_cd", prefix_cd);
      if (pos_cd && pos_cd !== "NULL") params.append("pos_cd", pos_cd);
      if (side_cd && side_cd !== "NULL") params.append("side_cd", side_cd);

      const url = `${config.pythonApiUrl}agp/v1/glass-parts?${params.toString()}`;
      const res = await fetch(url, { headers: { accept: "application/json" } });
      const data = await res.json();
      const glassParts = Array.isArray(data?.glass_parts)
        ? data.glass_parts
        : Array.isArray(data)
          ? data
          : [];

      setLoadedPartsMap(prev => ({ ...prev, [code]: { loading: false, error: null, data: glassParts } }));

    } catch (e) {
      console.error(e);
      setLoadedPartsMap(prev => ({ ...prev, [code]: { loading: false, error: e.message || "Failed to fetch parts", data: [] } }));
    }
  };

  const handleSelectPart = (part, glass) => {
    const glassKey = glass ? glass.code : "";
    const nagsId = part.nags_id || part.nags_glass_id;
    const oemId = part.oem_glass_id;
    const featureSpan = part.feature_span || "";

    const alreadySelected = selectedParts.some(
      (p) => {
        const pNagsId = p.part.nags_id || p.part.nags_glass_id;
        const pOemId = p.part.oem_glass_id;
        const pFeatureSpan = p.part.feature_span || "";
        return pNagsId === nagsId &&
          pFeatureSpan === featureSpan &&
          pOemId === oemId &&
          p.glass.code === glassKey;
      }
    );
    if (alreadySelected) return; // Prevent duplicate selection

    // Use nested glass_info from API response
    const info = part.glass_info || null;

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
        (p) => {
          const nagsId = p.part.nags_id || p.part.nags_glass_id;
          const oemId = p.part.oem_glass_id;
          const featureSpan = p.part.feature_span || "";
          return `${nagsId || ""}|${featureSpan}|${oemId || ""}|${p.glass.code}` !== partKey;
        }
      )
    );
    // Notify parent
    if (onPartDeselect) {
      onPartDeselect(partKey);
    } else if (typeof onPartSelect === 'function') {
      onPartSelect({ remove: true, partKey });
    }
  };

  // Remove entire glass type selection
  // Remove entire glass type selection
  const handleRemoveGlassType = (e, glassCode) => {
    e.stopPropagation();

    // 1. Remove from selectedGlassCodes
    setSelectedGlassCodes((prev) => prev.filter(c => c !== glassCode));

    // 2. Identify parts to remove
    const partsToRemove = selectedParts.filter(p => p.glass.code === glassCode);

    // 3. Update selectedParts
    setSelectedParts((prev) => prev.filter(p => p.glass.code !== glassCode));

    // 4. Notify parent for each removed part
    if (partsToRemove.length > 0) {
      partsToRemove.forEach(p => {
        const partKey = `${p.part.nags_id || p.part.nags_glass_id || ""}|${p.part.feature_span || ""}|${p.part.oem_glass_id || ""}|${p.glass.code}`;
        if (onPartDeselect) {
          onPartDeselect(partKey);
        } else if (typeof onPartSelect === 'function') {
          onPartSelect({ remove: true, partKey });
        }
      });
    }
  };



  const renderPartsColumn = () => {
    if (selectedGlassCodes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 italic p-4 text-center">
          <p className="text-sm">
            Select one or more glass types from the left to view available parts.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col space-y-4 pt-0 p-2">
        {selectedGlassCodes.map(code => {
          const glassState = loadedPartsMap[code];
          const glassObj = glassData.find(g => g.code === code);
          const label = getFormattedLabel(code);

          if (!glassState || glassState.loading) {
            return (
              <div key={code} className="border border-slate-200 rounded p-4 text-center bg-slate-50">
                <p className="text-xs font-bold text-slate-700 mb-2">{label}</p>
                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            );
          }
          if (glassState.error) {
            return (
              <div key={code} className="border border-red-200 rounded p-4 text-center bg-red-50">
                <p className="text-xs font-bold text-red-700 mb-2">{label}</p>
                <p className="text-xs text-red-500">{glassState.error}</p>
              </div>
            );
          }

          const parts = glassState.data || [];
          if (parts.length === 0) {
            return (
              <div key={code} className="border border-slate-100 rounded p-4 text-center bg-slate-50">
                <p className="text-xs font-bold text-slate-500">{label} - No Parts Found</p>
              </div>
            );
          }

          return (
            <div key={code} className="flex flex-col space-y-1">
              <div className="flex items-center justify-between gap-2 pb-1 group/header">
                <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wide">{label}</span>
                <button
                  onClick={(e) => handleRemoveGlassType(e, code)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                  title="Remove this glass type"
                >
                  <DeleteOutlined style={{ fontSize: '14px' }} />
                </button>
              </div>
              {parts.map((part, index) => {
                const nagsId = part.nags_id || part.nags_glass_id;
                const oemId = part.oem_glass_id;
                const featureSpan = part.feature_span || "";
                const partId = nagsId || oemId;
                const partKey = `${nagsId || ""}|${featureSpan}|${oemId || ""}|${code}`;

                const isSelected = selectedParts.some(
                  (p) => {
                    const pNagsId = p.part.nags_id || p.part.nags_glass_id;
                    const pOemId = p.part.oem_glass_id;
                    const pFeatureSpan = p.part.feature_span || "";
                    return pNagsId === nagsId &&
                      pFeatureSpan === featureSpan &&
                      pOemId === oemId &&
                      p.glass.code === code;
                  }
                );

                return (
                  <div
                    key={`${partId}_${index}`}
                    onClick={() => {
                      if (isSelected) {
                        handleRemoveSelectedPart(partKey);
                      } else {
                        handleSelectPart(part, glassObj);
                      }
                    }}
                    className={`
                                group flex items-start sm:items-center gap-3 p-1.5 cursor-pointer transition-all border rounded-lg mb-1 relative
                                ${isSelected
                        ? "bg-[#EFF6FF] border-blue-500 shadow-sm z-10"
                        : "bg-white border-transparent border-b-slate-100 hover:bg-blue-50 hover:border-blue-200"
                      }
                            `}
                  >
                    {/* Checkbox */}
                    <div
                      className={`
                                w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0
                                ${isSelected
                          ? "bg-blue-600 border-blue-600"
                          : "bg-white border-slate-300 group-hover:border-blue-400"
                        }
                                `}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Info */}
                    {/* Info Wrapper - Flex Row */}
                    <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
                      {/* LEFT SIDE: ID & Description */}
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className={`font-bold text-xs ${isSelected ? "text-blue-900" : "text-slate-800"}`}>
                          {nagsId || "Unknown ID"}
                          {part.feature_span ? ` ${part.feature_span}` : (part.glass_info?.ta ? ` ${part.glass_info.ta}` : "")}
                          {part.qualifiers && part.qualifiers.length > 0 ? ` (${part.qualifiers.join(", ")})` : ""}
                        </span>
                        <p className="text-[10px] text-slate-500 truncate leading-tight">
                          {part.part_description || ""}
                        </p>
                      </div>

                      {/* RIGHT SIDE: OEM & Price (Aligned right, side by side or stacked based on space, but user asked for one line) */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* OEM Badge */}
                        {part.OEMS && part.OEMS.length > 1 ? (
                          <div onClick={(e) => e.stopPropagation()}>
                            <Dropdown
                              menu={{
                                items: part.OEMS.map(o => ({ key: o, label: <span className="text-[10px] font-mono font-bold">{o}</span> })),
                                onClick: () => { } // Display only
                              }}
                              trigger={['click']}
                            >
                              <span className="cursor-pointer flex items-center gap-1 text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0 border border-slate-200 hover:border-blue-400 transition-colors">
                                {part.OEMS[0]} <DownOutlined style={{ fontSize: '8px' }} />
                              </span>
                            </Dropdown>
                          </div>
                        ) : (oemId || (part.OEMS && part.OEMS.length === 1)) ? (
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0 border border-slate-200">
                            OEM: {oemId || part.OEMS[0]}
                          </span>
                        ) : null}

                        {/* Price Badge */}
                        {part.list_price && (
                          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded shrink-0 border border-slate-200">
                            ${part.list_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  // Only show loading if glass data failed to load
  if (error && !initialLoadDone) {
    return (
      <div className="flex justify-center items-center h-full bg-slate-50 border border-slate-200">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading glass catalog…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 text-xs text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-transparent p-0 h-full flex flex-col">
      {/* Top header removed, description moved below image */}
      <div className="flex flex-col md:flex-row gap-2 h-full overflow-hidden">
        {/* Left column: Diagram & Glass Selection */}
        <div className="flex flex-col items-center justify-start bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] rounded-lg border-0 pr-0 w-full md:w-1/3 shrink-0 relative z-0">
          <div className="w-full mb-2 relative px-2 pt-2">
            <label className="block text-sm font-bold text-slate-800 mb-2">Select Glass Type</label>


            {/* ... inside CarGlassViewer component ... */}

            {/* Custom Mega Menu Trigger */}
            {(() => {
              const isAnyLoading = selectedGlassCodes.some(code => loadedPartsMap[code]?.loading);
              return (
                <div
                  ref={triggerRef}
                  className="w-full border border-slate-300 rounded px-3 py-2 bg-white cursor-pointer flex items-center justify-between hover:border-violet-500 transition-colors"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isAnyLoading && (
                      <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin shrink-0" />
                    )}
                    <span className="text-sm text-slate-700 truncate">
                      {selectedGlassCodes.length > 0
                        ? selectedGlassCodes.map(c => getFormattedLabel(c)).join(", ")
                        : "Select Glass Type"
                      }
                    </span>
                  </div>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              );
            })()}

            {/* Mega Menu Overlay (Portal) */}
            {isMenuOpen && ReactDOM.createPortal(
              <div
                className="fixed inset-0 z-[9999]"
                onClick={() => setIsMenuOpen(false)}
              >
                {/* Dropdown Content */}
                <div
                  className="absolute bg-white border border-slate-200 shadow-xl rounded-lg flex flex-col max-h-[70vh] overflow-hidden"
                  style={{
                    top: dropdownCoords.top,
                    left: Math.max(8, Math.min(dropdownCoords.left, window.innerWidth - 320)),
                    width: Math.min(480, window.innerWidth - 16),
                    maxWidth: '95vw',
                  }}
                  onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-2 gap-y-3 p-3 overflow-y-auto">
                    {[
                      { name: "Primary", items: glassGroups["Primary Glass"] || [] },
                      { name: "Side Glass", items: glassGroups["Side Glass"] || [] },
                      { name: "Vent", items: glassGroups["Vent Glass"] || [] },
                      { name: "Quarter", items: glassGroups["Quarter Glass"] || [] },
                      { name: "Roof", items: glassGroups["Roof Glass"] || [] }
                    ].map((group, groupIndex) => (
                      <div key={group.name} className="flex flex-col gap-1.5">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1 mb-0.5">
                          {group.name}
                        </h3>
                        <div className="flex flex-col gap-0.5">
                          {group.items.length > 0 ? (
                            group.items.map(item => {
                              const isSelected = selectedGlassCodes.includes(item.code);

                              // Build label from API fields: [Side] [Position] [Type]
                              const parts = [];

                              if (item.side) parts.push(item.side);
                              if (item.position) parts.push(item.position);
                              if (item.type) parts.push(item.type);

                              const label = parts.length > 0 ? parts.join(" ") : item.code;

                              return (
                                <div
                                  key={item.code}
                                  onClick={() => {
                                    toggleGlassSelection(item);
                                    setIsMenuOpen(false);
                                  }}
                                  className={`
                                    flex items-start gap-2 p-1.5 rounded cursor-pointer transition-colors text-xs
                                    ${isSelected ? "bg-blue-50 text-blue-800" : "hover:bg-slate-50 text-slate-600"}
                                  `}
                                >
                                  <div className={`mt-0.5 w-3 h-3 rounded border flex items-center justify-center shrink-0 ${isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}>
                                    {isSelected && (
                                      <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className="leading-tight">{label}</span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-[10px] text-slate-300 italic py-0.5">None</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>,
              document.body
            )}

            {/* Old Overlay removed */}
            {imageSrc && (
              <>
                <div
                  className="flex flex-col items-center w-full mt-4 relative z-1 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setImageModalOpen(true);
                    setImageLoading(true);
                  }}
                  title="Click to enlarge"
                >
                  <div className="relative w-full h-48 flex items-center justify-center bg-slate-50">
                    {imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded z-10">
                        <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <img
                      src={imageSrc}
                      alt="Vehicle Graphic"
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  </div>
                </div>

                <Modal
                  open={imageModalOpen}
                  footer={null}
                  onCancel={() => setImageModalOpen(false)}
                  width={800}
                  centered
                  bodyStyle={{ padding: 0 }}
                  destroyOnClose
                >
                  <div className="p-4 flex items-center justify-center bg-white rounded-lg relative min-h-[400px]">
                    {imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded z-10">
                        <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <img
                      src={imageSrc}
                      alt="Vehicle Graphic Large"
                      className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  </div>
                </Modal>
              </>
            )}
          </div>
        </div>

        {/* Right column: Parts Selection */}
        <div className="flex flex-col flex-1 bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] rounded-lg border-0 overflow-hidden min-h-0">
          <div className="px-2 py-1 bg-white flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              {selectedGlassCodes.length > 0
                ? `Available Options (${selectedGlassCodes.length} Selected)`
                : "Available Options"
              }
            </h4>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {renderPartsColumn()}
          </div>

        </div>
      </div>


    </div>
  );
}
