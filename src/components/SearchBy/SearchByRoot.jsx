import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import { getPilkingtonPrice } from "../../api/getVendorPrices";

const SearchByRoot = () => {
  const [vinData, setVinData] = useState(null);
  const [modelId, setModelId] = useState(null);
  const [vehId, setVehId] = useState(null);
  const [vehicleInfo, setVehicleInfo] = useState({});
  const [selectedParts, setSelectedParts] = useState([]);
  const [activeTab, setActiveTab] = useState('quote');
  // Separated state for items to avoid overwrite conflicts
  const [editItems, setEditItems] = useState([]);
  const [derivedPartItems, setDerivedPartItems] = useState([]); // Items derived from selectedParts (via API)
  const [manualKitItems, setManualKitItems] = useState([]);     // Items manually added via modal (Kits)
  const [resetKey, setResetKey] = useState(0); // Key to force-reset child components

  // Store vendor pricing data for each part (keyed by part ID)
  const [vendorPricingData, setVendorPricingData] = useState({});

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
            originalPartId: item.partId, // Preserve backend ID for updates
            type: item.itemType === 'PART' ? 'Part' : (item.itemType === 'LABOR' ? 'Labor' : 'Service'),
            nagsId: item.nagsGlassId || "",
            oemId: "",
            description: item.partDescription || "",
            manufacturer: "",
            qty: item.quantity || 1,
            unitPrice: item.partPrice || 0,
            listPrice: item.listPrice || item.partPrice || 0, // Map listPrice or fallback to partPrice
            amount: item.itemTotal || (item.partPrice * item.quantity),
            labor: 0, // Labor is separated
            isManual: true,
            pricingType: "hourly"
          });

          // Linked Labor Item (if laborRate exists)
          if (item.laborRate && item.laborRate > 0) {
            result.push({
              id: `${partId}_LABOR`,
              // We don't have a distinct partId for linked labor in this flat map unless we check other items, 
              // but usually labor is part of the same item set or handled differently. 
              // If the backend treats them as separate items in the list, we might need logic to find the matching Labor item's ID.
              // For now, let's assume strict separate items in DB -> mapped here. 
              // Wait, the loop `flatMap` is over `serviceDocument.items`. 
              // IF the backend returns Labor as a separate row, it will be hit in the loop separately.
              // IF `logic` here is splitting one item into two, that implies the backend stored it as one or we are splitting view.
              // The provided log shows backend returns items list. 
              // If itemType is PART, we process it. If LABOR, we process it.
              // This logic `if (item.laborRate ...)` inside a map seems to imply splitting a PART item that HAS labor attached.
              // If the backend has SEPARATE items for part and labor, we shouldn't duplicate labor here.
              // Let's look at the backend response provided by user: 
              // It has `itemType: "PART"` and `itemType: "KIT"`. 
              // The part item has `laborHours` and `laborRate`.
              // So the frontend seems to split this single "Part with Labor" into two UI rows (Part row + Labor row).
              // So the Labor row in UI is "virtual" relative to the DB item? 
              // If so, it shouldn't have a `partId` of its own, OR it shares the `partId`?
              // The user request shows: `partId: 1001` for PART and `partId: 1003` for LABOR.
              // This suggests they CAN be separate items in DB.
              // But the current code splits a single `item` into Part + Labor if `laborRate > 0`.
              // CHECK: Does `serviceDocument.items` contain SEPARATE entries for Labor?
              // The provided JSON shows:
              // Item 1: Part DW02582 with laborHours 3.6.
              // Item 2: Kit HAH000004.
              // Logic: `mappedItems` flatMaps. 
              // If I have one item in DB that represents Part+Labor, and I create 2 UI items.
              // When saving back, do I merge them? 
              // `QuotePanel.jsx` handleSave:
              // `items.forEach`... if Part, push. if Labor, find linked Part and update its labor fields.
              // So yes, they are merged back into ONE item in the payload if they are linked.
              // So `originalPartId` belongs to the Part item. 
              // The Labor item is just UI state to hold the labor values for that Part.
              // SO, I do NOT need `originalPartId` on the labor item if it's merely a UI split of the Part.
              // BUT, if there are standalone Labor items (type LABOR), they hit the `else` block in `handleSave` (manualItems).
              // In `SearchByRoot`, `item.itemType === 'LABOR'` logic exists in line 140.
              // If `itemType` is LABOR, it goes to `result.push` with type Labor.
              // So purely manual labor items from DB have their own ID.
              // The `if (item.laborRate ...)` block (lines 155+) creates a *secondary* labor row for a PART item.
              // This secondary row doesn't need a DB ID because it's merged back into the Part item on save.
              // Correct.

              type: 'Labor',
              nagsId: "",
              oemId: "",
              description: `${item.laborHours || 0} hours`,
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

    setSelectedParts((prevParts) => {
      const alreadyAdded = prevParts.some(
        (p) =>
          p.part.nags_glass_id === part.nags_glass_id &&
          p.part.oem_glass_id === part.oem_glass_id &&
          p.glass.code === glass.code
      );
      return alreadyAdded ? prevParts : [...prevParts, { glass, part, glassInfo }];
    });

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

    // Add kit as a separate item in viewerItems
    const kitQty = selectedKit.QTY || 1;
    const kitPrice = 20; // Default kit price
    const kitItem = {
      type: "Kit",
      id: `kit_${selectedKit.NAGS_HW_ID}_${Date.now()}`,
      parentPartId: pendingKitData.partId,
      nagsId: selectedKit.NAGS_HW_ID,
      oemId: "",
      description: selectedKit.DSC || "Installation Kit",
      manufacturer: "",
      qty: kitQty,
      listPrice: 0, // No list price for kits
      unitPrice: kitPrice,
      amount: kitQty * kitPrice,
      labor: 0
    };

    setManualKitItems(prev => [...prev, kitItem]);
    setPendingKitData(null);
  };

  // Handle kit modal close without selection
  const handleKitModalClose = () => {
    setKitModalVisible(false);
    setPendingKitData(null);
  };

  // Handle removing a part
  const handleRemovePart = (partKey) => {
    console.log('[SearchByRoot] Removing part and vendor data for:', partKey);

    // 1. Remove from Edit Items (Saved Document Items)
    setEditItems((prev) => {
      const remaining = prev.filter(it => it.id !== partKey);
      if (remaining.length !== prev.length) {
        console.log('[SearchByRoot] Removed item from editItems:', partKey);
        return remaining;
      }
      return prev;
    });

    // 2. Remove from Viewer Items (Added Kits or manual additions)
    // Now split: check both derived and manual lists

    // Remove from Manual Kits
    setManualKitItems((prev) => {
      const remaining = prev.filter(it => it.id !== partKey);
      if (remaining.length !== prev.length) {
        console.log('[SearchByRoot] Removed item from manualKitItems:', partKey);
        return remaining;
      }
      return prev;
    });

    // Remove from Derived Parts is mainly handled by removing from selectedParts.
    // However, if we need to remove a derived part immediately visually before API sync:
    /*
    setDerivedPartItems((prev) => {
        const remaining = prev.filter(it => it.id !== partKey);
        return remaining;
    });
    */

    // 3. Remove Part Selection (triggers API calls, so optimize update)
    setSelectedParts((prevParts) => {
      const filtered = prevParts.filter(
        (p) => {
          const nagsId = p.part.nags_id || p.part.nags_glass_id;
          const oemId = p.part.oem_glass_id;
          const key = `${nagsId || ""}|${oemId || ""}|${p.glass.code}`;
          // Check against partKey (which might be random ID) OR the generated key
          return key !== partKey;
        }
      );

      // Only update state if length changed to prevent re-render loop
      if (filtered.length !== prevParts.length) {
        return filtered;
      }
      return prevParts;
    });

    // Also remove vendor pricing data for this part
    setVendorPricingData((prev) => {
      if (!prev[partKey]) return prev; // Optimize: don't update if key not present
      const updated = { ...prev };
      delete updated[partKey];
      console.log('[SearchByRoot] Vendor data after removal:', updated);
      return updated;
    });
  };

  // Handle document creation - switch to attachment tab
  const handleDocumentCreated = (documentNumber) => {
    setCreatedDocumentNumber(documentNumber);
    setActiveTab('attachment');
  };

  // --- Invoice Item Calculation (Lifted from QuoteDetails) ---
  useEffect(() => {
    const fetchGlassInfo = async () => {
      const result = await Promise.all(selectedParts.map(async (p) => {
        // Support both old and new API field names
        const nagsId = p.part.nags_id || p.part.nags_glass_id;
        const oemId = p.part.oem_glass_id;
        const uniqueId = `${nagsId || ""}|${oemId || ""}|${p.glass.code}`;

        // Check if we have new API format with all data included
        const hasNewFormat = p.part.nags_id && p.part.list_price !== undefined;

        let listPrice, netPrice, description, labor, manufacturer, ta;

        // Try to fetch vendor pricing first
        const userId = localStorage.getItem('userId') || 2;
        let vendorPrice = null;

        // Preserve NAGS list_price if available (from new API format)
        const nagsListPrice = p.part.list_price || 0;

        if (userId && nagsId) {
          try {
            // Construct part number with feature span if available
            let partNumber = p.part.feature_span
              ? `${nagsId} ${p.part.feature_span}`.trim()
              : nagsId;

            // Remove trailing 'N' from the part number for vendor API
            // Example: "FD28887 GTYN" becomes "FD28887 GTY"
            partNumber = partNumber.replace(/N$/, '');

            vendorPrice = await getPilkingtonPrice(userId, partNumber);

            if (vendorPrice) {
              console.log(`[Vendor Pricing] Found price for ${partNumber}:`, vendorPrice);

              // Store complete vendor pricing data for this part
              setVendorPricingData(prev => ({
                ...prev,
                [uniqueId]: vendorPrice  // Store full vendor response
              }));

              // Use vendor NetPrice for amount, but preserve NAGS list_price for List column
              netPrice = parseFloat(vendorPrice.UnitPrice) || 0;
              listPrice = nagsListPrice || parseFloat(vendorPrice.ListPrice) || netPrice;
              description = vendorPrice.Description || p.part.part_description || "Glass Part";
              // Keep labor and ta from existing data
              labor = p.part.labor || 0;
              ta = p.part.feature_span || "";
              manufacturer = "Pilkington";
              console.log(`[Vendor Pricing] Using NAGS list_price: ${listPrice}, Vendor NetPrice: ${netPrice}`);
            }
          } catch (err) {
            console.error("Failed to fetch vendor price:", err);
          }
        }

        // If no vendor price found, use existing logic
        if (!vendorPrice) {
          if (hasNewFormat) {
            // Use data directly from new API response
            listPrice = p.part.list_price || 0;
            netPrice = p.part.list_price || 0; // Use list_price as net price
            labor = p.part.labor || 0;
            ta = p.part.feature_span || "";
            description = p.part.part_description || "Glass Part";
            manufacturer = ""; // Not provided in new API
            console.log(`[Glass Parts API] Using list_price: ${listPrice} for part ${nagsId}`);
          } else {
            // Old format: fetch additional glass info
            let rawInfo = p.glassInfo;
            if (!rawInfo && nagsId) {
              try {
                const res = await fetch(`${config.pythonApiUrl}agp/v1/glass-info?nags_glass_id=${nagsId}`);
                if (res.ok) rawInfo = await res.json();
              } catch (err) { console.error("Failed to fetch glass info", err); }
            }

            // Use helper to extract data (prioritizing Pilkington)
            const extracted = extractGlassInfo(rawInfo, p.part.part_description);
            listPrice = extracted.listPrice;
            netPrice = extracted.netPrice;
            description = extracted.description;
            labor = extracted.labor;
            manufacturer = extracted.manufacturer;
            ta = extracted.ta;
          }
        }

        const items = [];
        // Part Item
        const fullPartNumber = `${nagsId || ""}${ta ? " " + ta : ""}`.trim();

        const partItem = {
          type: "Part", id: uniqueId,
          prefixCd: getPrefixCd(p.glass), posCd: getPosCd(p.glass), sideCd: getSideCd(p.glass),
          nagsId: fullPartNumber, oemId: oemId || "",
          labor: labor, description: description,
          manufacturer: manufacturer, qty: 1,
          listPrice: listPrice,
          unitPrice: netPrice, amount: netPrice
        };
        console.log(`[Item Created] Part ${fullPartNumber} with listPrice: ${listPrice}`, partItem);
        items.push(partItem);

        // Labor Item
        if (Number(labor) > 0) {
          const globalLaborRate = parseFloat(localStorage.getItem('GlobalLaborRate')) || 0;
          items.push({
            type: "Labor", id: `${uniqueId}_LABOR`,
            nagsId: "", oemId: "", labor: labor,
            description: `${labor} hours`, manufacturer: "", qty: 1,
            unitPrice: globalLaborRate, amount: globalLaborRate, pricingType: "hourly"
          });
        }
        return items;
      }));
      setDerivedPartItems(result.flat());
    };

    if (selectedParts.length > 0) fetchGlassInfo();
    else setDerivedPartItems([]);

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
        setSpecialInstructions("");
        setInsuranceData({});
        setIncludeInsurance(false);
        setAttachments([]);
        setSavedAttachments([]);
        setAttachments([]);
        setEditItems([]);
        setDerivedPartItems([]);
        setManualKitItems([]);
        setCustomerData(initialCustomerData);
        setVehicleInfo({});
        setVinData(null);
        setModelId(null);
        setVendorPricingData({}); // Clear vendor pricing data
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
              <div className={`flex-shrink-0 border-t-2 border-slate-800 bg-white shadow-sm mt-2 ${!modelId && editItems.length === 0 && derivedPartItems.length === 0 && manualKitItems.length === 0 ? 'opacity-50' : ''}`}>
                <div className="p-2">
                  <QuotePanel
                    key={`quote-${resetKey}`}
                    parts={[...editItems, ...derivedPartItems, ...manualKitItems]}
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
                    vendorPricingData={vendorPricingData}
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
