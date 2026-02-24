import React, { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';

const PRESETS = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'this_week', label: 'This week (Mon – Today)' },
    { key: 'last_7', label: 'Last 7 days' },
    { key: 'last_week', label: 'Last week (Mon – Sun)' },
    { key: 'last_14', label: 'Last 14 days' },
    { key: 'this_month', label: 'This month' },
    { key: 'last_30', label: 'Last 30 days' },
    { key: 'last_month', label: 'Last month' },
    { key: 'all_time', label: 'All time' },
    { key: 'custom', label: 'Custom range' },
];

function getRange(key) {
    const today = dayjs().startOf('day');
    switch (key) {
        case 'today': return [today, today];
        case 'yesterday': return [today.subtract(1, 'day'), today.subtract(1, 'day')];
        case 'this_week': { const m = today.startOf('week').add(1, 'day'); return [m, today]; }
        case 'last_7': return [today.subtract(6, 'day'), today];
        case 'last_week': { const lm = today.startOf('week').subtract(6, 'day'); return [lm, lm.add(6, 'day')]; }
        case 'last_14': return [today.subtract(13, 'day'), today];
        case 'this_month': return [today.startOf('month'), today];
        case 'last_30': return [today.subtract(29, 'day'), today];
        case 'last_month': { const f = today.subtract(1, 'month').startOf('month'); return [f, f.endOf('month')]; }
        default: return [null, null];
    }
}

const WDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function Calendar({ month, onPrev, onNext, onDayClick, hoverDay, onDayHover, start, end, customEnd }) {
    const firstDay = month.startOf('month');
    const offset = (firstDay.day() + 6) % 7;
    const total = month.daysInMonth();
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(month.date(d));

    return (
        <div className="select-none">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={onPrev}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <span className="text-sm font-bold text-slate-800 tracking-wide">{month.format('MMMM YYYY')}</span>
                <button type="button" onClick={onNext}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
            </div>

            {/* Weekday row */}
            <div className="grid grid-cols-7 mb-1">
                {WDAYS.map((d, i) => (
                    <span key={i} className="text-center text-[11px] font-semibold text-slate-400 py-1">{d}</span>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
                {cells.map((day, idx) => {
                    if (!day) return <span key={`e${idx}`} />;
                    const isStart = start && day.isSame(start, 'day');
                    const isEnd = end && day.isSame(end, 'day');
                    const effEnd = end || hoverDay;
                    const inRange = start && effEnd &&
                        day.isAfter(start, 'day') && day.isBefore(effEnd, 'day');
                    const isToday = day.isSame(dayjs(), 'day');
                    const isEndpoint = isStart || isEnd;

                    // Background strip spans full cell width for range days
                    const stripBg = inRange
                        ? 'rgba(219,234,254,0.8)'   // blue-100 approx
                        : isStart && !end && !customEnd
                            ? 'transparent'              // single dot, no strip yet
                            : 'transparent';

                    return (
                        <button
                            key={day.format('YYYY-MM-DD')}
                            type="button"
                            onClick={() => onDayClick(day)}
                            onMouseEnter={() => onDayHover?.(day)}
                            className="relative h-9 w-full flex items-center justify-center cursor-pointer group"
                        >
                            {/* Range band — full width, no radius */}
                            {(inRange || ((isStart || isEnd) && (start && (end || hoverDay)))) && (
                                <span
                                    className="absolute inset-y-1"
                                    style={{
                                        left: isStart ? '50%' : 0,
                                        right: isEnd ? '50%' : 0,
                                        background: 'rgba(219,234,254,0.9)',
                                    }}
                                />
                            )}
                            {/* Day number / endpoint circle */}
                            <span className={[
                                'relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-[13px] font-medium transition-colors',
                                isEndpoint
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : inRange
                                        ? 'text-blue-700'
                                        : isToday
                                            ? 'text-blue-600 font-bold ring-1 ring-blue-300'
                                            : 'text-slate-700 group-hover:bg-slate-100',
                            ].join(' ')}>
                                {day.date()}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function AnalyticsDatePicker({ onChange, activeLabel }) {
    const [open, setOpen] = useState(false);
    const [activePreset, setPreset] = useState('all_time');
    const [customStart, setStart] = useState(null);
    const [customEnd, setEnd] = useState(null);
    const [hoverDay, setHover] = useState(null);
    const [leftMonth, setLeft] = useState(dayjs().subtract(1, 'month').startOf('month'));
    const [rightMonth, setRight] = useState(dayjs().startOf('month'));
    const [showCustom, setShowCustom] = useState(false); // mobile: toggle calendar view
    const wrapperRef = useRef(null);

    useEffect(() => {
        const h = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const handlePreset = (key) => {
        setPreset(key);
        if (key === 'custom') { setStart(null); setEnd(null); setShowCustom(true); return; }
        setShowCustom(false);
        const [s, e] = getRange(key);
        const presetLabel = PRESETS.find(p => p.key === key)?.label ?? 'All time';
        onChange({ startDate: s?.format('YYYY-MM-DD') ?? null, endDate: e?.format('YYYY-MM-DD') ?? null, label: presetLabel });
        setOpen(false);
    };

    const handleDay = (day) => {
        if (!customStart || (customStart && customEnd)) {
            setStart(day); setEnd(null);
        } else {
            let s = customStart, e = day;
            if (e.isBefore(s)) [s, e] = [e, s];
            setStart(s); setEnd(e);
            const rangeLabel = `${s.format('DD MMM')} – ${e.format('DD MMM YYYY')}`;
            onChange({ startDate: s.format('YYYY-MM-DD'), endDate: e.format('YYYY-MM-DD'), label: rangeLabel });
        }
    };

    const label = () => {
        if (activePreset !== 'custom') return PRESETS.find(p => p.key === activePreset)?.label ?? 'All time';
        if (customStart && customEnd) return `${customStart.format('DD MMM')} – ${customEnd.format('DD MMM YYYY')}`;
        if (customStart) return `${customStart.format('DD MMM')} – …`;
        return 'Custom range';
    };

    const selectionHint = !customStart
        ? 'Click a start date'
        : !customEnd ? 'Now click an end date'
            : `${customStart.format('DD MMM')} → ${customEnd.format('DD MMM YYYY')}`;

    return (
        <div ref={wrapperRef} className="relative inline-block text-left" style={{ zIndex: 100 }}>

            {/* ── Trigger ── */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm text-sm font-medium text-slate-700 hover:border-blue-400 hover:shadow-md transition-all min-w-[170px]"
            >
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="flex-1 text-left truncate">{activeLabel || label()}</span>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {/* ── Dropdown ── */}
            {open && (
                <>
                    {/* ──────────── DESKTOP: side-by-side panel ──────────── */}
                    <div className="hidden sm:flex absolute right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                        style={{ width: 680 }}>

                        {/* Preset list */}
                        <div className="w-56 border-r border-slate-100 py-3 flex-shrink-0 bg-slate-50">
                            <p className="px-4 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Quick select</p>
                            {PRESETS.map(p => (
                                <button key={p.key} type="button" onClick={() => handlePreset(p.key)}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors rounded-none
                                        ${activePreset === p.key
                                            ? 'bg-blue-600 text-white font-semibold'
                                            : 'text-slate-700 hover:bg-white hover:shadow-sm'}`}>
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Calendar panel */}
                        <div className="flex-1 p-5">
                            {activePreset === 'custom' ? (
                                <>
                                    {/* Date display row */}
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="flex-1 cursor-pointer" onClick={() => { setStart(null); setEnd(null); }} title="Click to reset">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Start date</p>
                                            <div className={`px-3 py-2 border rounded-lg text-sm ${customStart ? 'border-blue-400 text-slate-800 bg-blue-50' : 'border-dashed border-slate-300 text-slate-400 bg-slate-50'}`}>
                                                {customStart ? customStart.format('ddd, DD MMM YYYY') : 'Click a start date'}
                                            </div>
                                        </div>
                                        <svg className="w-5 h-5 text-slate-300 mt-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">End date</p>
                                            <div className={`px-3 py-2 border rounded-lg text-sm ${customEnd ? 'border-blue-400 text-slate-800 bg-blue-50' : 'border-dashed border-slate-300 text-slate-400 bg-slate-50'}`}>
                                                {customEnd ? customEnd.format('ddd, DD MMM YYYY') : 'Click an end date'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Two calendars side by side */}
                                    <div className="grid grid-cols-2 gap-6" onMouseLeave={() => setHover(null)}>
                                        <Calendar month={leftMonth}
                                            onPrev={() => setLeft(m => m.subtract(1, 'month'))}
                                            onNext={() => setLeft(m => m.add(1, 'month'))}
                                            onDayClick={handleDay} hoverDay={hoverDay} onDayHover={setHover}
                                            start={customStart} end={customEnd} customEnd={customEnd} />
                                        <Calendar month={rightMonth}
                                            onPrev={() => setRight(m => m.subtract(1, 'month'))}
                                            onNext={() => setRight(m => m.add(1, 'month'))}
                                            onDayClick={handleDay} hoverDay={hoverDay} onDayHover={setHover}
                                            start={customStart} end={customEnd} customEnd={customEnd} />
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <p className="text-xs text-slate-400">{selectionHint}</p>
                                        {customStart && customEnd && (
                                            <button type="button" onClick={() => setOpen(false)}
                                                className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow">
                                                Apply
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm gap-3 py-10">
                                    <svg className="w-14 h-14 text-slate-200" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                                        <rect x="3" y="4" width="18" height="18" rx="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    <p className="text-base text-slate-500">Select a preset or choose <strong className="text-slate-700">Custom range</strong></p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ──────────── MOBILE: full-width stacked panel ──────────── */}
                    <div className="sm:hidden fixed inset-x-3 top-16 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[80vh] overflow-y-auto"
                        style={{ zIndex: 200 }}>

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                            <span className="font-bold text-slate-800">Select period</span>
                            <button type="button" onClick={() => setOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>

                        {/* Preset pills */}
                        <div className="px-4 py-3 flex flex-wrap gap-2">
                            {PRESETS.map(p => (
                                <button key={p.key} type="button" onClick={() => handlePreset(p.key)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                                        ${activePreset === p.key
                                            ? 'bg-blue-600 text-white shadow'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Mobile custom calendar */}
                        {activePreset === 'custom' && (
                            <div className="px-4 pb-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex-1 px-3 py-2 border rounded-lg text-sm text-center cursor-pointer"
                                        onClick={() => { setStart(null); setEnd(null); }}
                                        style={{ borderColor: customStart ? '#3b82f6' : '#e2e8f0', background: customStart ? '#eff6ff' : '#f8fafc', color: customStart ? '#1e40af' : '#94a3b8' }}>
                                        {customStart ? customStart.format('DD MMM YYYY') : 'Start date'}
                                    </div>
                                    <span className="text-slate-400">→</span>
                                    <div className="flex-1 px-3 py-2 border rounded-lg text-sm text-center"
                                        style={{ borderColor: customEnd ? '#3b82f6' : '#e2e8f0', background: customEnd ? '#eff6ff' : '#f8fafc', color: customEnd ? '#1e40af' : '#94a3b8' }}>
                                        {customEnd ? customEnd.format('DD MMM YYYY') : 'End date'}
                                    </div>
                                </div>
                                <div onMouseLeave={() => setHover(null)}>
                                    <Calendar month={leftMonth}
                                        onPrev={() => setLeft(m => m.subtract(1, 'month'))}
                                        onNext={() => setLeft(m => m.add(1, 'month'))}
                                        onDayClick={handleDay} hoverDay={hoverDay} onDayHover={setHover}
                                        start={customStart} end={customEnd} customEnd={customEnd} />
                                </div>
                                <p className="text-xs text-slate-400 mt-3 text-center">{selectionHint}</p>
                                {customStart && customEnd && (
                                    <button type="button" onClick={() => setOpen(false)}
                                        className="w-full mt-3 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl">
                                        Apply
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
