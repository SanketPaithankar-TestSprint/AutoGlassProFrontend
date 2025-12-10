import React, { useState } from "react";
import SearchByVin from "./SearchByvin";
import SearchByYMM from "./SearchByYMM";
import CarGlassViewer from "../carGlassViewer/CarGlassViewer";
import QuoteDetails from "../QuoteDetails/QuoteDetails";


const SearchByRoot = () => {
  const [vinData, setVinData] = useState(null);
  const [modelId, setModelId] = useState(null);
  const [vehicleInfo, setVehicleInfo] = useState({});
  const [selectedParts, setSelectedParts] = useState([]);

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
<<<<<<< Updated upstream
    <div className="min-h-screen bg-white flex flex-col items-center px-0 pt-24 pb-16">
      <div className="w-full md:max-w-[85%] 2xl:max-w-[1800px] mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-violet-600 mb-3">
            Search Options
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Find the right parts for your vehicle
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto">
            Enter a VIN to auto-detect your vehicle, or manually select the
            year, make, and model.
          </p>
=======
    <div className="h-screen bg-white flex flex-col items-center px-0 pt-20 pb-2 overflow-hidden">
      <div className={`w-full mx-auto space-y-2 h-full flex flex-col ${modelId && activeTab === 'quote' ? 'max-w-[98%] 2xl:max-w-[1900px]' : 'md:max-w-[80%] 2xl:max-w-[1400px]'}`}>

        {/* Top Tabs */}
        <div className="flex border-b border-gray-200 mb-2 gap-2 pb-0 shrink-0">
          <button
            onClick={() => setActiveTab('quote')}
            className={`px-6 py-1 text-sm font-bold rounded-t-lg border-x border-t transition-all ${activeTab === 'quote' ? 'border-slate-300 bg-white text-slate-900 border-b-white mb-[-1px] z-10' : 'bg-slate-50 border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Quote
          </button>
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-6 py-1 text-sm font-bold rounded-t-lg border-x border-t transition-all ${activeTab === 'customer' ? 'border-slate-300 bg-white text-slate-900 border-b-white mb-[-1px] z-10' : 'bg-slate-50 border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Customer
          </button>
>>>>>>> Stashed changes
        </div>

        {/* Search Container */}
        <div className="bg-white rounded-none md:rounded-2xl shadow-sm md:shadow-xl shadow-slate-200/60 border-y md:border border-slate-100 overflow-hidden w-full md:max-w-[85%] lg:max-w-[70%] mx-auto">
          {/* VIN Search Section */}
          <div className="p-4 md:p-8 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Option 1: Search by VIN
            </h2>
            <SearchByVin
              autoDecode
              delayMs={500}
              onDecoded={handleVinDecoded}
            />
          </div>

<<<<<<< Updated upstream
          {/* YMM Search Section */}
          <div className="p-4 md:p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Option 2: Search by Year, Make, Model
            </h2>
            <SearchByYMM
              value={vehicleInfo}
              onModelIdFetched={(id) => setModelId(id)}
              onVehicleInfoUpdate={handleVehicleInfoUpdate}
              className="w-full"
            />
          </div>
        </div>

        {/* Results Section */}
        {modelId && (
          <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            {/* Glass Diagram */}
            <div className="bg-white rounded-none md:rounded-2xl shadow-sm md:shadow-xl shadow-slate-200/60 border-y md:border border-slate-100 p-4 md:p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Select Parts
              </h2>

              <CarGlassViewer
                modelId={modelId}
                vehicleInfo={vehicleInfo}
                onPartSelect={handleAddPart}
                onPartDeselect={handleRemovePart}
              />
            </div>

            {/* Invoice/Quote Form */}
            {selectedParts.length > 0 && (
              <div className="bg-white rounded-none md:rounded-2xl shadow-sm md:shadow-xl shadow-slate-200/60 border-y md:border border-slate-100 p-4 md:p-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  Quote Details
                </h2>
                <p className="text-slate-600 mb-6">
                  Review your selection and generate a quote.
                </p>
                <QuoteDetails
                  prefill={{
                    ...vehicleInfo,
                    vin: vinData?.vin || "",
                    body: vinData?.body_type || vinData?.vehicle_type || "",
                  }}
                  parts={selectedParts}
                  onRemovePart={handleRemovePart}
                />
              </div>
            )}
=======
            {/* Main Content Area */}
            <div className={`flex flex-col ${modelId ? 'xl:flex-row items-stretch overflow-hidden flex-1 h-full' : ''} gap-4 transition-all duration-300 w-full`}>

              {/* Left Column: Search Container */}
              <div className={`bg-white border border-slate-200 overflow-hidden transition-all duration-300 flex flex-col ${modelId ? 'w-full xl:w-[350px] shrink-0' : 'w-full md:max-w-[70%] mx-auto'}`}>
                {/* VIN Search Section */}
                <div className="p-3 border-b border-slate-100 bg-slate-50/30">
                  <h2 className="text-sm font-semibold text-slate-800 mb-2">
                    Option 1: Search by VIN
                  </h2>
                  <SearchByVin
                    autoDecode
                    delayMs={500}
                    onDecoded={handleVinDecoded}
                  />
                </div>

                {/* YMM Search Section */}
                <div className="p-3 flex-1 overflow-y-auto">
                  <h2 className="text-sm font-semibold text-slate-800 mb-2">
                    Option 2: Search by Year, Make, Model
                  </h2>
                  <SearchByYMM
                    value={vehicleInfo}
                    onModelIdFetched={(id) => setModelId(id)}
                    onVehicleInfoUpdate={handleVehicleInfoUpdate}
                    className="w-full"
                    stacked={!!modelId}
                  />
                </div>
              </div>

              {/* Right Column: Parts & Quote */}
              {modelId && (
                <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full min-w-0">

                  {/* Top Right: Part Selection */}
                  <div className={`bg-white border border-slate-200 p-2 flex flex-col overflow-hidden min-h-0 ${selectedParts.length > 0 ? 'h-[50%]' : 'h-full'}`}>
                    <h2 className="text-sm font-semibold text-slate-800 mb-2 shrink-0">
                      Select Parts
                    </h2>
                    <div className="flex-1 overflow-hidden">
                      <CarGlassViewer
                        modelId={modelId}
                        vehicleInfo={vehicleInfo}
                        onPartSelect={handleAddPart}
                        onPartDeselect={handleRemovePart}
                      />
                    </div>
                  </div>

                  {/* Bottom Right: Quote Area */}
                  {selectedParts.length > 0 && (
                    <div className="bg-white border border-slate-200 p-3 h-[50%] flex flex-col overflow-hidden min-h-0">
                      <h2 className="text-sm font-semibold text-slate-800 mb-2 shrink-0">
                        Quote Details
                      </h2>
                      <div className="flex-1 overflow-y-auto min-h-0">
                        <QuoteDetails
                          prefill={{
                            ...vehicleInfo,
                            vin: vinData?.vin || "",
                            body: vinData?.body_type || vinData?.vehicle_type || "",
                          }}
                          parts={selectedParts}
                          onRemovePart={handleRemovePart}
                          activePanel="quote"
                          invoiceItems={invoiceItems}
                          setInvoiceItems={setInvoiceItems}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab Content: CUSTOMER */}
        {activeTab === 'customer' && (
          <div className="w-full max-w-4xl mx-auto animate-[fadeIn_0.5s_ease-out]">
            <QuoteDetails
              prefill={{
                ...vehicleInfo,
                vin: vinData?.vin || "",
                body: vinData?.body_type || vinData?.vehicle_type || "",
              }}
              parts={selectedParts}
              onRemovePart={handleRemovePart}
              activePanel="customer"
              onPanelSwitch={(panel) => setActiveTab(panel)}
              invoiceItems={invoiceItems}
              setInvoiceItems={setInvoiceItems}
            />
>>>>>>> Stashed changes
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchByRoot;
