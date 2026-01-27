import React, { useMemo } from "react";
import CurrencyInput from "../common/CurrencyInput";

const PAYMENT_METHODS = [
    { label: "Cash", value: "CASH" },
    { label: "Credit Card", value: "CREDIT_CARD" },
    { label: "Debit Card", value: "DEBIT_CARD" },
    { label: "Check", value: "CHECK" },
    { label: "Insurance Check", value: "INSURANCE_CHECK" },
    { label: "Interac E-Transfer", value: "INTERAC_E_TRANSFER" },
    { label: "Zelle", value: "ZELLE" },
    { label: "Apple Pay", value: "APPLE_PAY" },
    { label: "Wire Transfer", value: "WIRE_TRANSFER" },
    { label: "Other", value: "OTHER" }
];

export default function PaymentPanel({ paymentData, setPaymentData, existingPayments = [], totalAmount = 0 }) {

    // Helper to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    // Calculate totals
    const totalPaid = useMemo(() => {
        return existingPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    }, [existingPayments]);

    const balanceDue = useMemo(() => {
        return Math.max(0, totalAmount - totalPaid);
    }, [totalAmount, totalPaid]);

    // Format Date Helper
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Helper to update a specific field
    const updateField = (field, value) => {
        if (field === 'amount') {
            // Validation: Don't allow entering more than balance due
            // We'll allow typing, but maybe warn or cap?
            // Let's cap it at balanceDue if not 0, but allow user flexibility if needed?
            // "make sure the amount paid cant go above the total" - Strict requirement.

            let numValue = Number(value);
            if (numValue > balanceDue) {
                // Determine if we should hard block or just visual warn?
                // For better UX during typing (e.g. they want to type 100 but type 1 first, balance is 50),
                // it's tricky to hard block strict keystrokes without blocking valid partials.
                // But CurrencyInput usually handles complete values.
                // Let's soft-cap: if they leave the field (blur) or effectively enter > balance, we warn.
                // Or we can just cap it immediately.
                // The request says "cant go above", so capping is safe.
                if (balanceDue > 0) {
                    numValue = balanceDue; // Cap it
                }
            }
            setPaymentData(prev => ({
                ...prev,
                [field]: numValue
            }));
        } else {
            setPaymentData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    // Auto-prefill amount if 0 and there is a balance
    // Use effect removed to avoid infinite loops or overwriting user intent, 
    // but we can add a "Pay Remaining" button.

    return (
        <div className="h-full flex flex-col gap-4">
            {/* Payment Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-col items-center md:items-start">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Amount</span>
                    <span className="text-lg font-bold text-slate-900">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Paid</span>
                    <span className="text-lg font-bold text-emerald-600">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex flex-col items-center md:items-end bg-white px-6 py-2 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Balance Due</span>
                    <span className={`text-xl font-extrabold ${balanceDue > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {formatCurrency(balanceDue)}
                    </span>
                </div>
            </div>

            {/* Existing Payments List */}
            {existingPayments.length > 0 && (
                <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
                    <h3 className="text-sm font-bold text-gray-800 bg-gray-50 px-4 py-2 border-b">Payment History</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
                                <tr>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2">Method</th>
                                    <th className="px-4 py-2">Reference</th>
                                    <th className="px-4 py-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {existingPayments.map((pay, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-2 text-gray-600">{formatDate(pay.paymentDate || pay.createdAt)}</td>
                                        <td className="px-4 py-2 font-medium text-gray-800">
                                            {(PAYMENT_METHODS.find(m => m.value === pay.paymentMethod)?.label || pay.paymentMethod)?.replace('_', ' ')}
                                        </td>
                                        <td className="px-4 py-2 text-gray-500 font-mono text-xs">{pay.transactionReference || "-"}</td>
                                        <td className="px-4 py-2 text-right font-bold text-emerald-600">
                                            {formatCurrency(pay.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* New Payment Entry */}
            <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4 animate-fade-in max-w-2xl">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-sm font-bold text-gray-800">Add New Payment</h3>
                    <button
                        onClick={() => updateField('amount', balanceDue)}
                        className="text-xs font-semibold text-violet-600 hover:text-violet-800 underline disabled:opacity-50"
                        disabled={balanceDue <= 0}
                    >
                        Pay Remaining Balance
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Amount */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">
                            Payment Amount <span className="text-slate-400 font-normal">(Max: {formatCurrency(balanceDue)})</span>
                        </label>
                        <CurrencyInput
                            value={paymentData.amount}
                            onChange={(val) => updateField("amount", val)}
                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                            placeholder="$0.00"
                            max={balanceDue}
                        />
                        {paymentData.amount >= balanceDue && balanceDue > 0 && (
                            <span className="text-[10px] text-green-600 font-medium">Full balance covered</span>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Payment Method</label>
                        <select
                            value={paymentData.paymentMethod}
                            onChange={(e) => updateField("paymentMethod", e.target.value)}
                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all bg-white"
                        >
                            {PAYMENT_METHODS.map((method) => (
                                <option key={method.value} value={method.value}>
                                    {method.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Transaction Reference */}
                <div className="mb-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Transaction Reference / Check #</label>
                        <input
                            type="text"
                            value={paymentData.transactionReference}
                            onChange={(e) => updateField("transactionReference", e.target.value)}
                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                            placeholder="e.g. TXN-123456 or Check #999"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Payment Notes</label>
                        <textarea
                            value={paymentData.notes}
                            onChange={(e) => updateField("notes", e.target.value)}
                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all h-24 resize-none"
                            placeholder="Add any additional notes about this payment..."
                        />
                    </div>
                </div>
            </div>

            <div className="text-xs text-gray-400 px-1">
                Note: Payments added here will be recorded when the document is saved.
            </div>
        </div>
    );
}
