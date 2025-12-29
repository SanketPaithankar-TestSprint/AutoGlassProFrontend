import React, { useEffect, useMemo, useRef, useState } from "react";
import { Select, Spin, message, Button } from "antd";
import { getModelId } from "../../api/getModel"; // Import the API function
import CarGlassViewer from "../carGlassViewer/CarGlassViewer";

const VPIC_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";
const VEHICLE_TYPE = "car";

const buildYears = (start = 1981) => {
  const current = new Date().getFullYear();
  const arr = [];
  for (let y = current; y >= start; y--) arr.push(y);
  return arr;
};

const toOptions = (items, labelKey, valueKey) =>
  items.map((i) => ({ label: i[labelKey], value: i[valueKey] }));

export default function SearchByYMM({
  onModelIdFetched,
  onVehicleInfoUpdate,
  value,
  onChange,
  onContinue,
  className,
  disabled = false,
  minYear = 1981,
  showSearch = true,
}) {
  // --- YMM state
  const [year, setYear] = useState(value?.year || null);
  const [make, setMake] = useState(value?.make || null);
  const [model, setModel] = useState(value?.model || null);
  const [modelId, setModelId] = useState(null); // State to store the model ID
  const [modelImage, setModelImage] = useState(null);
  const [modelDescription, setModelDescription] = useState(null);

  // Sync state with value prop
  useEffect(() => {
    if (value) {
      setYear(value.year || null);
      setMake(value.make || null);
      setModel(value.model || null);
    }
  }, [value]);

  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);

  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingModelId, setLoadingModelId] = useState(false); // State for loading model ID

  const makesCache = useRef(new Map()); // key: vehicleType
  const modelsCache = useRef(new Map()); // key: `${make}|${year}`

  const years = useMemo(() => buildYears(minYear), [minYear]);

  // Fetch makes (cached)
  useEffect(() => {
    let ignore = false;
    const loadMakes = async () => {
      const cacheKey = VEHICLE_TYPE;
      if (makesCache.current.has(cacheKey)) {
        setMakes(makesCache.current.get(cacheKey));
        return;
      }
      setLoadingMakes(true);
      try {
        const resp = await fetch(
          `${VPIC_BASE}/GetMakesForVehicleType/${encodeURIComponent(
            VEHICLE_TYPE
          )}?format=json`
        );
        const data = await resp.json();
        const results = Array.isArray(data?.Results) ? data.Results : [];
        const uniqueMakes = new Set();
        const norm = [];
        results.forEach((r) => {
          const name = (r.MakeName || "").trim();
          if (name && !uniqueMakes.has(name)) {
            uniqueMakes.add(name);
            norm.push({ MakeId: r.MakeId, MakeName: name });
          }
        });
        norm.sort((a, b) => a.MakeName.localeCompare(b.MakeName));
        if (!ignore) {
          makesCache.current.set(cacheKey, norm);
          setMakes(norm);
        }
      } catch (e) {
        console.error("Failed to load makes:", e);
        if (!ignore) setMakes([]);
      } finally {
        if (!ignore) setLoadingMakes(false);
      }
    };
    loadMakes();
    return () => {
      ignore = true;
    };
  }, []);

  // Fetch models when year+make set
  useEffect(() => {
    let ignore = false;
    const loadModels = async (m, y) => {
      const cacheKey = `${m}|${y}`;
      if (modelsCache.current.has(cacheKey)) {
        setModels(modelsCache.current.get(cacheKey));
        return;
      }
      setLoadingModels(true);
      try {
        const url = `${VPIC_BASE}/GetModelsForMakeYear/make/${encodeURIComponent(
          m
        )}/modelyear/${encodeURIComponent(y)}?format=json`;
        const resp = await fetch(url);
        const data = await resp.json();
        const results = Array.isArray(data?.Results) ? data.Results : [];
        const uniqueModels = new Set();
        const norm = [];
        results.forEach((r) => {
          const name = (r.Model_Name || r.ModelName || "").trim();
          if (name && !uniqueModels.has(name)) {
            uniqueModels.add(name);
            norm.push({ ModelName: name });
          }
        });
        norm.sort((a, b) => a.ModelName.localeCompare(b.ModelName));
        if (!ignore) {
          modelsCache.current.set(cacheKey, norm);
          setModels(norm);
        }
      } catch (e) {
        console.error("Failed to load models:", e);
        if (!ignore) setModels([]);
      } finally {
        if (!ignore) setLoadingModels(false);
      }
    };

    if (year && make) {
      loadModels(make, year);
    } else {
      setModels([]);
    }

    return () => {
      ignore = true;
    };
  }, [year, make]);

  const lastFetchedYMM = useRef(""); // Track last fetched key to prevent loops

  // Reusable fetch function
  const fetchModelId = async (y, m, mod) => {
    if (!y || !m || !mod) return;

    // Prevent Fetch Loop: If we are already loading or already fetched this exact combo, maybe skip? 
    // But we need to allow "Retry" if user clicks button. 
    // We update the ref mainly to stop the EFFECT from triggering.
    const key = `${y}|${m}|${mod}`;
    lastFetchedYMM.current = key;

    setLoadingModelId(true);
    try {
      const data = await getModelId(y, m, mod);
      const mId = data?.model_id || null;
      setModelId(mId);
      setModelImage(data?.image || null);
      setModelDescription(data?.description || null);

      onModelIdFetched?.(mId);
      onVehicleInfoUpdate?.({
        year: y,
        make: m,
        model: mod,
        image: data?.image || null,
        description: data?.description || null
      });
      message.success(`Model ID fetched: ${mId}`);
    } catch (error) {
      console.error("Failed to fetch model ID:", error);
      message.error("Failed to fetch model ID. Please try again.");
      setModelId(null);
      setModelImage(null);
      setModelDescription(null);
      lastFetchedYMM.current = ""; // Reset on failure so we can retry or effect can retry
    } finally {
      setLoadingModelId(false);
    }
  };

  // Sync state with value prop and AUTO-FETCH if complete
  useEffect(() => {
    if (value) {
      const { year: y, make: m, model: mod } = value;
      setYear(y || null);
      setMake(m || null);
      setModel(mod || null);

      // Auto-trigger if we have all 3 parts from a likely VIN decode or external update
      if (y && m && mod) {
        const key = `${y}|${m}|${mod}`;
        // Only fetch if it's a NEW combination we haven't just fetched
        if (key !== lastFetchedYMM.current) {
          fetchModelId(y, m, mod);
        }
      }
    }
  }, [value]);

  // Fetch model ID when "Find Parts" is clicked
  const handleFindParts = () => {
    fetchModelId(year, make, model);
  };

  const handleYear = (v) => {
    setYear(v);
    setMake(null);
    setModel(null);
    setModelId(null); // Reset model ID on year change
    setModelImage(null);
    setModelDescription(null);
  };

  const handleMake = (v) => {
    setMake(v);
    setModel(null);
    setModelId(null); // Reset model ID on make change
    setModelImage(null);
    setModelDescription(null);
  };

  const handleModel = (v) => {
    setModel(v);
    setModelId(null); // Reset model ID on model change
    setModelImage(null);
    setModelDescription(null);
  };

  return (
    <div className={`${className} flex flex-col h-full`}>
      <style>{`
        .ant-select .ant-select-selector {
          border-radius: 2px !important;
        }
        .ant-select:hover .ant-select-selector {
          border-color: #7E5CFE !important;
        }
      `}</style>
      {/* Grid: Year / Make / Model - Customized Layout */}
      <div className="flex flex-col gap-2 w-full flex-1">
        {/* Row 1: Year & Make */}
        <div className="grid grid-cols-2 gap-2">
          {/* Year */}
          <div className="w-full">
            <label className="block text-gray-800 text-xs font-medium mb-1">Year</label>
            <Select
              size="middle"
              className="w-full !rounded-lg"
              placeholder="Year"
              value={year}
              onChange={handleYear}
              disabled={disabled}
              options={years.map((y) => ({ label: y.toString(), value: y }))}
              showSearch={showSearch}
            />
          </div>

          {/* Make */}
          <div className="w-full">
            <label className="block text-gray-800 text-xs font-medium mb-1">Make</label>
            <Select
              size="middle"
              className="w-full !rounded-lg"
              placeholder="Make"
              value={make}
              onChange={handleMake}
              disabled={disabled || !year}
              notFoundContent={loadingMakes ? <Spin size="small" /> : null}
              options={toOptions(makes, "MakeName", "MakeName")}
              showSearch={showSearch}
            />
          </div>
        </div>

        {/* Row 2: Model & Button */}
        <div className="w-full flex-1 flex flex-col">
          <label className="block text-gray-800 text-xs font-medium mb-1">Model</label>
          <Select
            size="middle"
            className="w-full !rounded-lg"
            placeholder="Model"
            value={model}
            onChange={handleModel}
            disabled={disabled || !year || !make}
            notFoundContent={loadingModels ? <Spin size="small" /> : null}
            options={toOptions(models, "ModelName", "ModelName")}
            showSearch={showSearch}
          />
          <div className="mt-2 flex-1 flex flex-col">
            <Button
              htmlType="button"
              onClick={handleFindParts}
              disabled={disabled || !model || !year || !make}
              loading={loadingModelId}
              block
              className="w-full bg-white border border-slate-800 text-slate-900 font-semibold text-sm hover:!border-[#7E5CFE] hover:!text-[#7E5CFE] transition-colors !rounded-md shadow-sm flex-1 h-full min-h-[40px]"
            >
              Find Parts
            </Button>
          </div>
        </div>

        {/* Find Parts Button Placeholder - Logic relies on auto-fetch but wireframe shows button. We can add a visual button if needed or keep auto. 
            The current logic auto-fetches. User didn't strictly ask for logic change, just layout. 
            I'll stick to auto-fetch for now unless explicit.
        */}
      </div>
    </div>
  );
}
