import React, { useMemo, useState, useEffect, useRef } from "react";
import { useQuoteStore } from "../../store";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Modal, Input, Button, message, notification, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { getActiveTaxRates, getDefaultTaxRate } from "../../api/taxRateApi";
import { getValidToken } from "../../api/getValidToken";
import { extractGlassInfo } from "../carGlassViewer/carGlassHelpers";
import { getPilkingtonPrice } from "../../api/getVendorPrices";
import { getUserAdasPrices } from "../../api/userAdasPrices";
import { ADAS_TYPES } from "../../const/adasTypes";
import { getTaxSettings } from "../../api/taxSettings";

// --- Extracted Hooks ---
import {
    useSpecialInstructions,
    useUserProfileSync,
    useVendorPricingEnrichment,
    useQuoteDirtyState,
    useQuoteActions,
} from "./hooks";

// --- Extracted UI Components ---
import QuoteItemsTable from "./QuoteItemsTable";
import TotalsSummary from "./TotalsSummary";
import CustomerSummary from "./CustomerSummary";
import TaxSection from "./TaxSection";
import ActionsBar from "./ActionsBar";

const SERVICE_OPTIONS = [
    { label: "Window Regulator", value: "WINDOW_REGULATOR" },
    { label: "Window Regulator w/ Motor", value: "WINDOW_REGULATOR_WITH_MOTOR" },
    { label: "Window Switch", value: "WINDOW_SWITCH" },
    { label: "Other", value: "OTHER" }
];
const LABOR_OPTIONS = [
    { label: "chip repair", value: "CHIP_REPAIR" },
    { label: "windshield leaking", value: "WINDSHIELD_LEAKING" },
    { label: "rear view mirror repair", value: "REAR_VIEW_MIRROR_REPAIR" },
    { label: "reinstallation of windshield", value: "REINSTALLATION_OF_WINDSHIELD" },
    { label: "other", value: "OTHER" }
];

function currency(n) {
    const num = Number.isFinite(n) ? n : 0;
    return num.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

const newItem = () => ({
    id: Math.random().toString(36).substring(2, 9),
    nagsId: "",
    oemId: "",
    labor: "",
    description: "",
    manufacturer: "",
    qty: 1,
    unitPrice: 0,
    amount: 0,
    type: "Part",
    pricingType: "hourly",
});

// --- Error Boundary ---
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("QuotePanel Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-center shadow-sm">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-red-800 mb-2">Something went wrong</h3>
                    <p className="text-red-600 text-sm mb-6 max-w-md mx-auto">
                        {this.state.error?.message || "An unexpected error occurred while loading the quote panel."}
                    </p>
                    <Button
                        onClick={() => this.setState({ hasError: false })}
                        className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                    >
                        Try Again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

// ===========================================================================
// QuotePanelContent — thin container wiring hooks + sub-components
// ===========================================================================
const QuotePanelContent = ({
    onRemovePart, customerData, printableNote, internalNote,
    insuranceData, includeInsurance, attachments = [], setAttachments,
    onClear, docMetadata, isSaved, isEditMode, onEditModeChange,
    onDocumentCreated, aiContactFormId, paymentData, existingPayments = [],
    onTotalChange, manualDocType, setManualDocType,
    schedulingData, setSchedulingData
}) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const token = getValidToken();

    // --- Zustand store ---
    const { quoteItems, setQuoteItems, quoteItemsVersion } = useQuoteStore();
    const items = quoteItems;
    const setItems = setQuoteItems;

    // --- Extracted hooks ---
    const specialInstructions = useSpecialInstructions();
    const userProfile = useUserProfileSync();
    const { hasChanges, markAsSaved } = useQuoteDirtyState(quoteItemsVersion);

    // Ref to debounce vendor warning modal (passed to enrichment hook)
    const lastVendorWarningRef = useRef(0);

    // --- Tax state ---
    const [globalTaxRate, setGlobalTaxRate] = useState(0);
    const [taxRates, setTaxRates] = useState([]);
    const userTaxRate = userProfile?.taxRate;

    useEffect(() => {
        const fetchTaxData = async () => {
            try {
                if (userTaxRate !== undefined && userTaxRate !== null) {
                    setGlobalTaxRate(userTaxRate);
                    return;
                }
                let rates = [];
                let defaultRate = null;
                let usedCache = false;
                try {
                    const cached = localStorage.getItem("agp_tax_rates");
                    if (cached) {
                        const allRates = JSON.parse(cached);
                        if (Array.isArray(allRates) && allRates.length > 0) {
                            rates = allRates.filter(r => r.isActive);
                            defaultRate = allRates.find(r => r.isDefault) || null;
                            usedCache = true;
                        }
                    }
                } catch (e) { console.error("Error reading tax rates from cache", e); }
                if (!usedCache) {
                    const [apiRates, apiDefault] = await Promise.all([
                        getActiveTaxRates().catch(() => []),
                        getDefaultTaxRate().catch(() => null)
                    ]);
                    rates = apiRates;
                    defaultRate = apiDefault;
                }
                const validRates = Array.isArray(rates) ? rates : [];
                setTaxRates(validRates);
                if (userTaxRate !== undefined && userTaxRate !== null) {
                    setGlobalTaxRate(userTaxRate);
                } else if (defaultRate && defaultRate.taxPercent) {
                    setGlobalTaxRate(defaultRate.taxPercent);
                } else if (validRates.length > 0) {
                    setGlobalTaxRate(validRates[0].taxPercent);
                }
            } catch (err) { console.error("Failed to fetch tax rates", err); }
        };
        fetchTaxData();
    }, [userTaxRate]);

    // --- Tax settings ---
    const taxSettings = useMemo(() => {
        try {
            const stored = localStorage.getItem("user_tax_settings");
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error("Failed to parse tax settings", e);
            return null;
        }
    }, []);

    // --- Debounce timer for part number changes ---
    const debounceTimersRef = useRef(new Map());
    useEffect(() => {
        const timersMap = debounceTimersRef.current;
        return () => {
            timersMap.forEach(timer => clearTimeout(timer));
            timersMap.clear();
        };
    }, []);

    // --- Global Labor Rate ---
    const globalLaborRate = useMemo(() => {
        const rate = localStorage.getItem('GlobalLaborRate');
        return rate ? parseFloat(rate) : 0;
    }, []);

    // --- Payment sync ---
    const [payment, setPayment] = useState(0);
    useEffect(() => {
        if (paymentData && paymentData.amount !== undefined) setPayment(paymentData.amount);
    }, [paymentData]);

    // --- Doc type sync ---
    useEffect(() => {
        if (docMetadata?.documentType) {
            const typeMap = { 'QUOTE': 'Quote', 'WORK_ORDER': 'Work Order', 'INVOICE': 'Invoice' };
            const mappedType = typeMap[docMetadata.documentType] || docMetadata.documentType;
            if (setManualDocType) setManualDocType(mappedType);
        }
    }, [docMetadata?.documentType, setManualDocType]);

    // --- Vendor pricing enrichment hook ---
    // We need a temporary modal instance for the vendor warning
    const [vendorModal, vendorContextHolder] = Modal.useModal();
    useVendorPricingEnrichment(items, setItems, vendorModal);

    // --- Computed totals ---
    const laborCostDisplay = useMemo(() =>
        items.filter(it => it.type === 'Labor').reduce((sum, it) => sum + (Number(it.amount) || 0), 0),
        [items]
    );

    const subtotal = useMemo(() =>
        items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0),
        [items]
    );

    const totalHours = useMemo(() =>
        items.filter(it => it.type === 'Labor').reduce((sum, it) => sum + (Number(it.labor) || 0), 0),
        [items]
    );

    const totalTax = useMemo(() => {
        if (customerData?.isTaxExempt) return 0;
        const settings = taxSettings || { taxParts: true, taxLabor: false, taxService: false, taxAdas: true };
        const taxableSubtotal = items
            .filter(it => {
                if (it.type === 'Part' || it.type === 'Kit') return settings.taxParts;
                if (it.type === 'Labor') return settings.taxLabor;
                if (it.type === 'Service') return settings.taxService;
                if (it.type === 'ADAS') return settings.taxAdas;
                return false;
            })
            .reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
        return (taxableSubtotal * (Number(globalTaxRate) || 0)) / 100;
    }, [items, globalTaxRate, taxSettings, customerData?.isTaxExempt]);

    const calculatedTotal = useMemo(() => Math.max(0, subtotal + totalTax), [subtotal, totalTax]);
    const [manualTotal, setManualTotal] = useState(null);
    const total = useMemo(() => manualTotal !== null ? Number(manualTotal) : calculatedTotal, [manualTotal, calculatedTotal]);

    useEffect(() => { if (onTotalChange) onTotalChange(total); }, [total, onTotalChange]);

    const totalExistingPaid = useMemo(() => {
        return (existingPayments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    }, [existingPayments]);

    const totalPaid = useMemo(() => {
        return totalExistingPaid + (Number(paymentData?.amount) || 0);
    }, [totalExistingPaid, paymentData]);

    const balance = useMemo(() => Math.max(0, total - totalPaid), [total, totalPaid]);

    const currentDocType = manualDocType;

    // --- Total adjustment ---
    const applyTotalAdjustment = (newTotal) => {
        if (newTotal === null || isNaN(newTotal)) { setManualTotal(null); return; }
        const difference = newTotal - calculatedTotal;
        if (difference !== 0) {
            const firstPartIndex = items.findIndex(it => it.type === 'Part');
            const firstServiceIndex = items.findIndex(it => it.type === 'Service' || it.type === 'ADAS');
            let targetIndex = firstPartIndex !== -1 ? firstPartIndex : firstServiceIndex;
            if (targetIndex !== -1) {
                const targetItem = items[targetIndex];
                const settings = taxSettings || { taxParts: true, taxLabor: false, taxService: false, taxAdas: true };
                let isTaxable = false;
                if (targetItem.type === 'Part' || targetItem.type === 'Kit') isTaxable = settings.taxParts;
                else if (targetItem.type === 'Labor') isTaxable = settings.taxLabor;
                else if (targetItem.type === 'Service') isTaxable = settings.taxService;
                else if (targetItem.type === 'ADAS') isTaxable = settings.taxAdas;

                let amountToAdd = difference;
                if (isTaxable) {
                    const taxMultiplier = 1 + (Number(globalTaxRate) || 0) / 100;
                    amountToAdd = difference / taxMultiplier;
                }
                const newAmount = Math.max(0, (Number(targetItem.amount) || 0) + amountToAdd);
                setItems(prev => prev.map((it, idx) => {
                    if (idx === targetIndex) {
                        return {
                            ...it,
                            amount: parseFloat(newAmount.toFixed(2)),
                            unitPrice: (Number(it.qty) === 1) ? parseFloat(newAmount.toFixed(2)) : it.unitPrice
                        };
                    }
                    return it;
                }));
            }
        }
        setManualTotal(null);
    };

    const handleRoundUp = () => applyTotalAdjustment(Math.ceil(total));

    // --- Quote actions hook ---
    const {
        performSave, getZeroPriceItems,
        handlePreview, handleEmail,
        handleCloseModal, handleConfirmAndSend, downloadPdf,
        saveLoading, previewLoading, emailLoading,
        showEmailModal, emailForm, setEmailForm, previewUrl,
        contextHolder, modal,
    } = useQuoteActions({
        items, setItems, customerData, userProfile, specialInstructions,
        subtotal, totalTax, totalHours, laborCostDisplay, total, balance,
        currentDocType, manualDocType, setManualDocType,
        printableNote, internalNote, insuranceData, includeInsurance,
        attachments, docMetadata, isSaved, onClear, onDocumentCreated,
        aiContactFormId, paymentData, existingPayments,
        schedulingData, globalTaxRate, taxSettings, markAsSaved,
    });

    // --- Save handler with zero-price confirmation (JSX lives here, not in hook) ---
    const handleSave = async () => {
        const zeroPriceItems = getZeroPriceItems();

        if (zeroPriceItems.length > 0) {
            const itemDescriptions = zeroPriceItems.map(item =>
                `• ${item.type}: ${item.description || 'No description'}`
            ).join('\n');

            modal.confirm({
                title: '⚠️ Items with $0.00 Price',
                content: (
                    <div>
                        <p className="mb-2">The following items have $0.00 price:</p>
                        <pre className="text-xs bg-slate-100 p-2 rounded whitespace-pre-wrap">{itemDescriptions}</pre>
                        <p className="mt-2 text-slate-500 text-sm">Are you sure you want to save with these prices? This might be intentional for discounts.</p>
                    </div>
                ),
                okText: 'Yes, Save Anyway',
                cancelText: 'Cancel & Fix',
                onOk: async () => {
                    const { success } = await performSave();
                    if (success) {
                        markAsSaved?.(items);
                        if (onClear) onClear(true);
                    }
                }
            });
            return;
        }

        const { success } = await performSave();
        if (success) {
            markAsSaved?.(items);
            if (onClear) onClear(true);
        }
    };

    // --- Item handlers ---
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? '-' : date.toLocaleString('sv-SE');
        } catch { return '-'; }
    };

    const handleServiceLocationChange = (val) => {
        if (setSchedulingData) setSchedulingData(prev => ({ ...prev, serviceLocation: val }));
    };

    const handleDeleteItem = (id) => {
        if (onRemovePart) {
            onRemovePart(id);
        } else {
            setItems((prev) => prev.filter((it) =>
                it.id !== id && it.id !== `${id}_LABOR` && it.parentPartId !== id
            ));
        }
    };

    const updateItem = (id, key, value) => {
        setItems((prev) => prev.map((it) => {
            if (it.id !== id) return it;
            const updated = { ...it, [key]: value };
            if (it.type === 'Labor') {
                if (key === 'unitPrice') updated.amount = Number(value) || 0;
                else if (key === 'amount') updated.unitPrice = Number(value) || 0;
            } else {
                if (key === 'qty' || key === 'unitPrice') {
                    updated.amount = (Number(updated.qty) || 0) * (Number(updated.unitPrice) || 0);
                }
            }
            return updated;
        }));
    };

    const handleAddRow = (type = "Part") => {
        let actualType = type;
        let description = "Custom Part";

        if (type === "ADAS") { actualType = "ADAS"; description = ""; }
        else if (type === "Service") { actualType = "Service"; description = ""; }
        else if (type.startsWith("ADAS_")) {
            actualType = "Service";
            const subType = type.split('_')[1];
            if (subType === 'Static') description = "Labor/ADAS Recal - Static";
            else if (subType === 'Dynamic') description = "Labor/ADAS Recal - Dynamic";
            else if (subType === 'Dual') description = "Labor/ADAS Recal - Static & Dynamic";
        }

        const newItemData = {
            ...newItem(),
            id: Math.random().toString(36).substring(2, 9),
            isManual: true,
            description,
            type: actualType
        };

        if (actualType === "Labor") {
            newItemData.unitPrice = globalLaborRate;
            newItemData.labor = 1;
            newItemData.pricingType = "hourly";
            newItemData.amount = globalLaborRate;
        }
        if (type === "Service") newItemData.serviceType = null;

        setItems(prev => [...prev, newItemData]);
    };

    // --- Part number handlers ---
    const handlePartNoChange = (id, partNo) => {
        if (debounceTimersRef.current.has(id)) clearTimeout(debounceTimersRef.current.get(id));
        const timer = setTimeout(() => {
            if (partNo && partNo.trim() !== '') handlePartNoBlur(id, partNo);
        }, 800);
        debounceTimersRef.current.set(id, timer);
    };

    // --- Glass / Kit modal state ---
    const [glassSelectionModal, setGlassSelectionModal] = useState({
        visible: false, options: [], pendingItemId: null, partNo: null
    });
    const [kitSelectionModal, setKitSelectionModal] = useState({
        visible: false, kits: [], pendingItemId: null, selectedGlass: null
    });

    const handlePartNoBlur = async (id, partNo) => {
        if (debounceTimersRef.current.has(id)) {
            clearTimeout(debounceTimersRef.current.get(id));
            debounceTimersRef.current.delete(id);
        }
        if (!partNo || partNo.trim() === '') return;
        const trimmedPartNo = partNo.trim();
        try {
            const res = await fetch(`https://api.autopaneai.com/agp/v1/glass-info?nags_glass_id=${trimmedPartNo}`);
            if (!res.ok) { message.error(`Part not found: ${trimmedPartNo}`); return; }
            const data = await res.json();
            if (!data || !Array.isArray(data) || data.length === 0) {
                message.error(`No glass info found for: ${trimmedPartNo}`); return;
            }
            if (data.length > 1) {
                setGlassSelectionModal({ visible: true, options: data, pendingItemId: id, partNo: trimmedPartNo });
            } else {
                await applySelectedGlass(id, data[0]);
            }
        } catch (error) {
            console.error("Error fetching glass info:", error);
            message.error("Failed to fetch part information");
        }
    };

    const applySelectedGlass = async (itemId, glassData) => {
        const userId = localStorage.getItem('userId');
        const span = glassData.feature_span || '';
        const fullPartNumber = span ? `${glassData.nags_id} ${span.trim()}` : glassData.nags_id;
        const qualifiersStr = Array.isArray(glassData.qualifiers) ? glassData.qualifiers.join(', ') : '';

        setGlassSelectionModal({ visible: false, options: [], pendingItemId: null, partNo: null });

        if (Array.isArray(glassData.kit) && glassData.kit.length > 1) {
            setKitSelectionModal({ visible: true, kits: glassData.kit, pendingItemId: itemId, selectedGlass: glassData });
            setItems(prev => {
                const filtered = prev.filter(it => it.parentPartId !== itemId);
                return filtered.map(it => {
                    if (it.id === itemId) {
                        return {
                            ...it, nagsId: fullPartNumber,
                            oemId: Array.isArray(glassData.OEMS) && glassData.OEMS.length > 0 ? glassData.OEMS[0] : '',
                            description: glassData?.qualifiers?.includes('Aftermarket')
                                ? `${fullPartNumber} (${qualifiersStr})` : (qualifiersStr || `Glass Part ${glassData.nags_id}`),
                            listPrice: glassData.list_price || 0, unitPrice: glassData.list_price || 0,
                            amount: (Number(it.qty) || 1) * (glassData.list_price || 0),
                            labor: glassData.labor || 0, glassData
                        };
                    }
                    return it;
                });
            });
            if (userId) fetchVendorPriceForItem(itemId, glassData.nags_id, userId, glassData);
            return;
        }
        await applyGlassWithKit(itemId, glassData, glassData.kit?.[0] || null);
        setTimeout(() => {
            const tableElement = document.querySelector('[data-quote-details-table]');
            if (tableElement) tableElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    };

    const applyGlassWithKit = async (itemId, glassData, selectedKit) => {
        const userId = localStorage.getItem('userId') || 2;
        const span = glassData.feature_span || '';
        const fullPartNumber = span ? `${glassData.nags_id} ${span.trim()}` : glassData.nags_id;
        const labor = glassData.labor || 0;
        const qualifiersStr = Array.isArray(glassData.qualifiers) ? glassData.qualifiers.join(', ') : '';
        const currentGlobalLaborRate = parseFloat(localStorage.getItem('GlobalLaborRate')) || 0;

        setItems(prev => {
            const filtered = prev.filter(it => it.parentPartId !== itemId && it.id !== `${itemId}_LABOR`);
            const updated = filtered.map(it => {
                if (it.id === itemId) {
                    return {
                        ...it, nagsId: fullPartNumber,
                        oemId: Array.isArray(glassData.OEMS) && glassData.OEMS.length > 0 ? glassData.OEMS[0] : '',
                        description: glassData?.qualifiers?.includes('Aftermarket')
                            ? `${fullPartNumber} (${qualifiersStr})` : (qualifiersStr || `Glass Part ${glassData.nags_id}`),
                        listPrice: glassData.list_price || 0, unitPrice: glassData.list_price || 0,
                        amount: (Number(it.qty) || 1) * (glassData.list_price || 0), labor, glassData
                    };
                }
                return it;
            });
            const additionalItems = [];
            if (Number(labor) >= 0) {
                additionalItems.push({
                    id: `${itemId}_LABOR`, type: 'Labor', nagsId: '', oemId: '',
                    labor, description: `${labor} hours`, manufacturer: '', qty: 1,
                    unitPrice: currentGlobalLaborRate, amount: currentGlobalLaborRate,
                    listPrice: 0, pricingType: 'hourly', isManual: false
                });
            }
            if (selectedKit) {
                const kitUnitPrice = selectedKit.unitPrice || 0;
                const kitQtyFromApi = selectedKit.QTY || 1;
                const formattedQty = Number(kitQtyFromApi).toFixed(1);
                const kitDescription = selectedKit.DSC ? `${formattedQty} ${selectedKit.DSC}` : 'Installation Kit';
                additionalItems.push({
                    id: `${itemId}_KIT_0`, parentPartId: itemId,
                    nagsId: selectedKit.NAGS_HW_ID || '', oemId: '',
                    description: kitDescription, manufacturer: '', qty: 1,
                    unitPrice: kitUnitPrice, amount: kitUnitPrice,
                    listPrice: 0, type: 'Kit', kitData: selectedKit
                });
            }
            return [...updated, ...additionalItems];
        });

        if (userId) await fetchVendorPriceForItem(itemId, glassData.nags_id, userId, glassData);
        setKitSelectionModal({ visible: false, kits: [], pendingItemId: null, selectedGlass: null });
    };

    const fetchVendorPriceForItem = async (itemId, nagsId, userId, glassData = null) => {
        if (!userId || !nagsId) return;
        try {
            let partNumber = nagsId;
            if (glassData?.feature_span) partNumber = `${nagsId} ${glassData.feature_span}`.trim();
            partNumber = partNumber.replace(/N$/, '');
            const vendorPrice = await queryClient.fetchQuery({
                queryKey: ['pilkingtonPrice', userId, partNumber],
                queryFn: () => getPilkingtonPrice(userId, partNumber),
                staleTime: 1000 * 60 * 60
            });
            if (vendorPrice) {
                const nagsListPrice = glassData?.list_price || 0;
                setItems(prev => prev.map(it => {
                    if (it.id === itemId) {
                        const unitPrice = parseFloat(vendorPrice.UnitPrice) || it.unitPrice;
                        const listPrice = nagsListPrice || parseFloat(vendorPrice.ListPrice) || unitPrice;
                        const qualifiers = glassData?.qualifiers || [];
                        const hasAftermarket = qualifiers.includes('Aftermarket');
                        const qualifiersStr = qualifiers.join(', ');
                        const description = hasAftermarket
                            ? `${partNumber} (${qualifiersStr})` : (vendorPrice.Description || it.description);
                        return {
                            ...it, description, listPrice, unitPrice,
                            amount: (Number(it.qty) || 1) * unitPrice, manufacturer: 'Pilkington',
                            vendorData: {
                                industryCode: vendorPrice.IndustryCode,
                                availability: vendorPrice.AvailabilityToPromise,
                                leadTime: vendorPrice.LeadTimeFormatted || vendorPrice.LeadTime,
                                manufacturer: 'Pilkington'
                            },
                            vendorPriceFetched: true
                        };
                    }
                    return it;
                }));
            }
        } catch (error) {
            console.error("Error fetching vendor price:", error);
            if (error.message && error.message.includes("No vendor credentials found")) {
                modal.warning({
                    title: 'Missing Vendor Credentials',
                    content: 'No vendor credentials found for Your Account. Please configure Pilkington credentials first.',
                });
            }
        }
    };

    // --- ADAS ---
    const adasPrices = useMemo(() => {
        try { return JSON.parse(localStorage.getItem("user_adas_prices") || "[]"); }
        catch (e) { return []; }
    }, []);

    const handleAdasChange = (id, calibrationCode) => {
        const selectedPrice = adasPrices.find(p => p.calibrationCode === calibrationCode);
        const price = selectedPrice ? selectedPrice.calibrationPrice : 0;
        setItems(prev => prev.map(it => {
            if (it.id === id) {
                return { ...it, description: calibrationCode, unitPrice: price, amount: (Number(it.qty) || 0) * price, adasCode: calibrationCode };
            }
            return it;
        }));
    };

    const handleServiceChange = (id, serviceType) => {
        const selectedOption = SERVICE_OPTIONS.find(opt => opt.value === serviceType);
        setItems(prev => prev.map(it => {
            if (it.id !== id) return it;
            if (!serviceType) return { ...it, serviceType: null };
            if (serviceType === "OTHER") return { ...it, serviceType, description: it.description || "" };
            return { ...it, serviceType, description: selectedOption?.label || it.description };
        }));
    };

    const handleLaborChange = (id, laborType) => {
        const selectedOption = LABOR_OPTIONS.find(opt => opt.value === laborType);
        setItems(prev => prev.map(it => {
            if (it.id !== id) return it;
            if (!laborType) return { ...it, laborType: null };
            if (laborType === "OTHER") return { ...it, laborType, description: it.description || "" };
            return { ...it, laborType, description: selectedOption?.label || it.description };
        }));
    };

    const handleGlassSelection = (selectedGlass) => {
        if (glassSelectionModal.pendingItemId) applySelectedGlass(glassSelectionModal.pendingItemId, selectedGlass);
    };

    const handleKitSelection = (selectedKit) => {
        if (kitSelectionModal.pendingItemId && kitSelectionModal.selectedGlass)
            applyGlassWithKit(kitSelectionModal.pendingItemId, kitSelectionModal.selectedGlass, selectedKit);
    };

    const handleCloseGlassSelection = () => {
        setGlassSelectionModal({ visible: false, options: [], pendingItemId: null, partNo: null });
    };

    const handleCloseKitSelection = () => {
        setKitSelectionModal({ visible: false, kits: [], pendingItemId: null, selectedGlass: null });
    };

    // ==================== RENDER ====================
    return (
        <div className="relative">
            {contextHolder}
            {vendorContextHolder}
            {/* Items Table */}
            <QuoteItemsTable
                items={items}
                updateItem={updateItem}
                handleDeleteItem={handleDeleteItem}
                handlePartNoBlur={handlePartNoBlur}
                handleAdasChange={handleAdasChange}
                handleServiceChange={handleServiceChange}
                handleLaborChange={handleLaborChange}
                glassSelectionModal={glassSelectionModal}
                handleGlassSelection={handleGlassSelection}
                handleCloseGlassSelection={handleCloseGlassSelection}
                kitSelectionModal={kitSelectionModal}
                handleKitSelection={handleKitSelection}
                handleCloseKitSelection={handleCloseKitSelection}
            />

            {/* Totals & Actions */}
            <div className="bg-white p-2 sm:p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] rounded-lg flex flex-col lg:flex-row gap-4 justify-between">
                {/* Left side - Vendor Pricing & Metadata */}
                <CustomerSummary items={items} docMetadata={docMetadata} formatDate={formatDate} />

                {/* Right side - Add & Totals Table */}
                <div className="flex flex-col sm:flex-row items-start gap-4 w-full sm:w-auto lg:order-2 lg:flex-row">
                    <TaxSection
                        schedulingData={schedulingData}
                        handleServiceLocationChange={handleServiceLocationChange}
                        handleAddRow={handleAddRow}
                    />

                    <TotalsSummary
                        laborCostDisplay={laborCostDisplay}
                        subtotal={subtotal}
                        totalTax={totalTax}
                        globalTaxRate={globalTaxRate}
                        total={total}
                        manualTotal={manualTotal}
                        setManualTotal={setManualTotal}
                        applyTotalAdjustment={applyTotalAdjustment}
                        handleRoundUp={handleRoundUp}
                        totalPaid={totalPaid}
                        balance={balance}
                    />
                </div>
            </div>

            {/* Actions Bar inside totals */}
            <div className="bg-white px-2 sm:px-4 pb-2 sm:pb-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] rounded-b-lg -mt-1">
                <ActionsBar
                    manualDocType={manualDocType}
                    setManualDocType={setManualDocType}
                    isSaved={isSaved}
                    docMetadata={docMetadata}
                    handleSave={handleSave}
                    saveLoading={saveLoading}
                    handlePreview={handlePreview}
                    previewLoading={previewLoading}
                    handleEmail={handleEmail}
                    emailLoading={emailLoading}
                />
            </div>

            {/* Email Preview Modal */}
            <Modal
                title={`Send ${currentDocType}`}
                open={showEmailModal}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="cancel" onClick={handleCloseModal}>Cancel</Button>,
                    <Button key="send" type="primary" loading={emailLoading} onClick={handleConfirmAndSend} className="bg-violet-600">
                        Confirm & Send
                    </Button>
                ]}
                width={800}
                className="[&_.ant-modal-body]:p-3 sm:[&_.ant-modal-body]:p-6"
            >
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                    <div className="flex-1 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
                            <Input value={emailForm.to} onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })} placeholder="Recipient email" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                            <Input value={emailForm.subject} onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })} placeholder="Email subject" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                            <Input.TextArea rows={4} value={emailForm.body} onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })} placeholder="Email body..." />
                        </div>
                    </div>
                    <div className="flex-1 h-[300px] sm:h-[400px] border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                        {previewUrl ? (
                            <iframe src={previewUrl} className="w-full h-full" title="PDF Preview" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">Generating Preview...</div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default function QuotePanel(props) {
    return (
        <ErrorBoundary>
            <QuotePanelContent {...props} />
        </ErrorBoundary>
    );
}