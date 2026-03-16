import React from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const RecentActivityTable = ({ data }) => {
    const { t } = useTranslation();
    
    if (!data || data.length === 0) {
        return (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-4 sm:p-6 h-full flex items-center justify-center"
                style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
                <p className="text-slate-400 text-sm">{t('analytics.noRecentActivity')}</p>
            </div>
        );
    }

    const documentTypeNames = {
        0: { label: t('analytics.invoice'), color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
        1: { label: t('analytics.workOrder'), color: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
        2: { label: t('analytics.quote'), color: 'bg-amber-50 text-amber-700 border border-amber-200' },
    };

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 h-full flex flex-col overflow-hidden"
            style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06)' }}>
            <div className="p-4 sm:p-6 border-b border-slate-100/60">
                <h3 className="text-sm sm:text-base font-bold text-slate-700">{t('analytics.recentActivity')}</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{t('analytics.latestServiceDocuments')}</p>
            </div>

            {/* Mobile/Tablet Card View (< lg screens) */}
            <div className="flex-1 overflow-auto lg:hidden">
                <div className="p-3 sm:p-4 space-y-3">
                    {data.map((activity, index) => {
                        const status = documentTypeNames[activity.document_type] || { label: t('analytics.unknown'), color: 'bg-gray-100 text-gray-600 border border-gray-200' };

                        return (
                            <div
                                key={index}
                                className="bg-slate-50/50 rounded-xl p-3 sm:p-4 border border-slate-100 hover:bg-indigo-50/30 transition-colors duration-200"
                            >
                                {/* First Row: Document # and Status */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">{t('analytics.documentNumber')}</p>
                                        <p className="text-sm font-bold text-slate-700 truncate">{activity.document_number}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Second Row: Amount and Date */}
                                <div className="flex items-end justify-between gap-3 pt-2 border-t border-slate-200/50">
                                    <div className="flex-1">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">{t('analytics.amount')}</p>
                                        <p className="text-sm font-bold text-slate-700">${activity.total_amount.toLocaleString()}</p>
                                    </div>
                                    <div className="flex-1 text-right">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">{t('analytics.created')}</p>
                                        <p className="text-xs text-slate-600">{dayjs(activity.created_at).format('MMM DD, YYYY')}</p>
                                        <p className="text-[10px] text-slate-400">{dayjs(activity.created_at).format('h:mm A')}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Desktop Table View (>= lg screens) */}
            <div className="flex-1 overflow-auto hidden lg:block">
                <table className="w-full">
                    <thead className="bg-slate-50/80 sticky top-0 z-10">
                        <tr>
                            <th className="text-left text-[10px] uppercase tracking-wider font-semibold text-slate-400 px-6 py-3">{t('analytics.documentNumber')}</th>
                            <th className="text-left text-[10px] uppercase tracking-wider font-semibold text-slate-400 px-6 py-3">{t('analytics.status')}</th>
                            <th className="text-right text-[10px] uppercase tracking-wider font-semibold text-slate-400 px-6 py-3">{t('analytics.amount')}</th>
                            <th className="text-right text-[10px] uppercase tracking-wider font-semibold text-slate-400 px-6 py-3">{t('analytics.created')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/60">
                        {data.map((activity, index) => {
                            const status = documentTypeNames[activity.document_type] || { label: t('analytics.unknown'), color: 'bg-gray-100 text-gray-600 border border-gray-200' };

                            return (
                                <tr key={index} className="hover:bg-indigo-50/30 transition-colors duration-200">
                                    <td className="px-6 py-3.5">
                                        <span className="text-sm font-semibold text-slate-700">
                                            {activity.document_number}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                        <span className="text-sm font-bold text-slate-700">
                                            ${activity.total_amount.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                        <span className="text-sm text-slate-500">
                                            {dayjs(activity.created_at).format('MMM DD, YYYY')}
                                        </span>
                                        <div className="text-[10px] text-slate-400">
                                            {dayjs(activity.created_at).format('h:mm A')}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentActivityTable;
