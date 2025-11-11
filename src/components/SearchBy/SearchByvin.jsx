import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import config from "../../config";

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

const baseUrl = (config?.pythonApiUrl ?? "http://107.21.57.47:8000/").replace(/\/+$/, "") + "/";

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
    raw.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/[IOQ]/g, "").slice(0, 17);

  const handleChange = (e) =>
  {
    setError("");
    setVin(sanitizeVin(e.target.value));
  };

  useEffect(() =>
  {
    if (!autoDecode) return;

    // Clear any pending debounce
    if (timerRef.current) clearTimeout(timerRef.current);

    // Only fire when valid 17-char VIN
    if (isValid)
    {
      timerRef.current = setTimeout(async () =>
      {
        try
        {
          setLoading(true);
          setError("");
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
      }, delayMs);
    }

    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [isValid]);

  return (
    <div className="space-y-2">
      <label htmlFor="vin-inline" className="text-sm text-gray-700 font-medium">
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
        className="!h-12 !rounded-md !border-gray-300 hover:!border-violet-400 focus:!border-violet-500 focus:!shadow-md focus:!shadow-violet-100 !text-gray-900 placeholder:!text-gray-400 transition-all duration-200"
        status={error ? "error" : undefined}
        disabled={loading}
      />
      <div className="h-5 text-sm">
        {vin.length === 0 && <span className="text-gray-500">The VIN is a 17-character code.</span>}
        {vin.length > 0 && !isValid && (
          <span className="text-red-500">VIN must be 17 characters and cannot contain I, O, or Q.</span>
        )}
        {loading && isValid && <span className="text-gray-600">Decoding…</span>}
        {error && <span className="text-red-500">{error}</span>}
      </div>
    </div>
  );
}
