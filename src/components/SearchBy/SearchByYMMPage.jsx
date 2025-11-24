import React, { useState } from "react";
import { message } from "antd";
import SearchByYMM from "./SearchByYMM";
import CarGlassViewer from "../CarGlassViewer";
import InvoiceForm from "../InvoiceForm";

const SearchByYMMPage = () =>
{
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
      debugger;
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
  const handleVehicleInfoUpdate = (info) =>
  {
    setVehicleInfo(info);
  };

  return (
    <div className="w-full mx-auto space-y-6 text-slate-50">
      {/* Main YMM search header + control */}
      <div
        className="
          rounded-2xl border border-slate-800
          bg-slate-900/70 backdrop-blur-lg
          shadow-xl shadow-slate-950/70
          p-4 md:p-6
          text-slate-50
        "
      >
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl font-semibold">
            Search by Year, Make, and Model
          </h1>
          <p className="mt-1 text-sm text-slate-300 max-w-2xl">
            Select a year, make, and model to explore glass diagrams and build
            an accurate invoice from the exact parts you choose.
          </p>
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
            rounded-2xl border border-slate-800
            bg-slate-900/70 backdrop-blur-lg
            shadow-xl shadow-slate-950/70
            p-4 md:p-6
            text-slate-50
          "
        >
          <h2 className="text-lg font-semibold mb-3">
            Glass Diagram & Parts Selector
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mb-4">
            Click on the glass or parts in the diagram to add them directly
            to your invoice.
          </p>
          <div className="text-slate-200 text-sm">
            <CarGlassViewer
              modelId={modelId}
              onPartSelect={handleAddPart}
            />
          </div>
        </div>
      )}

      {/* InvoiceForm card */}
      <div
        className="
          rounded-2xl border border-slate-800
          bg-slate-900/70 backdrop-blur-lg
          shadow-xl shadow-slate-950/70
          p-4 md:p-6
          text-slate-50
        "
      >
        <h2 className="text-lg font-semibold mb-3">
          Invoice Preview
        </h2>
        <p className="text-xs md:text-sm text-slate-300 mb-4">
          Review vehicle details and selected parts before sending a quote or
          creating a final invoice.
        </p>
        <div className="text-slate-200 text-sm">
          <InvoiceForm
            prefill={vehicleInfo}
            parts={selectedParts}
            onRemovePart={handleRemovePart}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchByYMMPage;
