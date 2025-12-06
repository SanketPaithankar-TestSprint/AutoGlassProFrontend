import React, { useMemo, useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Modal, Input, Button, message } from "antd";
import { createServiceDocument } from "../../api/createServiceDocument";
import { sendEmail } from "../../api/sendEmail";

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
});

export default function QuotePanel({ parts = [], onRemovePart, customerData }) {
    const [items, setItems] = useState(parts.length ? parts : [newItem()]);

    useEffect(() => {
        setItems((prevItems) => {
            const currentMap = new Map(prevItems.map((i) => [i.id, i]));
            const newItems = parts.map((p) => {
                if (currentMap.has(p.id)) {
                    return currentMap.get(p.id);
                }
                return p;
            });
            return newItems.length > 0 ? newItems : (parts.length > 0 ? newItems : []);
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

    // Labor cost is now derived from the Total Labor line item in the table
    const laborItem = items.find(it => it.id === 'TOTAL_LABOR' || it.type === 'Labor');
    const laborCost = laborItem ? (Number(laborItem.amount) || 0) : 0;

    const setLaborCost = (val) => {
        if (laborItem) {
            updateItem(laborItem.id, 'amount', val);
        }
    };

    const [globalTaxRate, setGlobalTaxRate] = useState(0);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [payment, setPayment] = useState(0);

    const updateItem = (id, key, value) => {
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [key]: value } : it)));
    };

    const subtotal = useMemo(() => items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0), [items]);
    const totalHours = useMemo(() => items.reduce((sum, it) => sum + (Number(it.labor) || 0), 0), [items]);
    const totalTax = useMemo(() => (subtotal * (Number(globalTaxRate) || 0)) / 100, [subtotal, globalTaxRate]);
    const discountAmount = useMemo(() => {
        return (subtotal * (Number(discountPercent) || 0)) / 100;
    }, [subtotal, discountPercent]);
    // Labor is now part of subtotal, so don't add it again
    const total = useMemo(() => Math.max(0, subtotal + totalTax - discountAmount), [subtotal, totalTax, discountAmount]);
    const numericPayment = Number(payment) || 0;
    const balance = useMemo(() => Math.max(0, total - numericPayment), [total, numericPayment]);

    let docType = "Invoice";
    if (numericPayment <= 0) docType = "Quote";
    else if (numericPayment < total) docType = "Work Order";

    const generatePdfDoc = () => {
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const left = 40;
        const lineGap = 18;
        doc.setFontSize(18);
        doc.text(docType.toUpperCase(), left, 40);
        doc.setFontSize(10);
        const now = new Date();
        doc.text(`Date: ${now.toLocaleDateString()}`, left, 60);

        // Add Customer Info
        if (customerData) {
            doc.setFontSize(10);
            doc.text("Customer:", left, 80);
            doc.setFont(undefined, "bold");
            doc.text(`${customerData.firstName} ${customerData.lastName}`, left + 60, 80);
            doc.setFont(undefined, "normal");
            doc.text(`${customerData.phone} | ${customerData.email}`, left + 60, 92);
            doc.text(`${customerData.addressLine1}, ${customerData.city}, ${customerData.state} ${customerData.postalCode}`, left + 60, 104);

            doc.text("Vehicle:", left, 124);
            doc.setFont(undefined, "bold");
            doc.text(`${customerData.vehicleYear} ${customerData.vehicleMake} ${customerData.vehicleModel}`, left + 60, 124);
            doc.setFont(undefined, "normal");
            doc.text(`VIN: ${customerData.vin || "N/A"}`, left + 60, 136);
        }

        let y = customerData ? 160 : 90;
        doc.setFontSize(12);
        doc.text("Items", left, y);
        autoTable(doc, {
            startY: y + 10,
            head: [["Type", "NAGS ID", "OEM ID", "Labor (Hrs)", "Description", "Manufacturer", "Qty", "List Price", "Amount"]],
            body: items.map((it) => [
                it.type || "Part",
                it.nagsId || "-",
                it.oemId || "-",
                it.labor || "-",
                it.description || "-",
                it.manufacturer || "-",
                String(Number(it.qty) || 0),
                currency(Number(it.unitPrice) || 0),
                currency(Number(it.amount) || 0),
            ]),
            styles: { fontSize: 8, cellPadding: 4 },
            headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255] },
            theme: "striped",
            columnStyles: { 5: { halign: "right" }, 6: { halign: "right" }, 7: { halign: "right" } },
            margin: { left },
        });
        const afterTableY = doc.lastAutoTable.finalY + 10;
        const totalsLeft = 340;
        let yCount = afterTableY;
        const row = (label, value, bold = false) => {
            if (bold) doc.setFont(undefined, "bold");
            else doc.setFont(undefined, "normal");
            yCount += lineGap;
            doc.text(label, totalsLeft, yCount);
            doc.text(value, totalsLeft + 160, yCount, { align: "right" });
        };
        doc.setFontSize(11);
        row("Subtotal:", currency(subtotal));
        if (Number(laborCost)) row("Labor Cost:", currency(Number(laborCost)));
        if (Number(globalTaxRate)) row(`Tax (${globalTaxRate}%):`, currency(totalTax));
        else row("Tax:", currency(totalTax));
        if (Number(discountPercent)) row(`Discount (${discountPercent}%):`, `- ${currency(discountAmount)}`);
        row("Total:", currency(total), true);
        row("Payment Received:", currency(numericPayment));
        row("Balance Due:", currency(balance), true);
        if (printableNote.trim()) {
            doc.setFontSize(10);
            doc.setFont(undefined, "italic");
            doc.text("Note:", left, yCount + 40);
            doc.setFont(undefined, "normal");
            doc.text(printableNote, left, yCount + 58, { maxWidth: 480 });
            yCount += 30;
        }
        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        doc.text("Thank you for your business!", left, yCount + 40);
        return doc;
    };

    const getFilename = () => {
        const now = new Date();
        let filename = `${docType.toLowerCase()}_${now.getTime()}.pdf`;
        if (customerData) {
            const name = `${customerData.firstName} ${customerData.lastName}`.trim();
            const car = `${customerData.vehicleYear} ${customerData.vehicleMake} ${customerData.vehicleModel}`.trim();
            if (name || car) {
                filename = `${name} - ${car} - ${docType}.pdf`.replace(/[\/\\?%*:|"<>]/g, '-');
            }
        }
        return filename;
    };

    const downloadPdf = () => {
        const doc = generatePdfDoc();
        doc.save(getFilename());
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

            // 1. Create Backend Document
            const payload = {
                documentType: docType.toLowerCase().replace(" ", "") === "workorder" ? "invoice" : docType.toLowerCase(),
                customerId: customerData.customerId,
                vehicleId: customerData.vehicleId,
                employeeId: 0,
                serviceLocation: "mobile",
                serviceAddress: `${customerData.addressLine1}, ${customerData.city}, ${customerData.state} ${customerData.postalCode}`,
                documentDate: new Date().toISOString(),
                scheduledDate: new Date().toISOString(),
                estimatedCompletion: new Date().toISOString(),
                dueDate: new Date().toISOString().split('T')[0],
                paymentTerms: "Due upon receipt",
                notes: printableNote,
                termsConditions: "Warranty valid for 12 months on workmanship.",
                taxRate: Number(globalTaxRate) || 0,
                discountAmount: discountAmount,
                items: items
                    // Filter out Labor items
                    .filter(it => it.type !== 'Labor' && it.id !== 'TOTAL_LABOR')
                    .map((it, index) => {
                        const partItems = items.filter(i => i.type !== 'Labor' && i.id !== 'TOTAL_LABOR');
                        const totalHoursFromParts = partItems.reduce((sum, x) => sum + (Number(x.labor) || 0), 0);
                        let itemLaborAmount = 0;
                        if (laborCost > 0) {
                            if (totalHoursFromParts > 0) {
                                const hours = Number(it.labor) || 0;
                                itemLaborAmount = laborCost * (hours / totalHoursFromParts);
                            } else if (index === 0) {
                                itemLaborAmount = laborCost;
                            }
                        }
                        return {
                            prefixCd: it.prefixCd || "",
                            posCd: it.posCd || "",
                            sideCd: it.sideCd || "",
                            nagsGlassId: it.nagsId || "MISC",
                            partDescription: it.description || "",
                            partPrice: Number(it.unitPrice) || 0,
                            laborAmount: Number(itemLaborAmount.toFixed(2)),
                            quantity: Number(it.qty) || 1
                        };
                    })
            };

            await createServiceDocument(payload);
            message.success("Service Document Created!");

            // 2. Send Email
            if (pdfBlob) {
                const file = new File([pdfBlob], getFilename(), { type: "application/pdf" });
                await sendEmail(emailForm.to, emailForm.subject, emailForm.body, file);
                message.success("Email Sent Successfully!");
            }

            handleCloseModal();
            // Optional: Download local copy too?
            downloadPdf();
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
            <div className="flex items-center justify-between mb-4 max-w-7xl">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">Quote Details</h2>
                    <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-medium border ${docType === "Quote" ? "border-sky-500/60 bg-sky-500/10 text-sky-200" : docType === "Work Order" ? "border-amber-400/70 bg-amber-400/10 text-amber-100" : "border-emerald-400/70 bg-emerald-400/10 text-emerald-100"}`}>{docType}</span>
                </div>
            </div>
            {/* Line Items Table */}
            <div className="overflow-x-auto mb-6 border border-slate-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            <th className="px-3 py-2 min-w-[80px]">Type</th>
                            <th className="px-3 py-2 min-w-[90px]">NAGS ID</th>
                            <th className="px-3 py-2 min-w-[90px]">OEM ID</th>
                            <th className="px-3 py-2 min-w-[70px]">Labor (Hrs)</th>
                            <th className="px-3 py-2 min-w-[180px]">Description</th>
                            <th className="px-3 py-2 min-w-[120px]">Manufacturer</th>
                            <th className="px-3 py-2 text-right min-w-[70px]">Qty</th>
                            <th className="px-3 py-2 text-right min-w-[90px]">List Price</th>
                            <th className="px-3 py-2 text-right min-w-[90px]">Amount</th>
                            <th className="px-2 py-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {items.map((it) => (
                            <tr key={it.id} className="hover:bg-slate-50 transition group">
                                <td className="px-3 py-2">
                                    <span className={`text-xs font-medium px-2 py-1 rounded ${it.type === 'Labor' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {it.type || "Part"}
                                    </span>
                                </td>
                                <td className="px-3 py-2">
                                    <input value={it.nagsId} onChange={(e) => updateItem(it.id, "nagsId", e.target.value)} className="w-full h-8 rounded border border-slate-300 px-2 text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none" placeholder="NAGS" />
                                </td>
                                <td className="px-3 py-2">
                                    <input value={it.oemId} onChange={(e) => updateItem(it.id, "oemId", e.target.value)} className="w-full h-8 rounded border border-slate-300 px-2 text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none" placeholder="OEM" />
                                </td>
                                <td className="px-3 py-2">
                                    <input value={it.labor} onChange={(e) => updateItem(it.id, "labor", e.target.value)} className="w-full h-8 rounded border border-slate-300 px-2 text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none" placeholder="Hrs" />
                                </td>
                                <td className="px-3 py-2">
                                    <input value={it.description} onChange={(e) => updateItem(it.id, "description", e.target.value)} className="w-full h-8 rounded border border-slate-300 px-2 text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none" />
                                </td>
                                <td className="px-3 py-2">
                                    <input value={it.manufacturer} onChange={(e) => updateItem(it.id, "manufacturer", e.target.value)} className="w-full h-8 rounded border border-slate-300 px-2 text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none" />
                                </td>
                                <td className="px-3 py-2 text-right">
                                    <input type="number" value={it.qty} onChange={(e) => updateItem(it.id, "qty", e.target.value)} className="w-full h-8 rounded border border-slate-300 px-2 text-xs text-right focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none" />
                                </td>
                                <td className="px-3 py-2 text-right">
                                    <input type="number" value={it.unitPrice} onChange={(e) => updateItem(it.id, "unitPrice", e.target.value)} className="w-full h-8 rounded border border-slate-300 px-2 text-xs text-right focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none" />
                                </td>
                                <td className="px-3 py-2 text-right font-medium text-xs">
                                    <div className="flex flex-col items-end gap-1">
                                        <input type="number" value={it.amount} onChange={(e) => updateItem(it.id, "amount", e.target.value)} className="w-24 rounded border border-slate-300 px-2 py-1 text-right text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none" />
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
            {/* Totals & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-slate-500 mb-1 block">Printable Note</label>
                        <textarea rows={3} value={printableNote} onChange={(e) => setPrintableNote(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Notes for the customer..." />
                    </div>
                    <div>
                        <label className="text-sm text-slate-500 mb-1 block">Internal Note</label>
                        <textarea rows={3} value={internalNote} onChange={(e) => setInternalNote(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Internal use only..." />
                    </div>
                </div>
                <div className="bg-slate-50/60 rounded-xl border border-slate-200 p-4 space-y-3">
                    <Row label="Subtotal" value={currency(subtotal)} />
                    <NumberRow
                        label={<span className="flex items-center gap-1">Labor Cost <span className="text-[10px] text-slate-400 font-normal">({totalHours.toFixed(1)} hrs)</span></span>}
                        value={laborCost}
                        setter={setLaborCost}
                    />
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
        </div>
    );
}
