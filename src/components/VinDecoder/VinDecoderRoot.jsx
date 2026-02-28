import React, { useState, useRef, useEffect } from 'react';
import { Collapse } from 'antd';
import { useNavigate } from 'react-router-dom';

// ─── NHTSA API ────────────────────────────────────────────────────────────────
const NHTSA_BASE = 'https://vpic.nhtsa.dot.gov/api';

async function decodeVin(vin, modelYear = '') {
    const url = `${NHTSA_BASE}/vehicles/DecodeVinValuesExtended/${vin.trim()}?format=json${modelYear ? `&modelyear=${modelYear}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NHTSA API error: ${res.status}`);
    const json = await res.json();
    if (!json.Results?.length) throw new Error('No results returned');
    return json.Results[0];
}

// ─── Field Groups ─────────────────────────────────────────────────────────────
const DATA_MAPPING = [
    { title: 'Core Identity', fields: ['Make', 'Model', 'ModelYear', 'VehicleType', 'BodyClass', 'Series', 'Trim', 'Trim2'] },
    { title: 'Powertrain', fields: ['EngineModel', 'EngineCylinders', 'DisplacementCC', 'DisplacementL', 'EngineHP', 'EngineKW', 'FuelTypePrimary', 'FuelTypeSecondary', 'DriveType', 'TransmissionStyle', 'TransmissionSpeeds'] },
    { title: 'Safety & Dimensions', fields: ['AirBagLocFront', 'AirBagLocSide', 'AirBagLocCurtain', 'AirBagLocKnee', 'TPMS', 'ESC', 'ABS', 'LaneDepartureWarning', 'ForwardCollisionWarning', 'DynamicBrakeSupport', 'Doors', 'Windows', 'WheelBaseLong', 'WheelBaseShort', 'TrackWidth', 'GVWR', 'Seats', 'SeatRows'] },
    { title: 'Origin', fields: ['Manufacturer', 'PlantCity', 'PlantCountry', 'PlantState', 'OriginCountry'] },
];

function formatLabel(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
}

function GridItem({ label, value }) {
    if (!value || value === 'Not Applicable' || value === '') return null;
    return (
        <div className="flex flex-col border-l-2 border-[#7E5CFE]/20 pl-3 py-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</span>
            <span className="text-sm font-semibold text-slate-800">{value}</span>
        </div>
    );
}

// ─── Inline Wave SVG ──────────────────────────────────────────────────────────
function WaveDivider() {
    return (
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none" style={{ height: 260 }}>
            {/* We scale the height and width to make the wave larger and fix the animation translation */}
            <svg viewBox="0 0 1440 260" preserveAspectRatio="none" className="w-full h-full">
                <style>{`
                    @keyframes wave-move {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-1920px); }
                    }
                    .wave-layer-0 { animation: wave-move 35s linear infinite; }
                    .wave-layer-1 { animation: wave-move 28s linear infinite -10s; }
                `}</style>
                <defs>
                    <linearGradient id="wg1"><stop stopColor="#7E5CFE" /><stop offset="1" stopColor="#9b7ffe" /></linearGradient>
                    {/* A wider path containing multiple repeating wave cycles so it can translate continuously */}
                    <path id="wpath" d="M0,180 Q240,100 480,180 T960,180 T1440,180 T1920,180 T2400,180 T2880,180 T3360,180 L3360,260 L0,260 Z" />
                </defs>
                <g>
                    <use href="#wpath" x="0" y="0" fill="url(#wg1)" opacity="0.10" className="wave-layer-0" />
                    <use href="#wpath" x="0" y="30" fill="url(#wg1)" opacity="0.15" className="wave-layer-1" />
                </g>
            </svg>
        </div>
    );
}

// ─── Accent line + label ──────────────────────────────────────────────────────
function SectionLabel({ children }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <div className="h-0.5 w-6 rounded-full" style={{ backgroundColor: '#7E5CFE' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#7E5CFE' }}>{children}</span>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NamedVinDecoder() {
    const [vin, setVin] = useState('');
    const [modelYear, setModelYear] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // ── SEO + Schema ──────────────────────────────────────────────────────────
    useEffect(() => {
        const prevTitle = document.title;
        document.title = 'Free VIN Decoder | Official NHTSA Vehicle Lookup | APAI';

        const metas = [
            { name: 'description', content: "Use APAI’s free VIN decoder to instantly identify vehicle year, make, model, and safety features. Powered by official NHTSA data for 100% accuracy." },
            { name: 'keywords', content: 'VIN decoder, free VIN lookup, NHTSA VIN, auto glass VIN, windshield VIN search, vehicle info, AutoPane AI, free VIN check, NHTSA vehicle specifications' },
            { name: 'robots', content: 'index, follow' },
            { property: 'og:title', content: 'Free VIN Decoder | Official NHTSA Vehicle Lookup | APAI' },
            { property: 'og:description', content: "Use APAI’s free VIN decoder to instantly identify vehicle year, make, model, and safety features. Powered by official NHTSA data for 100% accuracy." },
            { property: 'og:url', content: 'https://autopaneai.com/vin-decoder' },
            { property: 'og:type', content: 'website' },
        ];

        const added = [];
        metas.forEach(({ name, property, content }) => {
            const attr = property ? 'property' : 'name';
            const val = property || name;
            let el = document.querySelector(`meta[${attr}="${val}"]`);
            if (!el) { el = document.createElement('meta'); el.setAttribute(attr, val); document.head.appendChild(el); added.push(el); }
            el.setAttribute('content', content);
        });

        // Canonical
        let canon = document.querySelector('link[rel="canonical"]');
        if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; document.head.appendChild(canon); added.push(canon); }
        canon.href = 'https://autopaneai.com/vin-decoder';

        // JSON-LD Schema
        const schema = document.createElement('script');
        schema.type = 'application/ld+json';
        schema.id = 'vin-decoder-schema';
        schema.textContent = JSON.stringify([
            {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "APAI Free VIN Decoder",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "url": "https://autopaneai.com/vin-decoder",
                "description": "Use APAI’s free VIN decoder to instantly identify vehicle year, make, model, and safety features. Powered by official NHTSA data for 100% accuracy.",
                "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            },
            {
                "@context": "https://schema.org",
                "@type": "Vehicle",
                "name": "Decoded Vehicle Information",
                "description": "Accurate vehicle specifications including year, make, model, and safety features powered by NHTSA data.",
                "url": "https://autopaneai.com/vin-decoder",
                "vehicleIdentificationNumber": "Decode any 17-digit VIN"
            },
            {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                    { "@type": "Question", "name": "Is this a free VIN check?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. The APAI VIN decoder is a completely free tool provided to help the auto glass community access accurate NHTSA vehicle specifications quickly and easily." } },
                    { "@type": "Question", "name": "What information is included in the NHTSA VIN lookup?", "acceptedAnswer": { "@type": "Answer", "text": "Our decoder provides a comprehensive overview of the vehicle, including the year, make, model, body class, engine type, and safety features like airbags and brake systems." } },
                    { "@type": "Question", "name": "Can I identify car parts by VIN using this tool?", "acceptedAnswer": { "@type": "Answer", "text": "This free tool identifies the vehicle's core specifications. For industry-specific needs—like identifying the exact windshield part number or ADAS camera type—we recommend the full APAI software suite." } },
                    { "@type": "Question", "name": "Does this windshield VIN search work for all US vehicles?", "acceptedAnswer": { "@type": "Answer", "text": "Our decoder works for all 17-digit VINs registered in the United States from 1981 to the current 2026 models, utilizing the latest NHTSA vehicle specifications." } },
                    { "@type": "Question", "name": "How do I get more than just the basic specs?", "acceptedAnswer": { "@type": "Answer", "text": "For just $99 per month, you can upgrade to the full APAI platform. This gives you the power to convert decoded VIN data into instant quotes, order parts directly from distributors, and manage your entire paperless shop." } }
                ]
            }
        ]);
        document.head.appendChild(schema);
        added.push(schema);

        return () => { document.title = prevTitle; added.forEach(el => el?.remove()); };
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleDecode = async (e) => {
        e?.preventDefault();
        const trimmed = vin.trim().toUpperCase();
        if (!trimmed) { inputRef.current?.focus(); return; }
        setLoading(true); setError(null); setResult(null);
        try {
            const data = await decodeVin(trimmed, modelYear);
            if (data.ErrorCode && data.ErrorCode !== '0') setError(data.ErrorText || 'NHTSA could not decode this VIN.');
            else { setResult(data); setTimeout(() => document.getElementById('vd-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }
        } catch (err) { setError(err.message || 'Failed to decode VIN. Please try again.'); }
        finally { setLoading(false); }
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => currentYear - i);

    return (
        <div className="min-h-screen font-sans text-slate-900" style={{ background: '#f8fafc' }}>

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <div className="relative overflow-hidden border-b border-slate-200 min-h-[100vh] flex flex-col justify-center" style={{ background: '#f8fafc' }}>
                <WaveDivider />
                <div className="max-w-6xl mx-auto w-full px-6 pt-32 pb-36 relative z-10 flex flex-col items-center text-center">

                    {/* NHTSA badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#7E5CFE' }} />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Official NHTSA Database · 100% Free</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-5 leading-tight">
                        Free VIN Decoder:<br />
                        <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg,#7E5CFE,#6366f1)' }}>
                            Official NHTSA Vehicle Lookup
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg text-slate-500 max-w-2xl mb-10 leading-relaxed">
                        Instantly identify vehicle specifications with 100% accuracy using the APAI free VIN check, powered by official NHTSA data.
                    </p>

                    {/* Search card */}
                    <form onSubmit={handleDecode}
                        className="w-full max-w-3xl bg-white/90 backdrop-blur-xl p-4 md:p-5 rounded-3xl shadow-xl border border-slate-100 space-y-3"
                    >
                        <div className="flex flex-col md:flex-row gap-3">
                            {/* VIN input */}
                            <div className="flex-1 relative group">
                                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-400 group-focus-within:text-[#7E5CFE] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                                    </svg>
                                </span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={vin}
                                    onChange={e => setVin(e.target.value.toUpperCase())}
                                    placeholder="Enter 17-character VIN"
                                    maxLength={17}
                                    spellCheck={false}
                                    className="w-full pl-11 pr-10 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-[#7E5CFE]/40 focus:bg-white font-mono text-base text-slate-800 placeholder-slate-400 outline-none transition-all"
                                />
                                {vin && <button type="button" onClick={() => setVin('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>}
                            </div>

                            {/* Year */}
                            <select value={modelYear} onChange={e => setModelYear(e.target.value)}
                                className="md:w-36 px-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-[#7E5CFE]/40 text-sm text-slate-600 outline-none appearance-none cursor-pointer transition-all font-medium"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.4em' }}
                            >
                                <option value="">Year (opt.)</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || !vin.trim()}
                                className="px-8 py-4 rounded-2xl text-white font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                style={{ background: loading || !vin.trim() ? '#94a3b8' : 'linear-gradient(135deg,#7E5CFE,#6366f1)', boxShadow: loading || !vin.trim() ? 'none' : '0 8px 20px -4px rgba(126,92,254,0.4)' }}
                            >
                                {loading
                                    ? <svg className="animate-spin w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                    : 'Decode VIN'
                                }
                            </button>
                        </div>

                        {/* Progress dots */}
                        {vin && (
                            <div className="flex items-center gap-3 px-1">
                                <div className="flex gap-1 flex-1">
                                    {Array.from({ length: 17 }).map((_, i) => (
                                        <div key={i} className="h-1 flex-1 rounded-full transition-all duration-200"
                                            style={{ background: i < vin.length ? '#7E5CFE' : '#e2e8f0' }} />
                                    ))}
                                </div>
                                <span className="text-xs font-mono font-bold shrink-0" style={{ color: vin.length === 17 ? '#7E5CFE' : '#94a3b8' }}>
                                    {vin.length}/17 {vin.length === 17 ? '✓' : ''}
                                </span>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* ── Results ──────────────────────────────────────────────────── */}
            <div id="vd-results" className="max-w-6xl mx-auto px-6 pt-12">
                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex gap-4 items-start mb-8">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500 shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <div><p className="font-bold text-slate-900 mb-0.5">Decoding Failed</p><p className="text-sm text-red-600">{error}</p></div>
                    </div>
                )}

                {result && (
                    <div>
                        {/* Vehicle Title Strip */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-6 overflow-hidden"
                            style={{ borderLeft: '4px solid #7E5CFE' }}>
                            <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#7E5CFE' }}>Decoded Vehicle</p>
                                    <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-outfit">
                                        {[result.ModelYear, result.Make, result.Model].filter(Boolean).join(' ')}
                                    </h2>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {[result.BodyClass, result.DriveType, result.FuelTypePrimary, result.EngineCylinders && `${result.EngineCylinders}-cyl`, result.EngineHP && `${result.EngineHP}hp`, result.PlantCountry].filter(Boolean).map((tag, i) => (
                                            <span key={i} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-left sm:text-right space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">VIN</p>
                                    <p className="font-mono font-bold text-slate-700 tracking-wider text-sm">{result.VIN}</p>
                                    <button onClick={() => { setResult(null); setVin(''); setModelYear(''); inputRef.current?.focus(); }}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
                                        style={{ borderColor: '#7E5CFE', color: '#7E5CFE', background: 'rgba(126,92,254,0.06)' }}>
                                        Decode another →
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bento Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
                            {DATA_MAPPING.map(group => {
                                const fields = group.fields.map(k => ({ key: k, label: formatLabel(k), value: result[k] })).filter(f => f.value && f.value !== 'Not Applicable' && f.value !== '');
                                if (!fields.length) return null;
                                return (
                                    <div key={group.title} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                                            <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: '#7E5CFE' }} />
                                            <h3 className="font-bold text-slate-800 text-sm">{group.title}</h3>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-5">
                                            {fields.map(f => <GridItem key={f.key} label={f.label} value={f.value} />)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Content Sections ─────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-6 pb-24 space-y-24">

                {/* Precision Starts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    <div>
                        <SectionLabel>Why Accuracy Matters</SectionLabel>
                        <h2 className="text-3xl font-black text-slate-900 mb-5 leading-tight">Precision Starts with the Right Data</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            In the auto glass industry, a "close enough" part match isn't good enough. The APAI VIN decoder provides instant access to NHTSA vehicle specifications, ensuring you identify the exact year, make, and model before you ever place a glass order.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            By leveraging the official NHTSA VIN lookup, our tool eliminates the guesswork that leads to costly returns and wasted technician time. Whether you are performing a windshield VIN search or a comprehensive free VIN report in the US, this tool is the foundation for a professional repair workflow.
                        </p>
                    </div>
                    <div>
                        <SectionLabel>Why Use the APAI Auto Glass VIN Decoder?</SectionLabel>
                        <div className="space-y-5">
                            <p className="text-slate-700 leading-relaxed">
                                <span className="font-bold text-slate-900">Official Accuracy:</span> Directly integrated with the NHTSA API for the most reliable vehicle data available.
                            </p>
                            <p className="text-slate-700 leading-relaxed">
                                <span className="font-bold text-slate-900">Built for Speed:</span> Designed for technicians on the road who need a free VIN check that works instantly on mobile or desktop.
                            </p>
                            <p className="text-slate-700 leading-relaxed">
                                <span className="font-bold text-slate-900">Beyond the Basics:</span> While other decoders stop at the model name, APAI helps you prepare for the next step—identifying specific glass features and ADAS requirements.
                            </p>
                        </div>
                    </div>
                </div>

                {/* SmartVIN Section */}
                <div className="rounded-3xl border border-violet-100 overflow-hidden" style={{ background: 'rgba(126,92,254,0.03)' }}>
                    <div className="p-8 sm:p-12">
                        <SectionLabel>SmartVIN™ Advantage</SectionLabel>
                        <h2 className="text-3xl font-black text-slate-900 mb-4 leading-tight">From "Decoding" to "Doing"</h2>
                        <p className="text-slate-600 leading-relaxed mb-6 max-w-2xl">
                            While a standard VIN decoder tells you the vehicle's engine size and assembly plant, auto glass professionals need more. A basic NHTSA VIN lookup won't always tell you if a car has a rain sensor, a heated wiper park, or a forward-facing camera.
                        </p>
                        <p className="text-slate-600 leading-relaxed mb-8 max-w-2xl">
                            That is why we built SmartVIN™. While this page provides a high-quality free VIN check, the full APAI platform takes that data further.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {[
                                { title: 'Identify Car Parts by VIN', desc: 'Automatically map decoded data to specific NAGS part numbers.' },
                                { title: 'ADAS Identification', desc: 'Know exactly which safety systems are on board and what calibration is required before the tech arrives.' },
                                { title: 'Live Pricing Integration', desc: 'Move from a decoded VIN to a live price from distributors like Pilkington in seconds.' },
                            ].map((item, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                    <div className="w-1.5 h-5 rounded-full mb-4" style={{ backgroundColor: '#7E5CFE' }} />
                                    <h3 className="font-bold text-slate-900 mb-2 text-sm">{item.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <div className="max-w-3xl mx-auto w-full">
                    <div className="text-center mb-10">
                        <SectionLabel>FAQ</SectionLabel>
                        <h2 className="text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-2">
                        <Collapse ghost expandIconPosition="end"
                            items={[
                                { key: '1', label: <span className="font-bold text-slate-900">Is this a free VIN check?</span>, children: <p className="text-slate-600 pb-4 text-sm leading-relaxed">Yes. The APAI VIN decoder is a completely free tool provided to help the auto glass community access accurate NHTSA vehicle specifications quickly and easily.</p> },
                                { key: '2', label: <span className="font-bold text-slate-900">What information is included in the NHTSA VIN lookup?</span>, children: <p className="text-slate-600 pb-4 text-sm leading-relaxed">Our decoder provides a comprehensive overview of the vehicle, including the year, make, model, body class, engine type, and safety features like airbags and brake systems.</p> },
                                { key: '3', label: <span className="font-bold text-slate-900">Can I identify car parts by VIN using this tool?</span>, children: <p className="text-slate-600 pb-4 text-sm leading-relaxed">This free tool identifies the vehicle's core specifications. For industry-specific needs—like identifying the exact windshield part number or ADAS camera type—we recommend the full APAI software suite.</p> },
                                { key: '4', label: <span className="font-bold text-slate-900">Does this windshield VIN search work for all US vehicles?</span>, children: <p className="text-slate-600 pb-4 text-sm leading-relaxed">Our decoder works for all 17-digit VINs registered in the United States from 1981 to the current {currentYear} models, utilizing the latest NHTSA vehicle specifications.</p> },
                                { key: '5', label: <span className="font-bold text-slate-900">How do I get more than just the basic specs?</span>, children: <p className="text-slate-600 pb-4 text-sm leading-relaxed">For just $99 per month, you can upgrade to the full APAI platform. This gives you the power to convert decoded VIN data into instant quotes, order parts directly from distributors, and manage your entire paperless shop.</p> },
                            ]}
                        />
                    </div>
                    <style dangerouslySetInnerHTML={{ __html: `.ant-collapse-item{border-bottom:1px solid #f1f5f9!important}.ant-collapse-item:last-child{border-bottom:none!important}.ant-collapse-header{padding:18px 0!important}` }} />
                </div>

                {/* CTA */}
                <div className="text-center bg-white rounded-3xl border border-slate-100 shadow-sm p-10 sm:p-14">
                    <SectionLabel>Get Started</SectionLabel>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Ready to Scale Your Shop?</h2>
                    <p className="text-slate-600 max-w-xl mx-auto mb-8 leading-relaxed">
                        The free APAI VIN decoder is just the beginning. Automate your quoting, eliminate part errors, and manage your technicians from one mobile-first dashboard.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
                            className="px-8 py-3.5 rounded-full font-bold transition-all text-sm text-white"
                            style={{ background: '#7E5CFE', color: '#ffffff', boxShadow: '0 8px 20px -4px rgba(126,92,254,0.35)' }}>
                            [ Start with APAI at just $99/mo. ]
                        </button>
                        <a href="/pricing"
                            className="px-8 py-3.5 rounded-full font-bold border text-sm transition-all inline-flex items-center justify-center hover:bg-violet-50"
                            style={{ borderColor: '#7E5CFE', color: '#7E5CFE', background: 'transparent' }}>
                            View Pricing
                        </a>
                    </div>
                    <p className="!mt-8 text-xs text-slate-400">No hidden fees. Build a smarter shop today.</p>
                </div>
            </div>

            {/* Footer note */}
            <p className="text-center pb-8 text-xs text-slate-400">
                Data sourced from the{' '}
                <a href="https://vpic.nhtsa.dot.gov/api/" target="_blank" rel="noopener noreferrer"
                    className="font-medium hover:underline" style={{ color: '#7E5CFE' }}>NHTSA vPIC API</a>.
                {' '}Free to use · No account required.
            </p>
        </div>
    );
}
