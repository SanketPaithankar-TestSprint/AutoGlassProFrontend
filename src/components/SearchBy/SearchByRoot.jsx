import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuoteStore } from "../../store";
import { useQueryClient } from "@tanstack/react-query";
import { useKitPrices } from "../../hooks/usePricing";
import { getPilkingtonPrice } from "../../api/getVendorPrices";
import { Modal, Select } from "antd";
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
import JobSchedulingPanel from "../QuoteDetails/JobSchedulingPanel";
import { getEmployees } from "../../api/getEmployees";
import { getValidToken } from "../../api/getValidToken";
import DocumentEditorHeader from "./DocumentEditorHeader";


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
  const [preSelectedGlassCodes, setPreSelectedGlassCodes] = useState([]);


  // Unused state removed: editItems, derivedPartItems, manualKitItems, vendorPricingData

  const [resetKey, setResetKey] = useState(0); // Key to force-reset child components

  // Kit Selection Modal State
  const [kitModalVisible, setKitModalVisible] = useState(false);
  const [pendingKitData, setPendingKitData] = useState(null); // { kits: [], partId: '', partNumber: '' }


  // Edit Workflow State
  const [isSaved, setIsSaved] = useState(false);
  const [docMetadata, setDocMetadata] = useState(() => {
    const saved = localStorage.getItem("agp_doc_metadata");
    if (saved) {
      try { return JSON.parse(saved); }
      catch (e) { console.error("Failed to parse saved doc metadata", e); }
    }
    return null;
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [createdDocumentNumber, setCreatedDocumentNumber] = useState(null);
  const [lastRemovedPartKey, setLastRemovedPartKey] = useState(null); // Track last removed part for CarGlassViewer sync



  const [aiContactFormId, setAiContactFormId] = useState(null); // Track AI Contact Form ID to update status on completion

  // Status State
  const [currentStatus, setCurrentStatus] = useState(null);

  // Lifted Scheduling State
  const [schedulingData, setSchedulingData] = useState({
    scheduledDate: null,
    estimatedCompletion: null,
    dueDate: new Date().toISOString().split('T')[0], // Default to today logic
    paymentTerms: "Due upon receipt",
    assignedEmployeeId: null,
    employeeId: null,
    customPaymentTerms: "",
    serviceLocation: "IN_SHOP", // SHOP | MOBILE | CUSTOMER_LOCATION
    serviceAddress: "", // Required when serviceLocation is MOBILE or CUSTOMER_LOCATION
    tasks: []
  });

  // Employees State
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      const token = getValidToken();
      if (!token) return;

      setLoadingEmployees(true);
      try {
        const data = await getEmployees(token);
        if (Array.isArray(data)) {
          setEmployees(data);
        } else {
          setEmployees([]);
        }
      } catch (e) {
        console.error("Failed to fetch employees", e);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  // Lifted Document Type State
  const [manualDocType, setManualDocType] = useState('Quote');

  // Lifted Notes State
  const [showInternalNotes, setShowInternalNotes] = useState(false);

  // Modal Context for better visibility/theming
  const [modal, contextHolder] = Modal.useModal();

  // Initial Customer State Definition
  const initialCustomerData = {
    firstName: "", lastName: "", email: "", phone: "", alternatePhone: "",
    addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "",
    preferredContactMethod: "phone", notes: "",
    vehicleYear: "", vehicleMake: "", vehicleModel: "", vehicleStyle: "", bodyType: "",
    licensePlateNumber: "", vin: "", vehicleNotes: "",
    customerId: null,
    // Organization Fields
    customerType: "INDIVIDUAL",
    organizationId: null,
    organizationName: "",
    taxId: "",
    isTaxExempt: false,
    vehModifierId: null, // Added for vehicle modifier ID tracking
    organizationContactId: null, // Added for organization contact linking
    organizationContactName: "", // Added for organization contact name prefill
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
      const { serviceDocument, customer, vehicle, insurance, attachments: atts, organization, tasks } = location.state.compositeData;

      // 0. Set Metadata & Saved State
      setIsSaved(true);
      if (serviceDocument) {
        // Persist metadata immediately
        localStorage.setItem("agp_doc_metadata", JSON.stringify({
          documentNumber: serviceDocument.documentNumber,
          documentType: serviceDocument.documentType,
          documentDate: serviceDocument.documentDate,
          createdAt: serviceDocument.createdAt,
          updatedAt: serviceDocument.updatedAt
        }));

        setDocMetadata({
          documentNumber: serviceDocument.documentNumber,
          documentType: serviceDocument.documentType,
          documentDate: serviceDocument.documentDate,
          createdAt: serviceDocument.createdAt,
          updatedAt: serviceDocument.updatedAt
        });

        // Sync manualDocType
        const typeMap = {
          'QUOTE': 'Quote',
          'WORK_ORDER': 'Work Order',
          'INVOICE': 'Invoice'
        };
        const mappedType = typeMap[serviceDocument.documentType] || 'Quote'; // Default to Quote if unknown
        setManualDocType(mappedType);

        // 0.1 Map Payments
        if (serviceDocument.payments && Array.isArray(serviceDocument.payments) && serviceDocument.payments.length > 0) {
          // Do NOT pre-fill paymentData - the form is for NEW payments only. 
          // Previous logic copied history to new form, causing duplication/confusion.
          setPaymentData({
            amount: 0,
            paymentMethod: "CREDIT_CARD",
            transactionReference: "",
            notes: ""
          });
          // Store full payment history
          setExistingPayments(serviceDocument.payments);
        } else {
          setExistingPayments([]);
        }

        // 0.2 Map Scheduling Data (if available)
        setSchedulingData({
          scheduledDate: serviceDocument.scheduledDate || null,
          estimatedCompletion: serviceDocument.estimatedCompletion || null,
          dueDate: serviceDocument.dueDate ? serviceDocument.dueDate.split('T')[0] : null,
          paymentTerms: serviceDocument.paymentTerms || null,
          assignedEmployeeId: serviceDocument.technicianId || serviceDocument.employeeId || null,
          employeeId: serviceDocument.employeeId || null,
          customPaymentTerms: "",
          serviceLocation: serviceDocument.serviceLocation || null,
          serviceAddress: serviceDocument.serviceAddress || null,
          tasks: (tasks || serviceDocument.tasks || []).map(t => ({
            ...t,
            // Ensure every task has a unique frontend 'id' for React keys/updates
            // specific to frontend logic. backend uses assignmentId.
            id: t.assignmentId || t.id || Math.random().toString(36).substr(2, 9)
          }))
        });

        // 0.3 Map Status
        if (serviceDocument && serviceDocument.status) {
          setCurrentStatus(serviceDocument.status);
        }
      }

      // 1. Map Customer & Vehicle
      // Logic: Prefer Customer object if exists. If not, and we have Organization, map Organization details.

      let baseData = {};

      if (customer) {
        baseData = {
          customerId: customer.customerId || null,
          firstName: customer.firstName || "",
          lastName: customer.lastName || "",
          email: customer.email || "",
          phone: customer.phone || "",
          alternatePhone: customer.alternatePhone || "",
          addressLine1: customer.addressLine1 || "",
          addressLine2: customer.addressLine2 || "",
          city: customer.city || "",
          state: customer.state || "",
          postalCode: customer.postalCode || "",
          country: customer.country || "USA",
          preferredContactMethod: customer.preferredContactMethod || "email",
          notes: customer.notes || "",

          // Org fields potentially on customer object
          customerType: customer.customerType || (organization ? "BUSINESS" : "INDIVIDUAL"),
          organizationId: customer.organizationId || organization?.organizationId || null,
          organizationName: customer.organizationName || organization?.companyName || "",
          taxId: customer.taxId || organization?.taxId || "",
          isTaxExempt: customer.isTaxExempt || organization?.taxExempt || false,
          organizationContactId: customer.organizationContactId || serviceDocument?.organizationContactId || null,
          organizationContactName: serviceDocument?.organizationContactName || "",
        };
      } else if (organization) {
        // No customer, but we have organization -> Map to "Business" mode defaults
        baseData = {
          firstName: "",
          lastName: "",
          email: organization.email || "",
          phone: organization.phone || "",
          alternatePhone: organization.alternatePhone || "",
          addressLine1: organization.addressLine1 || "",
          addressLine2: organization.addressLine2 || "",
          city: organization.city || "",
          state: organization.state || "",
          postalCode: organization.postalCode || "",
          country: organization.country || "USA",
          preferredContactMethod: "phone",
          notes: organization.notes || "",

          customerType: "BUSINESS",
          organizationId: organization.organizationId,
          organizationName: organization.companyName || "",
          taxId: organization.taxId || "",
          isTaxExempt: organization.taxExempt || false,

          // Map specific Org Form Data for prefill
          companyName: organization.companyName || ""
        };
      }

      const newCustomerData = {
        ...baseData,
        // Vehicle
        vehicleYear: vehicle?.vehicleYear || "",
        vehicleMake: vehicle?.vehicleMake || "",
        vehicleModel: vehicle?.vehicleModel || "",
        vehicleStyle: vehicle?.vehicleStyle || "",
        bodyType: vehicle?.bodyType || "",
        licensePlateNumber: vehicle?.licensePlateNumber || "",
        vin: vehicle?.vin || "",
        vehicleNotes: vehicle?.notes || "",
        vehModifierId: vehicle?.vehModifierId || null // Ensure vehModifierId is mapped
      };
      setCustomerData(prev => ({ ...prev, ...newCustomerData }));

      // 1.1 Update Vehicle Info State (for YMM Component)
      if (vehicle) {
        // Prioritize masterVehId for parts lookup, fallback to vehicleId
        const activeVehId = vehicle.masterVehId || vehicle.vehicleId;

        setVehicleInfo({
          year: vehicle.vehicleYear?.toString() || "",
          make: vehicle.vehicleMake || "",
          model: vehicle.vehicleModel || "",
          style: vehicle.vehicleStyle || "",
          bodyType: vehicle.bodyType || "", // Pass body type description
          vin: vehicle.vin || "",
          // Add IDs to avoid redundant lookups if available
          vehId: activeVehId, // Use the correct ID for parts
          makeId: vehicle.makeId,
          makeModelId: vehicle.modelId, // SearchByYMM expects makeModelId
          bodyStyleId: vehicle.bodyStyleId,
          vehModifierId: vehicle.vechModifierId || vehicle.vehModifierId || null // Map modifier ID
        });

        // Use existing vehicleId and modelId if available to avoid redundant API calls
        if (activeVehId) {
          setVehId(activeVehId);
        }

        if (vehicle.modelId) {
          setModelId(vehicle.modelId);
        }

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
            // Map missing fields from backend item
            prefixCd: item.prefixCd || null,
            posCd: item.posCd || null,
            sideCd: item.sideCd || null,
            description: item.partDescription || "",
            adasCode: item.itemType === 'ADAS' && item.partDescription ? item.partDescription : null,
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
      localStorage.removeItem("agp_doc_metadata");
      if (incomingAiContactFormId) {
        setAiContactFormId(incomingAiContactFormId);
      }

      // Reset status for new quotes
      setCurrentStatus(null);

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

  // Persist Metadata
  useEffect(() => {
    if (docMetadata) {
      localStorage.setItem("agp_doc_metadata", JSON.stringify(docMetadata));
    }
  }, [docMetadata]);

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
      vehModifierId: veh_modifier_id || prev.vehModifierId, // Store modifier ID
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
      vehModifierId: info.vehModifierId || prev.vehModifierId, // Store modifier ID
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
      // Add to Quote Items - NO AWAIT so kit modal can show immediately
      // Vendor pricing will fetch in background and update the part when ready
      processAndAddPart({ glass, part, glassInfo });
    }

    // Check if part has kit options - show modal immediately without waiting for vendor pricing
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

    // Prepare initial pricing from NAGS data or fallback
    let listPrice, netPrice, description, labor, manufacturer, ta;

    if (isNewFormat) {
      listPrice = part.list_price || 0;
      netPrice = part.list_price || 0;
      labor = part.labor || 0;
      ta = part.feature_span || "";
      description = part.part_description || "Glass Part";
      manufacturer = "";
    } else {
      // Old format fallback - try to get glass info
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

    // Add part immediately with initial pricing
    const partItem = {
      type: "Part", id: uniqueId,
      prefixCd: getPrefixCd(glass), posCd: getPosCd(glass), sideCd: getSideCd(glass),
      nagsId: fullPartNumber, oemId: oemId || "",
      labor: labor, description: description,
      manufacturer: manufacturer, qty: 1,
      listPrice: listPrice,
      unitPrice: netPrice, amount: netPrice,
      isManual: false,
      vendorData: null, // Will be updated when vendor pricing arrives
      isLoadingVendorPrice: true // Flag to show loading indicator
    };
    newItems.push(partItem);

    if (Number(labor) >= 0) {
      const globalLaborRate = parseFloat(localStorage.getItem('GlobalLaborRate')) || 0;
      newItems.push({
        type: "Labor", id: `${uniqueId}_LABOR`,
        nagsId: "", oemId: "", labor: labor,
        description: `${labor} hours`, manufacturer: "", qty: 1,
        unitPrice: globalLaborRate, amount: globalLaborRate, pricingType: "hourly",
        isManual: false
      });
    }

    // Add items to quote immediately
    setQuoteItems(prev => [...prev, ...newItems]);

    // Fetch Vendor Pricing in background and update when ready
    const userId = localStorage.getItem('userId') || 2;
    const nagsListPrice = part.list_price || 0;

    if (userId && nagsId) {
      try {
        let partNumber = part.feature_span ? `${nagsId} ${part.feature_span}`.trim() : nagsId;
        partNumber = partNumber.replace(/N$/, '');

        // Use QueryClient to fetch with cache
        const vendorPrice = await queryClient.fetchQuery({
          queryKey: ['pilkingtonPrice', userId, partNumber],
          queryFn: () => getPilkingtonPrice(userId, partNumber),
          staleTime: 1000 * 60 * 60
        });

        if (vendorPrice) {
          // Update the part with vendor pricing
          const vendorNetPrice = parseFloat(vendorPrice.UnitPrice) || netPrice;
          const vendorListPrice = nagsListPrice || parseFloat(vendorPrice.ListPrice) || vendorNetPrice;
          const vendorDescription = vendorPrice.Description || description;

          setQuoteItems(prev => prev.map(item => {
            if (item.id === uniqueId) {
              return {
                ...item,
                unitPrice: vendorNetPrice,
                amount: vendorNetPrice,
                listPrice: vendorListPrice,
                description: vendorDescription,
                manufacturer: "Pilkington",
                isLoadingVendorPrice: false, // Remove loading flag
                vendorData: {
                  industryCode: vendorPrice.IndustryCode,
                  availability: vendorPrice.AvailabilityToPromise,
                  leadTime: vendorPrice.LeadTimeFormatted || vendorPrice.LeadTime,
                  manufacturer: "Pilkington"
                }
              };
            }
            return item;
          }));
          console.log(`[SearchByRoot] Updated part ${uniqueId} with vendor pricing`);
        } else {
          // No vendor price found, just remove loading flag
          setQuoteItems(prev => prev.map(item => {
            if (item.id === uniqueId) {
              return { ...item, isLoadingVendorPrice: false };
            }
            return item;
          }));
        }
      } catch (err) {
        console.error("[SearchByRoot] Failed to fetch vendor price (part already added with fallback)", err);
        // Remove loading flag even on error
        setQuoteItems(prev => prev.map(item => {
          if (item.id === uniqueId) {
            return { ...item, isLoadingVendorPrice: false };
          }
          return item;
        }));
      }
    }
  };


  // Global Clear Handler
  const handleGlobalClear = (skipConfirm = false) => {
    const performClear = () => {
      // 1. Clear Local Storage FIRST
      localStorage.removeItem("agp_customer_data");
      localStorage.removeItem("agp_doc_metadata");
      localStorage.removeItem("agp_quote_store");

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

      // Reset doc type
      setManualDocType('Quote');

      // Reset status
      setCurrentStatus(null);

      // 4. Reset Customer & Vehicle
      setCustomerData({ ...initialCustomerData });
      setVehicleInfo({});
      setVinData(null);
      setModelId(null);
      setVehId(null);
      setPreSelectedGlassCodes([]);
      setAiContactFormId(null);

      // Reset Scheduling Data
      setSchedulingData({
        scheduledDate: null,
        estimatedCompletion: null,
        dueDate: new Date().toISOString().split('T')[0],
        paymentTerms: "Due upon receipt",
        assignedEmployeeId: null,
        employeeId: null,
        customPaymentTerms: "",
        serviceLocation: "IN_SHOP",
        serviceAddress: "",
        tasks: []
      });

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

  return (
    <div className="bg-slate-200 flex flex-col px-0 pt-0 pb-1 ">
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

        {/* DOCUMENT EDITOR HEADER */}
        <DocumentEditorHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          manualDocType={manualDocType}
          setManualDocType={setManualDocType}
          handleGlobalClear={handleGlobalClear}
        />

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto">

          <div className="flex flex-col gap-2">
            {/* DYNAMIC TOP CONTENT BASED ON TAB */}
            <div className="w-full">

              <div className={activeTab === 'quote' ? 'block' : 'hidden'}>
                <div className="flex flex-col md:flex-row gap-2 md:h-[280px]">
                  {/* LEFT: SEARCH */}
                  <div className="bg-white p-4 flex flex-col gap-1 overflow-visible shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] rounded-lg w-full md:w-[380px] md:flex-shrink-0">
                    {/* VIN */}
                    <div>
                      <h2 className="text-xs !font-semibold text-slate-800 mb-1 uppercase tracking-wide">Search by VIN:</h2>
                      <ErrorBoundary>
                        <SearchByVin key={`vin-${resetKey}`} autoDecode delayMs={500} onDecoded={handleVinDecoded} />
                      </ErrorBoundary>
                    </div>
                    <hr className="border-slate-100" />
                    {/* YMM */}
                    <div className="flex-1 flex flex-col">
                      <h2 className="text-xs !font-semibold text-slate-800 mb-1 uppercase tracking-wide">Search by Year Make Model:</h2>
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
                <div className="w-full">
                  <CustomerPanel
                    key={`cust-${resetKey}`}
                    formData={customerData}
                    setFormData={setCustomerData}
                    setCanShowQuotePanel={() => { }}
                    setPanel={() => setActiveTab('quote')}
                    isDocumentLoaded={isSaved}
                  />
                </div>
              )}

              {activeTab === 'insurance' && (
                <div className="w-full">
                  <InsuranceDetails
                    data={insuranceData}
                    onChange={setInsuranceData}
                    enabled={includeInsurance}
                    onToggle={setIncludeInsurance}
                  />
                </div>
              )}

              {activeTab === 'scheduling' && (
                <div className="">
                  <JobSchedulingPanel
                    schedulingData={schedulingData}
                    setSchedulingData={setSchedulingData}
                    employees={employees}
                    loadingEmployees={loadingEmployees}
                    status={currentStatus}
                    documentNumber={docMetadata?.documentNumber}
                    onStatusChange={setCurrentStatus}
                  />
                </div>
              )}

              {activeTab === 'attachment' && (
                <div className="w-full">
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
                <div className="w-full">
                  <PaymentPanel
                    paymentData={paymentData}
                    setPaymentData={setPaymentData}
                    existingPayments={existingPayments}
                    totalAmount={currentTotalAmount}
                    onPaymentDeleted={handlePaymentDeleted}
                    paymentTerms={schedulingData.paymentTerms || "Due upon receipt"}
                    onPaymentTermsChange={(value) =>
                      setSchedulingData((prev) => ({
                        ...prev,
                        paymentTerms: value
                      }))
                    }
                    customPaymentTerms={schedulingData.customPaymentTerms || ""}
                    onCustomPaymentTermsChange={(value) =>
                      setSchedulingData((prev) => ({
                        ...prev,
                        customPaymentTerms: value
                      }))
                    }
                  />
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="p-6 space-y-4 bg-gradient-to-br from-white to-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Printable Note Section */}
                    <div className="flex flex-col">
                      <div className="mb-3">
                        <h3 className="text-xs font-semibold text-slate-900">
                          Printable Note <span className="text-[11px] text-slate-500 font-medium">(Visible to customer)</span>
                        </h3>
                      </div>
                      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all bg-white">
                        <ReactQuill
                          theme="snow"
                          value={printableNote}
                          onChange={setPrintableNote}
                          className="h-[280px] quill-custom-light"
                          modules={{
                            toolbar: [['bold', 'italic', 'underline'], [{ 'list': 'ordered' }, { 'list': 'bullet' }]]
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="mb-3">
                        <h3 className="text-xs font-semibold text-slate-900">
                          Internal Note <span className="text-[11px] text-slate-500 font-medium">(Private - office use only)</span>
                        </h3>
                      </div>
                      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all bg-white">
                        <textarea
                          value={internalNote}
                          onChange={(e) => setInternalNote(e.target.value)}
                          className="w-full h-[280px] p-4 text-sm focus:outline-none resize-none"
                          placeholder="Type internal notes here..."
                        />
                      </div>
                    </div>
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
                    schedulingData={schedulingData}
                    existingPayments={existingPayments}
                    onTotalChange={setCurrentTotalAmount}
                    manualDocType={manualDocType}
                    setManualDocType={setManualDocType}
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