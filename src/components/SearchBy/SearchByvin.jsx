import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "antd";
import { SearchOutlined, ScanOutlined } from "@ant-design/icons";
import config from "../../config";
import VinScanner from "./VinScanner";

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
  const [isScanning, setIsScanning] = useState(false);
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

  const handleScanResult = (decodedText) => {
    if (!decodedText) return;

    const sanitized = sanitizeVin(decodedText);

    // Strict validation: Must be exactly 17 characters
    if (sanitized.length === 17) {
      setVin(sanitized);
      setIsScanning(false); // Close the scanner only on valid scan
    } else {
      // Optional: Give feedback but keep scanning
      // We use a small delay or check to avoid spamming usage of 'message' if scanning continuously
      // But VinScanner now has a 2s cooldown for same-text, so this is safe.
      // We only show error if it's clearly not a partial scan.
      if (sanitized.length > 10) {
        // console.log("Ignored invalid scan:", sanitized);
        // You could show a toast here, but it might be annoying if scanning background noise.
        // For now, we just silently ignore invalid lengths to let user keep trying 
        // until they hit the barcode correctly.
      }
    }
  };

  const handleDecode = async () => {
    if (!isValid) {
      setError("VIN must be 17 characters and cannot contain I, O, or Q.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${baseUrl}agp/v1/vin?vin=${vin}&lookup_ids=true`, {
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
          font-weight: normal !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
      <div className="flex items-center gap-2 mt-1">
        <Input
          id="vin-inline"
          value={vin}
          onChange={handleChange}
          maxLength={17}
          size="middle"
          placeholder="17-character VIN"
          aria-label="Vehicle Identification Number"
          prefix={<SearchOutlined className="text-slate-400 group-focus-within:text-blue-500" />}
          className="
            !h-9 !rounded-md
            !bg-white
            !border-[#E2E8F0] hover:!border-blue-400 focus:!border-[#3B82F6]
            focus:!shadow-[0_0_0_3px_rgba(59,130,246,0.1)]
            !text-black !font-normal placeholder:!text-slate-400
            !text-sm
            transition-all duration-200
            flex-1
            outline-none
          "
          status={error ? "error" : undefined}
          disabled={loading}
          onPressEnter={handleDecode}
        />


        <button
          type="button"
          className="md:hidden h-9 px-3 rounded-md bg-transparent border border-[#E2E8F0] text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800 flex items-center justify-center"
          title="Scan VIN"
          onClick={() => setIsScanning(true)}
        >
          <ScanOutlined />
        </button>

        <button
          type="button"
          className="h-9 px-4 rounded-md bg-transparent border border-[#E2E8F0] text-slate-600 font-medium text-sm transition-colors hover:bg-slate-50 hover:text-slate-800 disabled:opacity-60 whitespace-nowrap"
          onClick={handleDecode}
          disabled={loading || !isValid}
        >
          {loading ? "..." : "Decode"}
        </button>
      </div>

      <div className="text-xs md:text-sm mt-1">

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

      <VinScanner
        visible={isScanning}
        onScan={handleScanResult}
        onClose={() => setIsScanning(false)}
      />
    </div>
  );
}
