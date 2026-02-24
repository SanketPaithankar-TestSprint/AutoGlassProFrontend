import React, { useState, useRef } from 'react';

// ─── NHTSA API ─────────────────────────────────────────────────────────────────
const NHTSA_BASE = 'https://vpic.nhtsa.dot.gov/api';

async function decodeVin(vin, modelYear = '') {
    const url = `${NHTSA_BASE}/vehicles/DecodeVinValuesExtended/${vin.trim()}?format=json${modelYear ? `&modelyear=${modelYear}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NHTSA API error: ${res.status}`);
    const json = await res.json();
    if (!json.Results || json.Results.length === 0) throw new Error('No results returned');
    return json.Results[0];
}

// ─── Field Groups ──────────────────────────────────────────────────────────────
const FIELD_GROUPS = [
    {
        label: 'Vehicle Identity',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 0 1 0 10h-2" /><line x1="8" y1="12" x2="16" y2="12" />
            </svg>
        ),
        color: 'purple1',
        fields: ['Make', 'Model', 'ModelYear', 'VehicleType', 'BodyClass', 'Series', 'Trim', 'Trim2'],
    },
    {
        label: 'Engine & Drivetrain',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
        ),
        color: 'blue1',
        fields: ['EngineModel', 'EngineCylinders', 'DisplacementCC', 'DisplacementL', 'EngineHP', 'EngineKW', 'FuelTypePrimary', 'FuelTypeSecondary', 'DriveType', 'TransmissionStyle', 'TransmissionSpeeds'],
    },
    {
        label: 'Safety & Features',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        color: 'purple2',
        fields: ['AirBagLocFront', 'AirBagLocSide', 'AirBagLocCurtain', 'AirBagLocKnee', 'AirBagLocSeatCushion', 'TPMS', 'ESC', 'ABS', 'AutomaticPedestrianAlertingSound', 'LaneDepartureWarning', 'LaneKeepSystem', 'ForwardCollisionWarning', 'DynamicBrakeSupport'],
    },
    {
        label: 'Dimensions & Capacity',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
            </svg>
        ),
        color: 'blue2',
        fields: ['Doors', 'Windows', 'WheelBaseLong', 'WheelBaseShort', 'TrackWidth', 'GVWR', 'GCWR', 'Seats', 'SeatRows'],
    },
    {
        label: 'Manufacturing',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
            </svg>
        ),
        color: 'violet',
        fields: ['Manufacturer', 'ManufacturerId', 'PlantCity', 'PlantCountry', 'PlantState', 'PlantCompanyName', 'OriginCountry', 'NCSA Make', 'NCSA Model'],
    },
];

// brand purple → #7E5CFE  brand blue → #00A8E4
const COLOR_MAP = {
    purple1: { card: 'border-violet-200', cardBg: 'rgba(126,92,254,0.06)', icon: 'from-[#7E5CFE] to-[#9b7ffe]', label: '#7E5CFE' },
    purple2: { card: 'border-indigo-200', cardBg: 'rgba(99,102,241,0.06)', icon: 'from-[#6366f1] to-[#7E5CFE]', label: '#6366f1' },
    blue1: { card: 'border-sky-200', cardBg: 'rgba(0,168,228,0.06)', icon: 'from-[#00A8E4] to-[#38bdf8]', label: '#00A8E4' },
    blue2: { card: 'border-blue-200', cardBg: 'rgba(59,130,246,0.06)', icon: 'from-[#3b82f6] to-[#00A8E4]', label: '#3b82f6' },
    violet: { card: 'border-purple-200', cardBg: 'rgba(168,85,247,0.06)', icon: 'from-[#a855f7] to-[#7E5CFE]', label: '#a855f7' },
};

function prettify(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
}

function FieldCard({ label, value, color }) {
    const colors = COLOR_MAP[color];
    if (!value || value === 'Not Applicable' || value === '') return null;
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
            <span className="text-sm font-medium text-slate-800 leading-snug">{value}</span>
        </div>
    );
}

function GroupCard({ group, data }) {
    const colors = COLOR_MAP[group.color];
    const fields = group.fields
        .map(f => ({ key: f, label: prettify(f), value: data[f] }))
        .filter(f => f.value && f.value !== 'Not Applicable' && f.value !== '');

    if (fields.length === 0) return null;

    return (
        <div className={`rounded-2xl border p-5 shadow-sm ${colors.card}`}
            style={{ background: colors.cardBg }}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${colors.icon} shadow-sm text-white`}>
                    {group.icon}
                </div>
                <h3 className="font-bold text-sm" style={{ color: colors.label }}>{group.label}</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4">
                {fields.map(f => <FieldCard key={f.key} label={f.label} value={f.value} color={group.color} />)}
            </div>
        </div>
    );
}

// ─── Hero Summary Strip ────────────────────────────────────────────────────────
function HeroSummary({ data }) {
    const year = data.ModelYear;
    const make = data.Make;
    const model = data.Model;
    const type = data.BodyClass || data.VehicleType;
    const vin = data.VIN;
    const country = data.PlantCountry;
    const engine = [data.EngineCylinders && `${data.EngineCylinders}-cyl`, data.EngineHP && `${data.EngineHP} hp`].filter(Boolean).join(' · ');
    const fuel = data.FuelTypePrimary;

    return (
        <div className="rounded-2xl text-white p-6 shadow-xl mb-6"
            style={{ background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Decoded Vehicle</p>
                    <h2 className="text-2xl sm:text-3xl font-black">
                        {[year, make, model].filter(Boolean).join(' ')}
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-3">
                        {type && <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-medium">{type}</span>}
                        {engine && <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-medium">{engine}</span>}
                        {fuel && <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-medium">{fuel}</span>}
                        {country && <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-medium">🌍 {country}</span>}
                    </div>
                </div>
                {vin && (
                    <div className="sm:text-right">
                        <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest mb-1">VIN</p>
                        <p className="font-mono text-base font-bold tracking-wider">{vin}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function VinDecoderRoot() {
    const [vin, setVin] = useState('');
    const [modelYear, setModelYear] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    const handleDecode = async (e) => {
        e?.preventDefault();
        const trimmed = vin.trim().toUpperCase();
        if (!trimmed) { inputRef.current?.focus(); return; }
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const data = await decodeVin(trimmed, modelYear);
            if (data.ErrorCode && data.ErrorCode !== '0') {
                setError(data.ErrorText || 'NHTSA could not decode this VIN.');
            } else {
                setResult(data);
            }
        } catch (err) {
            setError(err.message || 'Failed to decode VIN. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setVin('');
        setModelYear('');
        setResult(null);
        setError(null);
        inputRef.current?.focus();
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => currentYear - i);

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #eff6ff 50%, #e0f2fe 100%)' }}>
            {/* ── Hero header — collapses to compact bar after decode ── */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                {!(result || error) ? (
                    /* ── Expanded state (no results yet) ── */
                    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 border"
                            style={{ background: 'rgba(126,92,254,0.08)', borderColor: 'rgba(126,92,254,0.3)' }}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#7E5CFE' }}>
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812 3.066 3.066 0 00.723 1.745 3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7E5CFE' }}>Powered by NHTSA Official API</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-3 tracking-tight">VIN Decoder</h1>
                        <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto">
                            Instantly decode any Vehicle Identification Number using official NHTSA data — make, model, engine, safety features, and more.
                        </p>
                        <form onSubmit={handleDecode} className="mt-8 max-w-2xl mx-auto">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <input ref={inputRef} type="text" value={vin}
                                        onChange={e => setVin(e.target.value.toUpperCase())}
                                        placeholder="Enter 17-character VIN" maxLength={17} spellCheck={false}
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white font-mono text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm transition-colors" />
                                    {vin && (
                                        <button type="button" onClick={() => setVin('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        </button>
                                    )}
                                </div>
                                <select value={modelYear} onChange={e => setModelYear(e.target.value)}
                                    className="px-3 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm">
                                    <option value="">Year (optional)</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <button type="submit" disabled={loading || !vin.trim()}
                                    className="px-7 py-3.5 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all text-sm whitespace-nowrap hover:opacity-90"
                                    style={{ background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)' }}>
                                    {loading ? <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Decoding…</span> : 'Decode VIN'}
                                </button>
                            </div>
                            {vin && (
                                <div className="mt-2 flex items-center justify-between px-1">
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: 17 }).map((_, i) => (
                                            <span key={i} className="h-1 w-3 rounded-full transition-colors"
                                                style={{ background: i < vin.length ? '#7E5CFE' : '#e2e8f0' }} />
                                        ))}
                                    </div>
                                    <span className={`text-xs font-mono font-medium ${vin.length === 17 ? 'text-violet-600' : 'text-slate-400'}`}>
                                        {vin.length}/17 {vin.length === 17 ? '✓' : ''}
                                    </span>
                                </div>
                            )}
                        </form>
                    </div>
                ) : (
                    /* ── Compact bar (results visible) ── */
                    <div className="max-w-5xl mx-auto px-4 py-3">
                        <form onSubmit={handleDecode} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                            <div className="flex items-center gap-2 mr-2 flex-shrink-0">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#7E5CFE' }}>
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812 3.066 3.066 0 00.723 1.745 3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs font-bold hidden sm:inline" style={{ color: '#7E5CFE' }}>VIN Decoder</span>
                            </div>
                            <div className="flex-1 relative">
                                <input ref={inputRef} type="text" value={vin}
                                    onChange={e => setVin(e.target.value.toUpperCase())}
                                    placeholder="Enter another VIN…" maxLength={17} spellCheck={false}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors" />
                                {vin && (
                                    <button type="button" onClick={() => setVin('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    </button>
                                )}
                            </div>
                            <select value={modelYear} onChange={e => setModelYear(e.target.value)}
                                className="px-2 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-600 focus:outline-none focus:border-blue-500">
                                <option value="">Year</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <button type="submit" disabled={loading || !vin.trim()}
                                className="px-5 py-2 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all text-sm whitespace-nowrap hover:opacity-90"
                                style={{ background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)' }}>
                                {loading ? '…' : 'Decode'}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* ── Results ── */}
            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 mb-6">
                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <div>
                            <p className="font-semibold text-sm">Decode Error</p>
                            <p className="text-sm mt-0.5 text-red-600">{error}</p>
                        </div>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <>
                        <HeroSummary data={result} />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {FIELD_GROUPS.map(group => (
                                <GroupCard key={group.label} group={group} data={result} />
                            ))}
                        </div>

                        {/* Raw message note */}
                        {result.AdditionalErrorText && (
                            <div className="mt-10 mb-2 border-t border-slate-200 pt-5">
                                <p className="text-xs text-slate-400 text-center px-4">
                                    ℹ️ {result.AdditionalErrorText}
                                </p>
                            </div>
                        )}

                        <div className="mt-6 flex justify-center">
                            <button onClick={handleClear}
                                className="px-5 py-2 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
                                style={{ borderColor: '#7E5CFE', color: '#7E5CFE', background: 'rgba(126,92,254,0.06)' }}>
                                Decode another VIN
                            </button>
                        </div>
                    </>
                )}

                {/* Empty state */}
                {!result && !error && !loading && (
                    <div className="text-center py-16 text-slate-400">
                        <svg className="w-16 h-16 mx-auto mb-4 text-slate-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <rect x="3" y="6" width="18" height="13" rx="2" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><line x1="12" y1="11" x2="12" y2="16" /><line x1="9.5" y1="13.5" x2="14.5" y2="13.5" />
                        </svg>
                        <p className="font-semibold text-slate-500 text-lg">Enter a VIN to get started</p>
                        <p className="text-sm mt-1">You'll get make, model, engine, safety ratings, manufacturing details and more</p>
                    </div>
                )}
            </div>

            {/* Footer note */}
            <div className="text-center pb-8 text-xs text-slate-400">
                Data sourced from the{' '}
                <a href="https://vpic.nhtsa.dot.gov/api/" target="_blank" rel="noopener noreferrer"
                    className="hover:underline" style={{ color: '#7E5CFE' }}>NHTSA vPIC API</a>.
                Free to use, no account required.
            </div>
        </div>
    );
}
