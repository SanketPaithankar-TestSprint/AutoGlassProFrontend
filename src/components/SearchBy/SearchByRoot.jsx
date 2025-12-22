import React, { useState, useEffect } from "react";
import SearchByVin from "./SearchByvin";
import SearchByYMM from "./SearchByYMM";
import CarGlassViewer from "../carGlassViewer/CarGlassViewer";
import QuotePanel from "../QuoteDetails/QuotePanel";
import CustomerPanel from "../QuoteDetails/CustomerPanel";
import ErrorBoundary from "../common/ErrorBoundary";
import config from "../../config";
import { getPrefixCd, getPosCd, getSideCd } from "../carGlassViewer/carGlassHelpers";
import InsuranceDetails from "../QuoteDetails/InsuranceDetails";
import AttachmentDetails from "../QuoteDetails/AttachmentDetails";

const SearchByRoot = () => {
  const [vinData, setVinData] = useState(null);
  const [modelId, setModelId] = useState(null);
  const [vehicleInfo, setVehicleInfo] = useState({});
  const [selectedParts, setSelectedParts] = useState([]);
  const [activeTab, setActiveTab] = useState('quote');
  const [invoiceItems, setInvoiceItems] = useState([]);

  // Initial Customer State Definition
  const initialCustomerData = {
    firstName: "", lastName: "", email: "", phone: "", alternatePhone: "",
    addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "",
    preferredContactMethod: "phone", notes: "",
    vehicleYear: "", vehicleMake: "", vehicleModel: "", vehicleStyle: "",
    licensePlateNumber: "", vin: "", vehicleNotes: "",
  };

  // Lifted Customer State
  const [customerData, setCustomerData] = useState(() => {
    const saved = localStorage.getItem("agp_customer_data");
    if (saved) {
      try { return { ...initialCustomerData, ...JSON.parse(saved) }; }
      catch (e) { console.error("Failed to parse saved customer data", e); }
    }
    return initialCustomerData;
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


  // Lifted Notes State
  const [printableNote, setPrintableNote] = useState("");
  const [internalNote, setInternalNote] = useState("");

  // Lifted Insurance & Attachment State
  const [insuranceData, setInsuranceData] = useState({});
  const [includeInsurance, setIncludeInsurance] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentDescription, setAttachmentDescription] = useState("");

  const tabs = [
    { id: 'quote', label: 'Quote' },
    { id: 'customer', label: 'Customer Information' },
    { id: 'insurance', label: 'Insurance' },
    { id: 'attachment', label: 'Attachment' },
    { id: 'notes', label: 'Notes' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col px-0 pt-0 pb-1">
      <div className="w-full mx-auto space-y-2 flex flex-col max-w-[98%] 2xl:max-w-[1900px] flex-1">

        {/* TABS */}
        <div className="flex justify-start gap-0 border-b border-slate-200 mb-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 font-bold text-sm tracking-wide transition-all border-b-2 ${activeTab === tab.id
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col min-h-0">

          <div className="flex-1 flex flex-col gap-2 min-h-0">
            {/* DYNAMIC TOP CONTENT BASED ON TAB */}
            <div className="flex-1 overflow-y-auto">

              <div className={activeTab === 'quote' ? 'block' : 'hidden'}>
                <div className="grid grid-cols-[380px_1fr] gap-2 h-[280px]">
                  {/* LEFT: SEARCH */}
                  <div className="border border-slate-200 bg-white p-2 flex flex-col gap-1 overflow-y-auto shadow-sm rounded-lg">
                    {/* VIN */}
                    <div>
                      <h2 className="text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Search by VIN:</h2>
                      <ErrorBoundary>
                        <SearchByVin autoDecode delayMs={500} onDecoded={handleVinDecoded} />
                      </ErrorBoundary>
                    </div>
                    <hr className="border-slate-100" />
                    {/* YMM */}
                    <div className="flex-1 flex flex-col">
                      <h2 className="text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Search by Year Make Model:</h2>
                      <ErrorBoundary>
                        <SearchByYMM
                          value={vehicleInfo}
                          onModelIdFetched={(id) => setModelId(id)}
                          onVehicleInfoUpdate={handleVehicleInfoUpdate}
                          className="w-full h-full"
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
              </div>

              {activeTab === 'customer' && (
                <div className="w-full p-2">
                  <CustomerPanel
                    formData={customerData}
                    setFormData={setCustomerData}
                    setCanShowQuotePanel={() => { }}
                    setPanel={() => setActiveTab('quote')}
                  />
                </div>
              )}

              {activeTab === 'insurance' && (
                <div className="p-4">
                  <InsuranceDetails
                    data={insuranceData}
                    onChange={setInsuranceData}
                    enabled={includeInsurance}
                    onToggle={setIncludeInsurance}
                  />
                </div>
              )}

              {activeTab === 'attachment' && (
                <div className="p-4">
                  <AttachmentDetails
                    attachmentFile={attachmentFile}
                    setAttachmentFile={setAttachmentFile}
                    attachmentDescription={attachmentDescription}
                    setAttachmentDescription={setAttachmentDescription}
                  />
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Printable Note</label>
                    <textarea
                      rows={6}
                      value={printableNote}
                      onChange={(e) => setPrintableNote(e.target.value)}
                      className="w-full rounded border border-slate-300 p-2 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                      placeholder="Notes visible to the customer on the quote/invoice..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Internal Note</label>
                    <textarea
                      rows={6}
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      className="w-full rounded border border-slate-300 p-2 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none bg-yellow-50"
                      placeholder="Internal notes for office use only..."
                    />
                  </div>
                </div>
              )}

              {/* BOTTOM ROW: QUOTE DETAILS (ALWAYS VISIBLE) */}
              <div className={`flex-shrink-0 border-t-2 border-slate-800 bg-white shadow-sm mt-2 ${!modelId && invoiceItems.length === 0 ? 'opacity-50' : ''}`}>
                <div className="p-2">
                  <QuotePanel
                    parts={invoiceItems}
                    onRemovePart={handleRemovePart}
                    customerData={customerData}
                    printableNote={printableNote}
                    internalNote={internalNote}
                    insuranceData={insuranceData}
                    includeInsurance={includeInsurance}
                    attachmentFile={attachmentFile}
                    attachmentDescription={attachmentDescription}
                    onClear={() => {
                      setSelectedParts([]);
                      setPrintableNote("");
                      setInternalNote("");
                      setInsuranceData({});
                      setIncludeInsurance(false);
                      setAttachmentFile(null);
                      setAttachmentDescription("");
                      setInvoiceItems([]); // Explicitly clear items as well to be safe
                      setCustomerData(initialCustomerData); // Clears customer data
                    }}
                  />
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SearchByRoot;
