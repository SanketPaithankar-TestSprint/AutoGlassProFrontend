import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Modal } from "antd";
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
import { getAttachmentsByDocumentNumber } from "../../api/getAttachmentsByDocumentNumber";

const SearchByRoot = () => {
  const [vinData, setVinData] = useState(null);
  const [modelId, setModelId] = useState(null);
  const [vehicleInfo, setVehicleInfo] = useState({});
  const [selectedParts, setSelectedParts] = useState([]);
  const [activeTab, setActiveTab] = useState('quote');
  // Separated state for items to avoid overwrite conflicts
  const [editItems, setEditItems] = useState([]);
  const [viewerItems, setViewerItems] = useState([]);
  const [resetKey, setResetKey] = useState(0); // Key to force-reset child components

  // Edit Workflow State
  const [isSaved, setIsSaved] = useState(false);
  const [docMetadata, setDocMetadata] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Modal Context for better visibility/theming
  const [modal, contextHolder] = Modal.useModal();

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

  const location = useLocation();

  useEffect(() => {
    document.title = "APAI | Search";
  }, []);

  // Handle Incoming Composite Data (Edit Mode)
  useEffect(() => {
    if (location.state?.compositeData) {
      const { serviceDocument, customer, vehicle, insurance, attachments: atts } = location.state.compositeData;

      // 0. Set Metadata & Saved State
      setIsSaved(true);
      if (serviceDocument) {
        setDocMetadata({
          documentNumber: serviceDocument.documentNumber,
          documentDate: serviceDocument.documentDate,
          createdAt: serviceDocument.createdAt, // Corrected field name from API
          updatedAt: serviceDocument.updatedAt
        });
      }

      // 1. Map Customer & Vehicle
      const newCustomerData = {
        firstName: customer?.firstName || "",
        lastName: customer?.lastName || "",
        email: customer?.email || "",
        phone: customer?.phone || "",
        alternatePhone: customer?.alternatePhone || "",
        addressLine1: customer?.addressLine1 || "",
        addressLine2: customer?.addressLine2 || "",
        city: customer?.city || "",
        state: customer?.state || "",
        postalCode: customer?.postalCode || "",
        country: customer?.country || "",
        preferredContactMethod: customer?.preferredContactMethod || "email",
        notes: customer?.notes || "",
        // Vehicle
        vehicleYear: vehicle?.vehicleYear || "",
        vehicleMake: vehicle?.vehicleMake || "",
        vehicleModel: vehicle?.vehicleModel || "",
        vehicleStyle: vehicle?.vehicleStyle || "",
        licensePlateNumber: vehicle?.licensePlateNumber || "",
        vin: vehicle?.vin || "",

        vehicleNotes: vehicle?.notes || ""
      };
      setCustomerData(prev => ({ ...prev, ...newCustomerData }));

      // 1.1 Update Vehicle Info State (for YMM Component)
      if (vehicle) {
        setVehicleInfo({
          year: vehicle.vehicleYear?.toString() || "",
          make: vehicle.vehicleMake || "",
          model: vehicle.vehicleModel || "",
          style: vehicle.vehicleStyle || "",
          vin: vehicle.vin || ""
        });
        // Also set VIN data if available to consistency?
        if (vehicle.vin) setVinData({ vin: vehicle.vin });
      }

      // 2. Map Items (Split Part/Labor for QuotePanel)
      if (serviceDocument?.items) {
        const mappedItems = serviceDocument.items.flatMap(item => {
          const partId = Math.random().toString(36).substring(2, 9);
          const result = [];

          // Part Item
          result.push({
            id: partId,
            type: item.itemType === 'PART' ? 'Part' : (item.itemType === 'LABOR' ? 'Labor' : 'Service'),
            nagsId: item.nagsGlassId || "",
            oemId: "",
            description: item.partDescription || "",
            manufacturer: "",
            qty: item.quantity || 1,
            unitPrice: item.partPrice || 0,
            amount: item.itemTotal || (item.partPrice * item.quantity),
            labor: 0, // Labor is separated
            isManual: true,
            pricingType: "hourly"
          });

          // Linked Labor Item (if laborRate exists)
          if (item.laborRate && item.laborRate > 0) {
            result.push({
              id: `${partId}_LABOR`,
              type: 'Labor',
              nagsId: "",
              oemId: "",
              description: `Installation Labor`,
              manufacturer: "",
              qty: 1,
              unitPrice: item.laborRate || 0, // Assuming laborRate is the total labor cost for this item
              amount: item.laborRate || 0,
              labor: item.laborHours || 0,
              isManual: true,
              pricingType: "hourly"
            });
          }

          return result;
        });
        setEditItems(mappedItems);
        // Also set Model ID if possible to unlock UI? 
        // We lack modelId from backend usually, so UI might stay gray, but QuotePanel will work.
      }

      // 3. Map Notes
      setPrintableNote(serviceDocument?.notes || "");

      // 4. Map Insurance
      if (insurance) {
        setInsuranceData(insurance);
        setIncludeInsurance(true);
      }

      // 5. Fetch Saved Attachments
      if (serviceDocument?.documentNumber) {
        getAttachmentsByDocumentNumber(serviceDocument.documentNumber)
          .then(fetchedAttachments => {
            console.log("Fetched attachments for edit mode:", fetchedAttachments);
            setSavedAttachments(fetchedAttachments || []);
          })
          .catch(err => {
            console.error("Failed to fetch attachments:", err);
            setSavedAttachments([]);
          });
      }
    }
  }, [location.state]);

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
      setViewerItems(result.flat());
    };

    if (selectedParts.length > 0) fetchGlassInfo();
    else setViewerItems([]);


  }, [selectedParts]);

  // Global Clear Handler
  const handleGlobalClear = () => {
    modal.confirm({
      title: "Clear All Details",
      content: "Are you sure you want to clear all details? This will reset the entire quote.",
      okText: "Yes, Clear All",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        setSelectedParts([]);
        setPrintableNote("");
        setInternalNote("");
        setInsuranceData({});
        setIncludeInsurance(false);
        setAttachments([]);
        setSavedAttachments([]);
        setAttachments([]);
        setEditItems([]);
        setViewerItems([]);
        setCustomerData(initialCustomerData);
        setVehicleInfo({});
        setVinData(null);
        setModelId(null);
        setResetKey(prev => prev + 1); // Force remount of search components
        setActiveTab('quote');
        setIsSaved(false);
        setDocMetadata(null);
        setIsEditMode(false);
      }
    });

  };


  // Lifted Notes State
  const [printableNote, setPrintableNote] = useState("");
  const [internalNote, setInternalNote] = useState("");

  // Lifted Insurance & Attachment State
  const [insuranceData, setInsuranceData] = useState({});
  const [includeInsurance, setIncludeInsurance] = useState(false);
  const [attachments, setAttachments] = useState([]); // Array { id, file, description }
  const [savedAttachments, setSavedAttachments] = useState([]); // Array of saved attachments from backend

  const tabs = [
    { id: 'quote', label: 'Quote' },
    { id: 'customer', label: 'Customer Information' },
    { id: 'insurance', label: 'Insurance' },
    { id: 'attachment', label: 'Attachment' },
    { id: 'notes', label: 'Notes' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col px-0 pt-0 pb-1">
      {contextHolder}
      <div className="w-full mx-auto space-y-2 flex flex-col max-w-[98%] 2xl:max-w-[1900px] flex-1">



        {/* TABS & ACTIONS */}
        <div className="flex justify-between items-center gap-0 border-b border-slate-200 mb-1">
          <div className="flex justify-start">
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

          <div className="pr-4">
            <button
              onClick={handleGlobalClear}
              className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-1 transition-colors px-3 py-1 rounded hover:bg-red-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Clear All
            </button>
          </div>
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
                        <SearchByVin key={`vin-${resetKey}`} autoDecode delayMs={500} onDecoded={handleVinDecoded} />
                      </ErrorBoundary>
                    </div>
                    <hr className="border-slate-100" />
                    {/* YMM */}
                    <div className="flex-1 flex flex-col">
                      <h2 className="text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Search by Year Make Model:</h2>
                      <ErrorBoundary>
                        <SearchByYMM
                          key={`ymm-${resetKey}`}
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
                          key={`${modelId || 'empty'}-${resetKey}`}
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
                    attachments={attachments}
                    setAttachments={setAttachments}
                    savedAttachments={savedAttachments}
                    setSavedAttachments={setSavedAttachments}
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
              <div className={`flex-shrink-0 border-t-2 border-slate-800 bg-white shadow-sm mt-2 ${!modelId && editItems.length === 0 && viewerItems.length === 0 ? 'opacity-50' : ''}`}>
                <div className="p-2">
                  <QuotePanel
                    key={`quote-${resetKey}`}
                    parts={[...editItems, ...viewerItems]}
                    onRemovePart={handleRemovePart}
                    customerData={customerData}
                    printableNote={printableNote}
                    internalNote={internalNote}
                    insuranceData={insuranceData}
                    includeInsurance={includeInsurance}
                    attachments={attachments}
                    docMetadata={docMetadata}
                    isSaved={isSaved}
                    isEditMode={isEditMode}
                    onEditModeChange={setIsEditMode}
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
