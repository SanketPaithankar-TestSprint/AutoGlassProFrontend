import React, { useEffect, useState } from "react";
import { getValidToken } from "../../api/getValidToken";
import { getServiceDocuments } from "../../api/getServiceDocuments";

const Work = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [workItems, setWorkItems] = useState([]);
    const [expandedDoc, setExpandedDoc] = useState(null);

    useEffect(() => {
        const fetchWork = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = getValidToken();
                if (!token) throw new Error("No token found. Please login.");

                const res = await getServiceDocuments(token);
                const documents = Array.isArray(res) ? res : (res?.data || res?.documents || []);
                setWorkItems(documents);
            } catch (err) {
                setError(err.message || "Failed to fetch work data.");
            } finally {
                setLoading(false);
            }
        };
        fetchWork();
    }, []);

    // Calculate stats from workItems
    const stats = {
        pending: workItems.filter(item => item.status === "pending").length,
        inProgress: workItems.filter(item => item.status === "in_progress").length,
        completed: workItems.filter(item => item.status === "completed").length,
        totalAmount: workItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
    };

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount || 0);
    };

    // Get status badge style
    const getStatusBadge = (status) => {
        const styles = {
            pending: "bg-amber-100 text-amber-700",
            in_progress: "bg-blue-100 text-blue-700",
            completed: "bg-green-100 text-green-700",
            cancelled: "bg-red-100 text-red-700",
        };
        return styles[status] || "bg-gray-100 text-gray-700";
    };

    // Get document type badge
    const getDocTypeBadge = (type) => {
        const styles = {
            quote: "bg-violet-100 text-violet-700",
            invoice: "bg-blue-100 text-blue-700",
            work_order: "bg-green-100 text-green-700",
        };
        return styles[type] || "bg-gray-100 text-gray-700";
    };

    return (
        <div className="max-w-5xl mx-auto h-screen overflow-y-auto px-[5px] md:px-[20px] py-4 pt-20 pb-20">
            <h1 className="text-3xl font-extrabold mb-6 text-violet-700 flex items-center gap-2">
                <span className="inline-block bg-violet-100 text-violet-700 rounded-full px-3 py-1 text-lg font-bold">Work</span>
            </h1>

            {loading ? (
                <div className="text-center py-12 text-lg text-gray-500 animate-pulse">Loading work data...</div>
            ) : error ? (
                <div className="text-center py-12 text-lg text-red-500">{error}</div>
            ) : (
                <div className="space-y-6">
                    {/* Work Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
                            <div className="text-3xl font-bold">{stats.pending}</div>
                            <div className="text-sm opacity-80">Pending</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                            <div className="text-3xl font-bold">{stats.inProgress}</div>
                            <div className="text-sm opacity-80">In Progress</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                            <div className="text-3xl font-bold">{stats.completed}</div>
                            <div className="text-sm opacity-80">Completed</div>
                        </div>
                        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-4 text-white">
                            <div className="text-3xl font-bold">{formatCurrency(stats.totalAmount)}</div>
                            <div className="text-sm opacity-80">Total Value</div>
                        </div>
                    </div>

                    {/* Service Documents List */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800">Service Documents</h2>
                            <span className="text-sm text-gray-500">{workItems.length} documents</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {workItems.length > 0 ? (
                                workItems.map((doc) => (
                                    <div key={doc.documentId} className="bg-white">
                                        {/* Document Header */}
                                        <div
                                            onClick={() => setExpandedDoc(expandedDoc === doc.documentId ? null : doc.documentId)}
                                            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-bold text-gray-900">{doc.documentNumber}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getDocTypeBadge(doc.documentType)}`}>
                                                            {doc.documentType}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(doc.status)}`}>
                                                            {doc.status?.replace("_", " ")}
                                                        </span>
                                                        {doc.serviceLocation && (
                                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                                                                {doc.serviceLocation}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        <span className="font-medium">{doc.customerName}</span>
                                                        <span className="mx-2">•</span>
                                                        <span>{doc.vehicleInfo}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        Scheduled: {formatDateTime(doc.scheduledDate)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="font-bold text-lg text-gray-900">{formatCurrency(doc.totalAmount)}</div>
                                                        {doc.balanceDue > 0 && (
                                                            <div className="text-xs text-amber-600">Due: {formatCurrency(doc.balanceDue)}</div>
                                                        )}
                                                    </div>
                                                    <svg
                                                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedDoc === doc.documentId ? "rotate-180" : ""}`}
                                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {expandedDoc === doc.documentId && (
                                            <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                                                {/* Document Details Grid */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                                                    <div>
                                                        <div className="text-xs text-gray-500 uppercase font-semibold">Document Date</div>
                                                        <div className="text-sm text-gray-900">{formatDate(doc.documentDate)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 uppercase font-semibold">Due Date</div>
                                                        <div className="text-sm text-gray-900">{formatDate(doc.dueDate)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 uppercase font-semibold">Payment Terms</div>
                                                        <div className="text-sm text-gray-900">{doc.paymentTerms || "-"}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 uppercase font-semibold">Assigned To</div>
                                                        <div className="text-sm text-gray-900">{doc.employeeName || doc.userName || "-"}</div>
                                                    </div>
                                                </div>

                                                {/* Items Table */}
                                                {doc.items && doc.items.length > 0 && (
                                                    <div className="mt-2">
                                                        <div className="text-xs text-gray-500 uppercase font-semibold mb-2">Items</div>
                                                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                            <table className="w-full text-sm">
                                                                <thead className="bg-gray-100 text-gray-600">
                                                                    <tr>
                                                                        <th className="text-left px-3 py-2 font-medium">Part</th>
                                                                        <th className="text-right px-3 py-2 font-medium hidden md:table-cell">Part Price</th>
                                                                        <th className="text-right px-3 py-2 font-medium hidden md:table-cell">Labor</th>
                                                                        <th className="text-center px-3 py-2 font-medium">Qty</th>
                                                                        <th className="text-right px-3 py-2 font-medium">Total</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100">
                                                                    {doc.items.map((item, idx) => (
                                                                        <tr key={idx} className="hover:bg-gray-50">
                                                                            <td className="px-3 py-2">
                                                                                <div className="font-medium text-gray-900">{item.partDescription}</div>
                                                                                <div className="text-xs text-gray-500">
                                                                                    {item.nagsGlassId} • {item.prefixCd}/{item.posCd}/{item.sideCd}
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-3 py-2 text-right hidden md:table-cell">{formatCurrency(item.partPrice)}</td>
                                                                            <td className="px-3 py-2 text-right hidden md:table-cell">{formatCurrency(item.laborAmount)}</td>
                                                                            <td className="px-3 py-2 text-center">{item.quantity}</td>
                                                                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.itemTotal)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Totals */}
                                                <div className="mt-4 flex justify-end">
                                                    <div className="w-full md:w-64 space-y-1 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Subtotal</span>
                                                            <span className="text-gray-900">{formatCurrency(doc.subtotal)}</span>
                                                        </div>
                                                        {doc.discountAmount > 0 && (
                                                            <div className="flex justify-between text-green-600">
                                                                <span>Discount</span>
                                                                <span>-{formatCurrency(doc.discountAmount)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Tax ({doc.taxRate}%)</span>
                                                            <span className="text-gray-900">{formatCurrency(doc.taxAmount)}</span>
                                                        </div>
                                                        <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
                                                            <span className="text-gray-900">Total</span>
                                                            <span className="text-gray-900">{formatCurrency(doc.totalAmount)}</span>
                                                        </div>
                                                        {doc.amountPaid > 0 && (
                                                            <div className="flex justify-between text-green-600">
                                                                <span>Paid</span>
                                                                <span>{formatCurrency(doc.amountPaid)}</span>
                                                            </div>
                                                        )}
                                                        {doc.balanceDue > 0 && (
                                                            <div className="flex justify-between font-bold text-amber-600">
                                                                <span>Balance Due</span>
                                                                <span>{formatCurrency(doc.balanceDue)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                    <p className="text-sm">No service documents yet</p>
                                    <p className="text-xs text-gray-400 mt-1">Your quotes and work orders will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-800">Quick Actions</h2>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <a
                                href="/search-by-root"
                                className="flex items-center gap-3 p-4 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-full bg-violet-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">Search Parts</div>
                                    <div className="text-sm text-gray-500">Find glass parts for vehicles</div>
                                </div>
                            </a>
                            <a
                                href="/Order"
                                className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">View Orders</div>
                                    <div className="text-sm text-gray-500">Check your order history</div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Work;
