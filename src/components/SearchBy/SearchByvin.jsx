import React, { useMemo, useRef, useState } from "react";
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
})
{
  const [vin, setVin] = useState(defaultVin.toUpperCase().slice(0, 17));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  const isValid = useMemo(() => VIN_REGEX.test(vin), [vin]);

  const sanitizeVin = (raw) =>
    raw
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .replace(/[IOQ]/g, "")
      .slice(0, 17);

  const handleChange = (e) =>
  {
    setError("");
    setVin(sanitizeVin(e.target.value));
  };

  const handleDecode = async () =>
  {
    if (!isValid)
    {
      setError("VIN must be 17 characters and cannot contain I, O, or Q.");
      return;
    }
    setLoading(true);
    setError("");
    try
    {
      const res = await fetch(`${baseUrl}agp/v1/vin?vin=${vin}`, {
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      onDecoded?.(data);
    } catch (e)
    {
      console.error(e);
      setError("Failed to decode VIN. Please try again.");
    } finally
    {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor="vin-inline"
        className="text-sm text-slate-200 font-medium"
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
        prefix={<SearchOutlined className="text-violet-400" />}
        className="
          !h-11 !rounded-xl
          !bg-slate-950/70
          !border-slate-700 hover:!border-violet-400 focus:!border-violet-500
          focus:!shadow-[0_0_0_1px_rgba(139,92,246,0.7)]
          !text-slate-50 placeholder:!text-slate-500
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
          <span className="text-slate-400">
            The VIN is a 17-character code containing letters and numbers.
          </span>
        )}
        {vin.length > 0 && !isValid && (
          <span className="text-rose-400">
            VIN must be 17 characters and cannot contain I, O, or Q.
          </span>
        )}
        {loading && isValid && (
          <span className="text-slate-300">Decoding…</span>
        )}
        {error && <span className="text-rose-400">{error}</span>}
      </div>
    </div>
  );
}
