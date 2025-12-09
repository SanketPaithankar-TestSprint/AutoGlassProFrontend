import React, { useMemo, useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Modal, Input, Button, message, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
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
    const totalLaborHours = items.reduce((sum, it) => sum + (Number(it.labor) || 0), 0);

    const [globalTaxRate, setGlobalTaxRate] = useState(0);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [payment, setPayment] = useState(0);

    const updateItem = (id, key, value) => {
        setItems((prev) => prev.map((it) => {
            if (it.id !== id) return it;
            const updated = { ...it, [key]: value };

            // Auto-calc amount if qty or unitPrice changes (standard behavior)
            if (key === 'qty' || key === 'unitPrice') {
                updated.amount = (Number(updated.qty) || 0) * (Number(updated.unitPrice) || 0);
            }
            return updated;
        }));
    };

    const handleAddRow = (type = "Part") => {
        setItems(prev => [...prev, {
            ...newItem(),
            id: Math.random().toString(36).substring(2, 9),
            isManual: true, // Flag to identify manual items
            description: type === "Part" ? "Custom Part" : type === "Labor" ? "Custom Labor" : "Service",
            type: type
        }]);
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
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 30;

        // --- Helper Functions ---
        const drawGrid = (x, y, w, h, rows, cols) => {
            // rows/cols = array of { size, text, label }
            // simple impl: just draw rects
            doc.setDrawColor(0);
            doc.rect(x, y, w, h);
        };

        const cell = (x, y, w, h, label, value, labelWidth = 0.4) => {
            doc.rect(x, y, w, h);
            doc.line(x + (w * labelWidth), y, x + (w * labelWidth), y + h);
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            if (label) doc.text(label, x + 2, y + 10);
            doc.setFont("helvetica", "bold");
            if (value) doc.text(String(value), x + (w * labelWidth) + 4, y + 10);
        };

        const topGridX = 350;
        const topGridY = 40;
        const rowH = 20;
        const gridW = 220;

        // --- Header Section ---
        // Left: Company Info
        // Left: Company Info
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(userProfile?.businessName || "", margin + 10, 50);
        doc.setFontSize(10);
        const addressLine = (userProfile?.addressLine1 && userProfile?.addressLine2)
            ? `${userProfile.addressLine1}, ${userProfile.addressLine2}`
            : (userProfile?.addressLine1 || "");

        const cityStateZip = (userProfile?.city && userProfile?.state)
            ? `${userProfile.city}, ${userProfile.state} ${userProfile.postalCode || ""}`
            : "";

        doc.text(addressLine, margin + 10, 65);
        doc.text(cityStateZip, margin + 10, 80);
        doc.text(userProfile?.phone || "", margin + 10, 95);
        doc.text(`Fed. ID# ${userProfile?.ein || userProfile?.businessLicenseNumber || ""}`, margin + 10, 110);

        // Right: Quote/Invoice Info Grid
        // Row 1: Quote # | Date
        const now = new Date().toLocaleDateString();
        doc.setLineWidth(0.5);

        // Quote # / Date
        // Box for Quote #
        doc.rect(topGridX, topGridY, 120, rowH);
        doc.line(topGridX + 40, topGridY, topGridX + 40, topGridY + rowH);
        doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.text("Quote #", topGridX + 2, topGridY + 12);
        doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.text("GFI0016248", topGridX + 45, topGridY + 13);

        // Box for Date
        doc.rect(topGridX + 120, topGridY, 100, rowH);
        doc.line(topGridX + 150, topGridY, topGridX + 150, topGridY + rowH);
        doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.text("Date", topGridX + 122, topGridY + 12);
        doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.text(now, topGridX + 155, topGridY + 13);

        // Row 2: Cust # | BillCode
        const y2 = topGridY + rowH;
        doc.rect(topGridX, y2, 120, rowH); // Cust
        doc.line(topGridX + 40, y2, topGridX + 40, y2 + rowH);
        doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.text("Cust. #", topGridX + 2, y2 + 12);
        doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.text(customerData?.customerId ? String(customerData.customerId) : "-", topGridX + 45, y2 + 13);

        doc.rect(topGridX + 120, y2, 100, rowH); // BillCode
        doc.line(topGridX + 155, y2, topGridX + 155, y2 + rowH);
        doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.text("BillCode", topGridX + 122, y2 + 12);
        doc.text("G1", topGridX + 160, y2 + 13);

        // Row 3: PO # | Sold By
        const y3 = y2 + rowH;
        doc.rect(topGridX, y3, 120, rowH);
        doc.line(topGridX + 40, y3, topGridX + 40, y3 + rowH);
        doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.text("P.O. #", topGridX + 2, y3 + 12);

        doc.rect(topGridX + 120, y3, 100, rowH);
        doc.line(topGridX + 155, y3, topGridX + 155, y3 + rowH);
        doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.text("Sold By", topGridX + 122, y3 + 12);
        const soldBy = userProfile?.ownerName || (userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName || ""}` : "");
        doc.setFont("helvetica", "bold"); doc.text(soldBy, topGridX + 160, y3 + 13);

        // Row 4: Fed Tax # | Inst'l By
        const y4 = y3 + rowH;
        doc.rect(topGridX, y4, 120, rowH);
        doc.line(topGridX + 40, y4, topGridX + 40, y4 + rowH);
        doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.text("Fed Tax #", topGridX + 2, y4 + 12);

        doc.rect(topGridX + 120, y4, 100, rowH);
        doc.line(topGridX + 155, y4, topGridX + 155, y4 + rowH);
        doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.text("Inst'l By", topGridX + 122, y4 + 12);

        // --- Address Box (Visual Markers) ---
        const addrY = 140;

        // Calculate dynamic height based on text
        let addrBoxH = 60;
        let addressLines = [];
        let cityY = addrY + 50;

        if (customerData) {
            const addr1 = customerData.addressLine1 || "";
            addressLines = doc.splitTextToSize(addr1, 250); // Adjusted to fit new width (340 - 25(margin) - few pts)
            // approx 12pts per line. 
            // Start Y for address is addrY + 35. 
            // City Y is after address lines.
            cityY = addrY + 35 + (addressLines.length * 12);

            // Check if we need to expand box
            // We want some padding below cityY. Say 15pts.
            const requiredH = (cityY + 15) - addrY;
            if (requiredH > addrBoxH) {
                addrBoxH = requiredH;
            }
        }

        // Top Left Bracket
        doc.line(margin, addrY, margin + 20, addrY);
        doc.line(margin, addrY, margin, addrY + 20);
        // Top Right Bracket (Moved to 340)
        doc.line(340, addrY, 320, addrY);
        doc.line(340, addrY, 340, addrY + 20);

        // Bottom Left Bracket (Dynamic Y)
        const bottomY = addrY + addrBoxH;
        doc.line(margin, bottomY, margin + 20, bottomY);
        doc.line(margin, bottomY, margin, bottomY - 20);
        // Bottom Right Bracket (Dynamic Y - Moved to 340)
        doc.line(340, bottomY, 320, bottomY);
        doc.line(340, bottomY, 340, bottomY - 20);

        if (customerData) {
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text(`${customerData.firstName} ${customerData.lastName}`, margin + 25, addrY + 20);
            doc.setFont("helvetica", "normal");

            doc.text(addressLines, margin + 25, addrY + 35);
            doc.text(`${customerData.city}, ${customerData.state} ${customerData.postalCode}`, margin + 25, cityY);
        }

        // --- Vehicle Info Grid ---
        const vY = bottomY + 20; // Dynamic start for next section
        const vRowH = 20;
        const fullW = 540; // width of table

        // Row 1: Year | Make | Policy
        doc.rect(margin, vY, 40, vRowH); doc.text("Year", margin + 2, vY + 14);
        doc.rect(margin + 40, vY, 80, vRowH); doc.setFont("helvetica", "bold"); doc.text(String(customerData?.vehicleYear || ""), margin + 45, vY + 14); doc.setFont("helvetica", "normal");

        doc.rect(margin + 120, vY, 40, vRowH); doc.text("Make", margin + 122, vY + 14);
        doc.rect(margin + 160, vY, 200, vRowH); doc.setFont("helvetica", "bold"); doc.text(customerData?.vehicleMake || "", margin + 165, vY + 14); doc.setFont("helvetica", "normal");

        doc.rect(margin + 360, vY, 40, vRowH); doc.text("Policy #", margin + 362, vY + 14);
        doc.rect(margin + 400, vY, 140, vRowH);

        // Row 2: Model | Body | Auth
        const vY2 = vY + vRowH;
        doc.rect(margin, vY2, 40, vRowH); doc.text("Model", margin + 2, vY2 + 14);
        doc.rect(margin + 40, vY2, 100, vRowH); doc.setFont("helvetica", "bold"); doc.text(customerData?.vehicleModel || "", margin + 45, vY2 + 14); doc.setFont("helvetica", "normal");

        doc.rect(margin + 140, vY2, 40, vRowH);
        doc.text("Body\nStyle", margin + 142, vY2 + 8, { lineHeightFactor: 1 });
        doc.rect(margin + 180, vY2, 180, vRowH); doc.setFont("helvetica", "bold"); doc.text("4 DOOR UTILITY", margin + 185, vY2 + 14); doc.setFont("helvetica", "normal");

        doc.rect(margin + 360, vY2, 40, vRowH); doc.text("Author-\nized by", margin + 362, vY2 + 8, { lineHeightFactor: 1 });
        doc.rect(margin + 400, vY2, 140, vRowH);

        // Row 3: Lic | VIN | Claim | Loss Date
        const vY3 = vY2 + vRowH;
        doc.rect(margin, vY3, 40, vRowH); doc.text("Lic. #", margin + 2, vY3 + 14);
        doc.rect(margin + 40, vY3, 100, vRowH); doc.setFont("helvetica", "bold"); doc.text("8ZEY923", margin + 45, vY3 + 14); doc.setFont("helvetica", "normal");

        doc.rect(margin + 140, vY3, 40, vRowH); doc.text("V.I.N", margin + 142, vY3 + 14);
        doc.rect(margin + 180, vY3, 180, vRowH); doc.setFont("helvetica", "bold"); doc.text(customerData?.vin || "", margin + 185, vY3 + 14); doc.setFont("helvetica", "normal");

        doc.rect(margin + 360, vY3, 40, vRowH); doc.text("Claim #", margin + 362, vY3 + 14);
        doc.rect(margin + 400, vY3, 80, vRowH); doc.setFont("helvetica", "bold"); doc.text("YTRYRTYTR", margin + 405, vY3 + 14); doc.setFont("helvetica", "normal");

        doc.rect(margin + 480, vY3, 60, vRowH);
        doc.setFontSize(6); doc.text("Loss Date", margin + 482, vY3 + 8); doc.setFontSize(8);
        doc.text(now, margin + 482, vY3 + 18);

        // Row 4: Phones | Damage
        const vY4 = vY3 + vRowH;
        doc.rect(margin, vY4, 40, vRowH); doc.text("Home\nPhone", margin + 2, vY4 + 8, { lineHeightFactor: 1 });
        doc.rect(margin + 40, vY4, 100, vRowH); doc.text("() -", margin + 45, vY4 + 14);

        doc.rect(margin + 140, vY4, 40, vRowH); doc.text("Bus.\nPhone", margin + 142, vY4 + 8, { lineHeightFactor: 1 });
        doc.rect(margin + 180, vY4, 100, vRowH); doc.text("() -", margin + 185, vY4 + 14);

        doc.rect(margin + 280, vY4, 80, vRowH); doc.text("Damage\n/ Cause", margin + 282, vY4 + 8, { lineHeightFactor: 1 });
        doc.rect(margin + 360, vY4, 180, vRowH);


        // --- Items Table ---
        const tableY = vY4 + vRowH + 10;
        autoTable(doc, {
            startY: tableY,
            head: [["Qty", "Part #", "Description", "Block Size", "List", "Price", "Total"]],
            body: items.map((it) => [
                String(Number(it.qty) || 0),
                it.nagsId || it.oemId || "-",
                it.description || "-",
                "0 x 0", // Block Size dummy
                (Number(it.unitPrice) || 0).toFixed(2), // List
                (Number(it.unitPrice) || 0).toFixed(2), // Price
                (Number(it.amount) || 0).toFixed(2)     // Total
            ]),
            styles: {
                fontSize: 9,
                cellPadding: 4,
                lineWidth: 0, // No internal borders 
                valign: 'top'
            },
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontStyle: "normal",
                lineWidth: 0.5,
                lineColor: [0, 0, 0]
            },
            bodyStyles: {
                textColor: [0, 0, 0]
            },
            theme: "plain", // We want custom lines or just list
            columnStyles: {
                0: { halign: "center", cellWidth: 30 },
                1: { cellWidth: 90 },
                2: { cellWidth: 200 },
                4: { halign: "right" },
                5: { halign: "right" },
                6: { halign: "right" }
            },
            margin: { left: margin, right: margin },
            didDrawPage: (data) => {
                // Draw borders if needed
            }
        });

        // --- Totals ---
        let finalY = doc.lastAutoTable.finalY + 10;
        // Ensure we are at bottom or distinct section
        // Depending on page breaks, just putting it after table for now.
        // We'll mimic the big footer block.

        // Let's force it to bottom of page if possible, or just below table.
        // Image shows a block at bottom.
        let footerY = Math.max(finalY, pageHeight - 150);
        if (finalY > pageHeight - 160) {
            doc.addPage();
            footerY = pageHeight - 150;
        }

        // Special Instructions Bar
        doc.rect(margin, footerY, 540, 15);
        doc.setFontSize(8);
        doc.text("SPECIAL INSTRUCTIONS", margin + 200, footerY + 10);

        // Block below instructions
        const totalBoxY = footerY + 15;
        const totalBoxH = 100;

        // Left Text Block
        doc.rect(margin, totalBoxY, 410, totalBoxH);
        doc.setFontSize(7);
        const disclaimer = "Windshield Post Replacement- 1) NO CAR WASH for 3 days. 2) Leave Blue tape on for 3 days. 3) Leave front 2 windows rolled down slightly (1/2 inch) for 48 hours. 4) Gently remove blue tape after 3 days period.\n\nWarranty: Any issues caused by an installation error, such as wind and water leaks, lose moldings, and some types of stress cracks, will be repaired or replaced at no cost to you.\n\nTerms of payment are 0 days from Invoice date.";
        doc.text(disclaimer, margin + 4, totalBoxY + 10, { maxWidth: 400 });

        // Right Totals Block
        const totalsX = margin + 410;
        const totalsW = 130;
        doc.rect(totalsX, totalBoxY, totalsW, totalBoxH);

        // Lines for totals
        const tRowH = 20;
        // Labor
        doc.text("Labor", totalsX + 4, totalBoxY + 12);
        doc.text(totalHours > 0 ? (totalHours * 65).toFixed(2) : "0.00", totalsX + 125, totalBoxY + 12, { align: "right" }); // Example logic

        // Subtotal
        doc.text("Subtotal", totalsX + 4, totalBoxY + 28);
        doc.text(subtotal.toFixed(2), totalsX + 125, totalBoxY + 28, { align: "right" });

        // Tax
        doc.text("Tax", totalsX + 4, totalBoxY + 44);
        doc.text(totalTax.toFixed(2), totalsX + 125, totalBoxY + 44, { align: "right" });

        // Total
        doc.text("Total", totalsX + 4, totalBoxY + 60);
        doc.setFont("helvetica", "bold");
        doc.text(total.toFixed(2), totalsX + 125, totalBoxY + 60, { align: "right" });
        doc.setFont("helvetica", "normal");

        // Balance
        doc.line(totalsX, totalBoxY + 80, totalsX + totalsW, totalBoxY + 80);
        doc.text("Balance", totalsX + 4, totalBoxY + 92);
        doc.setFont("helvetica", "bold");
        doc.text(balance.toFixed(2), totalsX + 125, totalBoxY + 92, { align: "right" });

        // Bottom Footer: Received By
        const recY = totalBoxY + totalBoxH;
        doc.rect(margin, recY, 200, 20);
        doc.setFontSize(8); doc.setFont("helvetica", "normal");
        doc.text("RECEIVED BY", margin + 4, recY + 14);

        doc.rect(margin + 200, recY, 340, 20);
        doc.setFontSize(6);
        doc.text("The glass listed has been replaced / repaired with like kind and quality to my entire satisfaction, and I authorize my Insurance Company to pay GlassFixit Auto Glass.", margin + 204, recY + 8, { maxWidth: 330 });

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
                    // Filter out Labor items as per user request to avoid backend errors
                    .filter(it => it.type !== 'Labor')
                    .map((it) => ({
                        prefixCd: it.prefixCd || "",
                        posCd: it.posCd || "",
                        sideCd: it.sideCd || "",
                        nagsGlassId: it.nagsId || "MISC",
                        partDescription: it.description || "",
                        partPrice: Number(it.unitPrice) || 0,
                        laborAmount: 0, // Set to 0 since we filtered out labor rows
                        quantity: Number(it.qty) || 1
                    }))
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
                                    <input
                                        value={it.nagsId}
                                        onChange={(e) => updateItem(it.id, "nagsId", e.target.value)}
                                        className={`w-full h-8 rounded border border-slate-300 px-2 text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none ${(!it.isManual && it.type === 'Labor') ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                                        placeholder="NAGS"
                                        disabled={!it.isManual && it.type === 'Labor'}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        value={it.oemId}
                                        onChange={(e) => updateItem(it.id, "oemId", e.target.value)}
                                        className={`w-full h-8 rounded border border-slate-300 px-2 text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none ${(!it.isManual && it.type === 'Labor') ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                                        placeholder="OEM"
                                        disabled={!it.isManual && it.type === 'Labor'}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        value={it.labor}
                                        onChange={(e) => updateItem(it.id, "labor", e.target.value)}
                                        className={`w-full h-8 rounded border border-slate-300 px-2 text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none ${(!it.isManual && it.type === 'Labor') ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                                        placeholder="Hrs"
                                        disabled={!it.isManual && it.type === 'Labor'}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        value={it.description}
                                        onChange={(e) => updateItem(it.id, "description", e.target.value)}
                                        className={`w-full h-8 rounded border border-slate-300 px-2 text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none ${(!it.isManual && it.type === 'Labor') ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                                        disabled={!it.isManual && it.type === 'Labor'}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        value={it.manufacturer}
                                        onChange={(e) => updateItem(it.id, "manufacturer", e.target.value)}
                                        className={`w-full h-8 rounded border border-slate-300 px-2 text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none ${(!it.isManual && it.type === 'Labor') ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
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

            <div className="flex justify-end mb-6">
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
        </div>
    );
}

export default function QuotePanel(props) {
    return (
        <ErrorBoundary>
            <QuotePanelContent {...props} />
        </ErrorBoundary>
    );
}
