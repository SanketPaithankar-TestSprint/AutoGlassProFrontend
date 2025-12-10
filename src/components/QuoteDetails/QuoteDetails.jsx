import React, { useState, useEffect } from "react";
import CustomerPanel from "./CustomerPanel";
import QuotePanel from "./QuotePanel";
import config from "../../config";
import { getPrefixCd, getPosCd, getSideCd } from "../carGlassViewer/carGlassHelpers";

export default function QuoteDetails({ prefill, parts, onRemovePart, activePanel, onPanelSwitch, invoiceItems, setInvoiceItems }) {
    // If activePanel is passed (controlled mode), use it. Otherwise default to internal state.
    const [internalPanel, setInternalPanel] = useState("customer");
    const panel = activePanel || internalPanel;

    const [canShowQuotePanel, setCanShowQuotePanel] = useState(true);
    // invoiceItems is now passed as prop
    // const [invoiceItems, setInvoiceItems] = useState([]);

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
        return initial;
    });

    useEffect(() => {
        if (customerData) {
            localStorage.setItem("agp_customer_data", JSON.stringify(customerData));
        }
    }, [customerData]);

    // State lifting: useEffect moved to SearchByRoot
    // useEffect(() => { ... }, [parts]);

    return (
        <div className="text-slate-900">
            {/* Hide tabs if controlled via activePanel */}
            {!activePanel && (
                <div className="flex justify-center gap-4 mb-6">
                    <button
                        className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-all duration-150 ${internalPanel === 'customer' ? 'border-violet-500 text-violet-700 bg-white' : 'border-transparent text-slate-400 bg-slate-50'}`}
                        onClick={() => setInternalPanel('customer')}
                    >
                        Customer Information
                    </button>
                    <button
                        className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-all duration-150 ${internalPanel === 'quote' ? 'border-violet-500 text-violet-700 bg-white' : 'border-transparent text-slate-400 bg-slate-50'}`}
                        onClick={() => setInternalPanel('quote')}
                    >
                        Quote Information
                    </button>
                </div>
            )}
            {panel === 'customer' && (
                <CustomerPanel
                    formData={customerData}
                    setFormData={setCustomerData}
                    // Only pass setPanel if we are NOT in controlled mode (or handle it via parent)
                    // For now, if controlled, child cannot switch panel.
                    setCanShowQuotePanel={!activePanel ? setCanShowQuotePanel : undefined}
                    setPanel={!activePanel ? setInternalPanel : onPanelSwitch}
                />
            )}
            {panel === 'quote' && (
                <QuotePanel
                    parts={invoiceItems}
                    onRemovePart={onRemovePart}
                    customerData={customerData}
                    setItems={setInvoiceItems} // Passing setter to QuotePanel
                />
            )}
        </div>
    );
}
