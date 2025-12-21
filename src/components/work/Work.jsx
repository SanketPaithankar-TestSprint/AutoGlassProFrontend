import React, { useEffect, useState } from "react";
import { Button, Tooltip, Empty, App, Modal } from "antd";
import {
    PlusOutlined,
    FilePdfOutlined,
    MailOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    DollarOutlined,
    FileDoneOutlined,
    EditOutlined,
    ReloadOutlined,
    SwapOutlined
} from "@ant-design/icons";
import { getValidToken } from "../../api/getValidToken";
import { getServiceDocuments } from "../../api/getServiceDocuments";
import { deleteServiceDocument } from "../../api/deleteServiceDocument";
import { acceptServiceDocument } from "../../api/acceptServiceDocument";
import { completeServiceDocument } from "../../api/completeServiceDocument";
import { generateAndDownloadPDF, generatePDFFilename } from "../../utils/serviceDocumentPdfGenerator";
import { convertToWorkOrder } from "../../api/convertToWorkOrder";
import { convertToInvoice } from "../../api/convertToInvoice";
import CreateServiceDocumentModal from "./CreateServiceDocumentModal";
import PaymentModal from "./PaymentModal";
import EmailDocumentModal from "./EmailDocumentModal";
import EditDocumentModal from "./EditDocumentModal";
import { getAttachmentsByDocumentNumber } from "../../api/getAttachmentsByDocumentNumber";
import { deleteAttachment } from "../../api/deleteAttachment";

const Work = () => {
    const { modal, message } = App.useApp();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [workItems, setWorkItems] = useState([]);
    const [expandedDoc, setExpandedDoc] = useState(null);
    const [attachmentsCache, setAttachmentsCache] = useState({});
    const [attachmentsLoading, setAttachmentsLoading] = useState({});

    // Preview Modal State
    const [previewAttachment, setPreviewAttachment] = useState(null);



    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [paymentModalState, setPaymentModalState] = useState({ open: false, docId: null, balance: 0 });
    const [emailModalState, setEmailModalState] = useState({ open: false, docId: null, email: "" });
    const [editModalState, setEditModalState] = useState({ open: false, document: null });

    const fetchWork = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getValidToken();
            if (!token) throw new Error("No token found. Please login.");

            const res = await getServiceDocuments(token);
            const documents = Array.isArray(res) ? res : (res?.data || res?.documents || []);
            // Sort by createdAt descending
            documents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setWorkItems(documents);
        } catch (err) {
            setError(err.message || "Failed to fetch work data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = "APAI | Work";
        fetchWork();
    }, []);

    // Action Handlers
    const handleDelete = (docId) => {
        console.log('Delete called for document:', docId);
        modal.confirm({
            title: 'Delete Document',
            content: 'Are you sure you want to delete this document? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    console.log('Calling deleteServiceDocument API for:', docId);
                    await deleteServiceDocument(docId);
                    console.log('Delete successful, refreshing data...');
                    message.success('Document deleted successfully');
                    fetchWork();
                    if (expandedDoc === docId) setExpandedDoc(null);
                } catch (err) {
                    console.error('Delete failed:', err);
                    message.error('Failed to delete: ' + err.message);
                }
            }
        });
    };

    const handleAccept = async (docId, e) => {
        e.stopPropagation();
        try {
            await acceptServiceDocument(docId);
            message.success('Document accepted');
            fetchWork();
        } catch (err) {
            message.error('Failed to accept: ' + err.message);
        }
    };

    const handleComplete = async (docId, e) => {
        e.stopPropagation();
        try {
            await completeServiceDocument(docId);
            message.success('Document marked as completed');
            fetchWork();
        } catch (err) {
            message.error('Failed to complete: ' + err.message);
        }
    };

    const handleConvertToWorkOrder = (docNumber, e) => {
        e.stopPropagation();
        modal.confirm({
            title: 'Convert to Work Order',
            content: 'Are you sure you want to convert this Quote to a Work Order? This action cannot be undone.',
            okText: 'Convert',
            okType: 'primary',
            onOk: async () => {
                try {
                    await convertToWorkOrder(docNumber);
                    message.success('Document converted to Work Order');
                    fetchWork();
                } catch (err) {
                    message.error('Failed to convert: ' + err.message);
                }
            }
        });
    };

    const handleConvertToInvoice = (docNumber, e) => {
        e.stopPropagation();
        modal.confirm({
            title: 'Convert to Invoice',
            content: 'Are you sure you want to convert this Work Order to an Invoice? This action cannot be undone.',
            okText: 'Convert',
            okType: 'primary',
            onOk: async () => {
                try {
                    await convertToInvoice(docNumber);
                    message.success('Document converted to Invoice');
                    fetchWork();
                } catch (err) {
                    message.error('Failed to convert: ' + err.message);
                }
            }
        });
    };

    const handleExportPdf = async (documentNumber, e) => {
        e.stopPropagation();
        try {
            // Find the document in workItems
            const doc = workItems.find(d => d.documentNumber === documentNumber);
            if (!doc) {
                message.error('Document not found');
                return;
            }

            // Prepare data for PDF generator - split each item into Part row + Labor row
            const splitItems = [];
            (doc.items || []).forEach((item, index) => {
                const itemId = `item_${index + 1}`;

                // Row 1: The Part
                splitItems.push({
                    id: itemId,
                    qty: item.quantity || 1,
                    nagsId: item.nagsGlassId || "",
                    oemId: "",
                    description: item.partDescription || "",
                    unitPrice: item.partPrice || 0,
                    amount: item.partPrice || 0,
                    labor: 0,
                    type: "Part"
                });

                // Row 2: The Labor (only if laborRate exists)
                if (item.laborRate && item.laborRate > 0) {
                    splitItems.push({
                        id: `${itemId}_LABOR`,
                        qty: 1,
                        nagsId: "",
                        oemId: "",
                        description: `Installation Labor - ${item.partDescription || "Glass Part"}`,
                        unitPrice: item.laborRate || 0,
                        amount: item.laborRate || 0,
                        labor: item.laborHours || 0,
                        type: "Labor"
                    });
                }
            });

            const pdfData = {
                items: splitItems,
                customerData: {
                    customerId: doc.customerId,
                    firstName: doc.customerName?.split(' ')[0] || "",
                    lastName: doc.customerName?.split(' ').slice(1).join(' ') || "",
                    addressLine1: "",
                    addressLine2: "",
                    city: "",
                    state: "",
                    postalCode: "",
                    vehicleYear: doc.vehicleInfo?.split(' ')[0] || "",
                    vehicleMake: doc.vehicleInfo?.split(' ')[1] || "",
                    vehicleModel: doc.vehicleInfo?.split(' ').slice(2).join(' ') || "",
                    vin: ""
                },
                userProfile: JSON.parse(localStorage.getItem('agp_profile_data') || '{}'),
                subtotal: doc.subtotal || 0,
                totalTax: doc.taxAmount || 0,
                totalHours: doc.items?.reduce((sum, item) => sum + (item.laborHours || 0), 0) || 0,
                discountAmount: doc.discountAmount || 0,
                total: doc.totalAmount || 0,
                balance: doc.balanceDue || 0,
                docType: doc.documentType === "QUOTE" ? "Quote" : doc.documentType === "INVOICE" ? "Invoice" : "Work Order",
                printableNote: doc.notes || ""
            };

            // Generate and download PDF
            generateAndDownloadPDF(pdfData);
            message.success('PDF downloaded successfully');
        } catch (err) {
            console.error('PDF generation error:', err);
            message.error('Failed to generate PDF: ' + err.message);
        }
    };

    const openPaymentModal = (docId, balance, e) => {
        e.stopPropagation();
        setPaymentModalState({ open: true, docId, balance });
    };

    const openEmailModal = (docNum, email, e) => {
        e.stopPropagation();
        setEmailModalState({ open: true, docId: docNum, email });
    };

    const handleEdit = (documentNumber, e) => {
        e.stopPropagation();
        const doc = workItems.find(d => d.documentNumber === documentNumber);
        setEditModalState({ open: true, document: doc });
    };

    const handleDeleteAttachment = async (attachmentId, docNumber) => {
        try {
            await deleteAttachment(attachmentId);
            message.success("Attachment deleted successfully");

            // Update cache to remove the deleted item
            setAttachmentsCache(prev => ({
                ...prev,
                [docNumber]: prev[docNumber].filter(a => a.attachmentId !== attachmentId)
            }));
        } catch (err) {
            message.error("Failed to delete attachment");
        }
    };

    // Calculate stats
    const stats = {
        pending: workItems.filter(item => item.status?.toLowerCase() === "pending").length,
        inProgress: workItems.filter(item =>
            ["in_progress", "accepted", "in progress"].includes(item.status?.toLowerCase())
        ).length,
        completed: workItems.filter(item =>
            ["completed", "paid"].includes(item.status?.toLowerCase())
        ).length,
        totalAmount: workItems
            .filter(item => item.status?.toLowerCase() !== "cancelled")
            .reduce((sum, item) => sum + (item.totalAmount || 0), 0)
    };

    // Helpers
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);
    };

    const getStatusBadge = (status) => {
        const normalizedStatus = status?.toLowerCase().replace(/ /g, '_');
        const styles = {
            pending: "bg-amber-100 text-amber-700 border-amber-200",
            in_progress: "bg-blue-100 text-blue-700 border-blue-200",
            accepted: "bg-blue-100 text-blue-700 border-blue-200",
            completed: "bg-green-100 text-green-700 border-green-200",
            paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
            cancelled: "bg-red-100 text-red-700 border-red-200",
        };
        return styles[normalizedStatus] || "bg-gray-100 text-gray-700 border-gray-200";
    };

    const getDocTypeBadge = (type) => {
        const normalizedType = type?.toLowerCase().replace(/ /g, '_');
        const styles = {
            quote: "bg-violet-100 text-violet-700 border-violet-200",
            invoice: "bg-cyan-100 text-cyan-700 border-cyan-200",
            work_order: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
        };
        return styles[normalizedType] || "bg-gray-100 text-gray-700 border-gray-200";
    };

    return (
        <div className="max-w-6xl mx-auto h-screen overflow-y-auto px-4 md:px-8 py-6 pt-24 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Work Management</h1>
                    <p className="text-gray-500 mt-1">Manage quotes, work orders, and invoices</p>
                </div>
                <div className="flex gap-2">
                    <Tooltip title="Reload">
                        <Button
                            size="large"
                            icon={<ReloadOutlined spin={loading} />}
                            onClick={fetchWork}
                            disabled={loading}
                        />
                    </Tooltip>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        className="bg-violet-600 hover:bg-violet-700 shadow-md"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Create New
                    </Button>
                </div>
            </div>

            {loading && !workItems.length ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading your workspace...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">{error}</div>
            ) : (
                <div className="space-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Pending", value: stats.pending, color: "from-amber-400 to-amber-600" },
                            { label: "In Progress", value: stats.inProgress, color: "from-blue-400 to-blue-600" },
                            { label: "Completed", value: stats.completed, color: "from-green-400 to-green-600" },
                            { label: "Total Value", value: formatCurrency(stats.totalAmount), color: "from-violet-400 to-violet-600" },
                        ].map((stat, idx) => (
                            <div key={idx} className={`bg-gradient-to-br ${stat.color} rounded-xl p-5 text-white shadow-lg transform transition-transform hover:-translate-y-1`}>
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <div className="text-sm font-medium opacity-90">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Documents List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="font-bold text-gray-800 text-lg">Documents</h2>
                            <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{workItems.length}</span>
                        </div>

                        {workItems.length === 0 ? (
                            <Empty description={<span className="text-gray-500">No documents found. Create one to get started.</span>} className="py-12" />
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {workItems.map((doc) => (
                                    <div key={doc.documentNumber} className="group transition-all duration-200">
                                        <div
                                            onClick={() => {
                                                const isExpanding = expandedDoc !== doc.documentNumber;
                                                setExpandedDoc(isExpanding ? doc.documentNumber : null);

                                                if (isExpanding && !attachmentsCache[doc.documentNumber]) {
                                                    // Fetch attachments if not cached
                                                    setAttachmentsLoading(prev => ({ ...prev, [doc.documentNumber]: true }));
                                                    getAttachmentsByDocumentNumber(doc.documentNumber)
                                                        .then(data => {
                                                            setAttachmentsCache(prev => ({ ...prev, [doc.documentNumber]: data }));
                                                        })
                                                        .catch(err => {
                                                            console.error("Failed to fetch attachments", err);
                                                        })
                                                        .finally(() => {
                                                            setAttachmentsLoading(prev => ({ ...prev, [doc.documentNumber]: false }));
                                                        });
                                                }
                                            }}
                                            className={`p-5 cursor-pointer hover:bg-gray-50 transition-colors ${expandedDoc === doc.documentNumber ? "bg-gray-50" : "bg-white"}`}
                                        >
                                            <div className="flex flex-col md:flex-row gap-4 justify-between">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <span className="font-bold text-gray-900 text-lg">{doc.documentNumber}</span>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${getDocTypeBadge(doc.documentType)}`}>{doc.documentType?.replace("_", " ")}</span>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${getStatusBadge(doc.status)}`}>{doc.status?.replace("_", " ")}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <span className="font-medium text-gray-900">{doc.customerName}</span>
                                                        <span>•</span>
                                                        <span>{doc.vehicleInfo}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        Created {formatDateTime(doc.createdAt)}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between md:justify-end gap-6 min-w-[200px]">
                                                    <div className="text-right">
                                                        <div className="text-xl font-bold text-gray-900">{formatCurrency(doc.totalAmount)}</div>
                                                        {doc.balanceDue > 0 ? (
                                                            <div className="text-xs font-semibold text-amber-600">Due: {formatCurrency(doc.balanceDue)}</div>
                                                        ) : (
                                                            <div className="text-xs font-semibold text-green-600">Paid</div>
                                                        )}
                                                    </div>

                                                    {expandedDoc !== doc.documentNumber && (
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Tooltip title="Email"><Button type="text" shape="circle" icon={<MailOutlined />} onClick={(e) => openEmailModal(doc.documentNumber, doc.email || "", e)} /></Tooltip>
                                                            <Tooltip title="PDF"><Button type="text" shape="circle" icon={<FilePdfOutlined />} onClick={(e) => handleExportPdf(doc.documentNumber, e)} /></Tooltip>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {expandedDoc === doc.documentNumber && (
                                            <div className="bg-gray-50 px-6 pb-6 border-t border-gray-100 animate-fadeIn">
                                                {/* Action Bar */}
                                                <div className="py-4 flex flex-wrap gap-2 justify-end border-b border-gray-200 mb-4">
                                                    <Button icon={<EditOutlined />} onClick={(e) => handleEdit(doc.documentNumber, e)}>Edit</Button>
                                                    {doc.status === "pending" && (
                                                        <Button icon={<CheckCircleOutlined />} onClick={(e) => handleAccept(doc.documentNumber, e)}>Accept Quote</Button>
                                                    )}
                                                    {doc.documentType?.toUpperCase() === "QUOTE" && (
                                                        <Button type="primary" icon={<SwapOutlined />} onClick={(e) => handleConvertToWorkOrder(doc.documentNumber, e)}>Convert to Work Order</Button>
                                                    )}
                                                    {doc.documentType?.toUpperCase() === "WORK_ORDER" && (
                                                        <Button type="primary" icon={<SwapOutlined />} onClick={(e) => handleConvertToInvoice(doc.documentNumber, e)}>Convert to Invoice</Button>
                                                    )}
                                                    {(doc.status === "in_progress" || doc.status === "accepted") && (
                                                        <Button icon={<FileDoneOutlined />} onClick={(e) => handleComplete(doc.documentNumber, e)}>Mark Complete</Button>
                                                    )}
                                                    {doc.balanceDue > 0 && (
                                                        <Button icon={<DollarOutlined />} onClick={(e) => openPaymentModal(doc.documentNumber, doc.balanceDue, e)}>Record Payment</Button>
                                                    )}
                                                    <Button icon={<MailOutlined />} onClick={(e) => openEmailModal(doc.documentNumber, doc.email || "", e)}>Email</Button>
                                                    <Button icon={<FilePdfOutlined />} onClick={(e) => handleExportPdf(doc.documentNumber, e)}>Export PDF</Button>
                                                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(doc.documentNumber)}>Delete</Button>
                                                </div>

                                                {/* Details Grid */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Schedule</div>
                                                        <div className="text-sm font-medium text-gray-900">{formatDateTime(doc.scheduledDate)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Due Date</div>
                                                        <div className="text-sm font-medium text-gray-900">{formatDate(doc.dueDate)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location</div>
                                                        <div className="text-sm font-medium text-gray-900">{doc.serviceLocation || "-"}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment Terms</div>
                                                        <div className="text-sm font-medium text-gray-900">{doc.paymentTerms || "-"}</div>
                                                    </div>
                                                </div>

                                                {/* Items */}
                                                {doc.items && doc.items.length > 0 && (
                                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4 shadow-sm">
                                                        <table className="w-full text-sm">
                                                            <thead className="bg-gray-100 text-gray-600 font-semibold">
                                                                <tr>
                                                                    <th className="px-4 py-3 text-left">Item / Description</th>
                                                                    <th className="px-4 py-3 text-right">Price</th>
                                                                    <th className="px-4 py-3 text-right">Labor</th>
                                                                    <th className="px-4 py-3 text-center">Qty</th>
                                                                    <th className="px-4 py-3 text-right">Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                                {doc.items.flatMap((item, idx) => {
                                                                    const rows = [];
                                                                    const itemId = `item_${idx + 1}`;

                                                                    // Row 1: The Part
                                                                    rows.push(
                                                                        <tr key={itemId}>
                                                                            <td className="px-4 py-3">
                                                                                <div className="font-medium text-gray-900">{item.partDescription}</div>
                                                                                <div className="text-xs text-gray-500 font-mono mt-0.5">{item.nagsGlassId}</div>
                                                                            </td>
                                                                            <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.partPrice)}</td>
                                                                            <td className="px-4 py-3 text-right text-gray-400">-</td>
                                                                            <td className="px-4 py-3 text-center text-gray-900">{item.quantity}</td>
                                                                            <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(item.partPrice * (item.quantity || 1))}</td>
                                                                        </tr>
                                                                    );

                                                                    // Row 2: The Labor (only if laborRate exists)
                                                                    if (item.laborRate && item.laborRate > 0) {
                                                                        rows.push(
                                                                            <tr key={`${itemId}_LABOR`} className="bg-blue-50/50">
                                                                                <td className="px-4 py-3">
                                                                                    <div className="font-medium text-blue-700">Installation Labor</div>
                                                                                    <div className="text-xs text-blue-500 mt-0.5">{item.laborHours || 0} hrs</div>
                                                                                </td>
                                                                                <td className="px-4 py-3 text-right text-blue-600">{formatCurrency(item.laborRate)}</td>
                                                                                <td className="px-4 py-3 text-right text-blue-600">{item.laborHours || 0} hrs</td>
                                                                                <td className="px-4 py-3 text-center text-blue-700">1</td>
                                                                                <td className="px-4 py-3 text-right font-bold text-blue-700">{formatCurrency(item.laborRate)}</td>
                                                                            </tr>
                                                                        );
                                                                    }

                                                                    return rows;
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}

                                                {/* Financials */}
                                                <div className="flex justify-end">
                                                    <div className="w-full md:w-1/3 bg-white p-4 rounded-lg border border-gray-200 space-y-2 shadow-sm">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Subtotal</span>
                                                            <span className="font-medium">{formatCurrency(doc.subtotal)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Tax ({doc.taxRate}%)</span>
                                                            <span className="font-medium">{formatCurrency(doc.taxAmount)}</span>
                                                        </div>
                                                        <div className="border-t border-gray-100 pt-2 flex justify-between text-base font-bold text-gray-900">
                                                            <span>Total</span>
                                                            <span>{formatCurrency(doc.totalAmount)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm text-green-600 font-medium">
                                                            <span>Paid</span>
                                                            <span>{formatCurrency(doc.amountPaid)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm text-amber-600 font-bold border-t border-dashed border-gray-200 pt-2">
                                                            <span>Balance Due</span>
                                                            <span>{formatCurrency(doc.balanceDue)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Attachments Section */}
                                                <div className="mt-6 border-t border-gray-100 pt-4">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                        <FilePdfOutlined /> Attachments
                                                    </h4>
                                                    {attachmentsLoading[doc.documentNumber] ? (
                                                        <div className="text-xs text-gray-500 italic">Loading attachments...</div>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-4">
                                                            {attachmentsCache[doc.documentNumber] && attachmentsCache[doc.documentNumber].length > 0 ? (
                                                                attachmentsCache[doc.documentNumber].map(att => (
                                                                    <div key={att.attachmentId} className="relative group border border-gray-200 rounded-lg overflow-hidden w-32 h-32 bg-gray-50 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                                                        onClick={() => {
                                                                            if (att.contentType?.startsWith('image/')) {
                                                                                setPreviewAttachment({ ...att, docNumber: doc.documentNumber });
                                                                            } else {
                                                                                window.open(att.s3Url, '_blank');
                                                                            }
                                                                        }}
                                                                    >
                                                                        {/* Image Preview */}
                                                                        <div className="w-full h-full flex items-center justify-center p-2">
                                                                            {att.contentType?.startsWith('image/') ? (
                                                                                <img
                                                                                    src={att.s3Url}
                                                                                    alt={att.originalFileName}
                                                                                    className="max-w-full max-h-full object-contain"
                                                                                />
                                                                            ) : (
                                                                                <div className="flex flex-col items-center text-gray-400">
                                                                                    <FilePdfOutlined style={{ fontSize: '24px' }} />
                                                                                    <span className="text-[10px] mt-1 text-center truncate w-24">{att.fileExtension}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Overlay Actions */}
                                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                            <Tooltip title="View">
                                                                                <div className="text-white hover:text-violet-300">
                                                                                    {att.contentType?.startsWith('image/') ? (
                                                                                        <span className="text-xs font-semibold">Preview</span>
                                                                                    ) : (
                                                                                        <FilePdfOutlined style={{ fontSize: '18px' }} />
                                                                                    )}
                                                                                </div>
                                                                            </Tooltip>
                                                                            <Tooltip title="Delete">
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        modal.confirm({
                                                                                            title: 'Delete Attachment',
                                                                                            content: 'Are you sure you want to delete this attachment?',
                                                                                            okText: 'Delete',
                                                                                            okType: 'danger',
                                                                                            onOk: () => handleDeleteAttachment(att.attachmentId, doc.documentNumber)
                                                                                        });
                                                                                    }}
                                                                                    className="text-white hover:text-red-400"
                                                                                >
                                                                                    <DeleteOutlined style={{ fontSize: '18px' }} />
                                                                                </button>
                                                                            </Tooltip>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <span className="text-xs text-gray-400 italic">No attachments found.</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            <CreateServiceDocumentModal
                visible={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchWork}
            />

            <PaymentModal
                visible={paymentModalState.open}
                documentNumber={paymentModalState.docId}
                balanceDue={paymentModalState.balance}
                onClose={() => setPaymentModalState({ ...paymentModalState, open: false })}
                onSuccess={fetchWork}
            />

            <EmailDocumentModal
                visible={emailModalState.open}
                documentNumber={emailModalState.docId}
                defaultEmail={emailModalState.email}
                onClose={() => setEmailModalState({ ...emailModalState, open: false })}
                onSuccess={fetchWork} // Optional: maybe show persistent success message
            />

            <EditDocumentModal
                visible={editModalState.open}
                document={editModalState.document}
                onClose={() => setEditModalState({ open: false, document: null })}
                onSuccess={fetchWork}
            />

            {/* Image Preview Modal */}
            <Modal
                open={!!previewAttachment}
                title={previewAttachment?.originalFileName}
                footer={[
                    <Button key="delete" danger icon={<DeleteOutlined />} onClick={() => {
                        modal.confirm({
                            title: 'Delete Attachment',
                            content: 'Are you sure you want to delete this attachment?',
                            okText: 'Delete',
                            okType: 'danger',
                            onOk: async () => {
                                await handleDeleteAttachment(previewAttachment.attachmentId, previewAttachment.docNumber);
                                setPreviewAttachment(null);
                            }
                        });
                    }}>
                        Delete
                    </Button>,
                    <Button key="close" onClick={() => setPreviewAttachment(null)}>
                        Close
                    </Button>
                ]}
                onCancel={() => setPreviewAttachment(null)}
                width={800}
                centered
            >
                {previewAttachment && (
                    <div className="flex justify-center bg-gray-50 p-4 rounded-lg">
                        <img
                            src={previewAttachment.s3Url}
                            alt={previewAttachment.originalFileName}
                            className="max-h-[70vh] max-w-full object-contain shadow-sm"
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Work;
