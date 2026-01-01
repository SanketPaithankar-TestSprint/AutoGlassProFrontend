import React, { useMemo, useState, useEffect } from "react";
import { Modal, Input, Button, message, Dropdown, Select, InputNumber } from "antd";
import { DownOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { createCompositeServiceDocument } from "../../api/createCompositeServiceDocument";
import { updateCompositeServiceDocument } from "../../api/updateCompositeServiceDocument";
import { getActiveTaxRates, getDefaultTaxRate } from "../../api/taxRateApi";
import { getAttachmentsByDocumentNumber } from "../../api/getAttachmentsByDocumentNumber";

import { sendEmail } from "../../api/sendEmail";
import { extractGlassInfo } from "../carGlassViewer/carGlassHelpers";
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

function NumberRow({ label, value, setter, isCurrency }) {
    // Helper to format display value
    const displayValue = isCurrency && value !== '' && value !== null && value !== undefined
        ? `$${value}`
        : value;

    const handleChange = (e) => {
        let val = e.target.value;
        if (isCurrency) {
            // Allow only numbers and decimals, strip $
            val = val.replace(/[^0-9.]/g, '');
        }
        setter(val);
    };

    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">{label}</span>
            <input
                type={isCurrency ? "text" : "number"}
                value={displayValue}
                onChange={handleChange}
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

function QuotePanelContent({ parts = [], onRemovePart, customerData, printableNote, internalNote, insuranceData, includeInsurance, attachments = [], onClear, docMetadata, isSaved, isEditMode, onEditModeChange, onDocumentCreated }) {
    const navigate = useNavigate();
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? '-' : date.toLocaleString('sv-SE');
        } catch { return '-'; }
    };
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

    // Get Global Labor Rate from localStorage
    const globalLaborRate = useMemo(() => {
        const rate = localStorage.getItem('GlobalLaborRate');
        return rate ? parseFloat(rate) : 0; // Default to 0 if not set
    }, []);

    useEffect(() => {
        setItems((prevItems) => {
            // Deduplicate: Only keep manual items that are NOT in the incoming parts list
            const incomingIds = new Set(parts.map(p => p.id));
            const currentManualItems = prevItems.filter(it => it.isManual && !incomingIds.has(it.id));

            // Enrich parts with default description for Labor if missing
            const enrichedParts = parts.map(p => {
                if (p.type === 'Labor' && !p.description) {
                    return { ...p, description: `Labor ${p.labor || 0} hours` };
                }
                return p;
            });

            return [...enrichedParts, ...currentManualItems];
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
    const [manualDocType, setManualDocType] = useState("Quote"); // Default to Quote, no Auto

    const [taxRates, setTaxRates] = useState([]);

    useEffect(() => {
        const fetchTaxData = async () => {
            try {
                // If user profile has a tax rate, use it directly
                if (userProfile && userProfile.taxRate !== undefined && userProfile.taxRate !== null) {
                    setGlobalTaxRate(userProfile.taxRate);
                    return;
                }

                const [rates, defaultRate] = await Promise.all([
                    getActiveTaxRates().catch(() => []),
                    getDefaultTaxRate().catch(() => null)
                ]);
                const validRates = Array.isArray(rates) ? rates : [];
                setTaxRates(validRates);

                // Hierarchy: Profile -> Default -> First Active
                if (userProfile && userProfile.taxRate !== undefined && userProfile.taxRate !== null) {
                    setGlobalTaxRate(userProfile.taxRate);
                } else if (defaultRate && defaultRate.taxPercent) {
                    setGlobalTaxRate(defaultRate.taxPercent);
                } else if (validRates.length > 0) {
                    // Fallback to the first active rate if no default is explicitly set
                    setGlobalTaxRate(validRates[0].taxPercent);
                }
            } catch (err) {
                console.error("Failed to fetch tax rates", err);
            }
        };
        fetchTaxData();
    }, [userProfile]);

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


    const handlePartNoBlur = async (id, partNo) => {
        if (!partNo) return;
        try {
            const res = await fetch(`https://api.autopaneai.com/agp/v1/glass-info?nags_glass_id=${partNo}`);
            // If 404 or other error, just ignore or log
            if (!res.ok) return;

            const data = await res.json();
            if (data) {
                setItems(prev => prev.map(it => {
                    if (it.id === id) {
                        const { listPrice, netPrice, description, manufacturer } = extractGlassInfo(data, it.description);
                        return {
                            ...it,
                            description: description,
                            manufacturer: manufacturer,
                            listPrice: listPrice,
                            unitPrice: netPrice, // Use Net Price for calculation
                            amount: (Number(it.qty) || 0) * netPrice
                        };
                    }
                    return it;
                }));
            }
        } catch (error) {
            console.error("Error fetching glass info:", error);
        }
    };



    const subtotal = useMemo(() => items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0), [items]);
    const totalHours = useMemo(() =>
        items
            .filter(it => it.type === 'Labor')
            .reduce((sum, it) => sum + (Number(it.labor) || 0), 0),
        [items]
    );
    const totalTax = useMemo(() => {
        const taxableSubtotal = items
            .filter(it => it.type !== 'Labor')
            .reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
        return (taxableSubtotal * (Number(globalTaxRate) || 0)) / 100;
    }, [items, globalTaxRate]);
    const discountAmount = useMemo(() => {
        return (subtotal * (Number(discountPercent) || 0)) / 100;
    }, [subtotal, discountPercent]);
    const total = useMemo(() => Math.max(0, subtotal + totalTax - discountAmount), [subtotal, totalTax, discountAmount]);
    const numericPayment = Number(payment) || 0;
    const balance = useMemo(() => Math.max(0, total - numericPayment), [total, numericPayment]);

    let calculatedDocType = "Invoice";
    // Auto-calculation removed per request, strict manual selection
    const currentDocType = manualDocType;


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
            printableNote, // Passed from props
            insuranceData,
            includeInsurance
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
    const [saveLoading, setSaveLoading] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [pdfBlob, setPdfBlob] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [emailForm, setEmailForm] = useState({
        to: "",
        subject: "",
        body: ""
    });

    // Validated Modal Context
    const [modal, contextHolder] = Modal.useModal();

    // Validation helper function
    const validateDocumentData = () => {
        // Validation: Customer Data
        const hasCustomerIdentity = customerData && (
            (customerData.firstName && customerData.firstName.trim() !== "") ||
            (customerData.lastName && customerData.lastName.trim() !== "") ||
            (customerData.companyName && customerData.companyName.trim() !== "")
        );

        if (!hasCustomerIdentity) {
            modal.warning({
                title: 'Missing Customer',
                content: 'Please select or enter a customer before saving.',
                okText: 'OK',
            });
            return false;
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
            return false;
        }

        // Validation: Items
        const invalidItems = items.filter(it => !Number(it.amount) || Number(it.amount) === 0);
        if (invalidItems.length > 0) {
            modal.warning({
                title: 'Invalid Items',
                content: `Please enter a valid amount for: ${invalidItems.map(it => it.type === 'Labor' ? 'Labor' : (it.description || 'Item')).join(', ')}`,
                okText: 'OK',
            });
            return false;
        }

        return true;
    };

    // Handler 1: Save Document
    const handleSave = async () => {
        console.log("[QuotePanel] handleSave called with attachments:", attachments);

        if (!validateDocumentData()) return;

        setSaveLoading(true);
        try {
            // Build payload (same logic as before)
            const totalLaborAmount = items
                .filter(it => it.type === 'Labor')
                .reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

            const serviceDocumentItems = [];
            items.forEach(it => {
                if (it.type === 'Part') {
                    serviceDocumentItems.push({
                        itemType: 'part',
                        nagsGlassId: it.nagsId || "",
                        oemGlassId: it.oemId || "",
                        partDescription: it.description || "",
                        partPrice: Number(it.unitPrice) || 0,
                        quantity: Number(it.qty) || 1,
                        laborRate: 0,
                        laborHours: Number(it.labor) || 0
                    });
                } else if (it.type === 'Labor') {
                    const linkedPartId = it.id.replace('_LABOR', '');
                    const linkedPart = items.find(p => p.id === linkedPartId && p.type === 'Part');
                    if (linkedPart) {
                        const existingPart = serviceDocumentItems.find(sdi =>
                            sdi.nagsGlassId === linkedPart.nagsId && sdi.oemGlassId === linkedPart.oemId
                        );
                        if (existingPart) {
                            existingPart.laborRate = Number(it.unitPrice) || 0;
                            existingPart.laborHours = Number(it.labor) || 0;
                        }
                    }
                }
            });

            const manualItems = items.filter(it => (it.type === 'Labor' || it.type === 'Service') && !it.id.includes('_LABOR'));
            manualItems.forEach(manualIt => {
                serviceDocumentItems.push({
                    itemType: manualIt.type.toLowerCase(),
                    partDescription: manualIt.description,
                    partPrice: Number(manualIt.amount) || 0,
                    quantity: 1,
                    laborRate: 0,
                    laborHours: 0
                });
            });

            const customerWithVehicle = {
                organizationId: 0,
                customerType: "individual",
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
                vehicleYear: Number(customerData.vehicleYear) || 2020,
                vehicleMake: customerData.vehicleMake || "",
                vehicleModel: customerData.vehicleModel || "",
                vehicleStyle: customerData.vehicleStyle || "",
                bodyType: customerData.bodyType || "",
                licensePlateNumber: customerData.licensePlateNumber || "",
                vin: customerData.vin || "",
                vehicleNotes: ""
            };

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

            const combinedDescription = attachments.map(att =>
                `${att.file.name}: ${att.description || "No description"}`
            ).join('\n');

            const compositePayload = {
                customerWithVehicle: customerWithVehicle,
                serviceDocument: serviceDocument,
                insurance: includeInsurance ? insuranceData : null,
                attachmentDescription: combinedDescription
            };

            console.log("Sending Composite Payload:", compositePayload);

            const files = attachments.map(a => a.file);
            console.log("Files to upload:", files.length, files);

            let response;
            if (isSaved && docMetadata && docMetadata.documentNumber) {
                console.log("Updating Composite Document:", docMetadata.documentNumber);
                response = await updateCompositeServiceDocument(docMetadata.documentNumber, compositePayload, files);
                message.success("Service Document Updated Successfully!");

                // Navigate to open page after update
                setTimeout(() => {
                    navigate('/open');
                }, 1000);
            } else {
                console.log("Creating new document with", files.length, "files");
                response = await createCompositeServiceDocument(compositePayload, files);
                const createdDocNumber = response.serviceDocument?.documentNumber;

                if (createdDocNumber) {
                    message.success(`Service Document Created Successfully! Document #: ${createdDocNumber}`);

                    // Call callback to switch to attachment tab
                    if (onDocumentCreated) {
                        onDocumentCreated(createdDocNumber);
                    }
                } else {
                    message.success("Service Document Created Successfully!");
                }
            }

        } catch (err) {
            console.error(err);
            message.error("Save failed: " + err.message);
        } finally {
            setSaveLoading(false);
        }
    };

    // Handler 2: Preview Document
    const handlePreview = () => {
        if (!validateDocumentData()) return;

        setPreviewLoading(true);
        try {
            const doc = generatePdfDoc();
            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);

            // Open in new tab for preview
            window.open(url, '_blank');

            message.success('Preview opened in new tab');
        } catch (error) {
            console.error("Error in handlePreview:", error);
            modal.error({
                title: 'Preview Error',
                content: "Failed to generate preview: " + error.message,
            });
        } finally {
            setPreviewLoading(false);
        }
    };

    // Handler 3: Email Document
    const handleEmail = () => {
        if (!isSaved) {
            modal.warning({
                title: 'Document Not Saved',
                content: 'Please save the document before sending email.',
                okText: 'OK',
            });
            return;
        }

        if (!validateDocumentData()) return;

        try {
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
            console.error("Error in handleEmail:", error);
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

            // Send Email with PDF attachment
            if (pdfBlob) {
                const file = new File([pdfBlob], getFilename(), { type: "application/pdf" });
                const emailResponse = await sendEmail(emailForm.to, emailForm.subject, emailForm.body, file);

                if (emailResponse && emailResponse.status === "success") {
                    message.success("Email Sent Successfully!");
                } else {
                    message.warning("Email failed to send.");
                }
            } else {
                message.error("No PDF available to send.");
            }

            handleCloseModal();
        } catch (err) {
            console.error(err);
            message.error("Email failed: " + err.message);
        } finally {
            setEmailLoading(false);
        }
    };






    return (
        <div>
            {contextHolder}
            {/* Header / Metadata */}
            {/* Header / Metadata removed from here and moved to bottom */}
            {!isSaved && (
                <div className="flex items-center justify-between max-w-7xl mb-2">
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
                        Quote Details
                    </h3>
                </div>
            )}

            {/* Line Items Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-[180px] mb-2 border border-slate-300 bg-white shadow-sm rounded-sm">
                <table className="min-w-full divide-y divide-slate-300">
                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                        <tr className="text-left text-sm font-semibold text-slate-800 tracking-tight">
                            <th className="px-1 py-0.5 w-[120px] border-r border-slate-300 bg-slate-50">Part</th>
                            <th className="px-1 py-0.5 border-r border-slate-300 bg-slate-50">Description</th>
                            <th className="px-1 py-0.5 w-[90px] border-r border-slate-300 bg-slate-50">Manufacturer</th>
                            <th className="px-1 py-0.5 text-right w-[60px] border-r border-slate-300 bg-slate-50">Quantity</th>
                            <th className="px-1 py-0.5 text-right w-[90px] border-r border-slate-300 bg-slate-50">List</th>
                            <th className="px-1 py-0.5 text-right w-[90px] border-r border-slate-300 bg-slate-50">Amount</th>
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
                                        onBlur={(e) => it.type !== 'Labor' && handlePartNoBlur(it.id, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && it.type !== 'Labor') {
                                                handlePartNoBlur(it.id, e.currentTarget.value);
                                                e.currentTarget.blur();
                                            }
                                        }}
                                        className={`w-full h-5 rounded px-1 text-sm outline-none focus:bg-white bg-transparent ${it.type === 'Labor' ? 'text-slate-500' : 'text-slate-900 font-medium'}`}
                                        placeholder="Part No"
                                        disabled={it.type === 'Labor'}
                                    />
                                </td>
                                <td className="px-1 py-0.5 border-r border-slate-300">
                                    <input
                                        value={it.description || ''}
                                        onChange={(e) => updateItem(it.id, "description", e.target.value)}
                                        className="w-full h-5 rounded px-1 text-sm outline-none focus:bg-white bg-transparent text-slate-700"
                                    />
                                </td>
                                <td className="px-1 py-0.5 border-r border-slate-300">
                                    <input
                                        value={it.manufacturer}
                                        onChange={(e) => updateItem(it.id, "manufacturer", e.target.value)}
                                        className={`w-full h-5 rounded px-1 text-sm outline-none focus:bg-white bg-transparent ${(!it.isManual && it.type === 'Labor') ? 'text-slate-400' : 'text-slate-600'}`}
                                        disabled={!it.isManual && it.type === 'Labor'}
                                    />
                                </td>
                                <td className="px-1 py-0.5 text-right border-r border-slate-300">
                                    <input
                                        type="number"
                                        value={it.qty}
                                        onChange={(e) => updateItem(it.id, "qty", e.target.value)}
                                        className={`w-full h-5 rounded px-1 text-sm text-right outline-none focus:bg-white bg-transparent ${(!it.isManual && it.type === 'Labor') ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700'}`}
                                        disabled={!it.isManual && it.type === 'Labor'}
                                    />
                                </td>
                                <td className="px-1 py-0.5 text-right border-r border-slate-300">
                                    <input
                                        type="text"
                                        value={it.listPrice ? `$${it.listPrice}` : ''}
                                        onChange={(e) => updateItem(it.id, "listPrice", e.target.value.replace(/[^0-9.]/g, ''))}
                                        className={`w-full h-5 rounded px-1 text-sm text-right outline-none focus:bg-white bg-transparent ${(!it.isManual && it.type === 'Labor') ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700'}`}
                                        disabled={!it.isManual && it.type === 'Labor'}
                                        placeholder="$0.00"
                                    />
                                </td>
                                <td className="px-1 py-0.5 text-right font-medium text-sm border-r border-slate-300">
                                    <div className="flex flex-col items-end gap-0 h-full justify-center w-full">
                                        <input
                                            type="text"
                                            value={it.amount ? `$${it.amount}` : ''}
                                            onChange={(e) => updateItem(it.id, "amount", e.target.value.replace(/[^0-9.]/g, ''))}
                                            className={`w-full rounded px-1 py-0 text-right text-sm outline-none h-5 focus:bg-white bg-transparent ${(!Number(it.amount) || Number(it.amount) === 0) ? 'text-red-600 font-bold bg-red-50' : 'text-slate-900 bg-sky-50'}`}
                                            placeholder="$0.00"
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
                            { key: 'Part', label: <span className="text-xs">Add Part</span> },
                            { key: 'Labor', label: <span className="text-xs">Add Labor</span> },
                            { key: 'Service', label: <span className="text-xs">Add Service</span> }
                        ],
                        onClick: (e) => handleAddRow(e.key)
                    }}
                >
                    <button className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-medium transition-colors">
                        Add <DownOutlined className="text-[9px]" />
                    </button>
                </Dropdown>
            </div>

            {/* Totals & Actions (Notes removed) */}
            {/* Totals & Actions */}
            {/* Totals & Actions */}
            <div className="flex justify-end items-end mt-4 gap-6">
                {/* Left side Metadata */}
                <div className="flex flex-col gap-4 min-w-[200px]">
                    {docMetadata && (
                        <>
                            {/* Document # */}
                            <div className="flex flex-col">
                                <span className="text-[10px] text-sky-700 font-bold uppercase tracking-wider mb-0.5">Document #</span>
                                <span className="font-mono text-lg font-bold text-slate-800">{docMetadata.documentNumber}</span>
                            </div>

                            {/* Created / Updated Grid */}
                            <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                                <span className="uppercase text-[10px] font-bold text-slate-400 tracking-wider self-center">Created</span>
                                <span className="font-medium text-slate-700">{formatDate(docMetadata.createdAt)}</span>

                                <span className="uppercase text-[10px] font-bold text-slate-400 tracking-wider self-center">Updated</span>
                                <span className="font-medium text-slate-700">{formatDate(docMetadata.updatedAt)}</span>
                            </div>

                            {/* Edit Button */}
                            {onEditModeChange && (
                                <div className="mt-1">
                                    <button
                                        onClick={() => onEditModeChange(!isEditMode)}
                                        className={`w-full py-2 rounded-md text-sm font-semibold transition-colors shadow-sm ${isEditMode
                                            ? 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                                            : 'bg-[#5b4dfe] text-white hover:bg-[#4b3dce]'
                                            }`}
                                    >
                                        {isEditMode ? "Cancel Edit" : "Edit Document"}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="bg-slate-50 border border-slate-200 p-2 space-y-1 w-full max-w-sm rounded-lg shadow-sm">
                    <Row label="Subtotal" value={currency(subtotal)} />

                    {/* Tax Rate Selection */}
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Tax</span>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-xs mr-2">({globalTaxRate}%)</span>
                            <span className="text-slate-900 w-16 text-right">{currency(totalTax)}</span>
                        </div>
                    </div>

                    <NumberRow label="Discount %" value={discountPercent} setter={setDiscountPercent} />
                    {Number(discountPercent) > 0 && <Row label="Discount" value={`- ${currency(discountAmount)}`} />}

                    <div className="my-1 border-t border-slate-200"></div>

                    <Row label="Total" value={currency(total)} bold />
                    <NumberRow label="Paid" value={payment} setter={setPayment} isCurrency />

                    <div className="my-1 border-t border-slate-200"></div>

                    <Row label="Balance" value={currency(balance)} bold />

                    <div className="pt-1 flex flex-col gap-2 bg-white rounded-lg p-1">
                        {/* Document Type Selector */}
                        <select
                            value={manualDocType}
                            onChange={(e) => setManualDocType(e.target.value)}
                            className="appearance-none outline-none cursor-pointer inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium border border-[#00A8E4]/30 bg-[#00A8E4]/5 text-[#00A8E4]"
                        >
                            <option value="Quote">Quote</option>
                            <option value="Work Order">Work Order</option>
                            <option value="Invoice">Invoice</option>
                        </select>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                disabled={saveLoading}
                                className="flex-1 px-4 py-1.5 rounded bg-[#7E5CFE] text-white text-xs font-semibold shadow hover:bg-[#6b4ce6] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saveLoading ? 'Saving...' : (isSaved ? `Update ${currentDocType}` : `Save ${currentDocType}`)}
                            </button>

                            {/* Preview Button */}
                            <button
                                onClick={handlePreview}
                                disabled={previewLoading}
                                className="px-4 py-1.5 rounded bg-[#00A8E4] text-white text-xs font-semibold shadow hover:bg-[#0096cc] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Preview PDF"
                            >
                                {previewLoading ? 'Loading...' : 'Preview'}
                            </button>

                            {/* Email Button */}
                            <button
                                onClick={handleEmail}
                                disabled={!isSaved || emailLoading}
                                className="px-4 py-1.5 rounded bg-[#00A8E4] text-white text-xs font-semibold shadow hover:bg-[#0096cc] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title={!isSaved ? "Save document first" : "Send via email"}
                            >
                                {emailLoading ? 'Sending...' : 'Email'}
                            </button>
                        </div>
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
