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

  // Active viewing state (master-detail pattern)
  const [activeGlassTypeCode, setActiveGlassTypeCode] = useState(null);
  const [activeGlassParts, setActiveGlassParts] = useState({ loading: false, error: null, data: [] });

  // 3) Selected parts + extra info (bottom)
  const [selectedParts, setSelectedParts] = useState([]); // Array of { glass, part, glassInfo }

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

        const rawTypes = data?.glass_types || [];
        setGlassData(rawTypes);

        // Custom Grouping Logic
        // Primary: DW (Windshield), DB (Back Glass)
        // Side: DD (Door), DV (Vent), DQ (Quarter)
        // Roof: DR (Roof)
        const newGroups = {
          "Primary Glass": [],
          "Side Glass": [],
          "Roof Glass": []
        };
        const others = [];

        rawTypes.forEach(t => {
          const code = t.code; // e.g. "DW"
          const desc = (t.description || "").toLowerCase();

          if (
            ["DW", "DB"].includes(code) ||
            (t.type && ["DW", "DB"].includes(t.type)) ||
            desc.includes("windshield") ||
            desc.includes("back glass")
          ) {
            newGroups["Primary Glass"].push(t);
          } else if (
            ["DR"].includes(code) ||
            code.startsWith("DR") ||
            (t.type === "DR") ||
            desc.includes("roof") ||
            desc.includes("sunroof") ||
            desc.includes("moonroof") ||
            desc.includes("panoramic") ||
            desc.includes("glass panel") ||
            desc.includes("center glass")
          ) {
            newGroups["Roof Glass"].push(t);
          } else {
            // "Side Glass" is the catch-all for DD, DV, DQ and everything else (Door, Vent, Quarter, etc.)
            newGroups["Side Glass"].push(t);
          }
        });

        // "Other" bucket logic completely removed to enforce the 3 user categories.
        // Fallback catch-all is now "Side Glass".

        // Filter out empty groups
        const finalGroups = {};
        Object.keys(newGroups).forEach(key => {
          if (newGroups[key].length > 0) {
            finalGroups[key] = newGroups[key];
          }
        });

        setGlassGroups(finalGroups);

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
  const handleSelectGlassType = async (glass) => {
    if (!glass) return;

    setActiveGlassTypeCode(glass.code);
    setActiveGlassParts({ loading: true, error: null, data: [] });

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

      setActiveGlassParts({ loading: false, error: null, data: glassParts });

    } catch (e) {
      console.error(e);
      setActiveGlassParts({ loading: false, error: e.message || "Failed to fetch parts", data: [] });
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
    if (!activeGlassTypeCode) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 italic p-4 text-center">
          <p className="text-sm">
            Select a glass type from the left to view available parts.
          </p>
        </div>
      );
    }

    const { loading, error, data } = activeGlassParts;
    // Find glass object for passing to handlers
    const activeGlassObj = glassData.find(g => g.code === activeGlassTypeCode);

    if (loading) {
      return <div className="p-4 text-slate-500 text-sm text-center">Loading parts...</div>;
    }
    if (error) {
      return <div className="p-4 text-red-500 text-sm text-center">{error}</div>;
    }
    if (!data || data.length === 0) {
      return <div className="p-4 text-slate-400 text-sm text-center">No parts available for this glass type.</div>;
    }

    return (
      <div className="flex flex-col p-2 space-y-2">
        {data.map((part, index) => {
          const partId = part.nags_glass_id || part.oem_glass_id;
          const partKey = `${part.nags_glass_id || ""}|${part.oem_glass_id || ""}|${activeGlassTypeCode}`;
          const isSelected = selectedParts.some(
            (p) =>
              p.part.nags_glass_id === part.nags_glass_id &&
              p.part.oem_glass_id === part.oem_glass_id &&
              p.glass.code === activeGlassTypeCode
          );

          return (
            <div
              key={`${partId}_${index}`}
              onClick={() => {
                if (isSelected) {
                  handleRemoveSelectedPart(partKey);
                } else {
                  handleSelectPart(part, activeGlassObj);
                }
              }}
              className={`
                    group flex items-center gap-3 p-2 cursor-pointer transition-colors border border-slate-200 rounded
                    ${isSelected ? "bg-blue-50/50 border-blue-300" : "hover:bg-slate-50 bg-white"}
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
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-bold text-xs ${isSelected ? "text-blue-900" : "text-slate-800"}`}>
                    {part.nags_glass_id || "Unknown ID"}{part.glass_info?.ta ? ` ${part.glass_info.ta}` : ""}
                  </span>
                  {part.oem_glass_id && (
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1 py-0.5 rounded shrink-0">
                      OEM: {part.oem_glass_id}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {part.part_description || "Glass Part"}
                </p>
              </div>
            </div>
          );
        })}
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
    <div className="bg-white p-0 h-full flex flex-col">
      {/* Top header removed, description moved below image */}

      <div className="flex flex-col md:flex-row gap-2 h-full overflow-hidden">
        {/* Left column: Diagram */}
        <div className="flex flex-col items-center justify-start border-r border-slate-100 pr-0 md:pr-2 w-full md:w-1/3 shrink-0">
          <div className="w-full mb-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">Select Glass Type</label>
            <Select
              className="w-full"
              placeholder="Select Glass Type"
              onChange={(code) => {
                const selectedGlass = glassData.find(g => g.code === code);
                if (selectedGlass) handleSelectGlassType(selectedGlass);
              }}
              showSearch
              optionFilterProp="children"
            >
              {Object.entries(glassGroups).map(([type, items]) => {
                // Format Group Label logic
                let groupLabel = type.replace(/_/g, " ");
                // Try to replace codes in group label too
                GLASS_CODE_NAMES.forEach(mapping => {
                  const regex = new RegExp(`\\b${mapping.code}\\b`, 'g'); // Replace whole word code
                  groupLabel = groupLabel.replace(regex, mapping.name);
                });


                return (
                  <OptGroup key={type} label={groupLabel}>
                    {items.map(item => {
                      let label = item.description || item.code;

                      // 1. Exact match lookup
                      const codeObj = GLASS_CODE_NAMES.find(obj => obj.code === item.code);
                      if (codeObj) {
                        label = codeObj.name;
                      } else {
                        // 2. Replacement fallback: "Left DQ" -> "Left Quarter Glass"
                        GLASS_CODE_NAMES.forEach(mapping => {
                          // Use word boundary to avoid partial replacement if codes were substrings (e.g. DQQ)
                          // But strict 2-letter codes: check if label contains it
                          if (label.includes(mapping.code)) {
                            // Replace "DQ" with "Quarter Glass"
                            label = label.replace(mapping.code, mapping.name);
                          }
                        });
                      }

                      // Clean underscores
                      if (label) {
                        label = label.replace(/_/g, " ");
                      }

                      return (
                        <Option key={item.code} value={item.code}>
                          {label}
                        </Option>
                      );
                    })}
                  </OptGroup>
                )
              })}
            </Select>
          </div>
          {imageSrc && (
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
            </div>
          )}
        </div>

        {/* Right column: Parts Selection */}
        <div className="flex flex-col flex-1 bg-white border border-slate-200 overflow-hidden min-h-0">
          <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              {activeGlassTypeCode
                ? `Available Options - ${glassData.find(g => g.code === activeGlassTypeCode)?.description || activeGlassTypeCode}`
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
