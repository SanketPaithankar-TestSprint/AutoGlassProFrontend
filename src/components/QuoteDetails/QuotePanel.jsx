import React, { useMemo, useState, useEffect } from "react";
import { Modal, Input, Button, message, Dropdown, Select, InputNumber } from "antd";
import { DownOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { createCompositeServiceDocument } from "../../api/createCompositeServiceDocument";
import { getActiveTaxRates, getDefaultTaxRate } from "../../api/taxRateApi";

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
                className="w-20 rounded border border-slate-300 px-2 py-1 text-right text-sm"
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

function QuotePanelContent({ parts = [], onRemovePart, customerData, printableNote, internalNote, insuranceData, includeInsurance, attachmentFile, onClear }) {
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
            const currentManualItems = prevItems.filter(it => it.isManual);
            return [...parts, ...currentManualItems];
        });
    }, [parts]);

    // Local State Deleted: Notes are now passed as props

    const handleDeleteItem = (id) => {
        onRemovePart?.(id);
        setItems((prev) => prev.filter((it) => it.id !== id));
    };

    const laborCostDisplay = items.filter(it => it.type === 'Labor').reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

    const [globalTaxRate, setGlobalTaxRate] = useState(0);
    const [isManualTax, setIsManualTax] = useState(false);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [payment, setPayment] = useState(0);
    const [manualDocType, setManualDocType] = useState("");

    const [taxRates, setTaxRates] = useState([]);

    useEffect(() => {
        const fetchTaxData = async () => {
            try {
                const [rates, defaultRate] = await Promise.all([
                    getActiveTaxRates().catch(() => []),
                    getDefaultTaxRate().catch(() => null)
                ]);
                setTaxRates(Array.isArray(rates) ? rates : []);

                // If a default exists, use it
                if (defaultRate && defaultRate.taxPercent) {
                    setGlobalTaxRate(defaultRate.taxPercent);
                }
            } catch (err) {
                console.error("Failed to fetch tax rates", err);
            }
        };
        fetchTaxData();
    }, []);

    const updateItem = (id, key, value) => {
        setItems((prev) => prev.map((it) => {
            if (it.id !== id) return it;
            const updated = { ...it, [key]: value };
            if (it.type === 'Labor') {
                if (key === 'unitPrice') {
                    updated.amount = Number(value) || 0;
                }
            } else {
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

        if (type === "Labor") {
            newItemData.unitPrice = globalLaborRate;
            newItemData.labor = 1;
            newItemData.pricingType = "hourly";
            newItemData.amount = globalLaborRate;
        }

        setItems(prev => [...prev, newItemData]);
    };

    const subtotal = useMemo(() => items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0), [items]);
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
    const total = useMemo(() => Math.max(0, subtotal + totalTax - discountAmount), [subtotal, totalTax, discountAmount]);
    const numericPayment = Number(payment) || 0;
    const balance = useMemo(() => Math.max(0, total - numericPayment), [total, numericPayment]);

    let calculatedDocType = "Invoice";
    if (numericPayment <= 0) calculatedDocType = "Quote";
    else if (numericPayment < total) calculatedDocType = "Work Order";

    const currentDocType = manualDocType || calculatedDocType;


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
            docType: currentDocType,
            printableNote // Passed from props
        });
    };

    const getFilename = () => {
        return generatePDFFilename(currentDocType, customerData);
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

    // Validated Modal Context
    const [modal, contextHolder] = Modal.useModal();

    const handleOpenPreview = () => {
        try {
            // Validation: Customer Data
            const hasCustomerIdentity = customerData && (
                (customerData.firstName && customerData.firstName.trim() !== "") ||
                (customerData.lastName && customerData.lastName.trim() !== "") ||
                (customerData.companyName && customerData.companyName.trim() !== "")
            );

            if (!hasCustomerIdentity) {
                modal.warning({
                    title: 'Missing Customer',
                    content: 'Please select or enter a customer before generating a quote.',
                    okText: 'OK',
                });
                return;
            }

            // Validation: Vehicle Data
            const missingVehicleInfo = [];
            if (!customerData.vehicleYear || customerData.vehicleYear === 0) missingVehicleInfo.push("Year");
            if (!customerData.vehicleMake || customerData.vehicleMake.trim() === "") missingVehicleInfo.push("Make");
            if (!customerData.vehicleModel || customerData.vehicleModel.trim() === "") missingVehicleInfo.push("Model");

            if (missingVehicleInfo.length > 0) {
                modal.warning({
                    title: 'Missing Vehicle Details',
                    content: `Please provide the following vehicle details: ${missingVehicleInfo.join(', ')}.`,
                    okText: 'OK',
                });
                return;
            }

            // Validation: Items
            const invalidItems = items.filter(it => !Number(it.amount) || Number(it.amount) === 0);
            if (invalidItems.length > 0) {
                modal.warning({
                    title: 'Invalid Items',
                    content: `Please enter a valid amount for: ${invalidItems.map(it => it.type === 'Labor' ? 'Labor' : (it.description || 'Item')).join(', ')}`,
                    okText: 'OK',
                });
                return;
            }

            const doc = generatePdfDoc();
            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);
            setPdfBlob(blob);
            setPreviewUrl(url);
            setShowEmailModal(true);

            const subject = `Your Auto Glass ${currentDocType} - ${customerData.vehicleYear || ''} ${customerData.vehicleMake || ''} ${customerData.vehicleModel || ''}`;
            const body = `Dear ${customerData.firstName || 'Customer'} ${customerData.lastName || ''},

Please find attached the ${currentDocType.toLowerCase()} for your ${customerData.vehicleYear || ''} ${customerData.vehicleMake || ''} ${customerData.vehicleModel || ''}.

If you have any questions, please don't hesitate to contact us.

Best regards,
Auto Glass Pro Team`;

            setEmailForm({
                to: customerData?.email || "",
                subject: subject,
                body: body
            });
        } catch (error) {
            console.error("Error in handleOpenPreview:", error);
            modal.error({
                title: 'Error',
                content: "An unexpected error occurred: " + error.message,
            });
        }
    };

    const handleCloseModal = () => {
        setShowEmailModal(false);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setPdfBlob(null);
    };

    const handleConfirmAndSend = async () => {
        try {
            setEmailLoading(true);

            // 1. Construct Service Document Items
            const partItems = items.filter(it => it.type !== 'Labor');
            const laborItems = items.filter(it => it.type === 'Labor');
            const totalLaborAmount = laborItems.reduce((sum, labor) => sum + (Number(labor.amount) || 0), 0);

            const serviceDocumentItems = partItems.map((part) => {
                const linkedLabor = laborItems.find(l => l.id === `${part.id}_LABOR`);
                return {
                    itemType: "part",
                    prefixCd: part.prefixCd || "",
                    posCd: part.posCd || "",
                    sideCd: part.sideCd || "",
                    nagsGlassId: part.nagsId || "MISC",
                    partDescription: part.description || "",
                    partPrice: Number(part.unitPrice) || 0,
                    quantity: Number(part.qty) || 1,
                    laborRate: linkedLabor ? (Number(linkedLabor.amount) || 0) : 0,
                    laborHours: linkedLabor ? (Number(linkedLabor.labor) || 0) : 0,
                };
            });

            // Add purely manual labor/service items as well if they aren't linked to parts
            const manualItems = items.filter(it => (it.type === 'Labor' || it.type === 'Service') && !it.id.includes('_LABOR'));
            manualItems.forEach(manualIt => {
                serviceDocumentItems.push({
                    itemType: manualIt.type.toLowerCase(), // 'labor' or 'service'
                    partDescription: manualIt.description,
                    partPrice: Number(manualIt.amount) || 0, // treating amount as price for simple items
                    quantity: 1,
                    laborRate: 0,
                    laborHours: 0
                });
            });


            // 2. Construct CustomerWithVehicle DTO
            const customerWithVehicle = {
                organizationId: 0, // Default or from context
                customerType: "individual", // Default
                firstName: customerData.firstName || "",
                lastName: customerData.lastName || "",
                email: customerData.email || "",
                phone: customerData.phone || "",
                alternatePhone: customerData.alternatePhone || "",
                addressLine1: customerData.addressLine1 || "",
                addressLine2: "",
                city: customerData.city || "",
                state: customerData.state || "",
                postalCode: customerData.postalCode || "",
                country: customerData.country || "USA",
                preferredContactMethod: "email",
                notes: customerData.notes || "",

                // Vehicle Details
                vehicleYear: Number(customerData.vehicleYear) || 2020,
                vehicleMake: customerData.vehicleMake || "",
                vehicleModel: customerData.vehicleModel || "",
                vehicleStyle: customerData.vehicleStyle || "",
                licensePlateNumber: customerData.licensePlateNumber || "",
                vin: customerData.vin || "",
                vehicleNotes: ""
            };

            // 3. Construct ServiceDocument DTO
            const serviceDocument = {
                documentType: currentDocType.toLowerCase().replace(" ", "") === "workorder" ? "invoice" : currentDocType.toLowerCase(),
                employeeId: 0,
                serviceLocation: "mobile",
                serviceAddress: `${customerData.addressLine1 || ''}, ${customerData.city || ''}, ${customerData.state || ''} ${customerData.postalCode || ''}`,
                documentDate: new Date().toISOString(),
                scheduledDate: new Date().toISOString(),
                estimatedCompletion: new Date().toISOString(),
                dueDate: new Date().toISOString().split('T')[0],
                paymentTerms: "Due upon receipt",
                notes: printableNote,
                termsConditions: "Warranty valid for 12 months on workmanship.",
                taxRate: Number(globalTaxRate) || 0,
                discountAmount: discountAmount,
                laborAmount: totalLaborAmount,
                items: serviceDocumentItems
            };

            // 4. Construct Composite Payload
            const compositePayload = {
                customerWithVehicle: customerWithVehicle,
                serviceDocument: serviceDocument,
                insurance: includeInsurance ? insuranceData : null,
                attachmentDescription: attachmentFile ? "Quote Attachment" : ""
            };

            console.log("Sending Composite Payload:", compositePayload);

            // 5. Call Composite API
            const response = await createCompositeServiceDocument(compositePayload, attachmentFile);

            message.success("Service Document Created Successfully!");
            const createdDocNumber = response.serviceDocument?.documentNumber;

            // 6. Send Email if PDF is generated
            if (pdfBlob && createdDocNumber) {
                const file = new File([pdfBlob], getFilename(), { type: "application/pdf" });
                const emailResponse = await sendEmail(emailForm.to, emailForm.subject, emailForm.body, file);

                if (emailResponse && emailResponse.status === "success") {
                    message.success("Email Sent Successfully!");
                } else {
                    message.warning("Document created, but email failed to send.");
                }
            }

            handleCloseModal();
            downloadPdf();
            setTimeout(() => {
                navigate('/work');
            }, 1000);

        } catch (err) {
            console.error(err);
            message.error("Operation failed: " + err.message);
        } finally {
            setEmailLoading(false);
        }
    };


    const handleClear = () => {
        if (window.confirm("Are you sure you want to clear all details? This action cannot be undone.")) {
            // Reset Local State
            setItems([]);
            setGlobalTaxRate(0); // Optional: could reset to default if preferred
            setIsManualTax(false);
            setDiscountPercent(0);
            setPayment(0);
            setManualDocType("");

            // Trigger Parent Clear
            if (onClear) {
                onClear();
            }

            message.info("Quote details cleared.");
        }
    };


    return (
        <div>
            {contextHolder}
            {/* Header */}
            <div className="flex items-center justify-between mb-2 max-w-7xl">
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
                    Quote Details
                </h3>
                <button
                    onClick={handleClear}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                    title="Clear all details"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Clear
                </button>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-[180px] mb-2 border border-slate-300 bg-white shadow-sm rounded-sm">
                <table className="min-w-full divide-y divide-slate-300">
                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                        <tr className="text-left text-[11px] font-semibold text-slate-800 tracking-tight">
                            <th className="px-1 py-0.5 min-w-[60px] border-r border-slate-300 bg-slate-50">Part</th>
                            <th className="px-1 py-0.5 min-w-[400px] border-r border-slate-300 bg-slate-50">Description</th>
                            <th className="px-1 py-0.5 min-w-[60px] border-r border-slate-300 bg-slate-50">Manufacturer</th>
                            <th className="px-1 py-0.5 text-right min-w-[50px] border-r border-slate-300 bg-slate-50">Quantity</th>
                            <th className="px-1 py-0.5 text-right min-w-[50px] border-r border-slate-300 bg-slate-50">List</th>
                            <th className="px-1 py-0.5 text-right min-w-[50px] border-r border-slate-300 bg-slate-50">Amount</th>
                            <th className="px-1 py-0.5 w-5 bg-slate-50"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-300">
                        {items.map((it) => (
                            <tr key={it.id} className="hover:bg-slate-50 transition group">
                                <td className="px-1 py-0.5 border-r border-slate-300">
                                    <input
                                        value={it.type === 'Labor' ? "LABOR" : it.nagsId}
                                        onChange={(e) => it.type !== 'Labor' && updateItem(it.id, "nagsId", e.target.value)}
                                        className={`w-full h-5 rounded px-1 text-[11px] outline-none focus:bg-white bg-transparent ${it.type === 'Labor' ? 'text-slate-500' : 'text-slate-900 font-medium'}`}
                                        placeholder="Part No"
                                        disabled={it.type === 'Labor'}
                                    />
                                </td>
                                <td className="px-1 py-0.5 border-r border-slate-300">
                                    <input
                                        value={it.type === 'Labor' ? `Labor ${it.labor || 0} hours` : it.description}
                                        onChange={(e) => updateItem(it.id, "description", e.target.value)}
                                        className={`w-full h-5 rounded px-1 text-[11px] outline-none focus:bg-white bg-transparent ${it.type === 'Labor' ? 'text-slate-500' : 'text-slate-700'}`}
                                        disabled={it.type === 'Labor'}
                                    />
                                </td>
                                <td className="px-1 py-0.5 border-r border-slate-300">
                                    <input
                                        value={it.manufacturer}
                                        onChange={(e) => updateItem(it.id, "manufacturer", e.target.value)}
                                        className={`w-full h-5 rounded px-1 text-[11px] outline-none focus:bg-white bg-transparent ${(!it.isManual && it.type === 'Labor') ? 'text-slate-400' : 'text-slate-600'}`}
                                        disabled={!it.isManual && it.type === 'Labor'}
                                    />
                                </td>
                                <td className="px-1 py-0.5 text-right border-r border-slate-300">
                                    <input
                                        type="number"
                                        value={it.qty}
                                        onChange={(e) => updateItem(it.id, "qty", e.target.value)}
                                        className={`w-full h-5 rounded px-1 text-[11px] text-right outline-none focus:bg-white bg-transparent ${(!it.isManual && it.type === 'Labor') ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700'}`}
                                        disabled={!it.isManual && it.type === 'Labor'}
                                    />
                                </td>
                                <td className="px-1 py-0.5 text-right border-r border-slate-300">
                                    <input
                                        type="number"
                                        value={it.unitPrice}
                                        onChange={(e) => updateItem(it.id, "unitPrice", e.target.value)}
                                        className={`w-full h-5 rounded px-1 text-[11px] text-right outline-none focus:bg-white bg-transparent ${(!it.isManual && it.type === 'Labor') ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700'}`}
                                        disabled={!it.isManual && it.type === 'Labor'}
                                    />
                                </td>
                                <td className="px-1 py-0.5 text-right font-medium text-[11px] border-r border-slate-300">
                                    <div className="flex flex-col items-end gap-0 h-full justify-center">
                                        <input
                                            type="number"
                                            value={it.amount}
                                            onChange={(e) => updateItem(it.id, "amount", e.target.value)}
                                            className={`w-full rounded px-1 py-0 text-right text-[11px] outline-none h-5 focus:bg-white bg-transparent ${(!Number(it.amount) || Number(it.amount) === 0) ? 'text-red-600 font-bold bg-red-50' : 'text-slate-900 bg-sky-50'}`}
                                        />
                                        {(!Number(it.amount) || Number(it.amount) === 0) && (
                                            <span className="hidden">Required</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-1 py-0.5 text-center">
                                    <button type="button" onClick={() => handleDeleteItem(it.id)} className="text-slate-300 hover:text-red-500 transition-colors p-0.5 rounded hover:bg-red-50" title="Remove Item">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
                            { key: 'Part', label: <span className="text-[11px]">Add Part</span> },
                            { key: 'Labor', label: <span className="text-[11px]">Add Labor</span> },
                            { key: 'Service', label: <span className="text-[11px]">Add Service</span> }
                        ],
                        onClick: (e) => handleAddRow(e.key)
                    }}
                >
                    <button className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[11px] font-medium transition-colors">
                        Add <DownOutlined className="text-[9px]" />
                    </button>
                </Dropdown>
            </div>

            {/* Totals & Actions (Notes removed) */}
            {/* Totals & Actions */}
            <div className="flex justify-end mt-4">
                <div className="bg-slate-50 border border-slate-200 p-3 space-y-2 w-full max-w-sm rounded-lg shadow-sm">
                    <Row label="Subtotal" value={currency(subtotal)} />

                    {/* Tax Rate Selection */}
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Tax</span>
                        <div className="flex items-center gap-2">
                            {isManualTax ? (
                                <div className="flex items-center gap-1">
                                    <InputNumber
                                        value={globalTaxRate}
                                        onChange={setGlobalTaxRate}
                                        min={0}
                                        max={100}
                                        padding="0"
                                        size="small"
                                        className="w-20 text-right"
                                        formatter={value => `${value}`}
                                        parser={value => value.replace('%', '')}
                                    />
                                    <span className="text-slate-400 text-xs">%</span>
                                    <Button
                                        size="small"
                                        type="text"
                                        icon={<UnorderedListOutlined />}
                                        onClick={() => setIsManualTax(false)}
                                        title="Select from list"
                                        className="text-slate-400 hover:text-violet-600"
                                    />
                                </div>
                            ) : (
                                <Select
                                    value={globalTaxRate}
                                    onChange={(val) => {
                                        if (val === 'MANUAL') {
                                            setIsManualTax(true);
                                        } else {
                                            setGlobalTaxRate(val);
                                        }
                                    }}
                                    className="w-32"
                                    size="small"
                                    placeholder="Select Tax"
                                    dropdownMatchSelectWidth={false}
                                >
                                    {taxRates.map(rate => (
                                        <Select.Option key={rate.taxRateId} value={rate.taxPercent}>
                                            {rate.stateCode} ({rate.taxPercent}%)
                                        </Select.Option>
                                    ))}
                                    <Select.Option value={0}>No Tax (0%)</Select.Option>
                                    <Select.Option value="MANUAL" className="text-violet-600 font-medium border-t border-slate-100 mt-1">
                                        Custom Rate...
                                    </Select.Option>
                                </Select>
                            )}
                            <span className="text-slate-900 w-16 text-right">{currency(totalTax)}</span>
                        </div>
                    </div>

                    <NumberRow label="Discount %" value={discountPercent} setter={setDiscountPercent} />
                    {Number(discountPercent) > 0 && <Row label="Discount" value={`- ${currency(discountAmount)}`} />}

                    <div className="my-1 border-t border-slate-200"></div>

                    <Row label="Total" value={currency(total)} bold />
                    <NumberRow label="Paid" value={payment} setter={setPayment} />

                    <div className="my-1 border-t border-slate-200"></div>

                    <Row label="Balance" value={currency(balance)} bold />

                    <div className="pt-2 flex justify-between items-center bg-white rounded-lg p-2">
                        <select
                            value={manualDocType}
                            onChange={(e) => setManualDocType(e.target.value)}
                            className={`appearance-none outline-none cursor-pointer inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium border ${currentDocType === "Quote" ? "border-sky-500/60 bg-sky-500/10 text-emerald-600" : currentDocType === "Work Order" ? "border-amber-400/70 bg-amber-400/10 text-amber-600" : "border-emerald-400/70 bg-emerald-400/10 text-emerald-600"}`}
                        >
                            <option value="">Auto ({calculatedDocType})</option>
                            <option value="Quote">Quote</option>
                            <option value="Work Order">Work Order</option>
                            <option value="Invoice">Invoice</option>
                        </select>
                        <button onClick={handleOpenPreview} className="px-4 py-2 rounded bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold shadow hover:from-violet-500 hover:to-fuchsia-500 transition">
                            Generate {currentDocType}
                        </button>
                    </div>
                </div>
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
