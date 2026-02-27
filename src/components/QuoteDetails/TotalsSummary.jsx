import React, { useMemo } from "react";

function currency(n) {
    const num = Number.isFinite(n) ? n : 0;
    return num.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

/**
 * TotalsSummary renders the totals table: Labor, Subtotal, Tax, Total (editable), Paid, Balance.
 */
export default function TotalsSummary({
    laborCostDisplay,
    subtotal,
    totalTax,
    globalTaxRate,
    total,
    manualTotal,
    setManualTotal,
    applyTotalAdjustment,
    handleRoundUp,
    totalPaid,
    balance,
}) {
    return (
        <table className="w-full sm:w-auto text-xs sm:text-sm rounded-xl overflow-hidden bg-slate-50/50 min-w-[280px]">
            <tbody>
                {/* Labor Row */}
                <tr>
                    <td className="px-2 py-1 text-slate-600">Labor</td>
                    <td className="px-2 py-1 text-right text-slate-900">{currency(laborCostDisplay)}</td>
                </tr>
                {/* Subtotal Row */}
                <tr>
                    <td className="px-2 py-1 text-slate-600">Subtotal</td>
                    <td className="px-2 py-1 text-right text-slate-900">{currency(subtotal)}</td>
                </tr>
                {/* Tax Row */}
                <tr>
                    <td className="px-2 py-1 text-slate-600">Tax ({globalTaxRate}%)</td>
                    <td className="px-2 py-1 text-right text-slate-900">{currency(totalTax)}</td>
                </tr>
                {/* Total Row */}
                <tr className="bg-slate-50">
                    <td className="px-2 py-1 font-semibold text-slate-700">
                        <div className="flex items-center gap-1">
                            Total
                            <button
                                onClick={handleRoundUp}
                                className="w-4 h-4 flex items-center justify-center bg-sky-100 hover:bg-sky-200 text-sky-600 rounded text-[10px] font-bold"
                                title="Round Up"
                            >↑</button>
                        </div>
                    </td>
                    <td className="px-2 py-1 text-right font-bold text-slate-900">
                        <input
                            type="text"
                            value={manualTotal !== null ? `$${manualTotal}` : currency(total)}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                setManualTotal(val);
                            }}
                            onBlur={() => {
                                if (manualTotal !== null && manualTotal !== '') {
                                    const newTotal = parseFloat(manualTotal);
                                    applyTotalAdjustment(newTotal);
                                } else if (manualTotal === '') {
                                    setManualTotal(null);
                                }
                            }}
                            className="w-full text-right bg-transparent text-sm font-bold text-slate-900 outline-none border-b border-transparent hover:border-slate-300 focus:border-sky-400"
                        />
                    </td>
                </tr>
                <tr>
                    <td className="px-2 py-1 text-slate-600">Paid</td>
                    <td className="px-2 py-1 text-right text-slate-900 font-medium">{currency(totalPaid)}</td>
                </tr>
                {/* Balance Row */}
                <tr className="bg-slate-50">
                    <td className="px-2 py-1 font-semibold text-slate-700">Balance</td>
                    <td className="px-2 py-1 text-right font-bold text-slate-900">{currency(balance)}</td>
                </tr>
            </tbody>
        </table>
    );
}
