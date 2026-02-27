import { useState, useMemo } from "react";
import { Modal, message, notification } from "antd";
import { createCompositeServiceDocument } from "../../../api/createCompositeServiceDocument";
import { updateCompositeServiceDocument } from "../../../api/updateCompositeServiceDocument";
import { updateAiContactFormStatus } from "../../../api/aiContactForm";
import { getValidToken } from "../../../api/getValidToken";
import { getCustomers } from "../../../api/getCustomers";
import { sendEmail } from "../../../api/sendEmail";

/**
 * Hook that encapsulates all quote document actions:
 * validation, save (create/update), preview, email, PDF generation.
 *
 * Returns action handlers and loading states.
 */
export function useQuoteActions({
    items,
    setItems,
    customerData,
    userProfile,
    specialInstructions,
    subtotal,
    totalTax,
    totalHours,
    laborCostDisplay,
    total,
    balance,
    currentDocType,
    manualDocType,
    setManualDocType,
    printableNote,
    internalNote,
    insuranceData,
    includeInsurance,
    attachments,
    docMetadata,
    isSaved,
    onClear,
    onDocumentCreated,
    aiContactFormId,
    paymentData,
    existingPayments,
    schedulingData,
    globalTaxRate,
    taxSettings,
    markAsSaved, // from useQuoteDirtyState
}) {
    const token = getValidToken();

    // --- Loading states ---
    const [saveLoading, setSaveLoading] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);

    // --- Email modal state ---
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [pdfBlob, setPdfBlob] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [emailForm, setEmailForm] = useState({
        to: "",
        subject: "",
        body: ""
    });

    // Validated Modal Context
    const [modal, contextHolder] = Modal.useModal();

    // --- PDF Generation ---
    const generatePdfDoc = async (options = {}) => {
        const { generateServiceDocumentPDF } = await import("../../../utils/serviceDocumentPdfGenerator");
        const {
            overrideDocumentNumber = null,
            overridePayments = null,
            overrideDocType = null
        } = typeof options === 'string' ? { overrideDocumentNumber: options } : options;

        let pdfPayments;
        if (overridePayments !== null) {
            pdfPayments = overridePayments;
        } else {
            pdfPayments = [...(existingPayments || [])];
            if (paymentData && Number(paymentData.amount) > 0) {
                pdfPayments.push(paymentData);
            }
        }

        const effectiveDocType = overrideDocType || currentDocType;

        return generateServiceDocumentPDF({
            items,
            customerData,
            userProfile,
            subtotal,
            totalTax,
            totalHours,
            laborAmount: laborCostDisplay,
            total,
            balance,
            docType: effectiveDocType,
            printableNote,
            specialInstructions,
            insuranceData,
            includeInsurance,
            documentNumber: overrideDocumentNumber || docMetadata?.documentNumber || "",
            payments: pdfPayments
        });
    };

    const getFilename = async () => {
        const { generatePDFFilename } = await import("../../../utils/serviceDocumentPdfGenerator");
        return generatePDFFilename(currentDocType, customerData);
    };

    const downloadPdf = async () => {
        const { downloadPDF } = await import("../../../utils/serviceDocumentPdfGenerator");
        const doc = await generatePdfDoc();
        const filename = await getFilename();
        downloadPDF(doc, filename);
    };

    // --- Validation ---
    const validateDocumentData = () => {
        const hasCustomerIdentity = customerData && (
            customerData.customerId ||
            customerData.organizationId ||
            (customerData.firstName && customerData.firstName.trim() !== "") ||
            (customerData.lastName && customerData.lastName.trim() !== "") ||
            (customerData.companyName && customerData.companyName.trim() !== "") ||
            (customerData.organizationName && customerData.organizationName.trim() !== "")
        );

        if (!hasCustomerIdentity) {
            modal.warning({
                title: 'Missing Customer',
                content: 'Please select or enter a customer before saving.',
                okText: 'OK',
            });
            return false;
        }

        const phone = customerData.phone || "";
        const hasPhone = phone.trim().length > 0;

        if (!hasPhone) {
            modal.warning({
                title: 'Missing Phone Number',
                content: 'Phone number is mandatory. Please provide a phone number for the customer or organization before saving.',
                okText: 'OK',
            });
            return false;
        }

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

        return true;
    };

    // --- Internal Save ---
    const performSave = async () => {
        if (!validateDocumentData()) return { success: false };

        setSaveLoading(true);
        try {
            const totalLaborAmount = items
                .filter(it => it.type === 'Labor')
                .reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

            const mergedLaborIds = new Set();
            const serviceDocumentItems = [];

            items.forEach(it => {
                if (it.type === 'Part') {
                    const associatedKit = items.find(k => k.type === 'Kit' && k.parentPartId === it.id);

                    serviceDocumentItems.push({
                        partId: it.originalPartId || null,
                        itemType: 'PART',
                        nagsGlassId: it.nagsId || "",
                        prefixCd: it.prefixCd || null,
                        posCd: it.posCd || null,
                        sideCd: it.sideCd || null,
                        partDescription: it.description || "",
                        partPrice: Number(it.amount) || 0,
                        listPrice: Number(it.listPrice) || 0,
                        quantity: Number(it.qty) || 1,
                        laborRate: 0,
                        laborHours: Number(it.labor) || 0,
                        kitPrice: associatedKit ? (Number(associatedKit.amount) || 0) : 0,
                        kitDescription: associatedKit ? (associatedKit.description || "") : "",
                        kitQuantity: associatedKit ? (Number(associatedKit.qty) || 0) : 0,
                        kitId: associatedKit ? (associatedKit.nagsId || null) : null
                    });
                } else if (it.type === 'Kit') {
                    // Skip - merged into Part
                } else if (it.type === 'Labor') {
                    const linkedPartId = it.id.replace('_LABOR', '');
                    const linkedPart = items.find(p => p.id === linkedPartId && p.type === 'Part');
                    if (linkedPart) {
                        const existingPart = serviceDocumentItems.find(sdi =>
                            sdi.nagsGlassId === linkedPart.nagsId && sdi.itemType === 'PART'
                        );
                        if (existingPart) {
                            existingPart.laborRate = Number(it.unitPrice) || 0;
                            existingPart.laborHours = Number(it.labor) || 0;
                            mergedLaborIds.add(it.id);
                        }
                    }
                }
            });

            // Handle independent items
            const manualItems = items.filter(it =>
                (it.type === 'Labor' || it.type === 'Service' || it.type === 'ADAS') &&
                !mergedLaborIds.has(it.id)
            );
            manualItems.forEach(manualIt => {
                const isLabor = manualIt.type === 'Labor';
                serviceDocumentItems.push({
                    partId: manualIt.originalPartId || null,
                    itemType: manualIt.type === 'Service' ? 'SERVICE' : (manualIt.type === 'ADAS' ? 'ADAS' : (isLabor ? 'LABOR' : 'PART')),
                    prefixCd: manualIt.prefixCd || null,
                    posCd: manualIt.posCd || null,
                    sideCd: manualIt.sideCd || null,
                    partDescription: manualIt.description,
                    partPrice: Number(manualIt.amount) || 0,
                    quantity: 1,
                    laborRate: isLabor ? (Number(manualIt.unitPrice) || 0) : 0,
                    laborHours: isLabor ? (Number(manualIt.labor) || 0) : 0
                });
            });

            // Customer payload
            let customerPayload = null;
            let organizationPayload = null;
            const isIndividualClient = customerData.customerType === "INDIVIDUAL";

            if (isIndividualClient) {
                let resolvedCustomerId = customerData.customerId || null;
                if (!resolvedCustomerId && (customerData.email || customerData.phone)) {
                    try {
                        const token = await getValidToken();
                        const customers = await getCustomers(token);
                        const matchingCustomer = customers.find(c =>
                            (c.email && customerData.email && c.email.toLowerCase() === customerData.email.toLowerCase()) ||
                            (c.phone && customerData.phone && c.phone === customerData.phone)
                        );
                        if (matchingCustomer) {
                            resolvedCustomerId = matchingCustomer.customerId;
                        }
                    } catch (err) {
                        console.warn("Failed to check existing customers:", err);
                    }
                }

                if (resolvedCustomerId) {
                    customerPayload = { customerId: resolvedCustomerId };
                } else if (customerData.firstName || customerData.lastName) {
                    customerPayload = {
                        firstName: customerData.firstName || "",
                        lastName: customerData.lastName || "",
                        email: customerData.email || "",
                        phone: customerData.phone || "",
                        alternatePhone: customerData.alternatePhone || "",
                        addressLine1: customerData.addressLine1 || "",
                        addressLine2: customerData.addressLine2 || "",
                        city: customerData.city || "",
                        state: customerData.state || "",
                        postalCode: customerData.postalCode || "",
                        country: customerData.country || "USA",
                        preferredContactMethod: customerData.preferredContactMethod || "email",
                        customerType: "INDIVIDUAL",
                        taxExempt: false,
                        notes: customerData.notes || ""
                    };
                }
            }

            // Organization payload
            let rootOrganizationId = null;
            let rootOrganizationContactId = null;

            if (customerData.organizationId && !customerData.newContactDetails) {
                rootOrganizationId = customerData.organizationId;
                rootOrganizationContactId = customerData.organizationContactId || null;
                organizationPayload = null;
            } else if (customerData.organizationId && customerData.newContactDetails && customerData.organizationContactId) {
                organizationPayload = {
                    organizationId: customerData.organizationId,
                    contacts: [{
                        id: customerData.organizationContactId,
                        name: customerData.newContactDetails.name || "",
                        contactName: customerData.newContactDetails.name || ""
                    }]
                };
            } else if (customerData.newOrganizationDetails && customerData.newOrganizationDetails.companyName) {
                const contactId = customerData.organizationContactId || crypto.randomUUID();
                organizationPayload = {
                    ...customerData.newOrganizationDetails,
                    phone: customerData.newOrganizationDetails.phone?.replace(/[^\d]/g, '') || "",
                    alternatePhone: customerData.newOrganizationDetails.alternatePhone?.replace(/[^\d]/g, '') || "",
                    contacts: [{
                        id: contactId,
                        contactName: customerData.newOrganizationDetails.contactName || "",
                        name: customerData.newOrganizationDetails.contactName || ""
                    }]
                };
                organizationPayload.organizationContactId = contactId;
            } else if (customerData.organizationName) {
                organizationPayload = {
                    companyName: customerData.organizationName,
                    phone: customerData.phone || "",
                    addressLine1: customerData.addressLine1 || "",
                    city: customerData.city || "",
                    state: customerData.state || "",
                    postalCode: customerData.postalCode || ""
                };
            }

            const vehiclePayload = {
                vehicleYear: Number(customerData.vehicleYear) || 2024,
                vehicleMake: customerData.vehicleMake || "",
                vehicleModel: customerData.vehicleModel || "",
                bodyType: customerData.bodyType || "",
                vin: customerData.vin || "",
                licensePlateNumber: customerData.licensePlateNumber || "",
                notes: customerData.vehicleNotes || "",
                makeId: customerData.makeId || null,
                modelId: customerData.modelId || null,
                bodyStyleId: customerData.bodyStyleId || null,
                masterVehId: customerData.vehId || null,
                vechModifierId: customerData.vehModifierId || null
            };

            const attachmentMetadata = (attachments || []).map(att => ({
                description: att.description || att.file.name,
                category: "GENERAL"
            }));

            const effectiveServiceAddress = (schedulingData?.serviceLocation === 'MOBILE' || schedulingData?.serviceLocation === 'CUSTOMER_LOCATION')
                ? (schedulingData?.serviceAddress || '')
                : `${customerData.addressLine1 || ''}, ${customerData.city || ''}, ${customerData.state || ''} ${customerData.postalCode || ''}`;

            const rootClaimNumber = (includeInsurance && insuranceData?.claimNumber) ? insuranceData.claimNumber : null;

            const toISODate = (val) => {
                if (!val) return null;
                if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
                    const [m, d, y] = val.split('/');
                    return `${y}-${m}-${d}`;
                }
                if (val.includes('T')) return val.split('T')[0];
                return val;
            };

            const compositePayload = {
                documentType: currentDocType.replace(" ", "_").toUpperCase(),
                documentDate: new Date().toISOString(),
                insuranceClaimNumber: rootClaimNumber,
                scheduledDate: schedulingData?.scheduledDate || null,
                estimatedCompletion: schedulingData?.estimatedCompletion || null,
                dueDate: toISODate(schedulingData?.dueDate),
                paymentTerms: schedulingData?.paymentTerms || "Due upon receipt",
                technicianId: schedulingData?.assignedEmployeeId || schedulingData?.employeeId || null,
                employeeId: schedulingData?.assignedEmployeeId || schedulingData?.employeeId || null,
                notes: printableNote,
                internalNotes: internalNote,
                serviceLocation: schedulingData?.serviceLocation || "IN_SHOP",
                serviceAddress: effectiveServiceAddress,
                taxRate: customerData.isTaxExempt ? 0 : (Number(globalTaxRate) || 0),
                discountAmount: 0.00,
                organizationId: rootOrganizationId,
                organizationContactId: rootOrganizationContactId,
                customer: customerPayload,
                organization: organizationPayload,
                vehicle: vehiclePayload,
                insurance: includeInsurance ? {
                    ...insuranceData,
                    incidentDate: toISODate(insuranceData?.incidentDate)
                } : null,
                items: serviceDocumentItems,
                attachments: attachmentMetadata,
                payments: [
                    ...(existingPayments || []).map(p => ({
                        amount: Number(p.amount) || 0,
                        paymentMethod: p.paymentMethod || "OTHER",
                        transactionReference: p.transactionReference || "",
                        notes: p.notes || "",
                        paymentId: p.paymentId || p.id
                    })),
                    ...(paymentData && paymentData.amount > 0 ? [{
                        amount: Number(paymentData.amount) || 0,
                        paymentMethod: paymentData.paymentMethod || "CREDIT_CARD",
                        transactionReference: paymentData.transactionReference || "",
                        notes: paymentData.notes || "",
                        paymentId: null
                    }] : [])
                ]
            };

            if (compositePayload.payments) {
                compositePayload.payments.forEach(p => {
                    if (p.paymentId === undefined) {
                        console.warn("Payment ID key missing in payload, forcing null");
                        p.paymentId = null;
                    }
                });
            }

            console.log("Composite Payload:", compositePayload);

            const files = (attachments || []).map(a => a.file);

            let createdDocNumber;
            let response;

            if (isSaved && docMetadata?.documentNumber) {
                response = await updateCompositeServiceDocument(docMetadata.documentNumber, compositePayload);
                createdDocNumber = response?.documentNumber || response?.serviceDocument?.documentNumber || docMetadata.documentNumber;
                notification.success({
                    message: "Success",
                    description: `Document save with the ${createdDocNumber}`,
                    placement: "topRight"
                });
            } else {
                response = await createCompositeServiceDocument(compositePayload, files);
                createdDocNumber = response?.documentNumber || response?.serviceDocument?.documentNumber;
                notification.success({
                    message: "Success",
                    description: createdDocNumber
                        ? `Document save with the ${createdDocNumber}`
                        : "Document save successfully!",
                    placement: "topRight"
                });
            }

            if (aiContactFormId) {
                try {
                    await updateAiContactFormStatus(token, aiContactFormId, 'COMPLETED');
                } catch (e) {
                    console.error("Failed to update AI Contact Form status to COMPLETED", e);
                }
            }

            return { success: true, documentNumber: createdDocNumber, responseData: response };
        } catch (err) {
            console.error(err);
            let errorMessage = err.message || "An unexpected error occurred.";
            if (err.response && err.response.data) {
                const backendError = err.response.data;
                if (backendError.message) errorMessage = backendError.message;
                else if (backendError.error) errorMessage = backendError.error;
            }
            modal.error({
                title: 'Save Failed',
                content: errorMessage,
            });
            return { success: false };
        } finally {
            setSaveLoading(false);
        }
    };

    // --- Helper: find items with $0.00 price ---
    const getZeroPriceItems = () => {
        return items.filter(item => {
            const types = ['Labor', 'Kit', 'Service'];
            if (!types.includes(item.type)) return false;
            return (Number(item.amount) || 0) === 0;
        });
    };

    // --- Handler 2: Preview ---
    const handlePreview = async () => {
        const { success, documentNumber, responseData } = await performSave();
        if (!success) return;

        setPreviewLoading(true);
        try {
            const backendPayments = responseData?.payments || responseData?.serviceDocument?.payments || null;
            const backendDocType = responseData?.documentType || responseData?.serviceDocument?.documentType || null;
            const formattedDocType = backendDocType
                ? backendDocType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
                : null;

            const doc = await generatePdfDoc({
                overrideDocumentNumber: documentNumber,
                overridePayments: backendPayments,
                overrideDocType: formattedDocType
            });
            const blob = doc.output('blob');

            const { generatePDFFilename } = await import("../../../utils/serviceDocumentPdfGenerator");
            const filename = generatePDFFilename(formattedDocType || currentDocType, customerData);
            const file = new File([blob], filename, { type: 'application/pdf' });
            const url = URL.createObjectURL(file);
            window.open(url, '_blank');
            message.success(`Preview opened: ${filename}`);

            if (onClear) onClear(true);
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

    // --- Handler 3: Email ---
    const handleEmail = async () => {
        const { success, documentNumber, responseData } = await performSave();
        if (!success) return;
        if (!validateDocumentData()) return;

        try {
            const backendPayments = responseData?.payments || responseData?.serviceDocument?.payments || null;
            const backendDocType = responseData?.documentType || responseData?.serviceDocument?.documentType || null;
            const formattedDocType = backendDocType
                ? backendDocType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
                : null;
            const effectiveDocType = formattedDocType || currentDocType;

            const doc = await generatePdfDoc({
                overrideDocumentNumber: documentNumber,
                overridePayments: backendPayments,
                overrideDocType: formattedDocType
            });
            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);
            setPdfBlob(blob);
            setPreviewUrl(url);
            setShowEmailModal(true);

            const subject = `Your Auto Glass ${effectiveDocType} - ${customerData.vehicleYear || ''} ${customerData.vehicleMake || ''} ${customerData.vehicleModel || ''}`;
            const shopName = userProfile?.businessName || "Auto Glass Pro Team";
            const shopPhone = userProfile?.phone ? ` at ${userProfile.phone}` : "";

            const body = `Hello ${customerData.firstName || 'Customer'} ${customerData.lastName || ''},

Please find attached the ${effectiveDocType.toLowerCase()} for your ${customerData.vehicleYear || ''} ${customerData.vehicleMake || ''} ${customerData.vehicleModel || ''}.

If you have any questions, please don't hesitate to contact us${shopPhone}.

Best regards,
${shopName}`;

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

            if (pdfBlob) {
                const filename = await getFilename();
                const file = new File([pdfBlob], filename, { type: "application/pdf" });
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
            if (onClear) onClear(true);
        } catch (err) {
            console.error(err);
            message.error("Email failed: " + err.message);
        } finally {
            setEmailLoading(false);
        }
    };

    return {
        // Core save action (no UI confirmation — caller handles that)
        performSave,
        getZeroPriceItems,

        // Action handlers
        handlePreview,
        handleEmail,
        handleCloseModal,
        handleConfirmAndSend,
        downloadPdf,

        // Loading states
        saveLoading,
        previewLoading,
        emailLoading,

        // Email modal state
        showEmailModal,
        emailForm,
        setEmailForm,
        previewUrl,
        pdfBlob,

        // Modal context (must be rendered in JSX)
        contextHolder,
        modal,
    };
}
