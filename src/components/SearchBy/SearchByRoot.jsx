import React, { useState, useEffect } from "react";
import SearchByVin from "./SearchByvin";
import SearchByYMM from "./SearchByYMM";
import CarGlassViewer from "../carGlassViewer/CarGlassViewer";
import QuotePanel from "../QuoteDetails/QuotePanel";
import CustomerPanel from "../QuoteDetails/CustomerPanel";
import ErrorBoundary from "../common/ErrorBoundary";
import config from "../../config";
import { getPrefixCd, getPosCd, getSideCd } from "../carGlassViewer/carGlassHelpers";

const SearchByRoot = () => {
  const [vinData, setVinData] = useState(null);
  const [modelId, setModelId] = useState(null);
  const [vehicleInfo, setVehicleInfo] = useState({});
  const [selectedParts, setSelectedParts] = useState([]);
  const [activeTab, setActiveTab] = useState('quote');
  const [invoiceItems, setInvoiceItems] = useState([]);

  // Lifted Customer State
  const [customerData, setCustomerData] = useState(() => {
    const saved = localStorage.getItem("agp_customer_data");
    const initial = {
      firstName: "", lastName: "", email: "", phone: "", alternatePhone: "",
      addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "",
      preferredContactMethod: "phone", notes: "",
      vehicleYear: "", vehicleMake: "", vehicleModel: "", vehicleStyle: "",
      licensePlateNumber: "", vin: "", vehicleNotes: "",
    };

    if (saved) {
      try { return { ...initial, ...JSON.parse(saved) }; }
      catch (e) { console.error("Failed to parse saved customer data", e); }
    }
    return initial;
  });

  useEffect(() => {
    document.title = "APAI | Search";
  }, []);

  // Persist Customer Data
  useEffect(() => {
    if (customerData) {
      localStorage.setItem("agp_customer_data", JSON.stringify(customerData));
    }
  }, [customerData]);

  // Handle VIN decode
  const handleVinDecoded = (data) => {
    setVinData(data);
    if (data) {
      const info = { year: data.year, make: data.make, model: data.model, body: data.body_type || data.vehicle_type };
      setVehicleInfo(info);
      // Auto-update customer vehicle info
      setCustomerData(prev => ({
        ...prev,
        vehicleYear: info.year || prev.vehicleYear,
        vehicleMake: info.make || prev.vehicleMake,
        vehicleModel: info.model || prev.vehicleModel,
        vehicleStyle: info.body || prev.vehicleStyle,
        vin: data.vin || prev.vin
      }));
    }
  };

  // Handle vehicle info update from YMM
  const handleVehicleInfoUpdate = (info) => {
    setVehicleInfo(info);
    setCustomerData(prev => ({
      ...prev,
      vehicleYear: info.year || prev.vehicleYear,
      vehicleMake: info.make || prev.vehicleMake,
      vehicleModel: info.model || prev.vehicleModel,
      vehicleStyle: info.description || prev.vehicleStyle, // Use description for style if available
    }));
  };

  // Handle adding a part
  const handleAddPart = ({ glass, part, glassInfo }) => {
    setSelectedParts((prevParts) => {
      const alreadyAdded = prevParts.some(
        (p) =>
          p.part.nags_glass_id === part.nags_glass_id &&
          p.part.oem_glass_id === part.oem_glass_id &&
          p.glass.code === glass.code
      );
      return alreadyAdded ? prevParts : [...prevParts, { glass, part, glassInfo }];
    });
  };

  // Handle removing a part
  const handleRemovePart = (partKey) => {
    setSelectedParts((prevParts) =>
      prevParts.filter(
        (p) => `${p.part.nags_glass_id || ""}|${p.part.oem_glass_id || ""}|${p.glass.code}` !== partKey
      )
    );
  };

  // --- Invoice Item Calculation (Lifted from QuoteDetails) ---
  useEffect(() => {
    const fetchGlassInfo = async () => {
      const result = await Promise.all(selectedParts.map(async (p) => {
        const uniqueId = `${p.part.nags_glass_id || ""}|${p.part.oem_glass_id || ""}|${p.glass.code}`;

        let info = p.glassInfo;
        if (!info && p.part.nags_glass_id) {
          try {
            const res = await fetch(`${config.pythonApiUrl}agp/v1/glass-info?nags_glass_id=${p.part.nags_glass_id}`);
            if (res.ok) info = await res.json();
          } catch (err) { console.error("Failed to fetch glass info", err); }
        }

        const items = [];
        // Part Item
        const fullPartNumber = `${p.part.nags_glass_id || ""}${info?.ta ? " " + info.ta : ""}`.trim();
        items.push({
          type: "Part", id: uniqueId,
          prefixCd: getPrefixCd(p.glass), posCd: getPosCd(p.glass), sideCd: getSideCd(p.glass),
          nagsId: fullPartNumber, oemId: p.part.oem_glass_id || "",
          labor: Number(info?.labor) || "", description: p.part.part_description || "",
          manufacturer: info?.manufacturer || "", qty: 1,
          unitPrice: info?.list_price || 0, amount: info?.list_price || 0
        });

        // Labor Item
        if (Number(info?.labor) > 0) {
          const globalLaborRate = parseFloat(sessionStorage.getItem('GlobalLaborRate')) || 100;
          items.push({
            type: "Labor", id: `${uniqueId}_LABOR`,
            nagsId: "", oemId: "", labor: Number(info?.labor) || 0,
            description: "Installation Labor", manufacturer: "", qty: 1,
            unitPrice: globalLaborRate, amount: globalLaborRate, pricingType: "hourly"
          });
        }
        return items;
      }));
      setInvoiceItems(result.flat());
    };

    if (selectedParts.length > 0) fetchGlassInfo();
    else setInvoiceItems([]);
  }, [selectedParts]);


  return (
    <div className="min-h-screen bg-white flex flex-col px-0 pt-20 pb-2">
      <div className="w-full mx-auto space-y-4 flex flex-col max-w-[98%] 2xl:max-w-[1900px] flex-1">

        {/* TABS */}
        <div className="flex justify-start gap-0 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('quote')}
            className={`px-8 py-3 font-bold text-sm tracking-wide transition-all border-b-2 ${activeTab === 'quote'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Quote
          </button>
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-8 py-3 font-bold text-sm tracking-wide transition-all border-b-2 ${activeTab === 'customer'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Customer Information
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col min-h-0">

          {/* CUSTOMER TAB */}
          {activeTab === 'customer' && (
            <div className="w-full max-w-4xl mx-auto p-4">
              <CustomerPanel
                formData={customerData}
                setFormData={setCustomerData}
                setCanShowQuotePanel={() => { }}
                setPanel={() => setActiveTab('quote')}
              />
            </div>
          )}

          {/* QUOTE TAB */}
          {activeTab === 'quote' && (
            <div className="flex flex-col gap-4 h-full">

              {/* TOP ROW: Search (Left) + Graphic/Parts (Right) */}
              <div className="grid grid-cols-[380px_1fr] gap-4 h-[380px]">

                {/* LEFT: SEARCH */}
                <div className="border border-slate-200 bg-white p-3 flex flex-col gap-2 overflow-y-auto shadow-sm rounded-lg">
                  {/* VIN */}
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Search by VIN:</h2>
                    <ErrorBoundary>
                      <SearchByVin autoDecode delayMs={500} onDecoded={handleVinDecoded} />
                    </ErrorBoundary>
                  </div>
                  <hr className="border-slate-100" />
                  {/* YMM */}
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">Search by Year Make Model:</h2>
                    <ErrorBoundary>
                      <SearchByYMM
                        value={vehicleInfo}
                        onModelIdFetched={(id) => setModelId(id)}
                        onVehicleInfoUpdate={handleVehicleInfoUpdate}
                        className="w-full"
                        showSearch={true}
                      />
                    </ErrorBoundary>
                  </div>

                </div>

                {/* RIGHT: GRAPHIC & PARTS */}
                <div className={`border border-slate-200 bg-white p-0 overflow-hidden shadow-sm rounded-lg flex flex-col ${!modelId ? 'opacity-50 pointer-events-none grayscale' : ''}`}>

                  <div className="flex-1 overflow-hidden relative">
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
              </div>

              {/* BOTTOM ROW: QUOTE DETAILS */}
              <div className={`border-t-4 border-slate-800 bg-white shadow-sm ${!modelId && invoiceItems.length === 0 ? 'opacity-50' : ''}`}>
                <div className="p-4">
                  <QuotePanel
                    parts={invoiceItems}
                    onRemovePart={handleRemovePart}
                    customerData={customerData}
                  />
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SearchByRoot;
