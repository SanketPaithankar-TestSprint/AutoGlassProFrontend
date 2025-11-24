
import React, { useEffect, useState } from "react";
import config from "../config";
import { prefixMap, posMap, sideMap } from "./glassMappings";

export default function CarGlassViewer({ modelId, onPartSelect }) {
  // 1) Glass catalog (left column)
  const [loading, setLoading] = useState(true);
  const [glassData, setGlassData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedGlass, setSelectedGlass] = useState(null);

  // 2) Parts for selected glass (right column)
  const [partsLoading, setPartsLoading] = useState(false);
  const [partsError, setPartsError] = useState(null);
  const [parts, setParts] = useState([]);

  // 3) Selected parts + extra info (bottom)
  const [selectedParts, setSelectedParts] = useState([]); // Array of { glass, part, glassInfo }
  const [glassInfoLoading, setGlassInfoLoading] = useState(false);
  const [glassInfoError, setGlassInfoError] = useState(null);
  const [glassInfo, setGlassInfo] = useState(null);
  const [labor, setLabor] = useState(null);

  // ---------- helpers: convert backend data → API params ----------
  const getPrefixCd = (glass) => glass.code.substring(0, 2).toUpperCase();

  const getPosCd = (glass) => {
    const raw = (glass.position || "").toUpperCase();
    if (raw.startsWith("FRONT") || raw === "F") return "F";
    if (raw.startsWith("REAR") || raw === "R") return "R";
    return "NULL";
  };

  const getSideCd = (glass) => {
    const raw = (glass.side || "").toUpperCase();
    if (raw.startsWith("LEFT") || raw === "L") return "L";
    if (raw.startsWith("RIGHT") || raw === "R") return "R";
    return "NULL";
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
  const handleSelectGlass = async (glass) => {
    setSelectedGlass(glass);
    setGlassInfo(null);
    setGlassInfoError(null);
    setParts([]);
    setPartsError(null);
    setPartsLoading(true);

    try {
      const prefix_cd = getPrefixCd(glass);
      const pos_cd = getPosCd(glass);
      const side_cd = getSideCd(glass);
      const url = `${config.pythonApiUrl}agp/v1/glass-parts?make_model_id=${modelId}&prefix_cd=${prefix_cd}&pos_cd=${pos_cd}&side_cd=${side_cd}`;
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (!res.ok) throw new Error("Failed to fetch glass parts");
      const data = await res.json();
      const glassParts = Array.isArray(data?.glass_parts)
        ? data.glass_parts
        : Array.isArray(data)
        ? data
        : [];
      setParts(glassParts);
    } catch (e) {
      console.error(e);
      setPartsError(e.message || "Failed to fetch glass parts.");
    } finally {
      setPartsLoading(false);
    }
  };

  const handleSelectPart = async (part) => {
    const partKey = `${part.nags_glass_id || ""}|${part.oem_glass_id || ""}`;
    const glassKey = selectedGlass ? selectedGlass.code : "";
    const alreadySelected = selectedParts.some(
      (p) =>
        p.part.nags_glass_id === part.nags_glass_id &&
        p.part.oem_glass_id === part.oem_glass_id &&
        p.glass.code === glassKey
    );
    if (alreadySelected) return; // Prevent duplicate selection

    onPartSelect?.({ glass: selectedGlass, part });

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
    setSelectedParts((prev) => [
      ...prev,
      { glass: selectedGlass, part, glassInfo: info }
    ]);
  };

  // ---------- render helpers ----------
  const renderGlassCards = () =>
    glassData.map((glass) => {
      const prefix_cd = getPrefixCd(glass);
      const pos_cd = getPosCd(glass);
      const side_cd = getSideCd(glass);
      const isActive = selectedGlass?.code === glass.code;

      return (
        <button
          key={glass.code}
          type="button"
          onClick={() => handleSelectGlass(glass)}
          className={`
            text-left rounded-2xl border px-4 py-4 text-sm md:text-base font-medium w-full mb-3
            transition-all duration-300 ease-out
            backdrop-blur-md bg-slate-900/60
            shadow-lg hover:shadow-2xl
            scale-100 hover:scale-[1.03] active:scale-95
            opacity-90 hover:opacity-100
            ${
              isActive
                ? "border-violet-400 bg-gradient-to-br from-violet-700/40 to-indigo-800/40 shadow-violet-900/40"
                : "border-slate-600 bg-gradient-to-br from-slate-900/70 to-slate-800/60 hover:border-violet-500"
            }
          `}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-2 py-0.5 rounded-lg text-[12px] font-bold text-white shadow"
                style={{
                  background:
                    "linear-gradient(90deg, #7c3aed 60%, #6366f1 100%)",
                }}
              >
                {glass.code}
              </span>
              <span className="text-sm text-slate-200 truncate font-semibold">
                {glass.description}
              </span>
            </div>
            <div className="text-xs text-slate-300 space-y-0.5">
              <div>
                <b>Prefix:</b> {prefixMap[prefix_cd] || prefix_cd}
              </div>
              <div>
                <b>Position:</b> {posMap[pos_cd] || pos_cd}
              </div>
              <div>
                <b>Side:</b> {sideMap[side_cd] || side_cd}
              </div>
            </div>
          </div>
        </button>
      );
    });

  const renderPartsColumn = () => {
    if (!selectedGlass) {
      return (
        <div className="text-slate-400 italic">
          Select a glass type on the left to view available parts.
        </div>
      );
    }
    if (partsLoading) {
      return <div className="text-slate-400">Loading parts…</div>;
    }
    if (partsError) {
      return <div className="text-red-400 text-sm">{partsError}</div>;
    }
    if (!parts.length) {
      return (
        <div className="text-slate-400 text-sm">
          No parts returned for this glass selection.
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {parts.map((part) => {
          const isSelected = selectedParts.some(
            (p) =>
              p.part.nags_glass_id === part.nags_glass_id &&
              p.part.oem_glass_id === part.oem_glass_id &&
              p.glass.code === selectedGlass.code
          );
          return (
            <button
              key={part.nags_glass_id || part.oem_glass_id}
              type="button"
              onClick={() => handleSelectPart(part)}
              className={`
                rounded-xl border bg-slate-900/80 p-3 text-sm text-slate-100 shadow 
                hover:scale-[1.02] transition-all w-full text-left
                ${
                  isSelected
                    ? "border-violet-400 ring-2 ring-violet-500/60"
                    : "border-slate-700 hover:border-violet-500"
                }
              `}
            >
              <div className="flex flex-col gap-1">
                <div className="flex justify-between gap-3 text-xs">
                  <span className="text-slate-400 font-semibold">
                    NAGS Glass ID
                  </span>
                  <span className="text-slate-100 break-all">
                    {part.nags_glass_id || "-"}
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-xs">
                  <span className="text-slate-400 font-semibold">
                    OEM Glass ID
                  </span>
                  <span className="text-slate-100 break-all">
                    {part.oem_glass_id || "-"}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  // Remove selected part by unique key
  const handleRemoveSelectedPart = (partKey) => {
    setSelectedParts((prev) =>
      prev.filter(
        (p) => `${p.part.nags_glass_id || ""}|${p.part.oem_glass_id || ""}|${p.glass.code}` !== partKey
      )
    );
  };

const renderSelectedPartPanel = () => {
  if (!selectedParts.length) return null;

  return (
    <div className="mt-6 rounded-xl border-2 border-violet-500 bg-slate-900/90 p-4 text-sm text-slate-100 shadow-lg relative">
      <h5 className="text-base font-bold text-violet-300 mb-2">Selected Parts</h5>

      <div className="flex flex-col gap-4">
        {selectedParts.map(({ glass, part, glassInfo }, idx) => {
          const prefix_cd = glass ? getPrefixCd(glass) : null;
          const pos_cd = glass ? getPosCd(glass) : null;
          const side_cd = glass ? getSideCd(glass) : null;
          const partKey = `${part.nags_glass_id || ""}|${part.oem_glass_id || ""}|${glass.code}`;

          return (
            <div
              key={partKey}
              className="relative border-b border-slate-700 pb-3 mb-3 last:border-b-0 last:mb-0 last:pb-0"
            >
              {/* Cross icon positioned correctly in the top-right corner */}
              <button
                type="button"
                onClick={() => handleRemoveSelectedPart(partKey)}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-400 text-lg font-bold rounded-full focus:outline-none"
                title="Remove"
                aria-label="Remove"
              >
                &times;
              </button>

              {/* Selected Part Information */}
              <div className="flex flex-col gap-3">
                <div className="flex text-s">
                  <span className="text-slate-400 font-semibold">NAGS Glass ID : </span>
                  <span className="text-slate-100">{part.nags_glass_id || "-"}</span>
                </div>

                <div className="flex text-s">
                  <span className="text-slate-400 font-semibold">OEM Glass ID : </span>
                  <span className="text-slate-100">{" " + (part.oem_glass_id || "-")}</span>
                </div>

                {glass && (
                  <div className="flex flex-col gap-1 text-xs text-slate-300">
                    <div>
                      <b>Type:</b> {prefixMap[prefix_cd] || prefix_cd}
                    </div>
                    <div>
                      <b>Position:</b> {posMap[pos_cd] || pos_cd}
                    </div>
                    <div>
                      <b>Side:</b> {sideMap[side_cd] || side_cd}
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <h6 className="text-xs font-bold text-violet-400 mb-1">Labor Info</h6>
                  {glassInfo && glassInfo.labor ? (
                    <div className="text-slate-200 text-xs">
                      <div><b>Labor Hours:</b> {glassInfo.labor}</div>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs">No labor info available.</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

  // ---------- main render ----------
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-slate-900/60 rounded-3xl border border-slate-700 backdrop-blur-xl">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-200 text-sm">Loading glass catalog…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-950/40 rounded-3xl border border-red-600/60 p-6 text-sm text-red-100">
        {error}
      </div>
    );
  }

  if (!glassData.length) {
    return (
      <div className="bg-slate-900/60 rounded-3xl border border-slate-700 p-6 text-sm text-slate-200">
        No glass parts available for this model.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 rounded-3xl border border-slate-700 p-6 md:p-8 space-y-7 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-2xl font-bold text-white tracking-tight drop-shadow">
          All Glass Parts{" "}
          <span className="text-violet-400">({glassData.length})</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-h-[32rem]">
        {/* Left column: glass types */}
        <div className="pr-6 border-r border-slate-700 flex flex-col gap-2 overflow-y-auto max-h-[32rem]">
          {renderGlassCards()}
        </div>

        {/* Right column: parts for selected glass */}
        <div className="pl-6 overflow-y-auto max-h-[32rem] flex flex-col h-full">
          <div className="bg-slate-900/80 rounded-2xl p-4 shadow border border-slate-700 flex-1">
            <h4 className="text-lg font-bold text-violet-300 mb-2">
              Parts for Selection
            </h4>
            {renderPartsColumn()}
          </div>

          {renderSelectedPartPanel()}
        </div>
      </div>
    </div>
  );
}
