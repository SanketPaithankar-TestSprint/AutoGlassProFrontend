// Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getValidToken } from "../../api/getValidToken";
import HeroSection from "./HeroSection";
import { SearchOutlined, CarOutlined } from "@ant-design/icons";

const Home = () => {
    const navigate = useNavigate();
    const [isAuthed, setIsAuthed] = useState(false);
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const token = getValidToken();
        setIsAuthed(Boolean(token));
    }, []);
    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div className="min-h-screen bg-[#F8F9FC] text-slate-900 pb-24">
            {/* Spacer for sticky header if you have one */}
            <div className="h-16" />

            {/* Hero */}
            <HeroSection />

            {/* Auth space / CTA */}
            <div className="max-w-6xl mx-auto px-4 mt-6 flex justify-end">
                {isAuthed ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-sm text-emerald-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>Signed in</span>
                    </div>
                ) : (
                    <button
                        type="button"
                        className="relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-violet-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/40 transition-all duration-200 hover:scale-105 hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
                        onClick={() => navigate("/login")}
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-violet-400/40 via-fuchsia-400/40 to-violet-400/40 opacity-0 transition-opacity duration-300 hover:opacity-100" />
                        <span className="relative">Sign in to continue</span>
                    </button>
                )}
            </div>

            {/* Main content */}
            <div
                className={`max-w-6xl mx-auto px-4 mt-10 transition-all duration-700 ${mounted
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                    }`}
            >
                {/* Heading */}
                <div className="mb-8 space-y-3">
                    <p className="text-xs font-semibold tracking-[0.35em] uppercase text-violet-600/80">
                        AI POWERED VEHICLE INTELLIGENCE
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                        Welcome to{" "}
                        <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                            APAi
                        </span>
                    </h2>
                    <p className="text-sm md:text-base text-slate-600 max-w-2xl">
                        Explore vehicle data, decode VINs, and visualize models in 3D
                        once you sign in to your account. Built for engineers, analysts,
                        and automotive enthusiasts.
                    </p>
                </div>

                <div className="border-b border-slate-200 mb-8" />

                {/* Feature grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {/* Search by Root card */}
                    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/60 hover:shadow-violet-200/50">
                        {/* Glow background */}
                        <div className="pointer-events-none absolute -inset-16 opacity-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.15),_transparent_60%)] transition-opacity duration-300 group-hover:opacity-100" />

                        <div className="relative p-6 flex flex-col h-full justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-violet-50/80 border border-violet-200 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-violet-700 mb-4">
                                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                                    Search For Your Vehicle
                                </div>

                                <h3 className="text-lg md:text-xl font-semibold mb-2 text-slate-900">
                                    Search by Vin or Year Make Model
                                </h3>
                                <p className="text-sm text-slate-600">
                                    Instantly navigate to the{" "}
                                    <span className="font-medium text-violet-600">
                                        SearchBy
                                    </span>{" "}
                                    experience to explore vehicle hierarchies and decode
                                    structured data starting from a root code.
                                </p>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                    <span className="h-1 w-1 rounded-full bg-slate-400" />
                                    <span>Fast · Structured · Precise</span>
                                </div>

                                <button
                                    type="button"
                                    className={`relative inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white
                                    ${isAuthed
                                            ? 'bg-white text-violet-600 border border-violet-400 shadow-violet-200 hover:bg-violet-50 hover:text-violet-700'
                                            : 'bg-slate-100 text-slate-600 border border-slate-200 cursor-not-allowed opacity-50'
                                        }`}

                                    onClick={() => isAuthed && navigate("/search-by-root")}
                                    disabled={!isAuthed}
                                >
                                    <span className="relative flex items-center gap-1">
                                        <span>Open</span>
                                        <span className="inline-block translate-x-0 group-hover:translate-x-0.5 transition-transform duration-200">
                                            →
                                        </span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Placeholder cards (optional) */}
                    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/60">
                        <div className="pointer-events-none absolute -inset-16 opacity-0 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.15),_transparent_60%)] transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="relative p-6 flex flex-col justify-between h-full">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-sky-50/80 border border-sky-200 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-sky-700 mb-4">
                                    VIN decoder
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold mb-2 text-slate-900">
                                    Decode VINs
                                </h3>
                                <p className="text-sm text-slate-600">
                                    Turn raw VINs into rich, structured vehicle information in
                                    seconds with APAi&apos;s decoding engine.
                                </p>
                            </div>
                            <p className="mt-6 text-[11px] text-slate-400 italic">
                                Coming soon to your dashboard.
                            </p>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/60">
                        <div className="pointer-events-none absolute -inset-16 opacity-0 bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.15),_transparent_60%)] transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="relative p-6 flex flex-col justify-between h-full">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50/80 border border-emerald-200 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-emerald-700 mb-4">
                                    3D Viewer
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold mb-2 text-slate-900">
                                    Visualize in 3D
                                </h3>
                                <p className="text-sm text-slate-600">
                                    Experience interactive 3D models and understand vehicle
                                    structure like never before.
                                </p>
                            </div>
                            <p className="mt-6 text-[11px] text-slate-400 italic">
                                Sign in to unlock this experience.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Home;
