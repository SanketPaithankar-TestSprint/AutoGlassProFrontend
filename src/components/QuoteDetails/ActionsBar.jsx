import React from "react";

/**
 * ActionsBar renders the doc-type dropdown plus Save/Print/Email action buttons.
 */
export default function ActionsBar({
    manualDocType,
    setManualDocType,
    isSaved,
    docMetadata,
    handleSave,
    saveLoading,
    handlePreview,
    previewLoading,
    handleEmail,
    emailLoading,
}) {
    return (
        <div className="flex gap-1">
            <select
                value={manualDocType}
                onChange={(e) => setManualDocType(e.target.value)}
                disabled={isSaved && docMetadata?.documentType === 'INVOICE'}
                className={`flex-1 px-2 py-1 text-[10px] font-medium border border-slate-300 rounded bg-white text-slate-700 outline-none ${isSaved && docMetadata?.documentType === 'INVOICE' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <option value="Quote">Quote</option>
                <option value="Work Order">W.Order</option>
                <option value="Invoice">Invoice</option>
            </select>
            <button
                onClick={handleSave}
                disabled={saveLoading}
                className="flex-1 px-3 py-1.5 rounded !bg-green-500 text-white text-[11px] font-bold !hover:bg-green-600 transition shadow-sm disabled:opacity-50"
            >
                {saveLoading ? '...' : 'Save'}
            </button>
            <button
                onClick={handlePreview}
                disabled={previewLoading}
                className="flex-1 px-3 py-1.5 rounded !bg-[#3B82F6] text-white text-[11px] font-medium !hover:bg-[#7E5CFE] hover:text-white transition shadow-sm disabled:opacity-50"
                title="Preview PDF"
            >
                {previewLoading ? '...' : 'Print'}
            </button>
            <button
                onClick={handleEmail}
                disabled={emailLoading}
                className="flex-1 px-3 py-1.5 rounded !bg-[#3B82F6] text-white text-[11px] font-medium !hover:bg-[#7E5CFE] hover:text-white transition shadow-sm disabled:opacity-50"
                title="Send via email"
            >
                {emailLoading ? '...' : 'Email'}
            </button>
        </div>
    );
}
