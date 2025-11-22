import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const GLASS_TYPES = [
  { label: "(All)", value: "" },
  { label: "Windshield", value: "Windshield" },
  { label: "Door Glass", value: "Door Glass" },
  { label: "Rear Glass", value: "Rear Glass" },
  { label: "Quarter Glass", value: "Quarter Glass" },
  { label: "Sunroof / Moonroof", value: "Sunroof / Moonroof" },
];

const newItem = () => ({
  id: crypto.randomUUID(),
  part: "",
  description: "",
  manufacturer: "",
  qty: 1,
  unitPrice: 0,
  taxRate: 0, // per-item tax %
});

export default function InvoiceForm({ prefill, parts, onRemovePart }) {
  // Vehicle / header info
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [body, setBody] = useState("");
  const [glassType, setGlassType] = useState("");
  const [vin, setVin] = useState("");

  // Notes
  const [printableNote, setPrintableNote] = useState("");
  const [internalNote, setInternalNote] = useState("");

  useEffect(() => {
    if (!prefill) return;
    setYear(prefill.year ?? "");
    setMake(prefill.make ?? "");
    setModel(prefill.model ?? "");
    setBody(prefill.body ?? "");
    setVin(prefill.vin ?? "");
  }, [prefill]);

  // Items
  const [items, setItems] = useState([newItem()]);

  // Charges
  const [shipping, setShipping] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState(0); // amount customer already paid

  useEffect(() => {
    if (parts) {
      setItems(
        parts.map((part) => ({
          id: part.code,
          part: part.code,
          description: part.description,
          manufacturer: part.manufacturer || "",
          qty: 1,
          unitPrice: part.price || 0,
          taxRate: 0,
        }))
      );
    }
  }, [parts]);

  const clearVehicle = () => {
    setYear("");
    setMake("");
    setModel("");
    setBody("");
    setGlassType("");
    setVin("");
  };

  const handleAddItem = () => setItems((prev) => [...prev, newItem()]);

  const handleRemoveItem = (id) => {
    onRemovePart?.(id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  // Calculations
  const { subtotal, totalTax } = useMemo(() => {
    let sub = 0;
    let tax = 0;
    for (const it of items) {
      const lineBase = (Number(it.qty) || 0) * (Number(it.unitPrice) || 0);
      sub += lineBase;
      const lineTaxRate = Number(it.taxRate) || 0;
      const lineTax = (lineBase * lineTaxRate) / 100;
      tax += lineTax;
    }
    return { subtotal: sub, totalTax: tax };
  }, [items]);

  const total = useMemo(
    () =>
      Math.max(
        0,
        subtotal + totalTax + (Number(shipping) || 0) - (Number(discount) || 0)
      ),
    [subtotal, totalTax, shipping, discount]
  );

  const numericPayment = Number(payment) || 0;
  const balance = useMemo(
    () => Math.max(0, total - numericPayment),
    [total, numericPayment]
  );

  // Document type based on payment
  let docType = "Invoice";
  if (numericPayment <= 0) {
    docType = "Quote";
  } else if (numericPayment < total) {
    docType = "Work Order";
  } else {
    docType = "Invoice";
  }

  const downloadPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const left = 40;
    const lineGap = 18;

    // Header
    doc.setFontSize(18);
    doc.text(docType.toUpperCase(), left, 40);
    doc.setFontSize(10);
    const now = new Date();
    doc.text(`Date: ${now.toLocaleDateString()}`, left, 60);

    // Vehicle block
    let y = 90;
    doc.setFontSize(12);
    doc.text("Vehicle Information", left, y);
    y += 10;
    doc.setLineWidth(0.5);
    doc.line(left, y, 555, y);
    y += lineGap;

    doc.setFontSize(10);
    const vehRows = [
      ["Year", year || "-"],
      ["Make", make || "-"],
      ["Model", model || "-"],
      ["Body", body || "-"],
      ["Type of Glass", glassType || "-"],
      ["VIN", vin || "-"],
    ];
    vehRows.forEach(([k, v]) => {
      doc.text(`${k}:`, left, y);
      doc.text(String(v), left + 120, y);
      y += lineGap;
    });

    // Items table with per-item tax - FIXED: Correct autoTable usage
    doc.setFontSize(12);
    doc.text("Items", left, y + 10);
    
    autoTable(doc, {
      startY: y + 20,
      head: [
        [
          "Part",
          "Description",
          "Manufacturer",
          "Qty",
          "Unit",
          "Tax %",
          "Amount",
          "Tax",
        ],
      ],
      body: items.map((it) => {
        const qty = Number(it.qty) || 0;
        const unit = Number(it.unitPrice) || 0;
        const lineBase = qty * unit;
        const lineTaxRate = Number(it.taxRate) || 0;
        const lineTax = (lineBase * lineTaxRate) / 100;
        return [
          it.part || "-",
          it.description || "-",
          it.manufacturer || "-",
          String(qty),
          currency(unit),
          `${lineTaxRate || 0}%`,
          currency(lineBase),
          currency(lineTax),
        ];
      }),
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255] },
      theme: "striped",
      columnStyles: {
        3: { halign: "right" },
        4: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "right" },
      },
      margin: { left },
    });

    // FIXED: Access finalY correctly
    const afterTableY = doc.lastAutoTable.finalY + 10;

    // Totals block
    const totalsLeft = 340;
    let yCount = afterTableY;
    
    const row = (label, value, bold = false) => {
      if (bold) doc.setFont(undefined, "bold");
      else doc.setFont(undefined, "normal");
      yCount += lineGap;
      doc.text(label, totalsLeft, yCount);
      doc.text(value, totalsLeft + 160, yCount, {
        align: "right",
      });
    };

    doc.setFontSize(11);
    row("Subtotal:", currency(subtotal));
    row("Tax Total:", currency(totalTax));
    if (Number(shipping)) row("Shipping:", currency(Number(shipping)));
    if (Number(discount)) row("Discount:", `- ${currency(Number(discount))}`);
    row("Total:", currency(total), true);
    row("Payment Received:", currency(numericPayment));
    row("Balance Due:", currency(balance), true);


    // Printable Note
    if (printableNote.trim()) {
      doc.setFontSize(10);
      doc.setFont(undefined, "italic");
      doc.text("Note:", left, yCount + 40);
      doc.setFont(undefined, "normal");
      doc.text(printableNote, left, yCount + 58, { maxWidth: 480 });
      yCount += 30;
    }

    // Footer
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.text("Thank you for your business!", left, yCount + 40);

    doc.save(`${docType.toLowerCase()}_${now.getTime()}.pdf`);
  };

  const handleGenerateAndSend = () => {
    // For now this just generates the PDF.
    // Later you can hook this into an email/send API.
    downloadPdf();
  };

  return (
    <div className="text-slate-100">
      {/* Header row (no Generate button here now) */}
      <div className="flex items-center justify-between mb-4 max-w-7xl">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Invoice</h2>
          <span
            className={`
              inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-medium
              border
              ${
                docType === "Quote"
                  ? "border-sky-500/60 bg-sky-500/10 text-sky-200"
                  : docType === "Work Order"
                  ? "border-amber-400/70 bg-amber-400/10 text-amber-100"
                  : "border-emerald-400/70 bg-emerald-400/10 text-emerald-100"
              }
            `}
          >
            {docType}
          </span>
        </div>
      </div>

      {/* Vehicle info */}
      <div
        className="
          rounded-xl border border-slate-700/80
          bg-slate-900/60
          p-4 md:p-6 mb-6
        "
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-slate-100">
            Vehicle Information
          </h3>
          <button
            onClick={clearVehicle}
            className="
              px-3 py-1.5 text-xs
              rounded-md border border-slate-600
              text-slate-200
              hover:bg-slate-800/80
              transition
            "
          >
            Clear
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField
            label="Year"
            value={year}
            onChange={setYear}
            placeholder="2025"
          />
          <TextField
            label="Make"
            value={make}
            onChange={setMake}
            placeholder="BMW"
          />
          <TextField
            label="Model"
            value={model}
            onChange={setModel}
            placeholder="X3"
          />
          <TextField
            label="Body"
            value={body}
            onChange={setBody}
            placeholder="SUV / MPV"
          />
          <SelectField
            label="Type of Glass"
            value={glassType}
            onChange={setGlassType}
            options={GLASS_TYPES}
          />
          <TextField
            label="VIN"
            value={vin}
            onChange={setVin}
            placeholder="17-character VIN"
          />
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium text-slate-100">Line Items</h3>
          <button
            onClick={handleAddItem}
            className="
              px-3 py-1.5 rounded-md
              bg-slate-800
              text-slate-100 text-sm
              border border-slate-600
              hover:bg-slate-700
              transition
            "
          >
            Add Item
          </button>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs md:text-sm text-slate-400">
                <th className="px-3 py-2">Part</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Manufacturer</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Unit</th>
                <th className="px-3 py-2 text-right">Tax %</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const qty = Number(it.qty) || 0;
                const unit = Number(it.unitPrice) || 0;
                const lineBase = qty * unit;
                const lineTaxRate = Number(it.taxRate) || 0;
                const lineTax = (lineBase * lineTaxRate) / 100;
                return (
                  <tr
                    key={it.id}
                    className="
                      rounded-lg
                      bg-slate-900/60
                      hover:bg-slate-900
                      transition
                    "
                  >
                    <td className="px-3 py-2">
                      <input
                        value={it.part}
                        onChange={(e) =>
                          updateItem(it.id, "part", e.target.value)
                        }
                        placeholder="FW046876YNN"
                        className="
                          h-10 w-44 rounded-md border border-slate-700
                          bg-slate-950/70
                          px-3 text-sm
                          text-slate-100
                          placeholder:text-slate-500
                          outline-none focus:ring-2 focus:ring-violet-500/60
                        "
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={it.description}
                        onChange={(e) =>
                          updateItem(it.id, "description", e.target.value)
                        }
                        placeholder="Windshield (rain/light sensor)..."
                        className="
                          h-10 w-[28rem] max-w-full rounded-md
                          border border-slate-700
                          bg-slate-950/70
                          px-3 text-sm
                          text-slate-100
                          placeholder:text-slate-500
                          outline-none focus:ring-2 focus:ring-violet-500/60
                        "
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={it.manufacturer}
                        onChange={(e) =>
                          updateItem(it.id, "manufacturer", e.target.value)
                        }
                        placeholder="PGW / Pilkington"
                        className="
                          h-10 w-44 rounded-md
                          border border-slate-700
                          bg-slate-950/70
                          px-3 text-sm
                          text-slate-100
                          placeholder:text-slate-500
                          outline-none focus:ring-2 focus:ring-violet-500/60
                        "
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={it.qty}
                        onChange={(e) => updateItem(it.id, "qty", e.target.value)}
                        className="
                          h-10 w-24 rounded-md
                          border border-slate-700
                          bg-slate-950/70
                          px-3 text-sm
                          text-right text-slate-100
                          outline-none focus:ring-2 focus:ring-violet-500/60
                        "
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={it.unitPrice}
                        onChange={(e) =>
                          updateItem(it.id, "unitPrice", e.target.value)
                        }
                        className="
                          h-10 w-28 rounded-md
                          border border-slate-700
                          bg-slate-950/70
                          px-3 text-sm
                          text-right text-slate-100
                          outline-none focus:ring-2 focus:ring-violet-500/60
                        "
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={it.taxRate}
                        onChange={(e) => updateItem(it.id, "taxRate", e.target.value)}
                        className="
                          h-10 w-20 rounded-md
                          border border-slate-700
                          bg-slate-950/70
                          px-3 text-sm
                          text-right text-slate-100
                          outline-none focus:ring-2 focus:ring-violet-500/60
                        "
                        placeholder="0"
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-100">
                      <div className="flex flex-col items-end text-xs md:text-sm">
                        <span>{currency(lineBase)}</span>
                        <span className="text-[11px] text-slate-400">
                          Tax: {currency(lineTax)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleRemoveItem(it.id)}
                        className="
                          px-2 py-1 text-xs md:text-sm
                          rounded-md border border-slate-600
                          text-slate-200
                          hover:bg-slate-800
                          transition
                          disabled:opacity-50
                        "
                        disabled={items.length === 1}
                        title={
                          items.length === 1
                            ? "At least one item is required"
                            : "Remove"
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1">Printable Note (will appear on PDF)</label>
              <textarea
                rows={3}
                value={printableNote}
                onChange={e => setPrintableNote(e.target.value)}
                placeholder="Special instructions, availability, etc. (will be printed)"
                className="rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/60 w-full"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1">Internal Note (not printed)</label>
              <textarea
                rows={3}
                value={internalNote}
                onChange={e => setInternalNote(e.target.value)}
                placeholder="Internal notes, reminders, etc. (not printed)"
                className="rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/60 w-full"
              />
            </div>
          </div>

          <div className="md:justify-self-end w-full md:w-96">
            <div
              className="
                rounded-xl border border-slate-700
                bg-slate-900/60
                p-4 space-y-3
              "
            >
              <Row label="Subtotal" value={currency(subtotal)} />
              <Row label="Tax Total" value={currency(totalTax)} />
              <NumberRow
                label="Shipping"
                value={shipping}
                setter={setShipping}
              />
              <NumberRow
                label="Discount"
                value={discount}
                setter={setDiscount}
              />
              <Row label="Total" value={currency(total)} bold />

              <NumberRow
                label="Payment Received"
                value={payment}
                setter={setPayment}
              />
              <Row label="Balance Due" value={currency(balance)} bold />

              {/* Generate & Send button, with dynamic label */}
              <div className="pt-3 mt-2 flex items-center justify-end">
                {total > 0 && (
                  <button
                    onClick={handleGenerateAndSend}
                    className="
                      px-4 py-2 rounded-lg
                      bg-gradient-to-r from-violet-500 to-fuchsia-500
                      text-white text-sm font-semibold
                      hover:from-violet-400 hover:to-fuchsia-400
                      transition
                      shadow-md shadow-violet-900/50
                    "
                  >
                    Generate &amp; Send {docType}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function TextField({ label, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs md:text-sm text-slate-300 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          h-11 rounded-md
          border border-slate-700
          bg-slate-950/70
          px-3 text-sm text-slate-100
          placeholder:text-slate-500
          outline-none focus:ring-2 focus:ring-violet-500/60
        "
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs md:text-sm text-slate-300 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          h-11 rounded-md
          border border-slate-700
          bg-slate-950/70
          px-3 text-sm text-slate-100
          outline-none focus:ring-2 focus:ring-violet-500/60
        "
      >
        {options.map((o) => (
          <option key={o.label} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Row({ label, value, bold = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm text-slate-300 ${bold ? "font-semibold" : ""}`}>
        {label}
      </span>
      <span className={`text-sm text-slate-100 ${bold ? "font-semibold" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function NumberRow({ label, value, setter }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-sm text-slate-300">{label}</label>
      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => setter(e.target.value)}
        className="
          h-10 w-28 rounded-md
          border border-slate-700
          bg-slate-950/70
          px-3 text-sm
          text-right text-slate-100
          outline-none focus:ring-2 focus:ring-violet-500/60
        "
      />
    </div>
  );
}

// ...existing code...

function currency(n) {
  const num = Number.isFinite(n) ? n : 0;
  return num.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}
