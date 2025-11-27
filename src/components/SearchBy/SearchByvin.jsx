import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import config from "../../config";

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

const baseUrl = (config?.pythonApiUrl ?? "http://107.21.57.47:8000/")
  .replace(/\/+$/, "") + "/";

export default function SearchByVin({
  autoDecode = true,
  delayMs = 400,
  defaultVin = "",
  onDecoded,
}) {
  const [vin, setVin] = useState(defaultVin.toUpperCase().slice(0, 17));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  const isValid = useMemo(() => VIN_REGEX.test(vin), [vin]);

  // Auto-decode effect
  useEffect(() => {
    if (autoDecode && isValid && !loading && !error && vin.length === 17) {
      const timer = setTimeout(() => {
        handleDecode();
      }, delayMs);
      return () => clearTimeout(timer);
    }
  }, [vin, isValid, autoDecode, delayMs]);

  const sanitizeVin = (raw) =>
    raw
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .replace(/[IOQ]/g, "")
      .slice(0, 17);

  const handleChange = (e) => {
    setError("");
    setVin(sanitizeVin(e.target.value));
  };

  const handleDecode = async () => {
    if (!isValid) {
      setError("VIN must be 17 characters and cannot contain I, O, or Q.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${baseUrl}agp/v1/vin?vin=${vin}`, {
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      onDecoded?.(data);
    } catch (e) {
      console.error(e);
      setError("Failed to decode VIN. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <style>{`
        #vin-inline:-webkit-autofill,
        #vin-inline:-webkit-autofill:hover, 
        #vin-inline:-webkit-autofill:focus, 
        #vin-inline:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px white inset !important;
          -webkit-text-fill-color: black !important;
          font-weight: bold !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
      <label
        htmlFor="vin-inline"
        className="text-sm text-slate-600 font-medium"
      >
        Enter VIN
      </label>

      <Input
        id="vin-inline"
        value={vin}
        onChange={handleChange}
        maxLength={17}
        size="large"
        placeholder="17-character VIN"
        aria-label="Vehicle Identification Number"
        prefix={<SearchOutlined className="text-violet-500" />}
        className="
          !h-11 !rounded-xl
          !bg-white
          !border-slate-200 hover:!border-violet-400 focus:!border-violet-500
          focus:!shadow-[0_0_0_1px_rgba(139,92,246,0.7)]
          !text-black !font-bold placeholder:!text-slate-400
          transition-all duration-200
        "
        status={error ? "error" : undefined}
        disabled={loading}
      />

      <button
        type="button"
        className="mt-2 px-4 py-2 rounded bg-violet-600 text-white font-semibold disabled:opacity-60"
        onClick={handleDecode}
        disabled={loading || !isValid}
      >
        {loading ? "Decoding…" : "Decode VIN"}
      </button>

      <div className="h-5 text-xs md:text-sm">
        {vin.length === 0 && (
          <span className="text-slate-500">
            The VIN is a 17-character code containing letters and numbers.
          </span>
        )}
        {vin.length > 0 && !isValid && (
          <span className="text-rose-400">
            VIN must be 17 characters and cannot contain I, O, or Q.
          </span>
        )}
        {loading && isValid && (
          <span className="text-slate-500">Decoding…</span>
        )}
        {error && <span className="text-rose-400">{error}</span>}
      </div>
    </div>
  );
}
