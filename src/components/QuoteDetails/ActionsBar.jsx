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
        <div className="flex flex-row sm:justify-end gap-2 sm:gap-3 w-full pt-1">
            <select
                value={manualDocType}
                onChange={(e) => setManualDocType(e.target.value)}
                disabled={isSaved && docMetadata?.documentType === 'INVOICE'}
                className={`flex-[1.5] sm:flex-none sm:w-36 px-2 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-[11px] font-medium border border-slate-300 rounded bg-white text-slate-700 outline-none shadow-sm focus:ring-2 focus:ring-blue-100 transition-shadow ${isSaved && docMetadata?.documentType === 'INVOICE' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <option value="Quote">Quote</option>
                <option value="Work Order">Work Order</option>
                <option value="Invoice">Invoice</option>
            </select>
            <button
                onClick={handleSave}
                disabled={saveLoading}
                className="flex-1 sm:flex-none sm:w-auto min-w-[70px] sm:min-w-[100px] px-2 sm:px-6 py-2 sm:py-1.5 rounded !bg-green-500 text-white text-xs sm:text-[11px] font-bold !hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1"
            >
                {saveLoading ? 'Saving...' : 'Save'}
            </button>
            <button
                onClick={handlePreview}
                disabled={previewLoading}
                className="flex-1 sm:flex-none sm:w-auto min-w-[70px] sm:min-w-[100px] px-2 sm:px-6 py-2 sm:py-1.5 rounded !bg-[#3B82F6] text-white text-xs sm:text-[11px] font-medium !hover:bg-[#7E5CFE] hover:text-white transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1"
                title="Preview PDF"
            >
                {previewLoading ? 'Printing...' : 'Print'}
            </button>
            <button
                onClick={handleEmail}
                disabled={emailLoading}
                className="flex-1 sm:flex-none sm:w-auto min-w-[70px] sm:min-w-[100px] px-2 sm:px-6 py-2 sm:py-1.5 rounded !bg-[#3B82F6] text-white text-xs sm:text-[11px] font-medium !hover:bg-[#7E5CFE] hover:text-white transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1"
                title="Send via email"
            >
                {emailLoading ? 'Emailing...' : 'Email'}
            </button>
        </div>
    );
}
