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
import PaymentPanel from "../QuoteDetails/PaymentPanel";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';


const SearchByRoot = () => {
  console.log("Rendering SearchByRoot - Card Redesign Active");
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
  const [preSelectedGlassCodes, setPreSelectedGlassCodes] = useState([]);


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
  const [lastRemovedPartKey, setLastRemovedPartKey] = useState(null); // Track last removed part for CarGlassViewer sync
  const [aiContactFormId, setAiContactFormId] = useState(null); // Track AI Contact Form ID to update status on completion

  // Modal Context for better visibility/theming
  const [modal, contextHolder] = Modal.useModal();

  // Initial Customer State Definition
  const initialCustomerData = {
    firstName: "", lastName: "", email: "", phone: "", alternatePhone: "",
    addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "",
    preferredContactMethod: "phone", notes: "",
    vehicleYear: "", vehicleMake: "", vehicleModel: "", vehicleStyle: "", bodyType: "",
    licensePlateNumber: "", vin: "", vehicleNotes: "",
    // Organization Fields
    customerType: "INDIVIDUAL",
    organizationId: null,
    organizationName: "",
    taxId: "",
    isTaxExempt: false,
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

  // Handle Incoming Composite Data (Edit Mode) OR Prefill Data (New Quote)
  useEffect(() => {
    if (location.state?.compositeData) {
      const { serviceDocument, customer, vehicle, insurance, attachments: atts } = location.state.compositeData;
      console.log("[SearchByRoot] Loading Composite Data for Edit:", serviceDocument);
      // 0. Set Metadata & Saved State
      setIsSaved(true);
      if (serviceDocument) {
        setDocMetadata({
          documentNumber: serviceDocument.documentNumber,
          documentType: serviceDocument.documentType,
          documentDate: serviceDocument.documentDate,
          createdAt: serviceDocument.createdAt,
          updatedAt: serviceDocument.updatedAt
        });

        // 0.1 Map Payments
        if (serviceDocument.payments && Array.isArray(serviceDocument.payments) && serviceDocument.payments.length > 0) {
          // Take the most recent payment or just the first one for now (UI limitation to single payment entry)
          const pay = serviceDocument.payments[0];
          setPaymentData({
            amount: pay.amount || 0,
            paymentMethod: pay.paymentMethod || "OTHER",
            transactionReference: pay.transactionReference || "",
            paymentMethod: pay.paymentMethod || "OTHER",
            transactionReference: pay.transactionReference || "",
            notes: pay.notes || ""
          });
          // Store full payment history
          setExistingPayments(serviceDocument.payments);
        } else {
          setExistingPayments([]);
        }
      }

      // 1. Map Customer & Vehicle
      const newCustomerData = {
        firstName: customer?.firstName || "",
        lastName: customer?.lastName || "",
        email: customer?.email || "",
        // Organization Mapping
        customerType: customer?.customerType || "INDIVIDUAL",
        organizationId: customer?.organizationId || null,
        organizationName: customer?.organizationName || "",
        taxId: customer?.taxId || "", // If preserved in customer object
        isTaxExempt: customer?.isTaxExempt || false, // If preserved

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
          bodyType: vehicle.bodyType || "", // Pass body type description
          vin: vehicle.vin || ""
        });
        if (vehicle.vin) setVinData({ vin: vehicle.vin });
      }

      // 2. Map Items (Split Part/Labor for QuotePanel)
      if (serviceDocument?.items) {
        const mappedItems = serviceDocument.items.flatMap(item => {
          const partId = Math.random().toString(36).substring(2, 9);
          const result = [];

          // Part Item - use partPrice for amount, not itemTotal (to avoid double-counting labor)
          result.push({
            id: partId,
            originalPartId: item.partId,
            type: item.itemType === 'PART' ? 'Part' : (item.itemType === 'LABOR' ? 'Labor' : (item.itemType === 'ADAS' ? 'ADAS' : 'Service')),
            nagsId: item.nagsGlassId || "",
            oemId: "",
            description: item.partDescription || "",
            adasCode: item.itemType === 'ADAS' && item.partDescription ? item.partDescription.replace('ADAS Recalibration - ', '') : null,
            manufacturer: "",
            qty: item.quantity || 1,
            unitPrice: item.partPrice || 0,
            listPrice: item.listPrice || item.partPrice || 0,
            amount: (item.partPrice || 0) * (item.quantity || 1),
            labor: 0,
            isManual: true,
            pricingType: "hourly"
          });

          // Linked Labor Item (Only for PART items, not for LABOR items)
          if (item.itemType === 'PART' && item.laborRate && item.laborRate > 0) {
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
          // Linked Kit Item (Unpacking from Part)
          if (item.kitId || (item.kitPrice && Number(item.kitPrice) > 0)) {
            result.push({
              type: 'Kit',
              id: `kit_${item.kitId || 'unknown'}_${Math.random().toString(36).substring(2, 7)}`,
              parentPartId: partId,
              nagsId: item.kitId || "",
              oemId: "",
              description: item.kitDescription || "Installation Kit",
              manufacturer: "",
              qty: item.kitQuantity || 1,
              unitPrice: item.kitPrice || 0,
              listPrice: item.kitListPrice || 0,
              amount: item.kitPrice || 0,
              labor: 0
            });
          }

          return result;
        });
        // Set global store items
        setQuoteItems(mappedItems);
      }

      // 3. Map Notes
      setPrintableNote(serviceDocument?.customerNotes || serviceDocument?.notes || "");
      setInternalNote(serviceDocument?.internalNotes || "");

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
    } else if (location.state?.prefillData) {
      // Handle Prefill Data (from AI Contact Form or similar)
      const { customer, vehicle, items, notes, aiContactFormId: incomingAiContactFormId } = location.state.prefillData;
      console.log("[SearchByRoot] Handling Prefill Data:", location.state.prefillData);

      // 0. Ensure New Quote Mode
      setIsSaved(false);
      setDocMetadata(null);
      if (incomingAiContactFormId) {
        setAiContactFormId(incomingAiContactFormId);
      }

      // 1. Map Customer
      if (customer) {
        setCustomerData(prev => ({
          ...prev,
          firstName: customer.firstName || "",
          lastName: customer.lastName || "",
          email: customer.email || "",
          phone: customer.phone || "",
          addressLine1: customer.addressLine1 || "",
          city: customer.city || "",
          state: customer.state || "",
          postalCode: customer.postalCode || "",
          country: customer.country || "",
          notes: notes || ""
        }));

        // Save userId if present (for logic that depends on it)
        if (customer.userId) {
          localStorage.setItem('userId', customer.userId.toString());
        }
      }

      // 2. Map Vehicle
      if (vehicle) {
        const newVehicleInfo = {
          year: vehicle.vehicleYear?.toString() || "",
          make: vehicle.vehicleMake || "",
          model: vehicle.vehicleModel || "",
          style: vehicle.vehicleStyle || "",
          bodyType: vehicle.bodyType || "",
          vin: vehicle.vin || ""
        };
        setVehicleInfo(newVehicleInfo);

        // Sync with customer data vehicle fields
        setCustomerData(prev => ({
          ...prev,
          vehicleYear: newVehicleInfo.year,
          vehicleMake: newVehicleInfo.make,
          vehicleModel: newVehicleInfo.model,
          vehicleStyle: newVehicleInfo.style,
          bodyType: newVehicleInfo.bodyType
        }));

        // Force model/vehicle update in YMM component if we have IDs (might need more logic in YMM)
        if (vehicle.vehicleId) {
          setVehId(vehicle.vehicleId);
        }
      }

      // 3. Extract Glass Codes for Pre-selection (don't add items directly)
      if (items && Array.isArray(items)) {
        const codes = items
          .map(item => item.nagsId || item.glassType) // Use nagsId (glass_code) or fallback to type
          .filter(Boolean);

        setPreSelectedGlassCodes(codes);
      }

      // 4. Notes
      if (notes) {
        setInternalNote(notes);
      }
    }
  }, [location.state]);

  // Persist Customer Data
  useEffect(() => {
    if (customerData) {
      localStorage.setItem("agp_customer_data", JSON.stringify(customerData));
    }
  }, [customerData]);

  // Handle VIN decode - now receives all IDs directly from API
  const handleVinDecoded = async (data) => {
    setVinData(data);
    if (!data) return;

    // All IDs come directly from the VIN API with lookup_ids=true
    const {
      year,
      make,
      model,
      body_type,
      make_id,
      make_model_id,
      veh_modifier_id,
      body_style_id,
      veh_id
    } = data;

    console.log('[VIN Decode] Received data with IDs:', {
      make_id,
      make_model_id,
      veh_modifier_id,
      body_style_id,
      veh_id
    });

    // Build vehicle info with all IDs for SearchByYMM
    const info = {
      year,
      make,                           // Display name
      makeId: make_id,                // ID for dropdowns/API
      model,                          // Display name  
      makeModelId: make_model_id,     // ID for dropdowns/API
      vehModifierId: veh_modifier_id, // Optional modifier ID
      body: body_type,                // Display name
      bodyStyleId: body_style_id,     // ID for dropdown
      vehId: veh_id                   // Vehicle ID for parts lookup
    };

    setVehicleInfo(info);

    // Set vehId for CarGlassViewer if available
    if (veh_id) {
      setVehId(veh_id);
    }

    // Update customer data with vehicle info and backend IDs
    setCustomerData(prev => ({
      ...prev,
      vehicleYear: year || prev.vehicleYear,
      vehicleMake: make || prev.vehicleMake,
      vehicleModel: model || prev.vehicleModel,
      vehicleStyle: body_type || prev.vehicleStyle,
      bodyType: body_type || prev.bodyType,
      vin: data.vin || prev.vin,
      // Include backend IDs for composite service document
      makeId: make_id || prev.makeId,
      modelId: make_model_id || prev.modelId,
      bodyStyleId: body_style_id || prev.bodyStyleId,
      vehId: veh_id || prev.vehId,
    }));
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
      // Include backend IDs for composite service document
      makeId: info.makeId || prev.makeId,
      modelId: info.makeModelId || prev.modelId,
      bodyStyleId: info.bodyStyleId || prev.bodyStyleId,
      vehId: info.veh_id || info.vehId || prev.vehId,
    }));
  };

  // Handle adding a part
  const handleAddPart = async ({ glass, part, glassInfo }) => {
    const nagsId = part.nags_id || part.nags_glass_id;
    const featureSpan = part.feature_span || '';
    const fullPartNumber = `${nagsId}${featureSpan ? ' ' + featureSpan : ''}`;
    // Include feature_span in uniqueId to differentiate parts with same NAGS ID but different features
    const uniqueId = `${nagsId || ""}|${featureSpan}|${part.oem_glass_id || ""}|${glass.code}`;

    // Check if already added using distinct ID
    const alreadyAdded = selectedParts.some(p => p.id === uniqueId);

    if (!alreadyAdded) {
      addPart({ glass, part, glassInfo, id: uniqueId });
      // Add to Quote Items directly and WAIT for it to complete
      await processAndAddPart({ glass, part, glassInfo });
    }

    // Check if part has kit options
    if (part.kit && Array.isArray(part.kit) && part.kit.length > 0) {
      console.log('[SearchByRoot] Part has kit options:', part.kit);
      const partId = uniqueId; // ENSURE THIS MATCHES THE ID USED IN processAndAddPart
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
    const kitQtyFromApi = selectedKit.QTY || 1; // Keep for description reference only

    // Use price from modal if available, otherwise look up or default
    let kitPrice = selectedKit.unitPrice;
    if (kitPrice === undefined || kitPrice === null || isNaN(kitPrice)) {
      const foundPrice = kitPricesList?.find(k => k.kit_code === selectedKit.NAGS_HW_ID)?.kit_price;
      kitPrice = foundPrice !== undefined ? foundPrice : 20;
    }

    // Include API QTY in description for reference, but qty in panel is always 1
    const formattedQty = Number(kitQtyFromApi).toFixed(1); // Always show one decimal (e.g., 2.0)
    const kitDescription = selectedKit.DSC ? `${formattedQty} ${selectedKit.DSC}` : "Installation Kit";

    const kitItem = {
      type: "Kit",
      id: `kit_${selectedKit.NAGS_HW_ID}_${Date.now()}`,
      parentPartId: pendingKitData.partId,
      nagsId: selectedKit.NAGS_HW_ID, // Use NAGS_HW_ID as the main ID
      oemId: "",
      description: kitDescription, // QTY + DSC for reference
      manufacturer: "",
      qty: 1, // Always 1 in the quote panel
      listPrice: 0,
      unitPrice: kitPrice,
      amount: kitPrice, // qty is 1, so amount = kitPrice
      labor: 0
    };

    setQuoteItems(prev => {
      // Find index of parent part
      const parentIndex = prev.findIndex(item => item.id === pendingKitData.partId);

      if (parentIndex !== -1) {
        // Insert kit item specifically after its parent part
        const newItems = [...prev];
        // If the next item is labor for this part, insert after that too?
        // Usually safer to just insert after parent.
        // Let's check if parent has labor attached (id_LABOR)
        const possibleLaborIndex = prev.findIndex(item => item.id === `${pendingKitData.partId}_LABOR`);

        let insertIndex = parentIndex + 1;
        if (possibleLaborIndex !== -1 && possibleLaborIndex > parentIndex) {
          insertIndex = possibleLaborIndex + 1;
        }

        newItems.splice(insertIndex, 0, kitItem);
        return newItems;
      } else {
        // Fallback: append if parent not found (shouldn't happen)
        return [...prev, kitItem];
      }
    });
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

    // Set last removed part key to trigger CarGlassViewer sync
    setLastRemovedPartKey(partKey);
    // Reset after a brief delay to allow re-removal of same part if needed
    setTimeout(() => setLastRemovedPartKey(null), 100);
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
    const featureSpan = part.feature_span || '';
    // Include feature_span in uniqueId to differentiate parts with same NAGS ID but different features
    const uniqueId = `${nagsId || ""}|${featureSpan}|${oemId || ""}|${glass.code}`;

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

    // Override description if qualifiers include 'Aftermarket'
    const fullPartNumber = `${nagsId || ""}${ta ? " " + ta : ""}`.trim();

    if (part.qualifiers && part.qualifiers.includes('Aftermarket')) {
      const qualStr = part.qualifiers.join(', ');
      description = `${fullPartNumber} (${qualStr})`;
    }

    const newItems = [];


    const partItem = {
      type: "Part", id: uniqueId,
      prefixCd: getPrefixCd(glass), posCd: getPosCd(glass), sideCd: getSideCd(glass),
      nagsId: fullPartNumber, oemId: oemId || "",
      labor: labor, description: description,
      manufacturer: manufacturer, qty: 1,
      listPrice: listPrice,
      unitPrice: netPrice, amount: netPrice,
      isManual: false,
      // Attach vendor data for display in QuotePanel
      vendorData: vendorPrice ? {
        industryCode: vendorPrice.IndustryCode,
        availability: vendorPrice.AvailabilityToPromise,
        leadTime: vendorPrice.LeadTimeFormatted || vendorPrice.LeadTime,
        manufacturer: "Pilkington"
      } : null
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
  const handleGlobalClear = (skipConfirm = false) => {
    const performClear = () => {
      // 1. Clear Local Storage FIRST
      localStorage.removeItem("agp_customer_data");

      // 2. Reset Store (Global State)
      resetStore();

      // 3. Reset Local State
      setPrintableNote("");
      setInternalNote("");

      setInsuranceData({});
      setIncludeInsurance(false);
      setAttachments([]);
      setSavedAttachments([]);
      setCreatedDocumentNumber(null); // Clear document number
      setExistingPayments([]); // Clear existing payments
      setPaymentData({        // Reset current payment entry
        amount: 0,
        paymentMethod: "CREDIT_CARD",
        transactionReference: "",
        notes: ""
      });

      // 4. Reset Customer & Vehicle
      setCustomerData({ ...initialCustomerData });
      setVehicleInfo({});
      setVinData(null);
      setModelId(null);
      setVehId(null); // Added this to clear the model view correctly

      // 5. UI Resets
      setResetKey(prev => prev + 1); // Force remount of search components
      setActiveTab('quote');
      setIsSaved(false);
      setDocMetadata(null); // THIS WILL NOW HIDE THE DOCUMENT # AND DATES
      setIsEditMode(false);

      // 6. Clear Navigation State
      navigate(location.pathname, { replace: true, state: {} });
    };

    if (skipConfirm === true) {
      performClear();
    } else {
      modal.confirm({
        title: "Clear All Details",
        content: "Are you sure you want to clear all details? This will reset the entire quote.",
        okText: "Yes, Clear All",
        okType: "danger",
        cancelText: "Cancel",
        onOk: performClear
      });
    }
  };


  // Lifted Notes State
  const [printableNote, setPrintableNote] = useState("");
  const [internalNote, setInternalNote] = useState("");


  // Lifted Insurance & Attachment State
  const [insuranceData, setInsuranceData] = useState({});
  const [includeInsurance, setIncludeInsurance] = useState(false);
  const [attachments, setAttachments] = useState([]); // Array { id, file, description }
  const [savedAttachments, setSavedAttachments] = useState([]); // Array of saved attachments from backend

  // Lifted Payment State
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: "CREDIT_CARD",
    transactionReference: "",
    notes: ""
  });
  // Lifted Existing Payments State (Payment History)
  const [existingPayments, setExistingPayments] = useState([]);
  // Lifted Total Amount State (for validation in PaymentPanel)
  const [currentTotalAmount, setCurrentTotalAmount] = useState(0);

  // Handle payment deletion - remove from state to trigger re-render
  const handlePaymentDeleted = (paymentId) => {
    setExistingPayments(prevPayments => 
      prevPayments.filter(payment => 
        (payment.paymentId || payment.id) !== paymentId
      )
    );
  };

  const tabs = [
    { id: 'quote', label: 'Quote' },
    { id: 'customer', label: 'Customer Information' },
    { id: 'insurance', label: 'Insurance' },
    { id: 'attachment', label: 'Attachment' },
    { id: 'payment', label: 'Payment' },
    { id: 'notes', label: 'Notes' },
  ];

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col px-0 pt-0 pb-1">
      {contextHolder}

      {/* Kit Selection Modal */}
      <KitSelectionModal
        visible={kitModalVisible}
        onClose={handleKitModalClose}
        onSelect={handleKitSelect}
        kits={pendingKitData?.kits || []}
        partNumber={pendingKitData?.partNumber || ''}
      />

      <div className="w-full mx-auto space-y-2 flex flex-col max-w-full px-2 lg:px-4 2xl:max-w-[1900px] flex-1">



        {/* TABS & ACTIONS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3 mt-2">
          <div className="flex justify-start gap-1 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 font-bold text-xs tracking-wide transition-all rounded-md shadow-sm border whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                  ? 'bg-white text-blue-600 border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="md:pr-4 w-full md:w-auto flex justify-end">
            <button
              onClick={handleGlobalClear}
              className="px-3 py-1.5 rounded-md bg-transparent border border-red-200 text-red-600 font-medium text-sm transition-colors hover:bg-red-50 hover:text-red-700 flex items-center gap-1"
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
                <div className="flex flex-col md:flex-row gap-2 md:h-[280px]">
                  {/* LEFT: SEARCH */}
                  <div className="bg-white p-4 flex flex-col gap-1 overflow-visible shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] rounded-lg w-full md:w-[380px] md:flex-shrink-0">
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
                  <div className={`p-0 overflow-hidden flex flex-col flex-1 min-h-[300px] md:min-h-0 ${!modelId ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    <div className="flex-1 overflow-hidden relative">
                      <ErrorBoundary>
                        <CarGlassViewer
                          key={`${modelId || 'empty'}-${resetKey}`}
                          modelId={modelId}
                          vehId={vehId}
                          vehicleInfo={vehicleInfo}
                          onPartSelect={handleAddPart}
                          onPartDeselect={handleRemovePart}
                          externalRemovedPartKey={lastRemovedPartKey}
                          preSelectedGlassCodes={preSelectedGlassCodes}
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

              {activeTab === 'payment' && (
                <div className="p-4">
                  <PaymentPanel
                    paymentData={paymentData}
                    setPaymentData={setPaymentData}
                    existingPayments={existingPayments}
                    totalAmount={currentTotalAmount}
                    onPaymentDeleted={handlePaymentDeleted}
                  />
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] rounded-lg">
                  <div className="space-y-2 h-[250px] flex flex-col ">
                    <label className="text-sm font-bold text-slate-700">Printable Note <span className="text-slate-400 font-normal">(Customer Notes)</span></label>
                    <div className="flex-1 overflow-hidden border border-slate-200 rounded-lg">
                      <ReactQuill
                        theme="snow"
                        value={printableNote}
                        onChange={setPrintableNote}
                        className="h-[210px]"
                        modules={{
                          toolbar: [['bold', 'italic', 'underline'], [{ 'list': 'ordered' }, { 'list': 'bullet' }]]
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 h-[250px] flex flex-col">
                    <label className="text-sm font-bold text-slate-700">Internal Note</label>
                    <textarea
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      className="w-full flex-1 rounded-lg border border-slate-200 p-2 text-xs text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-yellow-50/50 resize-none shadow-sm"
                      placeholder="Internal notes for office use only..."
                    />
                  </div>
                </div>
              )}

              {/* BOTTOM ROW: QUOTE DETAILS (ALWAYS VISIBLE) */}
              <div className={`flex-shrink-0 mt-2 ${!modelId && quoteItems.length === 0 ? 'opacity-50' : ''}`}>
                <div className="p-0">
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
                    onClear={handleGlobalClear}
                    paymentData={paymentData}
                    onTotalChange={setCurrentTotalAmount}
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
