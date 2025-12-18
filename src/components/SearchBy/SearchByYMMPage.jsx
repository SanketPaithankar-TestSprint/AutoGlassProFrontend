import React, { useState } from "react";
import { message } from "antd";
import SearchByYMM from "./SearchByYMM";
import CarGlassViewer from "../CarGlassViewer";
import QuoteDetails from "../QuoteDetails";

const SearchByYMMPage = () => {
  const [modelId, setModelId] = useState(null);
  const [selectedParts, setSelectedParts] = useState([]); // Array of { glass, part, glassInfo }
  const [vehicleInfo, setVehicleInfo] = useState({});

  // Handle adding a part to the invoice
  const handleAddPart = ({ glass, part, glassInfo }) => {

    setSelectedParts((prevParts) => {
      const alreadyAdded = prevParts.some(
        (p) =>
          p.part.nags_glass_id === part.nags_glass_id &&
          p.part.oem_glass_id === part.oem_glass_id &&
          p.glass.code === glass.code
      );
      if (alreadyAdded) {
        message.warning("Part already added to the invoice.");
        return prevParts;
      }
      return [...prevParts, { glass, part, glassInfo }];
    });
  };

  // Handle removing a part from the invoice
  const handleRemovePart = (partKey) => {
    setSelectedParts((prevParts) =>
      prevParts.filter(
        (p) => `${p.part.nags_glass_id || ""}|${p.part.oem_glass_id || ""}|${p.glass.code}` !== partKey
      )
    );
  };

  // Handle vehicle info update from SearchByYMM
  const handleVehicleInfoUpdate = (info) => {
    setVehicleInfo(info);
  };

  return (
    <div className="w-full mx-auto space-y-2 text-slate-50">
      {/* Main YMM search header + control */}
      <div
        className="
          rounded-2xl border border-slate-200
          bg-white/70 backdrop-blur-lg
          shadow-xl shadow-slate-200/70
          p-3
          text-slate-900
        "
      >
        <div className="mb-2">
          <h1 className="text-lg md:text-xl font-semibold">
            Search by Year, Make, and Model
          </h1>
        </div>

        <SearchByYMM
          onModelIdFetched={(id) => setModelId(id)}
          onVehicleInfoUpdate={handleVehicleInfoUpdate}
          className="mt-2"
        />
      </div>

      {/* CarGlassViewer card */}
      {modelId && (
        <div
          className="
            rounded-2xl border border-slate-200
            bg-white/70 backdrop-blur-lg
            shadow-xl shadow-slate-200/70
            p-2
            text-slate-900
          "
        >
          <h2 className="text-lg font-semibold mb-3">
            Glass Diagram & Parts Selector
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mb-4">
            Click on the glass or parts in the diagram to add them directly
            to your invoice.
          </p>
          <CarGlassViewer
            modelId={modelId}
            vehicleInfo={vehicleInfo}
            onPartSelect={handleAddPart}
          />
        </div>
      )}
      {/* QuoteDetails card */}
      <div
        className="
          rounded-2xl border border-slate-200
          bg-white/70 backdrop-blur-lg
          shadow-xl shadow-slate-200/70
          shadow-xl shadow-slate-200/70
          p-1
          text-slate-900
        "
      >
        <div className="text-slate-700 text-sm">
          <QuoteDetails
            prefill={vehicleInfo}
            parts={selectedParts}
            onRemovePart={handleRemovePart}
          />
        </div>
      </div>
    </div >
  );
};

export default SearchByYMMPage;
