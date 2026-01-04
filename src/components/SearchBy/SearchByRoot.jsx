import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuoteStore } from "../../store";
import { useQueryClient } from "@tanstack/react-query";
import { useKitPrices } from "../../hooks/usePricing";
import { getPilkingtonPrice } from "../../api/getVendorPrices";
import { Modal } from "antd";
import SearchByVin from "./SearchByvin";
import SearchByYMM from "./SearchByYMM";
import CarGlassViewer from "../carGlassViewer/CarGlassViewer";
import QuotePanel from "../QuoteDetails/QuotePanel";
import CustomerPanel from "../QuoteDetails/CustomerPanel";
import KitSelectionModal from "../QuoteDetails/KitSelectionModal";
import ErrorBoundary from "../common/ErrorBoundary";
import config from "../../config";
import { getPrefixCd, getPosCd, getSideCd, extractGlassInfo } from "../carGlassViewer/carGlassHelpers";
import InsuranceDetails from "../QuoteDetails/InsuranceDetails";
import AttachmentDetails from "../QuoteDetails/AttachmentDetails";
import { getAttachmentsByDocumentNumber } from "../../api/getAttachmentsByDocumentNumber";
import { resolveVinModel } from "../../api/resolveVinModel";
import { getBodyTypes } from "../../api/getModels";
import { extractDoorCount, selectBodyTypeByDoors } from "../../utils/vinHelpers";


const SearchByRoot = () => {
  // Zustand Store
  const {
    vinData, setVinData,
    vehicleInfo, setVehicleInfo,
    selectedParts, addPart, removePart, setQuoteItems, quoteItems, resetStore
  } = useQuoteStore();

  const queryClient = useQueryClient();
  const { data: kitPricesList } = useKitPrices();

  const [modelId, setModelId] = useState(null);
  const [vehId, setVehId] = useState(null);
  // vehicleInfo, vinData, selectedParts removed from local state
  const [activeTab, setActiveTab] = useState('quote');
  // Separated state for items to avoid overwrite conflicts


  // Unused state removed: editItems, derivedPartItems, manualKitItems, vendorPricingData

  const [resetKey, setResetKey] = useState(0); // Key to force-reset child components

  // Kit Selection Modal State
  const [kitModalVisible, setKitModalVisible] = useState(false);
  const [pendingKitData, setPendingKitData] = useState(null); // { kits: [], partId: '', partNumber: '' }


  // Edit Workflow State
  const [isSaved, setIsSaved] = useState(false);
  const [docMetadata, setDocMetadata] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [createdDocumentNumber, setCreatedDocumentNumber] = useState(null);

  // Modal Context for better visibility/theming
  const [modal, contextHolder] = Modal.useModal();

  // Initial Customer State Definition
  const initialCustomerData = {
    firstName: "", lastName: "", email: "", phone: "", alternatePhone: "",
    addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "",
    preferredContactMethod: "phone", notes: "",
    vehicleYear: "", vehicleMake: "", vehicleModel: "", vehicleStyle: "", bodyType: "",
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
  const navigate = useNavigate();

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
          createdAt: serviceDocument.createdAt,
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
        bodyType: vehicle?.bodyType || "",
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
            originalPartId: item.partId,
            type: item.itemType === 'PART' ? 'Part' : (item.itemType === 'LABOR' ? 'Labor' : 'Service'),
            nagsId: item.nagsGlassId || "",
            oemId: "",
            description: item.partDescription || "",
            manufacturer: "",
            qty: item.quantity || 1,
            unitPrice: item.partPrice || 0,
            listPrice: item.listPrice || item.partPrice || 0,
            amount: item.itemTotal || (item.partPrice * item.quantity),
            labor: 0,
            isManual: true,
            pricingType: "hourly"
          });

          // Linked Labor Item
          if (item.laborRate && item.laborRate > 0) {
            result.push({
              id: `${partId}_LABOR`,
              type: 'Labor',
              nagsId: "",
              oemId: "",
              description: `${item.laborHours || 0} hours`,
              manufacturer: "",
              qty: 1,
              unitPrice: item.laborRate || 0,
              amount: item.laborRate || 0,
              labor: item.laborHours || 0,
              isManual: true,
              pricingType: "hourly"
            });
          }
          return result;
        });
        // Set global store items
        setQuoteItems(mappedItems);
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

  // Handle VIN decode with model resolution and body type auto-selection
  const handleVinDecoded = async (data) => {
    setVinData(data);
    if (!data) return;

    try {
      const { year, make, model: vinModel } = data;

      // Step 1: Resolve the model name using fuzzy matching
      const { resolvedModel, matchFound } = await resolveVinModel(year, make, vinModel);



      // Step 2: Fetch body types for the resolved model (but don't auto-select if door count is unknown)
      let selectedBodyStyleId = null;
      try {
        const bodyTypesData = await getBodyTypes(year, make, resolvedModel);
        const bodyTypesList = Array.isArray(bodyTypesData?.body_types) ? bodyTypesData.body_types : [];

        if (bodyTypesList.length > 0) {
          // Step 3: Extract door count
          const doorCount = extractDoorCount(data);

          // Only attempt auto-selection if we successfully extracted door count
          if (doorCount) {
            selectedBodyStyleId = selectBodyTypeByDoors(bodyTypesList, doorCount);
          }
        }
      } catch (error) {
        console.error("[VIN Decode] Error fetching/selecting body type:", error);
      }

      // Step 4: Update vehicle info with resolved data
      const info = {
        year,
        make,
        model: resolvedModel, // Use resolved model
        body: data.body_type || data.vehicle_type,
        bodyStyleId: selectedBodyStyleId // Include auto-selected body type
      };

      setVehicleInfo(info);

      // Step 5: Auto-update customer vehicle info
      setCustomerData(prev => ({
        ...prev,
        vehicleYear: info.year || prev.vehicleYear,
        vehicleMake: info.make || prev.vehicleMake,
        vehicleModel: info.model || prev.vehicleModel,
        vehicleStyle: info.body || prev.vehicleStyle,
        bodyType: info.body || prev.bodyType, // Added bodyType persistence
        vin: data.vin || prev.vin
      }));

    } catch (error) {
      console.error("[VIN Decode] Error in handleVinDecoded:", error);
      // Fallback to basic behavior
      const info = { year: data.year, make: data.make, model: data.model, body: data.body_type || data.vehicle_type };
      setVehicleInfo(info);
      setCustomerData(prev => ({
        ...prev,
        vehicleYear: info.year || prev.vehicleYear,
        vehicleMake: info.make || prev.vehicleMake,
        vehicleModel: info.model || prev.vehicleModel,
        vehicleStyle: info.body || prev.vehicleStyle,
        bodyType: info.body || prev.bodyType, // Added bodyType persistence
        vin: data.vin || prev.vin
      }));
    }
  };

  // Handle vehicle info update from YMM
  const handleVehicleInfoUpdate = (info) => {
    setVehicleInfo(info);
    // Extract veh_id if present
    if (info.veh_id) {
      setVehId(info.veh_id);
    }
    setCustomerData(prev => ({
      ...prev,
      vehicleYear: info.year || prev.vehicleYear,
      vehicleMake: info.make || prev.vehicleMake,
      vehicleModel: info.model || prev.vehicleModel,
      vehicleStyle: info.description || prev.vehicleStyle, // Use description for style if available
      bodyType: info.bodyType || prev.bodyType, // Use bodyType description for display and storage
    }));
  };

  // Handle adding a part
  const handleAddPart = ({ glass, part, glassInfo }) => {
    const nagsId = part.nags_id || part.nags_glass_id;
    const featureSpan = part.feature_span || '';
    const fullPartNumber = `${nagsId}${featureSpan ? ' ' + featureSpan : ''}`;
    const uniqueId = `${nagsId || ""}|${part.oem_glass_id || ""}|${glass.code}`;

    // Check if already added using distinct ID
    const alreadyAdded = selectedParts.some(p => p.id === uniqueId);

    if (!alreadyAdded) {
      addPart({ glass, part, glassInfo, id: uniqueId });
      // Add to Quote Items directly
      processAndAddPart({ glass, part, glassInfo });
    }

    // Check if part has kit options
    if (part.kit && Array.isArray(part.kit) && part.kit.length > 0) {
      console.log('[SearchByRoot] Part has kit options:', part.kit);
      const partId = `${nagsId || ""}|${part.oem_glass_id || ""}|${glass.code}`;
      setPendingKitData({
        kits: part.kit,
        partId: partId,
        partNumber: fullPartNumber
      });
      setKitModalVisible(true);
    }
  };

  // Handle kit selection from modal
  const handleKitSelect = (selectedKit) => {
    if (!selectedKit || !pendingKitData) return;

    console.log('[SearchByRoot] Kit selected:', selectedKit);

    // Add kit as a separate item in quoteItems
    const kitQty = selectedKit.QTY || 1;

    // Use price from modal if available, otherwise look up or default
    let kitPrice = selectedKit.unitPrice;
    if (kitPrice === undefined || kitPrice === null || isNaN(kitPrice)) {
      const foundPrice = kitPricesList?.find(k => k.kit_code === selectedKit.NAGS_HW_ID)?.kit_price;
      kitPrice = foundPrice !== undefined ? foundPrice : 20;
    }

    const kitItem = {
      type: "Kit",
      id: `kit_${selectedKit.NAGS_HW_ID}_${Date.now()}`,
      parentPartId: pendingKitData.partId,
      nagsId: selectedKit.NAGS_HW_ID,
      oemId: "",
      description: selectedKit.DSC || "Installation Kit",
      manufacturer: "",
      qty: kitQty,
      listPrice: 0,
      unitPrice: kitPrice,
      amount: kitQty * kitPrice,
      labor: 0
    };

    setQuoteItems(prev => [...prev, kitItem]);
    setPendingKitData(null);
  };

  // Handle kit modal close without selection
  const handleKitModalClose = () => {
    setKitModalVisible(false);
    setPendingKitData(null);
  };

  // Handle removing a part
  const handleRemovePart = (partKey) => {
    // 3. Remove Part Selection from Store (triggers UI update)
    // Also remove from Quote Items
    setQuoteItems(prev => prev.filter(it => {
      // Filter out item if it matches partKey (Part ID)
      // OR if it is a labor item linked to that part (partKey_LABOR)
      if (it.id === partKey) return false;
      if (it.id === `${partKey}_LABOR`) return false;
      // Also check if partKey is parent of a Kit
      if (it.parentPartId === partKey) return false;
      return true;
    }));

    // Remove from selected parts in store
    removePart(partKey);
  };

  // Handle document creation - switch to attachment tab
  const handleDocumentCreated = (documentNumber) => {
    setCreatedDocumentNumber(documentNumber);
    setActiveTab('attachment');
  };

  // --- Helper to process and add part with pricing ---
  const processAndAddPart = async ({ glass, part, glassInfo }) => {
    // Support both old and new API field names
    const nagsId = part.nags_id || part.nags_glass_id;
    const oemId = part.oem_glass_id;
    const uniqueId = `${nagsId || ""}|${oemId || ""}|${glass.code}`;

    // Check for new API format
    const hasNewFormat = p => p.nags_id && p.list_price !== undefined;
    const isNewFormat = hasNewFormat(part);

    let listPrice, netPrice, description, labor, manufacturer, ta;

    // Fetch Vendor Pricing
    const userId = localStorage.getItem('userId') || 2;
    let vendorPrice = null;
    const nagsListPrice = part.list_price || 0;

    if (userId && nagsId) {
      try {
        let partNumber = part.feature_span ? `${nagsId} ${part.feature_span}`.trim() : nagsId;
        partNumber = partNumber.replace(/N$/, '');

        // Use QueryClient to fetch with cache
        vendorPrice = await queryClient.fetchQuery({
          queryKey: ['pilkingtonPrice', userId, partNumber],
          queryFn: () => getPilkingtonPrice(userId, partNumber),
          staleTime: 1000 * 60 * 60
        });

      } catch (err) { console.error("Failed to fetch vendor price", err); }
    }

    if (vendorPrice) {
      netPrice = parseFloat(vendorPrice.UnitPrice) || 0;
      listPrice = nagsListPrice || parseFloat(vendorPrice.ListPrice) || netPrice;
      description = vendorPrice.Description || part.part_description || "Glass Part";
      labor = part.labor || 0;
      ta = part.feature_span || "";
      manufacturer = "Pilkington";
    } else if (isNewFormat) {
      listPrice = part.list_price || 0;
      netPrice = part.list_price || 0;
      labor = part.labor || 0;
      ta = part.feature_span || "";
      description = part.part_description || "Glass Part";
      manufacturer = "";
    } else {
      // Old format fallback
      let rawInfo = glassInfo;
      if (!rawInfo && nagsId) {
        try {
          const res = await fetch(`${config.pythonApiUrl}agp/v1/glass-info?nags_glass_id=${nagsId}`);
          if (res.ok) rawInfo = await res.json();
        } catch (err) { }
      }
      const extracted = extractGlassInfo(rawInfo, part.part_description);
      listPrice = extracted.listPrice;
      netPrice = extracted.netPrice;
      description = extracted.description;
      labor = extracted.labor;
      manufacturer = extracted.manufacturer;
      ta = extracted.ta;
    }

    const newItems = [];
    const fullPartNumber = `${nagsId || ""}${ta ? " " + ta : ""}`.trim();

    const partItem = {
      type: "Part", id: uniqueId,
      prefixCd: getPrefixCd(glass), posCd: getPosCd(glass), sideCd: getSideCd(glass),
      nagsId: fullPartNumber, oemId: oemId || "",
      labor: labor, description: description,
      manufacturer: manufacturer, qty: 1,
      listPrice: listPrice,
      unitPrice: netPrice, amount: netPrice,
      isManual: false
    };
    newItems.push(partItem);

    if (Number(labor) > 0) {
      const globalLaborRate = parseFloat(localStorage.getItem('GlobalLaborRate')) || 0;
      newItems.push({
        type: "Labor", id: `${uniqueId}_LABOR`,
        nagsId: "", oemId: "", labor: labor,
        description: `${labor} hours`, manufacturer: "", qty: 1,
        unitPrice: globalLaborRate, amount: globalLaborRate, pricingType: "hourly",
        isManual: false
      });
    }

    setQuoteItems(prev => [...prev, ...newItems]);
  };


  // Global Clear Handler
  const handleGlobalClear = () => {
    modal.confirm({
      title: "Clear All Details",
      content: "Are you sure you want to clear all details? This will reset the entire quote.",
      okText: "Yes, Clear All",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        // 1. Clear Local Storage FIRST
        localStorage.removeItem("agp_customer_data");
        // Also clear other related keys if necessary
        // localStorage.removeItem("user_kit_prices"); // Keep kit prices? Probably yes.

        // 2. Reset Store (Global State)
        resetStore();

        // 3. Reset Local State
        setPrintableNote("");
        setInternalNote("");
        setSpecialInstructions("");
        setInsuranceData({});
        setIncludeInsurance(false);
        setAttachments([]);
        setSavedAttachments([]);
        setEditItems([]);
        setDerivedPartItems([]); // Ensure these legacy states are cleared if they exist in closure
        setManualKitItems([]);
        setCreatedDocumentNumber(null); // Clear document number

        // 4. Reset Customer & Vehicle
        // Passing a new object ensures the useEffect sees a change, 
        // but since we cleared localStorage, it should be fine.
        setCustomerData({ ...initialCustomerData });
        setVehicleInfo({});
        setVinData(null);
        setModelId(null);
        setVendorPricingData({});

        // 5. UI Resets
        setResetKey(prev => prev + 1); // Force remount of search components
        setActiveTab('quote');
        setIsSaved(false);
        setDocMetadata(null);
        setIsEditMode(false);

        // 6. Clear Navigation State
        navigate(location.pathname, { replace: true, state: {} });
      }
    });

  };


  // Lifted Notes State
  const [printableNote, setPrintableNote] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

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

      {/* Kit Selection Modal */}
      <KitSelectionModal
        visible={kitModalVisible}
        onClose={handleKitModalClose}
        onSelect={handleKitSelect}
        kits={pendingKitData?.kits || []}
        partNumber={pendingKitData?.partNumber || ''}
      />

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
                          vehId={vehId}
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
                    key={`cust-${resetKey}`}
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
                    createdDocumentNumber={createdDocumentNumber || docMetadata?.documentNumber}
                    customerData={customerData}
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
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Special Instructions</label>
                    <textarea
                      rows={6}
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full rounded border border-slate-300 p-2 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none bg-yellow-50"
                      placeholder="Special are from the shop that will inculded in the bottom of the pdf quote/invoice..."
                    />
                  </div>
                </div>
              )}

              {/* BOTTOM ROW: QUOTE DETAILS (ALWAYS VISIBLE) */}
              <div className={`flex-shrink-0 border-t-2 border-slate-800 bg-white shadow-sm mt-2 ${!modelId && quoteItems.length === 0 ? 'opacity-50' : ''}`}>
                <div className="p-2">
                  <QuotePanel
                    key={`quote-${resetKey}`}

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
                    onDocumentCreated={handleDocumentCreated}

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
