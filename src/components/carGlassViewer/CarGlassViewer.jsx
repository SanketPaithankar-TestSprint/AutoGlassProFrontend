import React, { useEffect, useState } from "react";
import { Select } from "antd";
import config from "../../config";

const { Option, OptGroup } = Select;
import GLASS_CODE_NAMES from "../../const/glassCodeNames";
import {
  getPrefixCd,
  getPosCd,
  getSideCd,
  findGlassInCatalog,
  GLASS_ZONES_CONFIG
} from "./carGlassHelpers";
import Diagram from "./Diagram";

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

  // 4) Tooltip state
  const [hoveredZone, setHoveredZone] = useState(null); // { label, x, y }

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
      params.append("pos_cd", pos_cd);
      params.append("side_cd", side_cd);

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

    // Performance optimization: Removed api/v1/glass-info call
    const info = null;

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

  // Define clickable zones using config
  const zones = GLASS_ZONES_CONFIG.map((z) => ({
    ...z,
    glass: findGlassInCatalog(glassData, z.criteria.prefix, z.criteria.pos, z.criteria.side),
  }));

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

  const renderPartsColumn = () => {
    if (selectedGlassTypes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 italic p-8 text-center">
          <p>
            Select a glass part from the dropdown to view available options.
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
                          </div>
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
          Select a glass part from the dropdown to view available options
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column: Diagram */}
        <div className="flex flex-col items-center justify-start border-r border-slate-100 pr-0 md:pr-8">
          <div className="w-full mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Glass Type</label>
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
          <Diagram
            zones={zones}
            selectedGlassTypes={selectedGlassTypes}
            onZoneHover={handleZoneHover}
            onZoneLeave={handleZoneLeave}
          />

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
        <div className="flex flex-col h-full bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Avaliable Options
            </h4>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {renderPartsColumn()}
          </div>

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
                      className="group flex flex-col bg-blue-50 border border-blue-200 rounded-lg p-2 pr-7 relative shadow-sm hover:shadow-md transition-all animate-[fadeIn_0.2s_ease-out]"
                      title={`${item.part.part_description || "Glass Part"} - ${item.glass.code}`}
                    >
                      <button
                        onClick={() => handleRemoveSelectedPart(partKey)}
                        className="absolute top-1 right-1 p-1 text-blue-400 hover:text-red-500 hover:bg-white rounded-full transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      <span className="text-xs font-bold text-slate-700 leading-tight">
                        {item.part.nags_glass_id || "Unknown ID"}
                      </span>
                      <span className="text-[10px] text-slate-500 line-clamp-1 max-w-[120px]">
                        {item.label || item.part.part_description || formatGlassName(item.glass)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
