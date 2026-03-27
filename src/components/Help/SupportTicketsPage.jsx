import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
    Ticket,
    Plus,
    X,
    Paperclip,
    ChevronDown,
    AlertCircle,
    CheckCircle2,
    Clock,
    XCircle,
    RefreshCw,
    Loader2,
    Calendar,
    Tag,
    FileText,
    Upload,
    Trash2,
} from 'lucide-react';
import { LeftOutlined } from '@ant-design/icons';
import { getSupportTickets, createSupportTicket } from '../../api/supportTickets';

/* ─── Constants ────────────────────────────────────────────────────────────── */

const CATEGORIES = ['BILLING', 'TECHNICAL', 'GENERAL', 'ACCOUNT', 'OTHER'];
const PRIORITIES  = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const STATUS_CONFIG = {
    OPEN:        { label: 'Open',        color: '#2563eb', bg: '#eff6ff', icon: Clock },
    IN_PROGRESS: { label: 'In Progress', color: '#d97706', bg: '#fffbeb', icon: RefreshCw },
    RESOLVED:    { label: 'Resolved',    color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle2 },
    CLOSED:      { label: 'Closed',      color: '#6b7280', bg: '#f9fafb', icon: XCircle },
};

const PRIORITY_CONFIG = {
    LOW:    { color: '#16a34a', bg: '#f0fdf4' },
    MEDIUM: { color: '#d97706', bg: '#fffbeb' },
    HIGH:   { color: '#dc2626', bg: '#fef2f2' },
    URGENT: { color: '#dc2626', bg: '#fef2f2' },
};

/* ─── Small reusable badge ─────────────────────────────────────────────────── */
function Badge({ label, color, bg }) {
    return (
        <span
            style={{ color, background: bg, border: `1px solid ${color}30` }}
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
        >
            {label}
        </span>
    );
}

/* ─── Create-ticket modal ──────────────────────────────────────────────────── */
function CreateTicketModal({ onClose, onCreated }) {
    const [form, setForm] = useState({
        subject: '',
        category: 'BILLING',
        priority: 'LOW',
        description: '',
    });
    const [files, setFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef();

    const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const handleFiles = (e) => {
        const picked = Array.from(e.target.files || []);
        setFiles(prev => [...prev, ...picked]);
        e.target.value = '';
    };

    const removeFile = (idx) => setFiles(f => f.filter((_, i) => i !== idx));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.subject.trim() || !form.description.trim()) {
            setError('Subject and description are required.');
            return;
        }
        setError('');
        setSubmitting(true);
        try {
            const ticket = await createSupportTicket(form, files);
            onCreated(ticket);
        } catch (err) {
            setError(err.message || 'Failed to create ticket.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Ticket className="w-4 h-4 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Create Support Ticket</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Subject */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.subject}
                            onChange={e => handleChange('subject', e.target.value)}
                            placeholder="Brief summary of the issue"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    {/* Category + Priority row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                Category
                            </label>
                            <div className="relative">
                                <select
                                    value={form.category}
                                    onChange={e => handleChange('category', e.target.value)}
                                    className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white pr-8 transition"
                                >
                                    {CATEGORIES.map(c => (
                                        <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                Priority
                            </label>
                            <div className="relative">
                                <select
                                    value={form.priority}
                                    onChange={e => handleChange('priority', e.target.value)}
                                    className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white pr-8 transition"
                                >
                                    {PRIORITIES.map(p => (
                                        <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={form.description}
                            onChange={e => handleChange('description', e.target.value)}
                            placeholder="Describe your issue in detail…"
                            rows={4}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                        />
                    </div>

                    {/* Attachments */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                            Attachments
                        </label>
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 border border-dashed border-blue-300 hover:border-blue-400 rounded-lg px-4 py-2.5 w-full justify-center transition-colors bg-blue-50/50 hover:bg-blue-50"
                        >
                            <Upload className="w-4 h-4" />
                            Click to attach files
                        </button>
                        <input
                            ref={fileRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFiles}
                        />

                        {files.length > 0 && (
                            <ul className="mt-2 space-y-1.5">
                                {files.map((f, i) => (
                                    <li key={i} className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                                        <div className="flex items-center gap-2 text-slate-600 truncate">
                                            <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span className="truncate">{f.name}</span>
                                        </div>
                                        <button type="button" onClick={() => removeFile(i)} className="ml-2 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-all duration-200 shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form=""
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-md shadow-blue-200/50 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                        ) : (
                            <><Plus className="w-4 h-4" /> Submit Ticket</>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

/* ─── Ticket card ──────────────────────────────────────────────────────────── */
function TicketCard({ ticket, index }) {
    const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
    const priority = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.LOW;
    const StatusIcon = status.icon;

    const formatDate = (iso) =>
        new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 group"
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 text-sm leading-snug truncate group-hover:text-blue-700 transition-colors">
                        {ticket.subject}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">#{ticket.id?.slice(0, 8)}</p>
                </div>
                <div
                    style={{ color: status.color, background: status.bg, border: `1px solid ${status.color}30` }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                </div>
            </div>

            {ticket.description && (
                <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {ticket.description}
                </p>
            )}

            <div className="flex items-center gap-3 flex-wrap">
                <Badge label={ticket.category} color="#2563eb" bg="#eff6ff" />
                <Badge
                    label={ticket.priority}
                    color={priority.color}
                    bg={priority.bg}
                />

                {ticket.attachments?.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Paperclip className="w-3.5 h-3.5" />
                        {ticket.attachments.length} attachment{ticket.attachments.length !== 1 ? 's' : ''}
                    </span>
                )}

                <span className="ml-auto flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(ticket.createdAt)}
                </span>
            </div>
        </motion.div>
    );
}

/* ─── Main page ────────────────────────────────────────────────────────────── */
export default function SupportTicketsPage() {
    const navigate = useNavigate();
    const [tickets, setTickets]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter]     = useState('ALL');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getSupportTickets();
            setTickets(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to load tickets.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleCreated = (newTicket) => {
        setTickets(prev => [newTicket, ...prev]);
        setShowModal(false);
    };

    const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

    const filtered = filter === 'ALL'
        ? tickets
        : tickets.filter(t => t.status === filter);

    return (
        <div className="p-4 sm:p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-between mb-6 gap-3 flex-wrap"
            >
                <div className="flex items-center gap-3">
                    <Button
                        icon={<LeftOutlined />}
                        onClick={() => navigate('/help')}
                        size="small"
                        className="bg-white hover:bg-blue-50 border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-700 flex-shrink-0"
                    >
                        Back
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={load}
                        disabled={loading}
                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors disabled:opacity-50"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-200"
                    >
                        <Plus className="w-4 h-4" />
                        New Ticket
                    </button>
                </div>
            </motion.div>

            {/* Status filters */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="flex gap-2 mb-5 overflow-x-auto pb-1"
            >
                {STATUS_FILTERS.map(s => {
                    const cfg = s === 'ALL' ? null : STATUS_CONFIG[s];
                    const count = s === 'ALL' ? tickets.length : tickets.filter(t => t.status === s).length;
                    return (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            style={filter === s && cfg ? { color: cfg.color, background: cfg.bg, borderColor: `${cfg.color}40` } : {}}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap transition-all ${
                                filter === s
                                    ? s === 'ALL' ? 'bg-blue-600 text-white border-blue-600' : ''
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
                            }`}
                        >
                            {s === 'ALL' ? 'All' : (STATUS_CONFIG[s]?.label || s)}
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                filter === s ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </motion.div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-400" />
                    <p className="text-sm">Loading tickets…</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                    <p className="text-sm font-medium text-slate-700 mb-1">Failed to load tickets</p>
                    <p className="text-xs text-slate-500 mb-4">{error}</p>
                    <button onClick={load} className="text-sm font-semibold text-blue-600 hover:underline">
                        Try again
                    </button>
                </div>
            ) : filtered.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-blue-300" />
                    </div>
                    <p className="text-base font-semibold text-slate-700 mb-1">
                        {filter === 'ALL' ? 'No tickets yet' : `No ${STATUS_CONFIG[filter]?.label} tickets`}
                    </p>
                    <p className="text-sm text-slate-400 mb-5">
                        {filter === 'ALL'
                            ? 'Submit a ticket and our team will get back to you shortly.'
                            : 'Try selecting a different filter.'}
                    </p>
                    {filter === 'ALL' && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create your first ticket
                        </button>
                    )}
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((ticket, i) => (
                        <TicketCard key={ticket.id} ticket={ticket} index={i} />
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <CreateTicketModal
                        onClose={() => setShowModal(false)}
                        onCreated={handleCreated}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
