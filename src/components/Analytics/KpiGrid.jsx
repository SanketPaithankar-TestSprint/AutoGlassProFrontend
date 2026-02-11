import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, CheckCircle, Clock, FileText } from 'lucide-react';

const KpiGrid = ({ data }) => {
    if (!data) return null;

    const { financial_metrics, job_productivity_metrics, outstanding_balance } = data;

    const kpis = [
        {
            label: 'Total Revenue',
            value: `$${(financial_metrics?.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            trend: financial_metrics?.month_over_month_change,
            icon: DollarSign,
            gradient: 'from-blue-500 to-indigo-600',
            lightBg: 'bg-blue-50/80',
        },
        {
            label: 'Total Paid',
            value: `$${(financial_metrics?.total_paid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            subtitle: `Avg: $${(financial_metrics?.average_job_value || 0).toLocaleString()}`,
            icon: CheckCircle,
            gradient: 'from-emerald-500 to-teal-600',
            lightBg: 'bg-emerald-50/80',
        },
        {
            label: 'Outstanding Balance',
            value: `$${(outstanding_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            subtitle: `Unpaid: $${(financial_metrics?.total_unpaid || 0).toLocaleString()}`,
            icon: Clock,
            gradient: 'from-amber-500 to-orange-600',
            lightBg: 'bg-amber-50/80',
        },
        {
            label: 'Total Jobs Completed',
            value: job_productivity_metrics?.total_jobs_completed || 0,
            subtitle: `This Month: ${job_productivity_metrics?.jobs_this_month || 0}`,
            icon: FileText,
            gradient: 'from-violet-500 to-purple-600',
            lightBg: 'bg-violet-50/80',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {kpis.map((kpi, index) => {
                const Icon = kpi.icon;

                return (
                    <div
                        key={index}
                        className="relative bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden"
                        style={{ boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.06), 0 2px 8px -2px rgba(0, 0, 0, 0.04)' }}
                    >
                        {/* Subtle gradient accent on top */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.gradient} rounded-t-2xl opacity-80`}></div>

                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">{kpi.label}</p>
                                <h3 className="text-2xl font-bold text-slate-800 mb-1">{kpi.value}</h3>
                                {kpi.subtitle && (
                                    <p className="text-xs text-slate-400">{kpi.subtitle}</p>
                                )}
                                {kpi.trend !== undefined && (
                                    <div className="flex items-center gap-1 mt-2">
                                        {kpi.trend >= 0 ? (
                                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                        ) : (
                                            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                                        )}
                                        <span className={`text-xs font-semibold ${kpi.trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {kpi.trend >= 0 ? '+' : ''}{kpi.trend.toFixed(1)}%
                                        </span>
                                        <span className="text-xs text-slate-400">vs last month</span>
                                    </div>
                                )}
                            </div>
                            <div className={`w-11 h-11 bg-gradient-to-br ${kpi.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KpiGrid;
