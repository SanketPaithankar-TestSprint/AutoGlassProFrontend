import React from 'react';

const QuoteConversionCard = ({ data }) => {
    if (!data) {
        return (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-6 h-full flex items-center justify-center"
                style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
                <p className="text-slate-400">No quote data available</p>
            </div>
        );
    }

    const { quotes_created, invoices_count, conversion_rate } = data;

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-5 h-full flex flex-col"
            style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
            <h3 className="text-base font-bold text-slate-700 mb-3">Quote Conversion</h3>

            <div className="flex-1 flex flex-col justify-center space-y-4">
                {/* Conversion Rate - Main Metric */}
                <div className="text-center p-5 bg-gradient-to-br from-indigo-50/80 to-violet-50/80 rounded-xl border border-indigo-100/50">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Conversion Rate</p>
                    <p className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{conversion_rate.toFixed(1)}%</p>
                    <p className="text-xs text-slate-400 mt-1">Quote to Invoice</p>
                </div>

                {/* Breakdown Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-slate-50/80 rounded-xl border border-slate-100/50">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Quotes Created</p>
                        <p className="text-xl font-bold text-slate-700">{quotes_created}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50/80 rounded-xl border border-slate-100/50">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Invoices</p>
                        <p className="text-xl font-bold text-slate-700">{invoices_count}</p>
                    </div>
                </div>

                {/* Visual Progress Bar */}
                <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                        <span>Progress</span>
                        <span className="font-medium text-slate-500">{invoices_count} of {quotes_created}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(conversion_rate, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteConversionCard;
