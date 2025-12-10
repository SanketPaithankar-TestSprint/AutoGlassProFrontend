import React, { useEffect, useState } from "react";
import { Select } from "antd";
import config from "../../config";

const { Option, OptGroup } = Select;
import GLASS_CODE_NAMES from "../../const/glassCodeNames";
import {
  getPrefixCd,
  getPosCd,
  getSideCd
} from "./carGlassHelpers";

export default function CarGlassViewer({
  modelId,
  vehicleInfo,
  onPartSelect,
  onPartDeselect,
}) {
  // 1) Glass catalog (left column)
  const [loading, setLoading] = useState(true);
  const [glassData, setGlassData] = useState([]);
  const [glassGroups, setGlassGroups] = useState({});
  const [error, setError] = useState(null);

  // Multi-selection state: Array of { glass, label, parts, loading, error, isExpanded }
  const [selectedGlassTypes, setSelectedGlassTypes] = useState([]);

  // 3) Selected parts + extra info (bottom)
  const [selectedParts, setSelectedParts] = useState([]); // Array of { glass, part, glassInfo }
  const [glassInfoLoading, setGlassInfoLoading] = useState(false);
  const [glassInfoError, setGlassInfoError] = useState(null);



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

  const imageSrc = vehicleInfo?.image ? `data:image/png;base64,${vehicleInfo.image}` : null;

  // Helper to format glass name
  const formatGlassName = (glass) => {
    const prefix = getPrefixCd(glass);
    const pos = (glass.position || "").toUpperCase();
    const side = (glass.side || "").toUpperCase();

    const codeObj = GLASS_CODE_NAMES.find(obj => obj.code === prefix);
    const baseName = codeObj ? codeObj.name : (glass.description || "Glass Part");

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
        setGlassGroups(data?.organized_by_type || {});
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

    // Replace existing selection with new one (Single selection mode for specific glass type)
    const newItem = {
      glass,
      label: label || formatGlassName(glass),
      parts: [],
      loading: true,
      error: null,
      isExpanded: true,
    };

    setSelectedGlassTypes([newItem]);

    try {
      const prefix_cd = getPrefixCd(glass);
      const pos_cd = getPosCd(glass);
      const side_cd = getSideCd(glass);

      const params = new URLSearchParams();
      params.append("make_model_id", modelId);
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

  const handleSelectPart = (part, glass) => {
    const glassKey = glass ? glass.code : "";
    const alreadySelected = selectedParts.some(
      (p) =>
        p.part.nags_glass_id === part.nags_glass_id &&
        p.part.oem_glass_id === part.oem_glass_id &&
        p.glass.code === glassKey
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
        (p) =>
          `${p.part.nags_glass_id || ""}|${p.part.oem_glass_id || ""}|${p.glass.code}` !== partKey
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
  const handleRemoveGlassType = (e, glassCode) => {
    e.stopPropagation(); // prevent accordion toggle

    // 1. Remove from selectedGlassTypes
    setSelectedGlassTypes((prev) => prev.filter(item => item.glass.code !== glassCode));

    // 2. Identify parts to remove
    const partsToRemove = selectedParts.filter(p => p.glass.code === glassCode);

    // 3. Update selectedParts
    setSelectedParts((prev) => prev.filter(p => p.glass.code !== glassCode));

    // 4. Notify parent for each removed part
    if (partsToRemove.length > 0) {
      partsToRemove.forEach(p => {
        const partKey = `${p.part.nags_glass_id || ""}|${p.part.oem_glass_id || ""}|${p.glass.code}`;
        if (onPartDeselect) {
          onPartDeselect(partKey);
        } else if (typeof onPartSelect === 'function') {
          onPartSelect({ remove: true, partKey });
        }
      });
    }
  };



  const renderPartsColumn = () => {
    const item = selectedGlassTypes[0]; // Only one selected at a time now

    if (!item) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 italic p-8 text-center">
          <p>
            Select a glass part from the dropdown to view available options.
          </p>
        </div>
      );
    }

    return (
<<<<<<< Updated upstream
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
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleRemoveGlassType(e, item.glass.code)}
                  className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                  title="Remove glass type"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${item.isExpanded ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
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
                  <div className="divide-y divide-slate-100 bg-white">
                    {item.parts.map((part) => {
                      const partId = part.nags_glass_id || part.oem_glass_id;
                      const partKey = `${part.nags_glass_id || ""}|${part.oem_glass_id || ""}|${item.glass.code}`;
                      const isSelected = selectedParts.some(
                        (p) =>
                          p.part.nags_glass_id === part.nags_glass_id &&
                          p.part.oem_glass_id === part.oem_glass_id &&
                          p.glass.code === item.glass.code
                      );

                      return (
                        <div
                          key={partId}
                          onClick={() => {
                            if (isSelected) {
                              handleRemoveSelectedPart(partKey);
                            } else {
                              handleSelectPart(part, item.glass);
                            }
                          }}
                          className={`
                            group flex items-center gap-3 p-3 cursor-pointer transition-colors
                            ${isSelected ? "bg-blue-50/50" : "hover:bg-slate-50"}
                          `}
                        >
                          {/* Checkbox */}
                          <div
                            className={`
                              w-5 h-5 rounded border flex items-center justify-center transition-colors
                              ${isSelected
                                ? "bg-blue-600 border-blue-600"
                                : "bg-white border-slate-300 group-hover:border-blue-400"
                              }
                            `}
                          >
                            {isSelected && (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className={`font-medium text-sm ${isSelected ? "text-blue-900" : "text-slate-700"}`}>
                                {part.nags_glass_id || "Unknown ID"}
                              </span>
                              {part.oem_glass_id && (
                                <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                  OEM: {part.oem_glass_id}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                              {part.part_description || "Glass Part"}
                            </p>
                            {part.glass_info?.ta && (
                              <div className="flex gap-3 mt-1 text-xs text-slate-600">
                                <span className="font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  TA: {part.glass_info.ta}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
=======
      <div className="flex flex-col h-full bg-white">
        {/* Header for the specific glass type */}
        <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">
            {item.label}
          </h3>
          <span className="text-xs text-slate-500">
            {item.loading ? "Loading..." : `${item.parts.length} options`}
          </span>
        </div>

        {/* Parts List (Flat List) */}
        <div className="flex-1 overflow-y-auto p-2">
          {item.loading ? (
            <div className="text-slate-400 text-sm p-4 text-center">Loading parts...</div>
          ) : item.error ? (
            <div className="text-red-400 text-sm p-4 text-center">{item.error}</div>
          ) : !item.parts.length ? (
            <div className="text-slate-400 text-sm p-4 text-center">No parts available.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {item.parts.map((part) => {
                const partKey = `${part.nags_glass_id || ""}|${part.oem_glass_id || ""}|${item.glass.code}`;
                // Check if selected
                const isSelected = selectedParts.some(
                  (p) => `${p.part.nags_glass_id || ""}|${p.part.oem_glass_id || ""}|${p.glass.code}` === partKey
                );

                return (
                  <div
                    key={partKey}
                    onClick={() => {
                      if (isSelected) {
                        handleRemoveSelectedPart(partKey);
                      } else {
                        handleSelectPart(part, item.glass);
                      }
                    }}
                    className={`
                                  group flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                  ${isSelected
                        ? "bg-blue-50 border-blue-200 shadow-sm"
                        : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm"
                      }
                              `}
                  >
                    {/* Selection Indicator */}
                    <div className={`
                                  w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors
                                  ${isSelected
                        ? "bg-blue-500 border-blue-500"
                        : "border-slate-300 group-hover:border-blue-400"
                      }
                             `}>
                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm font-semibold truncate ${isSelected ? "text-blue-900" : "text-slate-800"}`}>
                          {part.nags_glass_id || "Unknown"}
                          {part.glass_info?.ta ? <span className="text-slate-500 font-normal ml-1">({part.glass_info.ta})</span> : ""}
                        </span>
                        {part.oem_glass_id && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded border border-slate-200">
                            OEM: {part.oem_glass_id}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 truncate">
                        {part.part_description || "Glass Part"}
                      </span>
                    </div>
>>>>>>> Stashed changes
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
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
<<<<<<< Updated upstream
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm relative">
      {/* Header with Vehicle Info */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-900">
          {vehicleInfo?.description}
          </h3>
        <p className="text-slate-500 text-sm">
          Select a glass part from the dropdown to view available options
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column: Diagram */}
        <div className="flex flex-col items-center justify-start border-r border-slate-100 pr-0 md:pr-8">
          <div className="w-full mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Glass Type</label>
=======
    <div className="bg-white p-0 h-full flex flex-col">
      {/* Top header removed, description moved below image */}

      <div className="flex flex-col md:flex-row gap-2 h-full overflow-hidden">
        {/* Left column: Diagram */}
        <div className="flex flex-col items-center justify-start border-r border-slate-100 pr-0 md:pr-2 w-full md:w-1/3 shrink-0">
          <div className="w-full mb-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">Select Glass Type</label>
>>>>>>> Stashed changes
            <Select
              className="w-full"
              placeholder="Select a glass part..."
              onChange={(code) => {
                const selectedGlass = glassData.find(g => g.code === code);
                if (selectedGlass) handleSelectGlass(selectedGlass);
              }}
              showSearch
              optionFilterProp="children"
            >
              {Object.entries(glassGroups).map(([type, items]) => (
                <OptGroup key={type} label={type.replace(/_/g, " ")}>
                  {items.map(item => (
                    <Option key={item.code} value={item.code}>
                      {item.description}
                    </Option>
                  ))}
                </OptGroup>
              ))}
            </Select>
          </div>
          {imageSrc && (
<<<<<<< Updated upstream
            <div className="flex flex-col items-center w-full">
              <img
                src={imageSrc}
                alt="Vehicle Graphic"
                width="100%"
                height="auto"
                className="max-w-md w-full rounded-lg shadow-lg border border-gray-100 object-contain bg-white p-4 mb-4"
              />
=======
            <div className="flex flex-col items-center w-full mt-2">
              <div className="relative w-full h-32 md:h-40 lg:h-48 flex items-center justify-center">
                <img
                  src={imageSrc}
                  alt="Vehicle Graphic"
                  className="max-w-full max-h-full w-auto h-auto object-contain p-1"
                />
              </div>
              <h3 className="text-sm font-bold text-slate-900 text-center mt-1">
                {vehicleInfo?.description}
              </h3>
              <p className="text-slate-500 text-xs text-center">
                Select a glass part from the dropdown
              </p>
>>>>>>> Stashed changes
            </div>
          )}

        </div>

        {/* Right column: Parts Selection */}
        <div className="flex flex-col flex-1 bg-white border border-slate-200 overflow-hidden min-h-0">
          <div className="p-2 border-b border-slate-200 bg-slate-50">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Avaliable Options
            </h4>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {renderPartsColumn()}
          </div>

<<<<<<< Updated upstream
          {/* Sticky Selected Items Tray */}
          {selectedParts.length > 0 && (
            <div className="bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 flex flex-col gap-3 relative z-10">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Selected Items ({selectedParts.length})
                </h5>
                <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => {
                  // Optional: clear all logic if needed, or loops
                }}>
                  {/* Clear All? */}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {selectedParts.map((item) => {
                  const partKey = `${item.part.nags_glass_id || ""}|${item.part.oem_glass_id || ""}|${item.glass.code}`;
                  return (
                    <div
                      key={partKey}
                      className="group flex flex-col bg-blue-50 border border-blue-200 rounded-lg p-3 pr-8 relative shadow-sm hover:shadow-md transition-all animate-[fadeIn_0.2s_ease-out] min-w-[140px]"
                      title={`${item.part.part_description || "Glass Part"} - ${item.glass.code}`}
                    >
                      <button
                        onClick={() => handleRemoveSelectedPart(partKey)}
                        className="absolute top-1 right-1 p-1 text-blue-400 hover:text-red-500 hover:bg-white rounded-full transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      <span className="text-sm font-bold text-slate-700 leading-tight mb-0.5">
                        {item.part.nags_glass_id || "Unknown ID"}
                      </span>
                      <span className="text-xs text-slate-500 line-clamp-1 max-w-[160px] mb-1">
                        {item.label || item.part.part_description || formatGlassName(item.glass)}
                      </span>
                      {(item.glassInfo?.ta || item.part.glass_info?.ta) && (
                        <div className="mt-auto pt-1 border-t border-blue-100">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            TA: {item.glassInfo?.ta || item.part.glass_info?.ta}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
=======
>>>>>>> Stashed changes
        </div>
      </div>


    </div>
  );
}
