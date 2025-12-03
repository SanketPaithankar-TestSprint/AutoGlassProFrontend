import React, { useState } from "react";
import CustomerPanel from "./CustomerPanel";
import QuotePanel from "./QuotePanel";

export default function QuoteDetails({ prefill, parts, onRemovePart }) {
    const [panel, setPanel] = useState("customer");
    return (
        <div className="text-slate-900">
            <div className="flex justify-center gap-4 mb-6">
                <button
                    className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-all duration-150 ${panel === 'customer' ? 'border-violet-500 text-violet-700 bg-white' : 'border-transparent text-slate-400 bg-slate-50'}`}
                    onClick={() => setPanel('customer')}
                >
                    Customer Information
                </button>
                <button
                    className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-all duration-150 ${panel === 'quote' ? 'border-violet-500 text-violet-700 bg-white' : 'border-transparent text-slate-400 bg-slate-50'}`}
                    onClick={() => setPanel('quote')}
                >
                    Quote Information
                </button>
            </div>
            {panel === 'customer' && <CustomerPanel prefill={prefill} />}
            {panel === 'quote' && <QuotePanel parts={parts} onRemovePart={onRemovePart} />}
        </div>
    );
}
