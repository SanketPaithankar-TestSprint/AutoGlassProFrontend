import React from "react";

const PartsColumn = ({ selectedGlassTypes, selectedParts, expandedPartIds, togglePartExpansion, handleSelectPart, handleRemoveSelectedPart }) => {
    if (selectedGlassTypes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 italic p-8 text-center">
                <p>
                    Select a highlighted glass part on the diagram to view available options.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col p-4 space-y-4">
            {selectedGlassTypes.map((item) => (
                <div key={item.glass.code} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div
                        onClick={() => togglePartExpansion(item.glass.code)}
                        className="flex items-center justify-between p-4 bg-slate-50/80 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                        <div>
                            <h3 className="font-bold text-slate-800 text-base">
                                {item.label}
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
                                        const partId = part.nags_glass_id || part.oem_glass_id || "unknown";
                                        const isExpanded = expandedPartIds.has(partId);
                                        const isSelected = selectedParts.some(
                                            (p) =>
                                                p.part.nags_glass_id === part.nags_glass_id &&
                                                p.part.oem_glass_id === part.oem_glass_id &&
                                                p.glass.code === item.glass.code
                                        );
                                        return (
                                            <div key={partId} className={`rounded-xl border transition-all duration-200 overflow-hidden ${isSelected ? "border-blue-500 bg-blue-50/30 shadow-sm" : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"}`}>
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
                                                            <div className="flex gap-2 mt-2">
                                                                <button
                                                                    onClick={() => isSelected ? handleRemoveSelectedPart(partId) : handleSelectPart(part, item.glass)}
                                                                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium ${isSelected ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow"}`}
                                                                >
                                                                    {isSelected ? "Remove Selection" : "Select Part"}
                                                                </button>
                                                            </div>
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

export default PartsColumn;
