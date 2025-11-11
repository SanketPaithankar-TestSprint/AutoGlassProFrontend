import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
});

export default function InvoiceForm({ prefill, parts, onRemovePart })
{
    // Vehicle / header info (now controlled by prefill when provided)
    const [year, setYear] = useState("");
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [body, setBody] = useState("");
    const [glassType, setGlassType] = useState("");
    const [vin, setVin] = useState("");

    // Pull values from prefill whenever it changes
    useEffect(() =>
    {
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
    const [taxRate, setTaxRate] = useState(0);
    const [shipping, setShipping] = useState(0);
    const [discount, setDiscount] = useState(0);

    useEffect(() =>
    {
        if (parts)
        {
            setItems(parts.map((part) => ({
                id: part.code,
                part: part.code,
                description: part.description,
                manufacturer: part.manufacturer || "",
                qty: 1,
                unitPrice: part.price || 0,
            })));
        }
    }, [parts]);

    const clearVehicle = () =>
    {
        setYear("");
        setMake("");
        setModel("");
        setBody("");
        setGlassType("");
        setVin("");
    };

    const handleAddItem = () => setItems((prev) => [...prev, newItem()]);
    const handleRemoveItem = (id) =>
    {
        onRemovePart?.(id); // Notify parent to remove the part
        setItems((prev) => prev.filter((it) => it.id !== id));
    };

    const updateItem = (id, field, value) =>
    {
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
    };

    const subtotal = useMemo(
        () => items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0),
        [items]
    );
    const taxAmount = useMemo(() => (subtotal * (Number(taxRate) || 0)) / 100, [subtotal, taxRate]);
    const total = useMemo(
        () => Math.max(0, subtotal + taxAmount + (Number(shipping) || 0) - (Number(discount) || 0)),
        [subtotal, taxAmount, shipping, discount]
    );

    const downloadPdf = () =>
    {
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const left = 40;
        const lineGap = 18;

        // Header
        doc.setFontSize(18);
        doc.text("INVOICE", left, 40);
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
        vehRows.forEach(([k, v]) =>
        {
            doc.text(`${k}:`, left, y);
            doc.text(String(v), left + 120, y);
            y += lineGap;
        });

        // Items table
        doc.setFontSize(12);
        doc.text("Items", left, y + 10);
        doc.autoTable({
            startY: y + 20,
            head: [["Part", "Description", "Manufacturer", "Qty", "Unit", "Amount"]],
            body: items.map((it) => [
                it.part || "-",
                it.description || "-",
                it.manufacturer || "-",
                String(it.qty || 0),
                currency(Number(it.unitPrice) || 0),
                currency((Number(it.qty) || 0) * (Number(it.unitPrice) || 0)),
            ]),
            styles: { fontSize: 9, cellPadding: 6 },
            headStyles: { fillColor: false, textColor: 20 },
            theme: "striped",
            columnStyles: { 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" } },
            margin: { left },
        });

        const afterTableY = doc.lastAutoTable.finalY + 10;

        // Totals block
        const totalsLeft = 340;
        const row = (label, value, bold = false) =>
        {
            if (bold) doc.setFont(undefined, "bold");
            else doc.setFont(undefined, "normal");
            doc.text(label, totalsLeft, (yCount += lineGap));
            doc.text(value, totalsLeft + 160, yCount, { align: "right" });
        };

        let yCount = afterTableY;
        doc.setFontSize(11);
        row("Subtotal:", currency(subtotal));
        row(`Tax (${Number(taxRate) || 0}%):`, currency(taxAmount));
        if (Number(shipping)) row("Shipping:", currency(Number(shipping)));
        if (Number(discount)) row("Discount:", `- ${currency(Number(discount))}`);
        row("Total:", currency(total), true);

        // Footer
        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        doc.text("Thank you for your business!", left, yCount + 40);

        doc.save(`invoice_${now.getTime()}.pdf`);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4 max-w-7xl">
                <h2 className="text-lg font-semibold">Invoice</h2>
                <button
                    onClick={downloadPdf}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                    Generate PDF
                </button>
            </div>

            {/* Vehicle info */}
            <div className="rounded-xl border p-4 md:p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-medium">Vehicle Information</h3>
                    <button
                        onClick={clearVehicle}
                        className="px-3 py-1.5 text-gray-50n text-sm rounded-md border hover:bg-gray-50"
                    >
                        Clear
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextField label="Year" value={year} onChange={setYear} placeholder="2025" />
                    <TextField label="Make" value={make} onChange={setMake} placeholder="BMW" />
                    <TextField label="Model" value={model} onChange={setModel} placeholder="X3" />
                    <TextField label="Body" value={body} onChange={setBody} placeholder="SUV / MPV" />
                    <SelectField label="Type of Glass" value={glassType} onChange={setGlassType} options={GLASS_TYPES} />
                    <TextField label="VIN" value={vin} onChange={setVin} placeholder="17-character VIN" />
                </div>
            </div>

            {/* Items */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-medium">Line Items</h3>
                    <button
                        onClick={handleAddItem}
                        className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                        Add Item
                    </button>
                </div>

                <div className="overflow-auto">
                    <table className="min-w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-left text-sm text-gray-500">
                                <th className="px-3 py-2">Part</th>
                                <th className="px-3 py-2">Description</th>
                                <th className="px-3 py-2">Manufacturer</th>
                                <th className="px-3 py-2 text-right">Qty</th>
                                <th className="px-3 py-2 text-right">Unit</th>
                                <th className="px-3 py-2 text-right">Amount</th>
                                <th className="px-3 py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((it) =>
                            {
                                const amount = (Number(it.qty) || 0) * (Number(it.unitPrice) || 0);
                                return (
                                    <tr key={it.id} className="bg-gray-50 rounded-lg">
                                        <td className="px-3 py-2">
                                            <input
                                                value={it.part}
                                                onChange={(e) => updateItem(it.id, "part", e.target.value)}
                                                placeholder="FW046876YNN"
                                                className="h-10 w-44 rounded-md border px-3 outline-none focus:ring-2 focus:ring-indigo-200"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                value={it.description}
                                                onChange={(e) => updateItem(it.id, "description", e.target.value)}
                                                placeholder="Windshield (rain/light sensor)..."
                                                className="h-10 w-[28rem] max-w-full rounded-md border px-3 outline-none focus:ring-2 focus:ring-indigo-200"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                value={it.manufacturer}
                                                onChange={(e) => updateItem(it.id, "manufacturer", e.target.value)}
                                                placeholder="PGW / Pilkington"
                                                className="h-10 w-44 rounded-md border px-3 outline-none focus:ring-2 focus:ring-indigo-200"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={it.qty}
                                                onChange={(e) => updateItem(it.id, "qty", e.target.value)}
                                                className="h-10 w-24 rounded-md border px-3 text-right outline-none focus:ring-2 focus:ring-indigo-200"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={it.unitPrice}
                                                onChange={(e) => updateItem(it.id, "unitPrice", e.target.value)}
                                                className="h-10 w-28 rounded-md border px-3 text-right outline-none focus:ring-2 focus:ring-indigo-200"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-right font-medium">{currency(amount)}</td>
                                        <td className="px-3 py-2 text-right">
                                            <button
                                                onClick={() => handleRemoveItem(it.id)}
                                                className="px-2 py-1 text-sm rounded-md border hover:bg-white/70 disabled:opacity-50"
                                                disabled={items.length === 1}
                                                title={items.length === 1 ? "At least one item is required" : "Remove"}
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
                    <div>
                        <Notes />
                    </div>

                    <div className="md:justify-self-end w-full md:w-96">
                        <div className="bg-gray-50 rounded-xl border p-4 space-y-3">
                            <Row label="Subtotal" value={currency(subtotal)} />
                            <NumberRow label="Tax (%)" value={taxRate} setter={setTaxRate} />
                            <Row label="Tax Amount" value={currency(taxAmount)} />
                            <NumberRow label="Shipping" value={shipping} setter={setShipping} />
                            <NumberRow label="Discount" value={discount} setter={setDiscount} />
                            <div className="border-t pt-3 mt-2 flex items-center justify-between">
                                <span className="text-base font-semibold">Total</span>
                                <span className="text-xl font-semibold">{currency(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------- helpers ---------- */

function TextField({ label, value, onChange, placeholder })
{
    return (
        <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">{label}</label>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-11 rounded-md border px-3 outline-none focus:ring-2 focus:ring-indigo-200"
            />
        </div>
    );
}

function SelectField({ label, value, onChange, options })
{
    return (
        <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-11 rounded-md border px-3 outline-none focus:ring-2 focus:ring-indigo-200"
            >
                {options.map((o) => (
                    <option key={o.label} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    );
}

function Row({ label, value })
{
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="text-sm font-medium">{value}</span>
        </div>
    );
}

function NumberRow({ label, value, setter })
{
    return (
        <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">{label}</label>
            <input
                type="number"
                min="0"
                step="0.01"
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="h-10 w-28 rounded-md border px-3 text-right outline-none focus:ring-2 focus:ring-indigo-200"
            />
        </div>
    );
}

function Notes()
{
    const [notes, setNotes] = useState("");
    return (
        <div className="flex flex-col h-full">
            <label className="text-sm text-gray-600 mb-1">Notes / Messages</label>
            <textarea
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Availability notes, special instructions, etc."
                className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
            />
        </div>
    );
}

function currency(n)
{
    const num = Number.isFinite(n) ? n : 0;
    return num.toLocaleString(undefined, { style: "currency", currency: "USD" });
}
