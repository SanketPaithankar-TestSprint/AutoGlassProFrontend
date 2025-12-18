import React, { useMemo, useState, useEffect } from "react";
import { Modal, Input, Button, message, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { createServiceDocument } from "../../api/createServiceDocument";
import { sendEmail } from "../../api/sendEmail";
import {
    generateServiceDocumentPDF,
    generatePDFFilename,
    downloadPDF
} from "../../utils/serviceDocumentPdfGenerator";

function currency(n) {
    const num = Number.isFinite(n) ? n : 0;
    return num.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function Row({ label, value, bold }) {
    return (
        <div className="flex justify-between text-sm">
            <span className={bold ? "font-semibold text-slate-700" : "text-slate-500"}>{label}</span>
            <span className={bold ? "font-semibold text-slate-900" : "text-slate-900"}>{value}</span>
        </div>
    );
}

function NumberRow({ label, value, setter }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">{label}</span>
            <input
                type="number"
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-24 rounded border border-slate-300 px-2 py-1 text-right"
            />
        </div>
    );
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
    pricingType: "hourly", // "hourly" or "lumpSum" for labor items
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

function QuotePanelContent({ parts = [], onRemovePart, customerData }) {
    const navigate = useNavigate();
    const [items, setItems] = useState(parts.length ? parts : [newItem()]);
    const [userProfile, setUserProfile] = useState(() => {
        try {
            const saved = localStorage.getItem("agp_profile_data");
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Failed to parse user profile", e);
            return null;
        }
    });

    // Get Global Labor Rate from sessionStorage
    const globalLaborRate = useMemo(() => {
        const rate = sessionStorage.getItem('GlobalLaborRate');
        return rate ? parseFloat(rate) : 100; // Default to 100 if not set
    }, []);

    useEffect(() => {
        setItems((prevItems) => {
            // Create a map of existing items that CAME from parts (based on IDs)
            // Manual items (random IDs) won't be in the parts list, so we keep them if they exist
            // Actually, a simpler strategy:
            // 1. Keep manual items (those strictly NOT matching any incoming part ID or generated labor ID)
            // 2. Overwrite/Add incoming parts
            // But wait, parts changed means the user selected/deselected something.
            // When parts prop changes, it sends the "correct" list of managed items.
            // We should just "merge" manual items back in.

            // Identify managed IDs from the NEW parts list
            const newPartIds = new Set(parts.map(p => p.id));

            // Keep existing manual items (items NOT in the new managed list, but also check if they were managed before?)
            // A better way: The parent (QuoteDetails) controls the "managed" items. 
            // Any item in `prevItems` that is NOT found in `parts` (and wasn't a previously managed item) is manual.
            // However, we don't track which were managed easily unless we use a flag. 
            // Let's assume manual items have random IDs not containing pipes `|`. 
            // Or better: QuoteDetails generates specific ID formats.

            // Simple approach: 
            // Take all new parts.
            // Take all existing items that are NOT found in the previous parts set... 
            // Actually simplest: User adds "Custom Item". It has a random ID.
            // QuoteDetails sends "Invoice Items". 
            // We want `items = [...parts, ...manualItems]`.

            const currentManualItems = prevItems.filter(it => it.isManual);

            // Merge: New Parts + Existing Manual Items
            return [...parts, ...currentManualItems];
        });
    }, [parts]);

    const [printableNote, setPrintableNote] = useState("");
    const [internalNote, setInternalNote] = useState("");

    const handleDeleteItem = (id) => {
        // 1. Notify parent to remove (if it's a managed part)
        onRemovePart?.(id);

        // 2. Optimistically remove from local state
        // This handles "TOTAL_LABOR" (which parent ignores) and gives instant feedback for parts
        setItems((prev) => prev.filter((it) => it.id !== id));
    };

    // Labor cost is now just the sum of items with type 'Labor'
    const laborCostDisplay = items.filter(it => it.type === 'Labor').reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

    const [globalTaxRate, setGlobalTaxRate] = useState(0);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [payment, setPayment] = useState(0);

    const updateItem = (id, key, value) => {
        setItems((prev) => prev.map((it) => {
            if (it.id !== id) return it;
            const updated = { ...it, [key]: value };

            // For Labor items: Amount = Unit Price (lump sum, ignore hours)
            if (it.type === 'Labor') {
                if (key === 'unitPrice') {
                    updated.amount = Number(value) || 0;
                }
            } else {
                // Standard behavior for Parts: Auto-calc amount if qty or unitPrice changes
                if (key === 'qty' || key === 'unitPrice') {
                    updated.amount = (Number(updated.qty) || 0) * (Number(updated.unitPrice) || 0);
                }
            }
            return updated;
        }));
    };

    const handleAddRow = (type = "Part") => {
        const newItemData = {
            ...newItem(),
            id: Math.random().toString(36).substring(2, 9),
            isManual: true, // Flag to identify manual items
            description: type === "Part" ? "Custom Part" : type === "Labor" ? "Custom Labor" : "Service",
            type: type
        };

        // Auto-populate labor rate for Labor items
        if (type === "Labor") {
            newItemData.unitPrice = globalLaborRate;
            newItemData.labor = 1; // Default 1 hour
            newItemData.pricingType = "hourly"; // Default to hourly pricing
            newItemData.amount = globalLaborRate; // 1 hour × rate
        }

        setItems(prev => [...prev, newItemData]);
    };

    const subtotal = useMemo(() => items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0), [items]);
    // Only sum labor hours from Labor-type items to avoid double counting
    // (Part items also have a labor field for reference, but shouldn't be counted in total hours)
    const totalHours = useMemo(() =>
        items
            .filter(it => it.type === 'Labor')
            .reduce((sum, it) => sum + (Number(it.labor) || 0), 0),
        [items]
    );
    const totalTax = useMemo(() => (subtotal * (Number(globalTaxRate) || 0)) / 100, [subtotal, globalTaxRate]);
    const discountAmount = useMemo(() => {
        return (subtotal * (Number(discountPercent) || 0)) / 100;
    }, [subtotal, discountPercent]);
    // Labor is now in subtotal, so don't add it again
    const total = useMemo(() => Math.max(0, subtotal + totalTax - discountAmount), [subtotal, totalTax, discountAmount]);
    const numericPayment = Number(payment) || 0;
    const balance = useMemo(() => Math.max(0, total - numericPayment), [total, numericPayment]);

    let docType = "Invoice";
    if (numericPayment <= 0) docType = "Quote";
    else if (numericPayment < total) docType = "Work Order";


    // Generate PDF using utility function
    const generatePdfDoc = () => {
        return generateServiceDocumentPDF({
            items,
            customerData,
            userProfile,
            subtotal,
            totalTax,
            totalHours,
            discountAmount,
            total,
            balance,
            docType,
            printableNote
        });
    };

    const getFilename = () => {
        return generatePDFFilename(docType, customerData);
    };

    const downloadPdf = () => {
        const doc = generatePdfDoc();
        downloadPDF(doc, getFilename());
    };


    // --- Email / Modal State ---
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [pdfBlob, setPdfBlob] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [emailForm, setEmailForm] = useState({
        to: "",
        subject: "",
        body: ""
    });

    const handleOpenPreview = () => {
        if (!customerData?.customerId || !customerData?.vehicleId) {
            message.error("Please save/create the customer profile before generating a quote.");
            return;
        }

        // Validation: Check for 0 amounts
        const invalidItems = items.filter(it => !Number(it.amount) || Number(it.amount) === 0);
        if (invalidItems.length > 0) {
            message.error(`Please enter a valid amount for: ${invalidItems.map(it => it.type === 'Labor' ? 'Labor' : (it.description || 'Item')).join(', ')}`);
            return;
        }

        const doc = generatePdfDoc();
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        setPdfBlob(blob);
        setPreviewUrl(url);
        setShowEmailModal(true);

        // precise default values for email
        const subject = `Your Auto Glass ${docType} - ${customerData.vehicleYear} ${customerData.vehicleMake} ${customerData.vehicleModel}`;
        const body = `Dear ${customerData.firstName} ${customerData.lastName},

Please find attached the ${docType.toLowerCase()} for your ${customerData.vehicleYear} ${customerData.vehicleMake} ${customerData.vehicleModel}.

If you have any questions, please don't hesitate to contact us.

Best regards,
Auto Glass Pro Team`;

        setEmailForm({
            to: customerData?.email || "",
            subject: subject,
            body: body
        });
    };

    const handleCloseModal = () => {
        setShowEmailModal(false);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setPdfBlob(null);
    };

    // Replaced legacy handleGenerateAndSend with handleOpenPreview via render at bottom
    const handleConfirmAndSend = async () => {
        try {
            setEmailLoading(true);

            // 1. Separate Parts and Labor
            // We differentiate them by type
            const partItems = items.filter(it => it.type !== 'Labor');
            const laborItems = items.filter(it => it.type === 'Labor');

            // 2. Calculate Total Global Labor (Sum of all labor row amounts)
            // As per your request: simple sum of the flat rates (amounts)
            const totalLaborAmount = laborItems.reduce((sum, labor) => sum + (Number(labor.amount) || 0), 0);

            // 3. Create the Merged Items Payload
            // We loop through parts and try to find their "partner" labor row
            const payloadItems = partItems.map((part) => {
                // Find the linked labor row. 
                // Logic: matches if labor.id equals "partID_LABOR"
                const linkedLabor = laborItems.find(l => l.id === `${part.id}_LABOR`);

                return {
                    itemType: "part", // Fixed value or dynamic based on logic
                    prefixCd: part.prefixCd || "",
                    posCd: part.posCd || "",
                    sideCd: part.sideCd || "",
                    nagsGlassId: part.nagsId || "MISC",
                    partDescription: part.description || "",

                    // PART PRICING
                    partPrice: Number(part.unitPrice) || 0,
                    quantity: Number(part.qty) || 1,

                    // LABOR MERGING (The critical fix)
                    // We take the flat rate (amount) from the linked labor row
                    laborRate: linkedLabor ? (Number(linkedLabor.amount) || 0) : 0,
                    laborHours: linkedLabor ? (Number(linkedLabor.labor) || 0) : 0,
                };
            });

            // 4. Construct the Final Payload
            const payload = {
                documentType: docType.toLowerCase().replace(" ", "") === "workorder" ? "invoice" : docType.toLowerCase(),
                customerId: customerData.customerId || 0,
                vehicleId: customerData.vehicleId || 0,
                employeeId: 0, // Set default or dynamic
                serviceLocation: "mobile",
                serviceAddress: `${customerData.addressLine1 || ''}, ${customerData.city || ''}, ${customerData.state || ''} ${customerData.postalCode || ''}`,
                documentDate: new Date().toISOString(),
                scheduledDate: new Date().toISOString(),
                estimatedCompletion: new Date().toISOString(),
                dueDate: new Date().toISOString().split('T')[0],
                paymentTerms: "Due upon receipt",
                notes: printableNote,
                termsConditions: "Warranty valid for 12 months on workmanship.",

                // Financial Totals
                taxRate: Number(globalTaxRate) || 0,
                discountAmount: discountAmount, // Derived from your existing memo
                laborAmount: totalLaborAmount,  // The global sum we calculated in step 2

                // The Merged Items List
                items: payloadItems
            };

            console.log("Sending Payload:", payload); // Debugging

            await createServiceDocument(payload);
            message.success("Service Document Created!");

            // 5. Handle Email (Existing logic preserved)
            if (pdfBlob) {
                const file = new File([pdfBlob], getFilename(), { type: "application/pdf" });
                const emailResponse = await sendEmail(emailForm.to, emailForm.subject, emailForm.body, file);

                if (emailResponse && emailResponse.status === "success") {
                    message.success("Email Sent Successfully!");
                    handleCloseModal();
                    downloadPdf();
                    setTimeout(() => {
                        navigate('/work');
                    }, 1000);
                } else {
                    message.error("Email failed to send");
                }
            }
        } catch (err) {
            console.error(err);
            message.error("Operation failed: " + err.message);
        } finally {
            setEmailLoading(false);
        }
    };


    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-2 max-w-7xl">
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
                    Quote Details
                </h3>
                <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-medium border ${docType === "Quote" ? "border-sky-500/60 bg-sky-500/10 text-sky-200" : docType === "Work Order" ? "border-amber-400/70 bg-amber-400/10 text-amber-100" : "border-emerald-400/70 bg-emerald-400/10 text-emerald-100"}`}>{docType}</span>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto mb-2 border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            <th className="px-3 py-2 min-w-[120px]">Part</th>
                            <th className="px-3 py-2 min-w-[90px]">OEM ID</th>
                            <th className="px-3 py-2 min-w-[180px]">Description</th>
                            <th className="px-3 py-2 min-w-[120px]">Manufacturer</th>
                            <th className="px-3 py-2 text-right min-w-[70px]">Qty</th>
                            <th className="px-3 py-2 text-right min-w-[90px]">List Price</th>
                            <th className="px-3 py-2 text-right min-w-[90px]">Amount</th>
                            <th className="px-2 py-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {items.map((it) => (
                            <tr key={it.id} className="hover:bg-slate-50 transition group">
                                <td className="px-3 py-2">
                                    <input
                                        value={it.type === 'Labor' ? "LABOR" : it.nagsId}
                                        onChange={(e) => it.type !== 'Labor' && updateItem(it.id, "nagsId", e.target.value)}
                                        className={`w-full h-8 rounded border border-slate-300 px-2 text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none ${it.type === 'Labor' ? 'bg-slate-100 text-slate-500' : ''}`}
                                        placeholder="Part No"
                                        disabled={it.type === 'Labor'}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        value={it.oemId}
                                        onChange={(e) => updateItem(it.id, "oemId", e.target.value)}
                                        className={`w-full h-8 rounded border border-slate-300 px-2 text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none ${(!it.isManual && it.type === 'Labor') ? 'bg-slate-100 text-slate-500' : ''}`}
                                        placeholder="OEM"
                                        disabled={!it.isManual && it.type === 'Labor'}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        value={it.type === 'Labor' ? `Labor ${it.labor || 0} hours` : it.description}
                                        onChange={(e) => updateItem(it.id, "description", e.target.value)}
                                        className={`w-full h-8 rounded border border-slate-300 px-2 text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none ${it.type === 'Labor' ? 'bg-slate-100 text-slate-500' : ''}`}
                                        disabled={it.type === 'Labor'}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        value={it.manufacturer}
                                        onChange={(e) => updateItem(it.id, "manufacturer", e.target.value)}
                                        className={`w-full h-8 rounded border border-slate-300 px-2 text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none ${(!it.isManual && it.type === 'Labor') ? 'bg-slate-100 text-slate-500' : ''}`}
                                        disabled={!it.isManual && it.type === 'Labor'}
                                    />
                                </td>
                                <td className="px-3 py-2 text-right">
                                    <input
                                        type="number"
                                        value={it.qty}
                                        onChange={(e) => updateItem(it.id, "qty", e.target.value)}
                                        className={`w-full h-8 rounded border border-slate-300 px-2 text-xs text-right focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none ${(!it.isManual && it.type === 'Labor') ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                                        disabled={!it.isManual && it.type === 'Labor'}
                                    />
                                </td>
                                <td className="px-3 py-2 text-right">
                                    <input
                                        type="number"
                                        value={it.unitPrice}
                                        onChange={(e) => updateItem(it.id, "unitPrice", e.target.value)}
                                        className={`w-full h-8 rounded border border-slate-300 px-2 text-xs text-right focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none ${(!it.isManual && it.type === 'Labor') ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                                        disabled={!it.isManual && it.type === 'Labor'}
                                    />
                                </td>
                                <td className="px-3 py-2 text-right font-medium text-xs">
                                    <div className="flex flex-col items-end gap-1">
                                        <input
                                            type="number"
                                            value={it.amount}
                                            onChange={(e) => updateItem(it.id, "amount", e.target.value)}
                                            className={`w-24 rounded border px-2 py-1 text-right text-xs outline-none focus:ring-1 ${(!Number(it.amount) || Number(it.amount) === 0) ? 'border-red-500 focus:border-red-500 bg-red-50 text-red-700' : 'border-slate-300 focus:border-violet-500 focus:ring-violet-500'}`}
                                        />
                                        {(!Number(it.amount) || Number(it.amount) === 0) && (
                                            <span className="text-[10px] text-red-500 font-semibold">Required</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-2 py-2 text-center">
                                    <button type="button" onClick={() => handleDeleteItem(it.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50" title="Remove Item">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end mb-2">
                <Dropdown
                    menu={{
                        items: [
                            { key: 'Part', label: 'Add Part' },
                            { key: 'Labor', label: 'Add Labor' },
                            { key: 'Service', label: 'Add Service' }
                        ],
                        onClick: (e) => handleAddRow(e.key)
                    }}
                >
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors">
                        Add Item <DownOutlined />
                    </button>
                </Dropdown>
            </div>

            {/* Totals & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-2">
                    <div>
                        <label className="text-xs text-slate-500 mb-0.5 block">Printable Note</label>
                        <textarea rows={2} value={printableNote} onChange={(e) => setPrintableNote(e.target.value)} className="w-full rounded border border-slate-300 px-2 py-1 text-xs" placeholder="Notes for the customer..." />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 mb-0.5 block">Internal Note</label>
                        <textarea rows={2} value={internalNote} onChange={(e) => setInternalNote(e.target.value)} className="w-full rounded border border-slate-300 px-2 py-1 text-xs" placeholder="Internal use only..." />
                    </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-2 space-y-2">
                    <Row label="Subtotal" value={currency(subtotal)} />
                    <Row label="Subtotal" value={currency(subtotal)} />
                    {/* Labor is now in subtotal, but show hours for reference */}
                    <div className="flex justify-between text-xs text-slate-400 px-1">
                        <span>Total Labor Hours</span>
                        <span>{totalHours.toFixed(1)} hrs</span>
                    </div>
                    <NumberRow label="Tax %" value={globalTaxRate} setter={setGlobalTaxRate} />
                    <Row label="Tax Total" value={currency(totalTax)} />
                    <NumberRow label="Discount %" value={discountPercent} setter={setDiscountPercent} />
                    {Number(discountPercent) > 0 && <Row label="Discount Amount" value={`- ${currency(discountAmount)}`} />}
                    <Row label="Total" value={currency(total)} bold />
                    <NumberRow label="Payment Received" value={payment} setter={setPayment} />
                    <Row label="Balance Due" value={currency(balance)} bold />
                    <div className="pt-4 flex justify-end">
                        <button onClick={handleOpenPreview} className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-semibold shadow-md hover:from-violet-400 hover:to-fuchsia-400 transition">
                            Generate & Send {docType}
                        </button>
                    </div>
                </div>
            </div>

            {/* Email Preview Modal */}
            <Modal
                title={`Send ${docType}`}
                open={showEmailModal}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="cancel" onClick={handleCloseModal}>Cancel</Button>,
                    <Button key="send" type="primary" loading={emailLoading} onClick={handleConfirmAndSend} className="bg-violet-600">
                        Confirm & Send
                    </Button>
                ]}
                width={800}
            >
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Form Section */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
                            <Input
                                value={emailForm.to}
                                onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                                placeholder="Recipient email"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                            <Input
                                value={emailForm.subject}
                                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                                placeholder="Email subject"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                            <Input.TextArea
                                rows={4}
                                value={emailForm.body}
                                onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                                placeholder="Email body..."
                            />
                        </div>
                    </div>
                    {/* Preview Section */}
                    <div className="flex-1 h-[400px] border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                        {previewUrl ? (
                            <iframe src={previewUrl} className="w-full h-full" title="PDF Preview" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">Generating Preview...</div>
                        )}
                    </div>
                </div>
            </Modal>
        </div >
    );
}

export default function QuotePanel(props) {
    return (
        <ErrorBoundary>
            <QuotePanelContent {...props} />
        </ErrorBoundary>
    );
}
