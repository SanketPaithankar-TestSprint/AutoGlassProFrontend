import React, { useState, useEffect } from "react";
import CustomerPanel from "./CustomerPanel";
import QuotePanel from "./QuotePanel";
import PaymentPanel from "./PaymentPanel";
import config from "../../config";
import { getPrefixCd, getPosCd, getSideCd } from "../carGlassViewer/carGlassHelpers";
import AttachmentDetails from "./AttachmentDetails";
import JobSchedulingPanel from "./JobSchedulingPanel";
import { getEmployees } from "../../api/getEmployees";
import { getValidToken } from "../../api/getValidToken";

export default function QuoteDetails({ prefill, parts, onRemovePart, activePanel, onPanelSwitch, invoiceItems, setInvoiceItems }) {
    // Internal state fallback if not controlled
    const [internalPanel, setInternalPanel] = useState("customer");
    const [canShowQuotePanel, setCanShowQuotePanel] = useState(true);

    // Determine which panel is active (controlled vs uncontrolled)
    const panel = activePanel !== undefined ? activePanel : internalPanel;

    // Handle switching
    const handlePanelSwitch = (newPanel) => {
        if (onPanelSwitch) {
            onPanelSwitch(newPanel);
        } else {
            setInternalPanel(newPanel);
        }
    };

    // Lifted Customer State
    const [customerData, setCustomerData] = useState(() => {
        const saved = localStorage.getItem("agp_customer_data");
        const initial = {
            firstName: prefill.firstName || "",
            lastName: prefill.lastName || "",
            email: prefill.email || "",
            phone: prefill.phone || "",
            alternatePhone: prefill.alternatePhone || "",
            addressLine1: prefill.addressLine1 || "",
            addressLine2: prefill.addressLine2 || "",
            city: prefill.city || "",
            state: prefill.state || "",
            postalCode: prefill.postalCode || "",
            country: prefill.country || "",
            preferredContactMethod: prefill.preferredContactMethod ? prefill.preferredContactMethod.toLowerCase() : "phone",
            notes: prefill.notes || "",
            vehicleYear: prefill.vehicleYear || prefill.year || "",
            vehicleMake: prefill.vehicleMake || prefill.make || "",
            vehicleModel: prefill.vehicleModel || prefill.model || "",
            vehicleStyle: prefill.vehicleStyle || prefill.body || "",
            bodyType: prefill.bodyType || "",
            licensePlateNumber: prefill.licensePlateNumber || "",
            vin: prefill.vin || "",
            vehicleNotes: prefill.vehicleNotes || "",
            // Organization Fields
            organizationId: prefill.organizationId || null,
            customerType: prefill.customerType || "INDIVIDUAL",
            // If opening existing document with organization, we might want to capture these if available
            organizationName: prefill.organizationName || "",
            taxId: prefill.taxId || "", // If available in prefill or needs to be fetched
            isTaxExempt: prefill.isTaxExempt || false,
        };

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Return merged data, preserving IDs from storage
                return { ...initial, ...parsed };
            } catch (e) {
                console.error("Failed to parse saved customer data", e);
            }
        }
    });

    // Lifted Attachments State
    const [attachments, setAttachments] = useState([]);

    // Lifted Payment State
    const [paymentData, setPaymentData] = useState({
        amount: 0,
        paymentMethod: "CREDIT_CARD",
        transactionReference: "",
        notes: ""
    });

    // Lifted Scheduling State
    const [schedulingData, setSchedulingData] = useState({
        scheduledDate: null,
        estimatedCompletion: null,
        dueDate: new Date().toISOString().split('T')[0], // Default to today
        paymentTerms: "Due upon receipt",
        assignedEmployeeId: null,
        customPaymentTerms: ""
    });

    // Employees State
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    useEffect(() => {
        const fetchEmployees = async () => {
            const token = getValidToken();
            if (!token) return;

            setLoadingEmployees(true);
            try {
                const data = await getEmployees(token);
                // Ensure data is array
                if (Array.isArray(data)) {
                    setEmployees(data);
                } else {
                    console.error("Expected array of employees, got:", data);
                    setEmployees([]);
                }
            } catch (e) {
                console.error("Failed to fetch employees", e);
            } finally {
                setLoadingEmployees(false);
            }
        };

        if (activePanel === 'scheduling' || internalPanel === 'scheduling') {
            fetchEmployees();
        } else {
            // Optional: Fetch on mount regardless, or only when tab clicked?
            // Let's fetch on mount to have it ready, or just lazily. 
            // Logic above fetches when tab is active. Let's add a "hasFetched" check to avoid re-fetching?
            // For now, simpler to fetch when needed or just once on mount.
        }

    }, [activePanel, internalPanel]);

    // Fetch once on mount to populate dropdown if they go there
    useEffect(() => {
        const fetchEmployees = async () => {
            const token = getValidToken();
            if (!token) return;
            try {
                const data = await getEmployees(token);
                if (Array.isArray(data)) setEmployees(data);
            } catch (e) { console.error(e); }
        };
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (customerData) {
            localStorage.setItem("agp_customer_data", JSON.stringify(customerData));
        }
    }, [customerData]);

    useEffect(() => {
        const fetchGlassInfo = async () => {
            const result = await Promise.all(parts.map(async (p) => {
                const uniqueId = `${p.part.nags_glass_id || ""}|${p.part.oem_glass_id || ""}|${p.glass.code}`;

                // If we already have this item in our state with valid info, preserve user edits if needed, 
                // OR just use the cached data to avoid re-fetch.
                // For now, let's just fetch if missing info.

                let info = p.glassInfo;
                if (!info && p.part.nags_glass_id) {
                    try {
                        const res = await fetch(`${config.pythonApiUrl}agp/v1/glass-info?nags_glass_id=${p.part.nags_glass_id}`);
                        if (res.ok) {
                            info = await res.json();
                        }
                    } catch (err) {
                        console.error("Failed to fetch glass info", err);
                    }
                }

                const items = [];

                // 1. The Part Item
                items.push({
                    type: "Part",
                    id: uniqueId,
                    prefixCd: getPrefixCd(p.glass),
                    posCd: getPosCd(p.glass),
                    sideCd: getSideCd(p.glass),
                    nagsId: p.part.nags_glass_id || "",
                    oemId: p.part.oem_glass_id || "",
                    labor: Number(info?.labor) || "",
                    description: p.part.part_description || "",
                    manufacturer: info?.manufacturer || "",
                    qty: 1,
                    unitPrice: info?.list_price || 0,
                    amount: info?.list_price || 0
                });

                // 2. The Labor Item (if applicable)
                if (Number(info?.labor) > 0) {
                    // Get globalLaborRate from localStorage
                    const globalLaborRate = parseFloat(localStorage.getItem('GlobalLaborRate')) || 0;
                    const laborHours = Number(info?.labor) || 0;

                    items.push({
                        type: "Labor",
                        id: `${uniqueId}_LABOR`,
                        nagsId: "",
                        oemId: "",
                        labor: laborHours,
                        description: "Installation Labor",
                        manufacturer: "",
                        qty: 1,
                        unitPrice: globalLaborRate,  // Fixed: Set to globalLaborRate instead of 0
                        amount: globalLaborRate,  // Calculate initial amount
                        pricingType: "hourly"  // Default to hourly pricing
                    });
                }

                return items;
            }));

            // Flatten items
            const allItems = result.flat();
            setInvoiceItems(allItems);
        };

        if (parts.length > 0) {
            fetchGlassInfo();
        } else {
            setInvoiceItems([]);
        }
    }, [parts]);
    return (
        <div className="text-slate-900 min-h-screen">
            <div className="flex justify-start gap-4 mb-2">
                <button
                    className={`px-4 py-2 rounded-md font-semibold border transition-all duration-150 ${panel === 'customer' ? 'border-violet-500 text-violet-700 bg-white shadow-sm' : 'border-transparent text-slate-500 bg-slate-50 hover:bg-slate-100'}`}
                    onClick={() => handlePanelSwitch('customer')}
                >
                    Customer Information
                </button>
                <button
                    className={`px-4 py-2 rounded-md font-semibold border transition-all duration-150 ${panel === 'quote' ? 'border-violet-500 text-violet-700 bg-white' : 'border-transparent text-slate-500 bg-slate-50 hover:bg-slate-100'}`}
                    onClick={() => handlePanelSwitch('quote')}
                >
                    Quote Information
                </button>
                <button
                    className={`px-4 py-2 rounded-md font-semibold border transition-all duration-150 ${panel === 'attachments' ? 'border-violet-500 text-violet-700 bg-white' : 'border-transparent text-slate-500 bg-slate-50 hover:bg-slate-100'}`}
                    onClick={() => handlePanelSwitch('attachments')}
                >
                    Attachments
                </button>
                <button
                    className={`px-4 py-2 rounded-md font-semibold border transition-all duration-150 ${panel === 'payment' ? 'border-violet-500 text-violet-700 bg-white' : 'border-transparent text-slate-500 bg-slate-50 hover:bg-slate-100'}`}
                    onClick={() => handlePanelSwitch('payment')}
                >
                    Payment
                </button>
                <button
                    className={`px-4 py-2 rounded-md font-semibold border transition-all duration-150 ${panel === 'scheduling' ? 'border-violet-500 text-violet-700 bg-white' : 'border-transparent text-slate-500 bg-slate-50 hover:bg-slate-100'}`}
                    onClick={() => handlePanelSwitch('scheduling')}
                >
                    Job Scheduling
                </button>
            </div>
            {panel === 'customer' && (
                <CustomerPanel
                    formData={customerData}
                    setFormData={setCustomerData}
                    setCanShowQuotePanel={setCanShowQuotePanel}
                    setPanel={handlePanelSwitch}
                />
            )}
            {panel === 'quote' && canShowQuotePanel && (
                <div className="min-h-[600px]">
                    <QuotePanel
                        parts={invoiceItems}
                        onRemovePart={onRemovePart}
                        customerData={customerData}
                        attachments={attachments}
                        setAttachments={setAttachments}
                        paymentData={paymentData}
                        schedulingData={schedulingData}
                    />
                </div>
            )}
            {panel === 'attachments' && (
                <div className="min-h-[600px]">
                    <AttachmentDetails
                        attachments={attachments}
                        setAttachments={setAttachments}
                        createdDocumentNumber={null}
                        customerData={customerData}
                    />
                </div>
            )}
            {panel === 'payment' && (
                <div className="min-h-[600px]">
                    <PaymentPanel
                        paymentData={paymentData}
                        setPaymentData={setPaymentData}
                    />
                </div>
            )}
            {panel === 'scheduling' && (
                <div className="min-h-[600px]">
                    <JobSchedulingPanel
                        schedulingData={schedulingData}
                        setSchedulingData={setSchedulingData}
                        employees={employees}
                        loadingEmployees={loadingEmployees}
                    />
                </div>
            )}
        </div>
    );
}
