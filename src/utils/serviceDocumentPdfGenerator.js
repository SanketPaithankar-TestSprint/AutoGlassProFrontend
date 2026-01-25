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
    specialInstructions = "",
    insuranceData = {},
    includeInsurance = false,
    documentNumber = ""
}) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 30;
    const contentWidth = pageWidth - (margin * 2);  // 535pt on A4

    // Set PDF document properties (title shows in browser tab)
    const customerName = customerData ?
        `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim() : '';
    const vehicleInfo = customerData ?
        `${customerData.vehicleYear || ''} ${customerData.vehicleMake || ''} ${customerData.vehicleModel || ''}`.trim() : '';
    const pdfTitle = customerName && vehicleInfo
        ? `${customerName} - ${vehicleInfo} - ${docType}`
        : `${docType} Document`;

    doc.setProperties({
        title: pdfTitle,
        subject: `Auto Glass ${docType}`,
        author: userProfile?.businessName || 'Auto Glass Pro',
        creator: 'Auto Glass Pro'
    });

    // --- Helper: Modern cell with label/value ---
    const drawModernHeaderCell = (x, y, w, h, isLabel = false) => {
        if (isLabel) {
            doc.setFillColor(245, 247, 250);
        } else {
            doc.setFillColor(255, 255, 255);
        }
        doc.setDrawColor(200, 200, 200);
        doc.rect(x, y, w, h, 'FD');
    };

    // Right grid dimensions - positioned to align with right edge
    const topGridY = 35;
    const rowH = 22;
    const rightGridW = 235;  // Total width of right grid
    const topGridX = margin + contentWidth - rightGridW;  // Align to right edge
    const hLabelW = 55;      // Header label width
    const hValueW = 70;      // Header value width
    const hLabelW2 = 45;     // Header label 2 width
    const hValueW2 = 65;     // Header value 2 width (total = 55+70+45+65 = 235)

    // --- Header Section (Modern Style) ---
    // Left: Company Info with modern styling
    const leftSideWidth = contentWidth - rightGridW - 10;  // Space between company info and grid
    doc.setFillColor(50, 60, 80);
    doc.rect(margin, 30, leftSideWidth, 4, 'F');  // Accent bar under title area

    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 60, 80);
    doc.text(userProfile?.businessName || "", margin + 5, 50);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);

    let currentY = 65;

    const maxAddressWidth = leftSideWidth - 10;

    // Address Line 1
    if (userProfile?.addressLine1) {
        const addressLines = doc.splitTextToSize(userProfile.addressLine1, maxAddressWidth);
        addressLines.forEach(line => {
            doc.text(line, margin + 5, currentY);
            currentY += 13;
        });
    }

    // Address Line 2 (on separate line)
    if (userProfile?.addressLine2) {
        const addressLines = doc.splitTextToSize(userProfile.addressLine2, maxAddressWidth);
        addressLines.forEach(line => {
            doc.text(line, margin + 5, currentY);
            currentY += 13;
        });
    }

    // City, State, Zip
    const cityStateZip = (userProfile?.city && userProfile?.state)
        ? `${userProfile.city}, ${userProfile.state} ${userProfile.postalCode || ""}`
        : "";
    if (cityStateZip) {
        doc.text(cityStateZip, margin + 5, currentY);
        currentY += 13;
    }

    // Phone
    if (userProfile?.phone) {
        doc.setTextColor(100, 100, 100);
        doc.text(`Ph: ${userProfile.phone}`, margin + 5, currentY);
        currentY += 13;
    }

    // Fed ID (EIN)
    if (userProfile?.ein) {
        doc.setTextColor(100, 100, 100);
        doc.text(`Fed. ID# ${userProfile.ein}`, margin + 5, currentY);
        currentY += 13;
    }

    // Business License
    if (userProfile?.businessLicenseNumber) {
        doc.setTextColor(100, 100, 100);
        doc.text(`Business License: ${userProfile.businessLicenseNumber}`, margin + 5, currentY);
        currentY += 13;
    }

    // Right: Quote/Invoice Info Grid (Modern)
    const now = new Date().toLocaleDateString();
    doc.setLineWidth(0.3);
    doc.setDrawColor(200, 200, 200);

    // Row 1: Quote # | Date
    drawModernHeaderCell(topGridX, topGridY, hLabelW, rowH, true);
    drawModernHeaderCell(topGridX + hLabelW, topGridY, hValueW, rowH, false);
    drawModernHeaderCell(topGridX + hLabelW + hValueW, topGridY, hLabelW2, rowH, true);
    drawModernHeaderCell(topGridX + hLabelW + hValueW + hLabelW2, topGridY, hValueW2, rowH, false);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`${docType} #`, topGridX + 5, topGridY + 14);
    doc.text("Date", topGridX + hLabelW + hValueW + 5, topGridY + 14);

    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(documentNumber || "NEW", topGridX + hLabelW + 5, topGridY + 15);
    doc.text(now, topGridX + hLabelW + hValueW + hLabelW2 + 5, topGridY + 15);

    // Row 2: P.O. # | Sold By
    const y2 = topGridY + rowH;
    drawModernHeaderCell(topGridX, y2, hLabelW, rowH, true);
    drawModernHeaderCell(topGridX + hLabelW, y2, hValueW, rowH, false);
    drawModernHeaderCell(topGridX + hLabelW + hValueW, y2, hLabelW2, rowH, true);
    drawModernHeaderCell(topGridX + hLabelW + hValueW + hLabelW2, y2, hValueW2, rowH, false);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("P.O. #", topGridX + 5, y2 + 14);
    doc.text("Sold By", topGridX + hLabelW + hValueW + 5, y2 + 14);

    let soldBy = userProfile?.ownerName || (userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName || ""}` : "");
    if (soldBy.length > 12) {
        soldBy = soldBy.substring(0, 11) + "...";
    }
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(8);
    doc.text(soldBy, topGridX + hLabelW + hValueW + hLabelW2 + 5, y2 + 15);

    // Reset for rest of document
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);

    // --- Customer Info Card (Modern Style) ---
    const addrY = Math.max(140, currentY + 15); // Dynamic start position to avoid overlap
    const cardX = margin;
    const cardW = leftSideWidth;  // Same width as company info section

    // Calculate dynamic height based on actual content present
    let contentLines = 0;
    let addressLines = [];
    let hasCityStateZip = false;
    let cityStateZipLine = '';

    // Check what content we have
    if (customerData) {
        const addr1 = customerData.addressLine1 || "";
        if (addr1.trim()) {
            const lines = doc.splitTextToSize(addr1, cardW - 30);
            addressLines.push(...lines);
        }

        const addr2 = customerData.addressLine2 || "";
        if (addr2.trim()) {
            const lines = doc.splitTextToSize(addr2, cardW - 30);
            addressLines.push(...lines);
        }

        const cityPart = customerData.city || '';
        const statePart = customerData.state || '';
        const postalPart = customerData.postalCode || '';

        if (cityPart && statePart) {
            cityStateZipLine = `${cityPart}, ${statePart} ${postalPart}`.trim();
        } else if (cityPart) {
            cityStateZipLine = `${cityPart} ${postalPart}`.trim();
        } else if (statePart) {
            cityStateZipLine = `${statePart} ${postalPart}`.trim();
        } else if (postalPart) {
            cityStateZipLine = postalPart;
        }

        if (cityStateZipLine) {
            const lines = doc.splitTextToSize(cityStateZipLine, cardW - 30);
            // We can treat this as part of addressLines or separate. 
            // Let's separate it but use splitTextToSize to count lines.
            // Actually, simplest is to just wrap it and store it as an array of lines.
            // But existing code uses 'hasCityStateZip' boolean and 'cityStateZipLine' string.
            // Let's change cityStateZipLine to be an ARRAY of strings.
            cityStateZipLine = lines;
            hasCityStateZip = true;
        }
    }

    contentLines = addressLines.length + (hasCityStateZip ? cityStateZipLine.length : 0);

    // Calculate card height (name + address lines + city + phone + padding)
    const lineHeight = 14;
    const cardH = 25 + (contentLines * lineHeight) + (customerData?.phone ? 18 : 0) + 10;

    // Draw modern card with accent
    doc.setFillColor(50, 60, 80);
    doc.rect(cardX, addrY, 4, cardH, 'F');  // Left accent bar

    doc.setFillColor(250, 251, 253);
    doc.setDrawColor(220, 220, 220);
    doc.rect(cardX + 4, addrY, cardW - 4, cardH, 'FD');  // Card body

    // Render customer content
    if (customerData) {
        let textY = addrY + 18;

        // Customer Name (bold, larger)
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 50, 70);
        const fullName = `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim();
        if (fullName) {
            doc.text(fullName, cardX + 14, textY);
            textY += lineHeight + 2;
        }

        // Address lines
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);

        // Address lines (Line 1 and Line 2)
        if (addressLines.length > 0) {
            addressLines.forEach(line => {
                doc.text(line, cardX + 14, textY);
                textY += lineHeight;
            });
        }

        // City/State/Zip (Wrapped)
        if (hasCityStateZip && Array.isArray(cityStateZipLine)) {
            cityStateZipLine.forEach(line => {
                doc.text(line, cardX + 14, textY);
                textY += lineHeight;
            });
        }

        // Phone
        if (customerData.phone) {
            textY += 4;
            doc.setTextColor(100, 100, 100);
            doc.text(`Ph: ${customerData.phone}`, cardX + 14, textY);

            if (customerData.alternatePhone) {
                doc.text(`  |  Alt: ${customerData.alternatePhone}`, cardX + 110, textY);
            }
        }
    }

    // Reset colors
    doc.setTextColor(0, 0, 0);

    // --- Position for next section ---
    let phoneY = addrY + cardH;

    // --- Vehicle Info Grid (Modern Style) ---
    const vY = phoneY + 10;
    const vRowH = 22;  // Slightly taller rows

    // Modern color scheme
    const borderColor = [180, 180, 180];     // Light gray border
    const labelBgColor = [245, 247, 250];    // Very light blue-gray for labels
    const valueBgColor = [255, 255, 255];    // White for values
    const textColor = [50, 50, 50];          // Dark gray text
    const labelTextColor = [100, 100, 100];  // Medium gray for labels

    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.5);

    // Define consistent column positions for perfect vertical alignment
    // Total width = 535 (contentWidth) - uniform widths for clean look
    // All label columns: 75pt each (fits "Damage/Cause")
    // All value columns: ~103pt each (remaining space divided equally)
    const labelW = 75;    // Same width for all label columns
    const valueW1 = 103;  // Value column 1
    const valueW2 = 103;  // Value column 2
    const valueW3 = 104;  // Value column 3 (1pt extra for rounding) = 535 total

    const col1 = margin;
    const col2 = col1 + labelW;
    const col3 = col2 + valueW1;
    const col4 = col3 + labelW;
    const col5 = col4 + valueW2;
    const col6 = col5 + labelW;

    // Helper function for modern cell
    const drawModernCell = (x, y, w, h, isLabel = false) => {
        if (isLabel) {
            doc.setFillColor(...labelBgColor);
        } else {
            doc.setFillColor(...valueBgColor);
        }
        doc.rect(x, y, w, h, 'FD');  // Fill and draw
    };

    // Row 1: Year | Make | Model
    doc.setFontSize(9);

    // Labels (all same width)
    drawModernCell(col1, vY, labelW, vRowH, true);
    drawModernCell(col3, vY, labelW, vRowH, true);
    drawModernCell(col5, vY, labelW, vRowH, true);
    // Values
    drawModernCell(col2, vY, valueW1, vRowH, false);
    drawModernCell(col4, vY, valueW2, vRowH, false);
    drawModernCell(col6, vY, valueW3, vRowH, false);

    // Text
    doc.setTextColor(...labelTextColor);
    doc.setFont("helvetica", "normal");
    doc.text("Year", col1 + 6, vY + 14);
    doc.text("Make", col3 + 6, vY + 14);
    doc.text("Model", col5 + 6, vY + 14);

    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "normal");
    doc.text(String(customerData?.vehicleYear || ""), col2 + 6, vY + 14);
    doc.text(customerData?.vehicleMake || "", col4 + 6, vY + 14);
    doc.text(customerData?.vehicleModel || "", col6 + 6, vY + 14);

    // Row 2: Body Style | Lic # | VIN
    const vY2 = vY + vRowH;

    drawModernCell(col1, vY2, labelW, vRowH, true);
    drawModernCell(col3, vY2, labelW, vRowH, true);
    drawModernCell(col5, vY2, labelW, vRowH, true);
    drawModernCell(col2, vY2, valueW1, vRowH, false);
    drawModernCell(col4, vY2, valueW2, vRowH, false);
    drawModernCell(col6, vY2, valueW3, vRowH, false);

    doc.setTextColor(...labelTextColor);
    doc.setFont("helvetica", "normal");
    doc.text("Body Style", col1 + 6, vY2 + 14);
    doc.text("Lic. #", col3 + 6, vY2 + 14);
    doc.text("Auth by", col5 + 6, vY2 + 14);

    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "normal");
    doc.text(String(customerData?.bodyType || ""), col2 + 6, vY2 + 14);
    doc.text(customerData?.licensePlateNumber || "", col4 + 6, vY2 + 14);
    doc.text("", col6 + 6, vY2 + 14);

    // Row 3: Policy # | Claim # | Loss Date
    const vY3 = vY2 + vRowH;

    drawModernCell(col1, vY3, labelW, vRowH, true);
    drawModernCell(col3, vY3, labelW, vRowH, true);
    drawModernCell(col5, vY3, labelW, vRowH, true);
    drawModernCell(col2, vY3, valueW1, vRowH, false);
    drawModernCell(col4, vY3, valueW2, vRowH, false);
    drawModernCell(col6, vY3, valueW3, vRowH, false);

    doc.setTextColor(...labelTextColor);
    doc.setFont("helvetica", "normal");
    doc.text("Policy #", col1 + 6, vY3 + 14);
    doc.text("Claim #", col3 + 6, vY3 + 14);
    doc.text("Loss Date", col5 + 6, vY3 + 14);

    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "normal");
    doc.text(insuranceData?.policyNumber || "", col2 + 6, vY3 + 14);
    doc.text(customerData?.claimNumber || insuranceData?.claimNumber || "", col4 + 6, vY3 + 14);
    doc.text(now, col6 + 6, vY3 + 14);

    // Row 4: Auth by | Damage/Cause
    const vY4 = vY3 + vRowH;

    drawModernCell(col1, vY4, labelW, vRowH, true);
    drawModernCell(col5, vY4, labelW, vRowH, true);
    drawModernCell(col2, vY4, valueW1 + labelW + valueW2, vRowH, false);  // Spans 3 columns
    drawModernCell(col6, vY4, valueW3, vRowH, false);

    doc.setTextColor(...labelTextColor);
    doc.setFont("helvetica", "normal");
    doc.text("V.I.N", col1 + 6, vY4 + 14);
    doc.text("Damage/Cause", col5 + 6, vY4 + 14);

    doc.setTextColor(...textColor);
    doc.text(customerData?.vin || "", col2 + 6, vY4 + 14);

    // Reset colors for rest of document
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);

    // Track the Y position after vehicle grid
    let insuranceY = vY4 + vRowH;

    // Insurance details section removed - info is in vehicle table above

    // --- Items Table (Modern Style) ---
    const tableY = insuranceY + 25; // 25pt gap before parts table
    autoTable(doc, {
        startY: tableY,
        head: [["Qty", "Part #", "Description", "List", "Price"]],
        body: items.map((it) => {
            // Determine Part # display - show SERVICE for Service type, LABOR for Labor
            let partDisplay = it.nagsId || it.oemId || "-";
            if (it.type === 'Labor') partDisplay = "Labor";
            else if (it.type === 'Service') partDisplay = "SERVICE";

            // For price, use amount if unitPrice is 0 (for chip repair where only amount is set)
            const displayPrice = (Number(it.unitPrice) || 0) > 0
                ? Number(it.unitPrice)
                : Number(it.amount) || 0;

            return [
                String(Number(it.qty) || 1),
                partDisplay,
                it.description || "-",
                (Number(it.listPrice) || displayPrice).toFixed(2), // List
                (Number(it.amount) || 0).toFixed(2)  // Price (total amount)
            ];
        }),
        styles: {
            fontSize: 9,
            cellPadding: 5,
            lineWidth: 0.3,
            lineColor: [200, 200, 200],
            valign: 'middle',
            textColor: [60, 60, 60]
        },
        headStyles: {
            fillColor: [50, 60, 80],        // Dark blue-gray header
            textColor: [255, 255, 255],     // White text
            fontStyle: "normal",
            lineWidth: 0,
            halign: 'center'
        },
        bodyStyles: {
            textColor: [50, 50, 50]
        },
        alternateRowStyles: {
            fillColor: [248, 249, 252]      // Very light gray for alternating rows
        },
        theme: "grid",
        tableWidth: contentWidth,  // Force table to use exact content width
        columnStyles: {
            0: { halign: "center", cellWidth: 40 },   // Qty (40)
            1: { cellWidth: 100, fontStyle: 'normal' },  // Part # (100)
            2: { cellWidth: 265 },                     // Description (265)
            3: { halign: "right", cellWidth: 65 },    // List (65)
            4: { halign: "right", cellWidth: 65, fontStyle: 'normal' }  // Price (65) = 535 total
        },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
            // Draw borders if needed
        }
    });

    // --- Totals (Modern Style) ---
    let finalY = doc.lastAutoTable.finalY + 25; // 25pt gap after parts table
    let footerY = finalY; // Position directly after table, no forced bottom placement
    if (finalY > pageHeight - 210) {
        doc.addPage();
        footerY = 50;
    }

    // Normalize specialInstructions - handle object or string
    let normalizedSpecialInstructions = "";
    if (specialInstructions) {
        if (typeof specialInstructions === 'string') {
            normalizedSpecialInstructions = specialInstructions;
        } else if (typeof specialInstructions === 'object') {
            // Handle object case - try common property names
            normalizedSpecialInstructions = specialInstructions.instructions ||
                specialInstructions.content ||
                specialInstructions.text ||
                JSON.stringify(specialInstructions);
        }
    }

    // Special Instructions Header Bar (Modern)
    doc.setFillColor(50, 60, 80);  // Dark blue-gray
    doc.rect(margin, footerY, contentWidth, 18, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.text("SPECIAL INSTRUCTIONS", margin + 220, footerY + 12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    // Block below instructions - Calculate dynamic height
    const totalBoxY = footerY + 18;

    // Estimate content height for notes
    const noteLineHeight = 10;
    let estimatedLines = 0;

    // Estimate lines for customer notes
    if (printableNote && typeof printableNote === 'string' && printableNote.trim() !== '') {
        const strippedNote = printableNote.replace(/<[^>]*>/g, '');
        estimatedLines += 3 + Math.ceil(strippedNote.length / 60); // Label + content
    }

    // Estimate lines for special instructions
    if (normalizedSpecialInstructions && normalizedSpecialInstructions.trim() !== '') {
        const strippedInstr = normalizedSpecialInstructions.replace(/<[^>]*>/g, '');
        estimatedLines += 3 + Math.ceil(strippedInstr.length / 60); // Label + content
    }

    // Calculate box height with minimum of 90, max of what fits
    const totalBoxH = Math.max(90, Math.min(180, 30 + (estimatedLines * noteLineHeight)));

    // Left Text Block (Modern)
    doc.setFillColor(252, 252, 254);
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, totalBoxY, contentWidth - 140, totalBoxH, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    // --- Helper: Render Simple HTML to PDF (Sync) ---
    // Supports: p, br, b, strong, i, em, u, ul, ol, li
    const renderHtmlToPdf = (doc, html, x, y, maxWidth, fontSize = 8, lineHeight = 10) => {
        if (!html) return y;

        // Clean up input
        // ReactQuill sometimes ends with <p><br></p> which adds empty space, trim it?
        // Let's just parse.
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, 'text/html');

        // Flatten DOM to segments
        // Segment: { text, isNewline, styles: { bold, italic, underline }, isBlock, listType, listIndex }
        let segments = [];
        let listStack = []; // { type: 'ul'|'ol', count: 0 }

        const shouldAddSpace = (str) => str.length > 0 && !/\s$/.test(str);

        const traverse = (node, styles) => {
            if (node.nodeType === Node.TEXT_NODE) {
                // Split text into words to handle wrapping, preserving distinct spaces if non-collapsed
                // But typically HTML collapses spaces. We'll tokenize by spaces.
                const text = node.textContent;
                if (!text) return;

                // Decode formatting entities if any remaining (DOMParser handles standard entities)
                // Split by whitespace but keep the whitespace for reconstruction logic if we want perfect spacing?
                // Simpler: split by spaces, treat each word as a token.
                const words = text.split(/(\s+)/).filter(w => w.length > 0);

                words.forEach(word => {
                    // Check if it's just a newline or space char
                    if (/^\s+$/.test(word)) {
                        segments.push({ text: " ", styles: { ...styles }, isSpace: true });
                    } else {
                        segments.push({ text: word, styles: { ...styles } });
                    }
                });
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();
                const newStyles = { ...styles };

                let isBlock = false;
                let listMarker = null;

                if (tagName === 'b' || tagName === 'strong') newStyles.bold = true;
                if (tagName === 'i' || tagName === 'em') newStyles.italic = true;
                if (tagName === 'u') newStyles.underline = true;

                if (tagName === 'br') {
                    segments.push({ isNewline: true });
                    return;
                }

                if (tagName === 'p' || tagName === 'div') {
                    isBlock = true;
                    // Double newline before paragraphs if not at start
                    if (segments.length > 0 && !segments[segments.length - 1].isNewline) {
                        segments.push({ isNewline: true });
                    }
                }

                if (tagName === 'ul') {
                    listStack.push({ type: 'ul' });
                    isBlock = true;
                    if (segments.length > 0 && !segments[segments.length - 1].isNewline) segments.push({ isNewline: true });
                }
                if (tagName === 'ol') {
                    listStack.push({ type: 'ol', count: 0 });
                    isBlock = true;
                    if (segments.length > 0 && !segments[segments.length - 1].isNewline) segments.push({ isNewline: true });
                }

                if (tagName === 'li') {
                    isBlock = true;
                    if (segments.length > 0 && !segments[segments.length - 1].isNewline) segments.push({ isNewline: true });

                    const currentList = listStack[listStack.length - 1];
                    if (currentList) {
                        if (currentList.type === 'ul') {
                            listMarker = '•';
                        } else {
                            currentList.count++;
                            listMarker = `${currentList.count}.`;
                        }
                    } else {
                        listMarker = '•'; // Fallback
                    }

                    // Add marker segment (non-wrapping prefix)
                    segments.push({ listMarker, styles: newStyles });
                }

                // Recursion
                Array.from(node.childNodes).forEach(child => traverse(child, newStyles));

                // Post-traversal cleanup
                if (isBlock) {
                    if (segments.length > 0 && !segments[segments.length - 1].isNewline) {
                        segments.push({ isNewline: true });
                    }
                }
                if (tagName === 'ul' || tagName === 'ol') {
                    listStack.pop();
                }
            }
        };

        traverse(dom.body, { bold: false, italic: false, underline: false });

        // Rendering Loop
        let cursorX = x;
        let cursorY = y;
        let currentLineHeight = lineHeight;
        const initialX = x;

        doc.setFontSize(fontSize);
        doc.setTextColor(60, 60, 60); // Match existing color

        // Helper to measure text
        const measure = (txt, s) => {
            let fontStyle = 'normal';
            if (s.bold && s.italic) fontStyle = 'bolditalic';
            else if (s.bold) fontStyle = 'bold';
            else if (s.italic) fontStyle = 'italic';

            doc.setFont('helvetica', fontStyle);
            return doc.getStringUnitWidth(txt) * fontSize;
        };

        // Helper to draw text
        const draw = (txt, s, dx, dy) => {
            let fontStyle = 'normal';
            if (s.bold && s.italic) fontStyle = 'bolditalic';
            else if (s.bold) fontStyle = 'bold';
            else if (s.italic) fontStyle = 'italic';

            doc.setFont('helvetica', fontStyle);
            doc.text(txt, dx, dy);

            if (s.underline) {
                const w = doc.getStringUnitWidth(txt) * fontSize;
                doc.setLineWidth(0.5);
                doc.line(dx, dy + 1, dx + w, dy + 1);
            }
        };

        // Flatten segments into lines
        // A line is a list of segments
        // We iterate tokens.

        let lineSegments = [];
        let currentLineWidth = 0;
        let indent = 0;

        const flushLine = () => {
            if (lineSegments.length > 0) {
                let lx = initialX + indent;
                lineSegments.forEach(seg => {
                    draw(seg.text, seg.styles, lx, cursorY);
                    lx += measure(seg.text, seg.styles);
                });
            }
            cursorY += currentLineHeight;
            lineSegments = [];
            currentLineWidth = 0;
            // Indent persists for list items until newline?
            // Actually, if we wrap within an 'li', we should maintain indentation?
            // Simple approach: hanging indent is hard. We'll just reset X to initial + indent.
        };

        segments.forEach(seg => {
            if (seg.isNewline) {
                flushLine();
                indent = 0; // Reset indent on explicit newline (new paragraph/BI)
                // NOTE: If we want bullet indent to persist for wrapped lines, we need logic.
                // But typically newline starts new block. 
                return;
            }

            if (seg.listMarker) {
                // Determine indent based on marker
                // Draw marker immediately at Current X?
                // Or treat marker as part of line but with offset?
                // Let's draw marker at X, and set indent for subsequent text
                indent = 12; // Indent text by 12pt

                // Draw marker at initialX
                draw(seg.listMarker, seg.styles, initialX, cursorY);

                // Don't add marker to lineSegments, we drew it.
                // Set context for following text
                return;
            }

            // Content segment (word or space)
            const w = measure(seg.text, seg.styles);

            // Check wrapping
            // If adding this word exceeds maxWidth...
            if (currentLineWidth + w > (maxWidth - indent)) {
                flushLine();
                // After flush, if we were in a list item (indent set), should we keep indent?
                // Technically yes for hanging indent. But here indent resets in flushLine logic above if we didn't track it.
                // Ideally hanging indent:
                indent = indent > 0 ? indent : 0;
                // Wait, I reset indent=0 in isNewline only. So implicit wrap should KEEP indent.
            }

            // Ignore leading space at start of line
            if (lineSegments.length === 0 && seg.isSpace) return;

            lineSegments.push(seg);
            currentLineWidth += w;
        });

        // Flush remaining
        flushLine();

        return cursorY;
    };



    // --- RENDER CUSTOMER NOTES ---
    let currentNoteY = totalBoxY + 12;
    const noteWidth = contentWidth - 140 - 16;

    // Check if printableNote has actual content (not just empty HTML tags)
    const strippedPrintableNote = printableNote ? printableNote.replace(/<[^>]*>/g, '').trim() : '';

    if (strippedPrintableNote !== '') {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50);
        doc.text("Customer Notes:", margin + 8, currentNoteY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        const heightUsed = renderHtmlToPdf(doc, printableNote, margin + 8, currentNoteY + 12, noteWidth);
        currentNoteY = heightUsed + 15;
    }

    // --- RENDER SPECIAL INSTRUCTIONS ---
    if (normalizedSpecialInstructions && normalizedSpecialInstructions.trim() !== '') {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50);
        doc.text("Special Instructions:", margin + 8, currentNoteY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        renderHtmlToPdf(doc, normalizedSpecialInstructions, margin + 8, currentNoteY + 12, noteWidth);
    }

    // Right Totals Block (Modern)
    const totalsW = 140;
    const totalsX = margin + contentWidth - totalsW;
    const tRowH = 18;

    doc.setDrawColor(200, 200, 200);

    // Labor row
    doc.setFillColor(255, 255, 255);
    doc.rect(totalsX, totalBoxY, totalsW, tRowH, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Labor", totalsX + 8, totalBoxY + 12);
    doc.setTextColor(50, 50, 50);
    doc.text(laborAmount > 0 ? laborAmount.toFixed(2) : "0.00", totalsX + totalsW - 8, totalBoxY + 12, { align: "right" });

    // Subtotal row
    doc.setFillColor(248, 249, 252);
    doc.rect(totalsX, totalBoxY + tRowH, totalsW, tRowH, 'FD');
    doc.setTextColor(100, 100, 100);
    doc.text("Subtotal", totalsX + 8, totalBoxY + tRowH + 12);
    doc.setTextColor(50, 50, 50);
    doc.text(subtotal.toFixed(2), totalsX + totalsW - 8, totalBoxY + tRowH + 12, { align: "right" });

    // Tax row
    doc.setFillColor(255, 255, 255);
    doc.rect(totalsX, totalBoxY + tRowH * 2, totalsW, tRowH, 'FD');
    doc.setTextColor(100, 100, 100);
    doc.text("Tax", totalsX + 8, totalBoxY + tRowH * 2 + 12);
    doc.setTextColor(50, 50, 50);
    doc.text(totalTax.toFixed(2), totalsX + totalsW - 8, totalBoxY + tRowH * 2 + 12, { align: "right" });

    // Total row (highlighted)
    doc.setFillColor(240, 245, 255);
    doc.rect(totalsX, totalBoxY + tRowH * 3, totalsW, tRowH, 'FD');
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 60, 80);
    doc.text("Total", totalsX + 8, totalBoxY + tRowH * 3 + 12);
    doc.text(total.toFixed(2), totalsX + totalsW - 8, totalBoxY + tRowH * 3 + 12, { align: "right" });

    // Balance row (prominent)
    doc.setFillColor(50, 60, 80);
    doc.rect(totalsX, totalBoxY + tRowH * 4, totalsW, tRowH, 'FD');
    doc.setTextColor(255, 255, 255);
    doc.text("Balance Due", totalsX + 8, totalBoxY + tRowH * 4 + 12);
    doc.text(balance.toFixed(2), totalsX + totalsW - 8, totalBoxY + tRowH * 4 + 12, { align: "right" });

    // Bottom Footer: Received By (Modern - Clean)
    let recY = totalBoxY + totalBoxH + 5;

    // Check if we need a new page for the signature section
    if (recY + 30 > pageHeight - 30) {
        doc.addPage();
        recY = 50;
    }

    doc.setFillColor(245, 247, 250);
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, recY, contentWidth, 25, 'FD');
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("RECEIVED BY:", margin + 10, recY + 16);

    // Signature line
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.5);
    doc.line(margin + 90, recY + 18, margin + 250, recY + 18);

    // Date line
    doc.text("DATE:", margin + 280, recY + 16);
    doc.line(margin + 320, recY + 18, margin + 440, recY + 18);

    // Reset
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

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
