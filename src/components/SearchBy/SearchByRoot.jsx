import React, { useState } from "react";
import { NumberOutlined, CompassOutlined } from "@ant-design/icons";
import SearchByVinPage from "./SearchByVinPage";
import SearchByYMMPage from "./SearchByYMMPage";

const SearchByRoot = () => {
  const [showVin, setShowVin] = useState(false);
  const [showYMM, setShowYMM] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 flex items-center justify-center px-4 pt-24 pb-16">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-violet-400/80 mb-3">
            Search Options
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-2">
            Search by{" "}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              vehicle data
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto">
            Choose how you’d like to look up glass and parts—by VIN or by
            year, make, and model.
          </p>
        </div>

        {/* Cards in a horizontal row on md+ */}
        <div className="flex flex-col md:flex-row gap-5">
          {/* Search by VIN */}
          <button
            type="button"
            className="group relative overflow-hidden rounded-2xl border border-slate-800/80 
                       bg-slate-900/70 backdrop-blur-lg shadow-xl shadow-slate-950/70
                       px-5 py-5 md:px-6 md:py-6
                       flex-1 flex items-center justify-between gap-4
                       transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/70 hover:shadow-violet-800/60"
            onClick={() => {
              setShowVin(true);
              setShowYMM(false);
            }}
          >
            {/* Glow */}
            <div className="pointer-events-none absolute -inset-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.5),_transparent_60%)]" />

            <div className="relative flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600/20 border border-violet-500/40">
                <NumberOutlined className="text-lg text-violet-300" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                  Search by VIN
                </h2>
                <p className="text-xs md:text-sm text-slate-300 mt-1">
                  Enter a full VIN to decode and find the exact glass match
                  for the vehicle.
                </p>
              </div>
            </div>

            <span className="relative text-sm font-medium text-violet-300 group-hover:text-violet-200 flex items-center gap-1">
              Open
              <span className="inline-block translate-x-0 group-hover:translate-x-1 transition-transform duration-200">
                →
              </span>
            </span>
          </button>

          {/* Search by Year, Make, Model */}
          <button
            type="button"
            className="group relative overflow-hidden rounded-2xl border border-slate-800/80 
                       bg-slate-900/70 backdrop-blur-lg shadow-xl shadow-slate-950/70
                       px-5 py-5 md:px-6 md:py-6
                       flex-1 flex items-center justify-between gap-4
                       transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/70 hover:shadow-sky-800/60"
            onClick={() => {
              setShowYMM(true);
              setShowVin(false);
            }}
          >
            {/* Glow */}
            <div className="pointer-events-none absolute -inset-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.45),_transparent_60%)]" />

            <div className="relative flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-400/50">
                <CompassOutlined className="text-lg text-sky-300" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-slate-50">
                  Search by Year, Make, Model
                </h2>
                <p className="text-xs md:text-sm text-slate-300 mt-1">
                  Start from YMM and drill down to body style and options to
                  find the right part.
                </p>
              </div>
            </div>

            <span className="relative text-sm font-medium text-sky-300 group-hover:text-sky-200 flex items-center gap-1">
              Open
              <span className="inline-block translate-x-0 group-hover:translate-x-1 transition-transform duration-200">
                →
              </span>
            </span>
          </button>
        </div>

        {/* Render selected search component below */}
        <div className="mt-10">
          {showVin && <SearchByVinPage />}
          {showYMM && <SearchByYMMPage />}
        </div>
      </div>
    </div>
  );
};

export default SearchByRoot;
