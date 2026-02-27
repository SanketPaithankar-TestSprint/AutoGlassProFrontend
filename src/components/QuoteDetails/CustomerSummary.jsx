import React from "react";

/**
 * CustomerSummary renders the vendor pricing data and document metadata section.
 */
export default function CustomerSummary({ items, docMetadata, formatDate }) {
    return (
        <div className="flex flex-col gap-2 flex-1 lg:order-1">
            {/* Vendor Pricing Data Display */}
            {items.filter(it => it.vendorData).length > 0 && (
                <div className="space-y-1">
                    {items.filter(it => it.vendorData).map((item) => {
                        const vendorData = item.vendorData;
                        let colorClass = 'text-slate-600';
                        const availability = vendorData.availability?.toLowerCase();
                        if (availability === 'green') colorClass = 'text-green-600';
                        else if (availability === 'blue') colorClass = 'text-blue-600';
                        else if (availability === 'red') colorClass = 'text-red-600';
                        else if (availability === 'yellow') colorClass = 'text-yellow-600';

                        return (
                            <div key={item.id} className={`text-xs font-medium ${colorClass}`}>
                                {vendorData.industryCode && <>IndustryCode: {vendorData.industryCode} • </>}
                                Price: ${item.unitPrice} •
                                {vendorData.leadTime && <>LeadTime: {vendorData.leadTime} • </>}
                                Manufacturer: {vendorData.manufacturer || 'Pilkington'}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Document Metadata */}
            {docMetadata && (
                <div className="flex flex-col gap-2 mt-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-sky-700 font-bold uppercase tracking-wider mb-0.5">Document #</span>
                        <span className="font-mono text-lg font-bold text-slate-800">{docMetadata.documentNumber}</span>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                        <span className="uppercase text-[10px] font-bold text-slate-400 tracking-wider self-center">Created</span>
                        <span className="font-medium text-slate-700">{formatDate(docMetadata.createdAt)}</span>
                        <span className="uppercase text-[10px] font-bold text-slate-400 tracking-wider self-center">Updated</span>
                        <span className="font-medium text-slate-700">{formatDate(docMetadata.updatedAt)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
