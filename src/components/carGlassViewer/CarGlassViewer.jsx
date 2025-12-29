import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Select, Modal } from "antd";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

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

  // Helper to format glass name to match Mega Menu logic
  const getFormattedLabel = (code) => {
    const item = glassData.find(g => g.code === code);
    if (!item) return code;

    // 1. Determine Group
    let groupName = "Other";
    for (const [name, items] of Object.entries(glassGroups)) {
      if (items.some(i => i.code === code)) {
        groupName = name;
        break;
      }
    }

    // 2. Base Label
    let label = item.description || item.code;
    const codeObj = GLASS_CODE_NAMES.find(obj => obj.code === item.code);
    if (codeObj) label = codeObj.name;
    else if (label.includes("DQ")) label = label.replace("DQ", "Quarter");
    else if (label.includes("DD")) label = label.replace("DD", "Door");
    else if (label.includes("DV")) label = label.replace("DV", "Vent");

    // 3. Remove underscores
    label = label.replace(/_/g, " ");

    // 4. Group-specific rules
    // Side Glass(1), Vent Glass(2), Quarter Glass(3) in menu mapping
    // "Primary Glass" is 0, "Roof Glass" is 4
    if (groupName === "Vent Glass") {
      label = label.replace(/Door/gi, "").trim();
    }

    if (["Side Glass", "Vent Glass", "Quarter Glass"].includes(groupName)) {
      label = label.replace(/Glass/gi, "").trim();
    }

    // Clean up double spaces
    return label.replace(/\s+/g, " ").trim();
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
        // Primary: Automatic Windshield, Back Glass, etc (DW, DB)
        // Side Glass: Door Glass (DD)
        // Vent Glass: Vent (DV)
        // Quarter Glass: Quarter (DQ)
        // Roof Glass: Roof (DR, Sunroof)

        const newGroups = {
          "Primary Glass": [],
          "Side Glass": [],
          "Vent Glass": [],
          "Quarter Glass": [],
          "Roof Glass": []
        };

        rawTypes.forEach(t => {
          const code = (t.code || "").toUpperCase();
          const desc = (t.description || "").toLowerCase();
          const type = (t.type || "").toUpperCase();

          // 1. Primary
          if (["DW", "DB"].includes(code) || ["DW", "DB"].includes(type) || desc.includes("windshield") || desc.includes("back glass")) {
            newGroups["Primary Glass"].push(t);
          }
          // 2. Door (Side)
          else if (code.startsWith("DD") || type === "DD" || desc.includes("door glass") || desc.includes("front door") || desc.includes("rear door")) {
            newGroups["Side Glass"].push(t);
          }
          // 3. Vent
          else if (code.startsWith("DV") || type === "DV" || desc.includes("vent")) {
            newGroups["Vent Glass"].push(t);
          }
          // 4. Quarter
          else if (code.startsWith("DQ") || type === "DQ" || desc.includes("quarter")) {
            newGroups["Quarter Glass"].push(t);
          }
          // 5. Roof
          else if (code.startsWith("DR") || type === "DR" || desc.includes("roof") || desc.includes("sunroof") || desc.includes("moonroof")) {
            newGroups["Roof Glass"].push(t);
          }
          // Fallbacks
          else {
            // If completely unknown, maybe check common words or default to Side?
            // Let's default to Side Glass as a safe "Other" for generic side windows
            newGroups["Side Glass"].push(t);
          }
        });

        setGlassGroups(newGroups);

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
      <div className="flex flex-col space-y-4 p-2">
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
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100 group/header">
                <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wide">{label}</span>
                <button
                  onClick={(e) => handleRemoveGlassType(e, code)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                  title="Remove this glass type"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {parts.map((part, index) => {
                const partId = part.nags_glass_id || part.oem_glass_id;
                const partKey = `${part.nags_glass_id || ""}|${part.oem_glass_id || ""}|${code}`;

                const isSelected = selectedParts.some(
                  (p) =>
                    p.part.nags_glass_id === part.nags_glass_id &&
                    p.part.oem_glass_id === part.oem_glass_id &&
                    p.glass.code === code
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
                                group flex items-center gap-2 p-0.5 px-2 cursor-pointer transition-colors border border-slate-200 rounded
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
                          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0 border border-slate-200">
                            OEM: {part.oem_glass_id}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0 truncate leading-tight">
                        {part.part_description || "Glass Part"}
                      </p>
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
        {/* Left column: Diagram & Glass Selection */}
        <div className="flex flex-col items-center justify-start border-r border-slate-100 pr-0 md:pr-2 w-full md:w-1/3 shrink-0 relative z-10">
          <div className="w-full mb-2 relative pl-2 pt-2">
            <label className="block text-sm font-bold text-slate-800 mb-2">Select Glass Type</label>


            {/* ... inside CarGlassViewer component ... */}

            {/* Custom Mega Menu Trigger */}
            <div
              ref={triggerRef}
              className="w-full border border-slate-300 rounded px-3 py-2 bg-white cursor-pointer flex items-center justify-between hover:border-violet-500 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="text-sm text-slate-700 truncate">
                {selectedGlassCodes.length > 0
                  ? selectedGlassCodes.map(c => getFormattedLabel(c)).join(", ")
                  : "Select Glass Type"
                }
              </span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Mega Menu Overlay (Portal) */}
            {isMenuOpen && ReactDOM.createPortal(
              <div
                className="fixed inset-0 z-[9999]"
                onClick={() => setIsMenuOpen(false)}
              >
                {/* Dropdown Content */}
                <div
                  className="absolute bg-white border border-slate-200 shadow-xl rounded-lg flex flex-col max-h-[500px] overflow-hidden"
                  style={{
                    top: dropdownCoords.top,
                    left: dropdownCoords.left,
                    width: '480px', // Adjusted width significantly smaller
                  }}
                  onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                >
                  <div className="grid grid-cols-3 gap-x-2 gap-y-3 p-3 overflow-y-auto">
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
                              // Label cleanup
                              let label = item.description || item.code;
                              const codeObj = GLASS_CODE_NAMES.find(obj => obj.code === item.code);
                              if (codeObj) label = codeObj.name;
                              // Fallback replacements
                              else if (label.includes("DQ")) label = label.replace("DQ", "Quarter");
                              else if (label.includes("DD")) label = label.replace("DD", "Door");
                              else if (label.includes("DV")) label = label.replace("DV", "Vent");

                              // 1. Remove underscores
                              label = label.replace(/_/g, " ");

                              // 2. Specific fix for Vent Glass: Remove "Door" logic was based on index previously, do safe check
                              if (group.name === "Vent") {
                                label = label.replace(/Door/gi, "").trim();
                              }

                              // 3. Remove "Glass" from Side, Vent, Quarter
                              if (["Side Glass", "Vent", "Quarter"].includes(group.name)) {
                                label = label.replace(/Glass/gi, "").trim();
                              }

                              // Clean up double spaces
                              label = label.replace(/\s+/g, " ").trim();

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
                  className="flex flex-col items-center w-full mt-4 relative z-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setImageModalOpen(true)}
                  title="Click to enlarge"
                >
                  <div className="relative w-full h-48 flex items-center justify-center border border-slate-100 rounded-lg p-2">
                    <img
                      src={imageSrc}
                      alt="Vehicle Graphic"
                      className="max-w-full max-h-full w-auto h-auto object-contain"
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
                  <div className="p-4 flex items-center justify-center bg-white rounded-lg">
                    <img
                      src={imageSrc}
                      alt="Vehicle Graphic Large"
                      className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
                    />
                  </div>
                </Modal>
              </>
            )}
          </div>
        </div>

        {/* Right column: Parts Selection */}
        <div className="flex flex-col flex-1 bg-white border border-slate-200 overflow-hidden min-h-0">
          <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
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
