import React, { useState, useEffect } from "react";
import CustomerPanel from "./CustomerPanel";
import QuotePanel from "./QuotePanel";
import config from "../../config";
import { getPrefixCd, getPosCd, getSideCd } from "../carGlassViewer/carGlassHelpers";

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
            licensePlateNumber: prefill.licensePlateNumber || "",
            vin: prefill.vin || "",
            vehicleNotes: prefill.vehicleNotes || "",
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
                    items.push({
                        type: "Labor",
                        id: `${uniqueId}_LABOR`,
                        nagsId: "",
                        oemId: "",
                        labor: Number(info?.labor) || "",
                        description: "Installation Labor",
                        manufacturer: "",
                        qty: 1,
                        unitPrice: 0,
                        amount: 0
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
        <div className="text-slate-900">
            <div className="flex justify-center gap-4 mb-6">
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
                <QuotePanel
                    parts={invoiceItems}
                    onRemovePart={onRemovePart}
                    customerData={customerData}
                />
            )}
        </div>
    );
}
