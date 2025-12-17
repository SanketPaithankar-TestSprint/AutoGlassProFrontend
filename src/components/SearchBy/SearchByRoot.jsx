import React, { useState } from "react";
import SearchByVin from "./SearchByvin";
import SearchByYMM from "./SearchByYMM";
import CarGlassViewer from "../carGlassViewer/CarGlassViewer";
import QuoteDetails from "../QuoteDetails/QuoteDetails";
import ErrorBoundary from "../common/ErrorBoundary";

const SearchByRoot = () => {
  const [vinData, setVinData] = useState(null);
  const [modelId, setModelId] = useState(null);
  const [vehicleInfo, setVehicleInfo] = useState({});
  const [selectedParts, setSelectedParts] = useState([]);
  const [activeTab, setActiveTab] = useState('quote');
  const [invoiceItems, setInvoiceItems] = useState([]);

  // Handle VIN decode
  const handleVinDecoded = (data) => {
    setVinData(data);
    // Auto-populate YMM if data is available
    if (data) {
      setVehicleInfo({
        year: data.year,
        make: data.make,
        model: data.model,
      });
    }
  };
  // Handle vehicle info update from YMM selector
  const handleVehicleInfoUpdate = (info) => {
    setVehicleInfo(info);
  };
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
        // message.warning("Part already added to the invoice.");
        return prevParts;
      }
      return [...prevParts, { glass, part, glassInfo }];
    });
  };

  // Handle removing a part from the invoice
  const handleRemovePart = (partKey) => {
    setSelectedParts((prevParts) =>
      prevParts.filter(
        (p) =>
          `${p.part.nags_glass_id || ""}|${p.part.oem_glass_id || ""}|${p.glass.code
          }` !== partKey
      )
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-0 pt-20 pb-2">
      <div className="w-full mx-auto space-y-2 flex flex-col max-w-[98%] 2xl:max-w-[1900px]">

        {/* Quote Tab Content -> Renamed to Main Content as it handles everything */}
        <div className="screen w-full h-[calc(100vh-96px)] grid gap-4 transition-all duration-300 grid-cols-[350px_1fr] grid-rows-[55%_45%]">

          <div className="searchby bg-white border border-slate-200 overflow-y-auto flex flex-col row-span-2">
            {/* VIN Search Section */}
            <div className="p-4 border-b border-slate-200 shrink-0">
              <h2 className="text-base font-medium text-slate-800 mb-3">
                Search by VIN:
              </h2>
              <ErrorBoundary>
                <SearchByVin
                  autoDecode
                  delayMs={500}
                  onDecoded={handleVinDecoded}
                />
              </ErrorBoundary>
            </div>

            {/* YMM Search Section */}
            <div className="p-4 flex-1 overflow-y-auto">
              <h2 className="text-base font-medium text-slate-800 mb-3">
                Search by Year Make Model:
              </h2>
              <ErrorBoundary>
                <SearchByYMM
                  value={vehicleInfo}
                  onModelIdFetched={(id) => setModelId(id)}
                  onVehicleInfoUpdate={handleVehicleInfoUpdate}
                  className="w-full"
                  stacked={true}
                />
              </ErrorBoundary>

              {/* Visual "Find Parts" placeholder if needed, matching wireframe button location */}
              <div className="mt-4">
                <button className="w-full bg-white border border-slate-800 text-slate-800 font-medium py-1.5 px-4 hover:bg-slate-50 transition-colors">
                  Find Parts
                </button>
              </div>
            </div>
          </div>

          {/* Right Column Top: part selection */}
          <div className={`part-selection bg-white border border-slate-200 p-2 flex flex-col overflow-hidden ${!modelId ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            <h2 className="text-sm font-semibold text-slate-800 mb-2 shrink-0">
              Select Parts
            </h2>
            <div className="flex-1 overflow-hidden">
              <ErrorBoundary>
                <CarGlassViewer
                  modelId={modelId}
                  vehicleInfo={vehicleInfo}
                  onPartSelect={handleAddPart}
                  onPartDeselect={handleRemovePart}
                />
              </ErrorBoundary>
            </div>
          </div>

          {/* Right Column Bottom: quote area */}
          <div className={`quote-area bg-white border border-slate-200 p-3 flex flex-col overflow-hidden ${!modelId ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            <h2 className="text-sm font-semibold text-slate-800 mb-2 shrink-0">
              Quote Details
            </h2>
            <div className="flex-1 overflow-y-auto">
              <ErrorBoundary>
                <QuoteDetails
                  prefill={{
                    ...vehicleInfo,
                    vin: vinData?.vin || "",
                    body: vinData?.body_type || vinData?.vehicle_type || "",
                  }}
                  parts={selectedParts}
                  onRemovePart={handleRemovePart}
                  activePanel={activeTab} // Pass state to control panel
                  onPanelSwitch={(panel) => setActiveTab(panel)} // Allow internal switching
                  invoiceItems={invoiceItems}
                  setInvoiceItems={setInvoiceItems}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>

      </div >
    </div >
  );
};

export default SearchByRoot;
