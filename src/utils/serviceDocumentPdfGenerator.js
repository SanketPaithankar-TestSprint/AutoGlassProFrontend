import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Service Document PDF Generator Utility
 * Generates professional PDF documents for quotes, invoices, and work orders
 */

/**
 * Helper function to format currency
 */
function currency(n) {
    const num = Number.isFinite(n) ? n : 0;
    return num.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

/**
 * Generates a PDF document for service documents (quotes, invoices, work orders)
 * 
 * @param {Object} params - Parameters for PDF generation
 * @param {Array} params.items - Line items to include in the document
 * @param {Object} params.customerData - Customer information
 * @param {Object} params.userProfile - Business/user profile information
 * @param {number} params.subtotal - Subtotal amount
 * @param {number} params.totalTax - Tax amount
 * @param {number} params.totalHours - Total labor hours
 * @param {number} params.laborAmount - Total labor amount (sum of all labor items)
 * @param {number} params.discountAmount - Discount amount
 * @param {number} params.total - Grand total
 * @param {number} params.balance - Balance due
 * @param {string} params.docType - Document type (Quote, Invoice, Work Order)
 * @param {string} params.printableNote - Special instructions/notes
 * 
 * @returns {jsPDF} - The generated PDF document object
 */
export function generateServiceDocumentPDF({
    items = [],
    customerData = {},
    userProfile = {},
    subtotal = 0,
    totalTax = 0,
    totalHours = 0,
    laborAmount = 0,
    discountAmount = 0,
    total = 0,
    balance = 0,
    docType = "Quote",
    printableNote = "",
    insuranceData = {},
    includeInsurance = false
}) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 30;

    // --- Helper: Cell with label/value ---
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
    const now = new Date().toLocaleDateString();
    doc.setLineWidth(0.5);

    // Quote # / Date
    doc.rect(topGridX, topGridY, 120, rowH);
    doc.line(topGridX + 40, topGridY, topGridX + 40, topGridY + rowH);
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.text(`${docType} #`, topGridX + 2, topGridY + 12);
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.text("GFI0016248", topGridX + 45, topGridY + 13);

    // Box for Date
    doc.rect(topGridX + 120, topGridY, 100, rowH);
    doc.line(topGridX + 150, topGridY, topGridX + 150, topGridY + rowH);
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.text("Date", topGridX + 122, topGridY + 12);
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.text(now, topGridX + 155, topGridY + 13);

    // Row 2: Cust # | BillCode
    const y2 = topGridY + rowH;
    doc.rect(topGridX, y2, 120, rowH);
    doc.line(topGridX + 40, y2, topGridX + 40, y2 + rowH);
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.text("Cust. #", topGridX + 2, y2 + 12);
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.text(customerData?.customerId ? String(customerData.customerId) : "-", topGridX + 45, y2 + 13);

    doc.rect(topGridX + 120, y2, 100, rowH);
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
        addressLines = doc.splitTextToSize(addr1, 250);
        cityY = addrY + 35 + (addressLines.length * 12);

        const requiredH = (cityY + 15) - addrY;
        if (requiredH > addrBoxH) {
            addrBoxH = requiredH;
        }
    }

    // Top Left Bracket
    doc.line(margin, addrY, margin + 20, addrY);
    doc.line(margin, addrY, margin, addrY + 20);
    // Top Right Bracket
    doc.line(340, addrY, 320, addrY);
    doc.line(340, addrY, 340, addrY + 20);

    // Bottom Left Bracket
    const bottomY = addrY + addrBoxH;
    doc.line(margin, bottomY, margin + 20, bottomY);
    doc.line(margin, bottomY, margin, bottomY - 20);
    // Bottom Right Bracket
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
    const vY = bottomY + 20;
    const vRowH = 20;
    const fullW = 540;

    // Row 1: Year | Make | Policy
    doc.rect(margin, vY, 40, vRowH); doc.text("Year", margin + 2, vY + 14);
    doc.rect(margin + 40, vY, 80, vRowH); doc.text(String(customerData?.vehicleYear || ""), margin + 45, vY + 14);

    doc.rect(margin + 120, vY, 40, vRowH); doc.text("Make", margin + 122, vY + 14);
    doc.rect(margin + 160, vY, 200, vRowH); doc.text(customerData?.vehicleMake || "", margin + 165, vY + 14);

    doc.rect(margin + 360, vY, 40, vRowH); doc.text("Policy #", margin + 362, vY + 14);
    doc.rect(margin + 400, vY, 140, vRowH);

    // Row 2: Model | Body | Auth
    const vY2 = vY + vRowH;
    doc.rect(margin, vY2, 40, vRowH); doc.text("Model", margin + 2, vY2 + 14);
    doc.rect(margin + 40, vY2, 100, vRowH); doc.text(customerData?.vehicleModel || "", margin + 45, vY2 + 14);

    doc.rect(margin + 140, vY2, 40, vRowH);
    doc.text("Body\nStyle", margin + 142, vY2 + 8, { lineHeightFactor: 1 });
    doc.rect(margin + 180, vY2, 180, vRowH); doc.text(String(customerData?.bodyType || ""), margin + 185, vY2 + 14);

    doc.rect(margin + 360, vY2, 40, vRowH); doc.text("Author-\nized by", margin + 362, vY2 + 8, { lineHeightFactor: 1 });
    doc.rect(margin + 400, vY2, 140, vRowH);

    // Row 3: Lic | VIN | Claim | Loss Date
    const vY3 = vY2 + vRowH;
    doc.rect(margin, vY3, 40, vRowH); doc.text("Lic. #", margin + 2, vY3 + 14);
    doc.rect(margin + 40, vY3, 100, vRowH); doc.text(customerData?.licensePlate || "", margin + 45, vY3 + 14);

    doc.rect(margin + 140, vY3, 40, vRowH); doc.text("V.I.N", margin + 142, vY3 + 14);
    doc.rect(margin + 180, vY3, 180, vRowH); doc.text(customerData?.vin || "", margin + 185, vY3 + 14);

    doc.rect(margin + 360, vY3, 40, vRowH); doc.text("Claim #", margin + 362, vY3 + 14);
    doc.rect(margin + 400, vY3, 80, vRowH); doc.text(customerData?.claimNumber || "", margin + 405, vY3 + 14);

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

    // --- Insurance Details Section (if included) ---
    let insuranceY = vY4 + vRowH;
    if (includeInsurance && insuranceData) {
        insuranceY += 10;
        const insRowH = 20;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        // Row 1: Insurance Company | Policy #
        doc.rect(margin, insuranceY, 80, insRowH);
        doc.text("Insurance Co.", margin + 2, insuranceY + 14);
        doc.rect(margin + 80, insuranceY, 200, insRowH);
        doc.text(insuranceData?.companyName || "", margin + 85, insuranceY + 14);

        doc.rect(margin + 280, insuranceY, 80, insRowH);
        doc.text("Policy #", margin + 282, insuranceY + 14);
        doc.rect(margin + 360, insuranceY, 180, insRowH);
        doc.text(insuranceData?.policyNumber || "", margin + 365, insuranceY + 14);

        // Row 2: Claim # | Deductible
        const insY2 = insuranceY + insRowH;
        doc.rect(margin, insY2, 80, insRowH);
        doc.text("Claim #", margin + 2, insY2 + 14);
        doc.rect(margin + 80, insY2, 200, insRowH);
        doc.text(insuranceData?.claimNumber || "", margin + 85, insY2 + 14);

        doc.rect(margin + 280, insY2, 80, insRowH);
        doc.text("Deductible", margin + 282, insY2 + 14);
        doc.rect(margin + 360, insY2, 180, insRowH);
        doc.text(insuranceData?.deductible ? `$${insuranceData.deductible}` : "", margin + 365, insY2 + 14);

        insuranceY = insY2 + insRowH;
    }

    // --- Items Table ---
    const tableY = insuranceY + 10;
    autoTable(doc, {
        startY: tableY,
        head: [["Qty", "Part #", "Description", "List", "Price", "Total"]],
        body: items.map((it) => [
            String(Number(it.qty) || 0),
            it.nagsId || it.oemId || "-",
            it.description || "-",
            (Number(it.unitPrice) || 0).toFixed(2), // List
            (Number(it.unitPrice) || 0).toFixed(2), // Price
            (Number(it.amount) || 0).toFixed(2)     // Total
        ]),
        styles: {
            fontSize: 9,
            cellPadding: 4,
            lineWidth: 0,
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
        theme: "plain",
        columnStyles: {
            0: { halign: "center", cellWidth: 30 },
            1: { cellWidth: 90 },
            2: { cellWidth: 200 },
            3: { halign: "right" },
            4: { halign: "right" },
            5: { halign: "right" }
        },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
            // Draw borders if needed
        }
    });

    // --- Totals ---
    let finalY = doc.lastAutoTable.finalY + 10;
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
    // Labor - use actual labor amount sum, not recalculated
    doc.text("Labor", totalsX + 4, totalBoxY + 12);
    doc.text(laborAmount > 0 ? laborAmount.toFixed(2) : "0.00", totalsX + 125, totalBoxY + 12, { align: "right" });

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
}

/**
 * Generates a filename for the PDF based on customer and document type
 * 
 * @param {string} docType - Document type (Quote, Invoice, Work Order)
 * @param {Object} customerData - Customer information
 * @returns {string} - Generated filename
 */
export function generatePDFFilename(docType, customerData = {}) {
    const now = new Date();
    let filename = `${docType.toLowerCase()}_${now.getTime()}.pdf`;

    if (customerData) {
        const name = `${customerData.firstName || ""} ${customerData.lastName || ""}`.trim();
        const car = `${customerData.vehicleYear || ""} ${customerData.vehicleMake || ""} ${customerData.vehicleModel || ""}`.trim();
        if (name || car) {
            filename = `${name} - ${car} - ${docType}.pdf`.replace(/[\/\\?%*:|"<>]/g, '-');
        }
    }

    return filename;
}

/**
 * Downloads a PDF document
 * 
 * @param {jsPDF} doc - The PDF document to download
 * @param {string} filename - The filename for the download
 */
export function downloadPDF(doc, filename) {
    doc.save(filename);
}

/**
 * Generates and downloads a service document PDF in one step
 * 
 * @param {Object} params - Same parameters as generateServiceDocumentPDF
 * @returns {jsPDF} - The generated PDF document
 */
export function generateAndDownloadPDF(params) {
    const doc = generateServiceDocumentPDF(params);
    const filename = generatePDFFilename(params.docType, params.customerData);
    downloadPDF(doc, filename);
    return doc;
}
