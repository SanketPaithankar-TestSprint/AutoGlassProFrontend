import React from 'react';
import { useNavigate } from 'react-router-dom';

const RecentActivityTable = ({ data }) => {
    const navigate = useNavigate();

    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center text-slate-400">
                No recent activity
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 shrink-0">
                <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
            </div>
            <div className="overflow-auto flex-1 min-h-0">
                <table className="w-full text-left text-sm text-slate-600 relative">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4">Document</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((item, index) => (
                            <tr
                                key={index}
                                className="hover:bg-slate-50 cursor-pointer transition-colors"
                                onClick={() => navigate(`/quote-details/${item.document_number}`)} // Assuming route
                            >
                                <td className="px-6 py-4 font-medium text-slate-800">#{item.document_number}</td>
                                <td className="px-6 py-4">{new Date(item.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.total_amount)}
                                </td>
                                <td className="px-6 py-4">
                                    {(() => {
                                        const getStatusDetails = (status) => {
                                            const s = Number(status);
                                            switch (s) {
                                                case 0: return { label: 'Draft', className: 'bg-gray-100 text-gray-800' };
                                                case 1: return { label: 'Quoted', className: 'bg-indigo-100 text-indigo-800' };
                                                case 2: return { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' };
                                                case 3: return { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' };
                                                case 4: return { label: 'Scheduled', className: 'bg-blue-100 text-blue-800' };
                                                case 5: return { label: 'In Progress', className: 'bg-purple-100 text-purple-800' };
                                                case 6: return { label: 'Completed', className: 'bg-green-100 text-green-800' };
                                                case 7: return { label: 'Cancelled', className: 'bg-red-100 text-red-800' };
                                                case 8: return { label: 'Sent', className: 'bg-indigo-100 text-indigo-800' };
                                                case 9: return { label: 'Viewed', className: 'bg-indigo-100 text-indigo-800' };
                                                case 10: return { label: 'Partial Paid', className: 'bg-yellow-100 text-yellow-800' };
                                                case 11: return { label: 'Paid', className: 'bg-green-100 text-green-800' };
                                                case 12: return { label: 'Overdue', className: 'bg-red-100 text-red-800' };
                                                case 13: return { label: 'Refunded', className: 'bg-orange-100 text-orange-800' };
                                                case 14: return { label: 'Accepted', className: 'bg-green-100 text-green-800' };
                                                default: return { label: String(status), className: 'bg-gray-100 text-gray-800' };
                                            }
                                        };

                                        const { label, className } = getStatusDetails(item.status);
                                        return (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
                                                {label}
                                            </span>
                                        );
                                    })()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentActivityTable;
