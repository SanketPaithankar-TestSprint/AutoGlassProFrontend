import React, { useState } from "react";
import CustomerPanel from "./CustomerPanel";
import QuotePanel from "./QuotePanel";

export default function QuoteDetails({ prefill, parts, onRemovePart }) {
    const [panel, setPanel] = useState("customer");
    const [canShowQuotePanel, setCanShowQuotePanel] = useState(false);
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
                    className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-all duration-150 ${panel === 'quote' && canShowQuotePanel ? 'border-violet-500 text-violet-700 bg-white' : 'border-transparent text-slate-400 bg-slate-50 cursor-not-allowed'}`}
                    onClick={() => canShowQuotePanel && setPanel('quote')}
                    disabled={!canShowQuotePanel}
                >
                    Quote Information
                </button>
            </div>
            {panel === 'customer' && <CustomerPanel prefill={prefill} setCanShowQuotePanel={setCanShowQuotePanel} setPanel={setPanel} />}
            {panel === 'quote' && canShowQuotePanel && <QuotePanel parts={parts} onRemovePart={onRemovePart} />}
        </div>
    );
}
