import React, { useMemo, useState } from "react";
import { message } from "antd";
import CurrencyInput from "../common/CurrencyInput";
import paymentService from "../../services/paymentService";

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

const PAYMENT_TERMS = [
    { label: "Due upon receipt", value: "Due upon receipt" },
    { label: "Net 15", value: "Net 15" },
    { label: "Net 30", value: "Net 30" },
    { label: "Net 45", value: "Net 45" },
    { label: "Net 60", value: "Net 60" },
    { label: "Custom", value: "Custom" }
];

export default function PaymentPanel({ paymentData, setPaymentData, existingPayments = [], totalAmount = 0, onPaymentDeleted = null, paymentTerms = '', onPaymentTermsChange = null, customPaymentTerms = '', onCustomPaymentTermsChange = null }) {
    // Modal state for delete confirmation
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState(null);
    // Function to handle payment deletion
    const handlePaymentDelete = async (paymentId) => {
        try {
            console.log('Starting payment deletion for ID:', paymentId);

            if (!paymentId) {
                message.error('Payment ID not found');
                return;
            }

            // Call the API to delete the payment
            const result = await paymentService.delete(paymentId);
            console.log('Delete response:', result);

            // Notify parent to refresh the payment list
            if (onPaymentDeleted) {
                onPaymentDeleted(paymentId);
            }

            message.success('Payment deleted successfully');
            setIsDeleteModalOpen(false);
            setPaymentToDelete(null);
        } catch (error) {
            console.error('Error deleting payment:', error);
            message.error(error?.message || 'Failed to delete payment');
        }
    };
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
            {/* Payment Summary - MOVED TO TOP */}
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
                                    <th className="px-4 py-2 text-center w-20">Action</th>
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
                                        <td className="px-4 py-2 text-center">
                                            <button
                                                onClick={() => {
                                                    setPaymentToDelete(pay);  // Store full payment object
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="inline-flex items-center justify-center p-1.5 rounded hover:bg-red-50 transition-colors group"
                                                title="Delete Payment"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 text-gray-400 group-hover:text-red-600 transition-colors"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-fade-in">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-red-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Confirm Payment Deletion</h3>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-4">
                                Are you sure you want to delete this payment? This action cannot be undone.
                            </p>

                            {paymentToDelete && (
                                <div className="bg-gray-50 rounded-md p-3 mb-4 border border-gray-200">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500">Amount:</span>
                                            <span className="ml-2 font-semibold text-gray-900">{formatCurrency(paymentToDelete.amount)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Method:</span>
                                            <span className="ml-2 font-medium text-gray-900">
                                                {(PAYMENT_METHODS.find(m => m.value === paymentToDelete.paymentMethod)?.label || paymentToDelete.paymentMethod)?.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-500">Date:</span>
                                            <span className="ml-2 text-gray-900">{formatDate(paymentToDelete.paymentDate || paymentToDelete.createdAt)}</span>
                                        </div>
                                        {paymentToDelete.transactionReference && (
                                            <div className="col-span-2">
                                                <span className="text-gray-500">Reference:</span>
                                                <span className="ml-2 text-gray-900 font-mono text-xs">{paymentToDelete.transactionReference}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setPaymentToDelete(null);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        handlePaymentDelete(paymentToDelete.paymentId || paymentToDelete.id);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                >
                                    Delete Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* New Payment Entry - FULL WIDTH, REDUCED HEIGHT */}
            <div className="w-full bg-white rounded-md border border-gray-200 shadow-sm p-4 animate-fade-in">
                <div className="flex justify-between items-center mb-3 border-b pb-2">
                    <h3 className="text-sm font-bold text-gray-800">Add New Payment</h3>
                    <button
                        onClick={() => updateField('amount', balanceDue)}
                        className="text-xs font-semibold text-violet-600 hover:text-violet-800 underline disabled:opacity-50"
                        disabled={balanceDue <= 0}
                    >
                        Pay Remaining Balance
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                    {/* Payment Terms - Moved here */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">
                            Payment Terms
                        </label>
                        <select
                            value={paymentTerms}
                            onChange={(e) => onPaymentTermsChange && onPaymentTermsChange(e.target.value)}
                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all bg-white"
                        >
                            <option value="">Select Terms</option>
                            {PAYMENT_TERMS.map((term) => (
                                <option key={term.value} value={term.value}>
                                    {term.label}
                                </option>
                            ))}
                        </select>
                        {paymentTerms === 'Custom' && (
                            <input
                                type="text"
                                value={customPaymentTerms}
                                onChange={(e) => onCustomPaymentTermsChange && onCustomPaymentTermsChange(e.target.value)}
                                placeholder="Enter custom terms"
                                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all mt-1"
                            />
                        )}
                    </div>

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

                    {/* Transaction Reference */}
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

                {/* Notes - COMPACT */}
                <div className="mb-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Payment Notes</label>
                        <textarea
                            value={paymentData.notes}
                            onChange={(e) => updateField("notes", e.target.value)}
                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all h-12 resize-none"
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
