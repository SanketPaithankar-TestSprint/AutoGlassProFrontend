import React from 'react';

import { Switch } from 'antd';

export default function InsuranceDetails({ data, onChange, enabled, onToggle }) {
    const handleChange = (field, value) => {
        onChange({
            ...data,
            [field]: value
        });
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-violet-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
                Include Insurance Details
                <Switch
                    size="small"
                    className="ml-2 bg-slate-300"
                    checked={enabled}
                    onChange={onToggle}
                />
            </h4>

            {
                enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* Provider Name */}
                        <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">Provider Name</label>
                            <input
                                type="text"
                                value={data.insuranceProviderName || ''}
                                onChange={(e) => handleChange('insuranceProviderName', e.target.value)}
                                className="w-full h-8 rounded border border-slate-300 px-2 text-xs focus:ring-1 focus:ring-violet-500 outline-none"
                                placeholder="e.g. Geico, State Farm"
                            />
                        </div>

                        {/* Claim Number (Required) */}
                        <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">Claim Number <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={data.claimNumber || ''}
                                onChange={(e) => handleChange('claimNumber', e.target.value)}
                                className={`w-full h-8 rounded border px-2 text-xs focus:ring-1 focus:ring-violet-500 outline-none ${!data.claimNumber ? 'border-amber-300 bg-amber-50' : 'border-slate-300'}`}
                                placeholder="Required"
                            />
                        </div>

                        {/* Policy Number */}
                        <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">Policy Number</label>
                            <input
                                type="text"
                                value={data.policyNumber || ''}
                                onChange={(e) => handleChange('policyNumber', e.target.value)}
                                className="w-full h-8 rounded border border-slate-300 px-2 text-xs focus:ring-1 focus:ring-violet-500 outline-none"
                                placeholder="Policy #"
                            />
                        </div>

                        {/* Deductible */}
                        <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">Deductible ($)</label>
                            <input
                                type="number"
                                value={data.deductibleAmount || ''}
                                onChange={(e) => handleChange('deductibleAmount', e.target.value)}
                                className="w-full h-8 rounded border border-slate-300 px-2 text-xs focus:ring-1 focus:ring-violet-500 outline-none"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Incident Date */}
                        <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">Incident Date</label>
                            <input
                                type="date"
                                value={data.incidentDate || ''}
                                onChange={(e) => handleChange('incidentDate', e.target.value)}
                                className="w-full h-8 rounded border border-slate-300 px-2 text-xs focus:ring-1 focus:ring-violet-500 outline-none"
                            />
                        </div>

                        {/* Odometer */}
                        <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">Odometer</label>
                            <input
                                type="number"
                                value={data.odometerReading || ''}
                                onChange={(e) => handleChange('odometerReading', e.target.value)}
                                className="w-full h-8 rounded border border-slate-300 px-2 text-xs focus:ring-1 focus:ring-violet-500 outline-none"
                                placeholder="Miles"
                            />
                        </div>
                    </div>
                )
            }
        </div >
    );
}
