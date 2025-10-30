import React, { useEffect, useMemo, useRef, useState } from "react";
import { Select, Spin, message } from "antd";
import { getModelId } from "../api/getModel"; // Import the API function
import CarGlassViewer from "./CarGlassViewer";

const VPIC_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";
const VEHICLE_TYPE = "car";

const buildYears = (start = 1981) =>
{
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
})
{
  // --- YMM state
  const [year, setYear] = useState(value?.year || null);
  const [make, setMake] = useState(value?.make || null);
  const [model, setModel] = useState(value?.model || null);
  const [modelId, setModelId] = useState(null); // State to store the model ID

  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);

  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingModelId, setLoadingModelId] = useState(false); // State for loading model ID

  const makesCache = useRef(new Map()); // key: vehicleType
  const modelsCache = useRef(new Map()); // key: `${make}|${year}`

  const years = useMemo(() => buildYears(minYear), [minYear]);

  // Fetch makes (cached)
  useEffect(() =>
  {
    let ignore = false;
    const loadMakes = async () =>
    {
      const cacheKey = VEHICLE_TYPE;
      if (makesCache.current.has(cacheKey))
      {
        setMakes(makesCache.current.get(cacheKey));
        return;
      }
      setLoadingMakes(true);
      try
      {
        const resp = await fetch(
          `${VPIC_BASE}/GetMakesForVehicleType/${encodeURIComponent(
            VEHICLE_TYPE
          )}?format=json`
        );
        const data = await resp.json();
        const results = Array.isArray(data?.Results) ? data.Results : [];
        const norm = results
          .map((r) => ({
            MakeId: r.MakeId,
            MakeName: (r.MakeName || "").trim(),
          }))
          .filter((r) => r.MakeName);
        if (!ignore)
        {
          makesCache.current.set(cacheKey, norm);
          setMakes(norm);
        }
      } catch (e)
      {
        console.error("Failed to load makes:", e);
        if (!ignore) setMakes([]);
      } finally
      {
        if (!ignore) setLoadingMakes(false);
      }
    };
    loadMakes();
    return () =>
    {
      ignore = true;
    };
  }, []);

  // Fetch models when year+make set
  useEffect(() =>
  {
    let ignore = false;
    const loadModels = async (m, y) =>
    {
      const cacheKey = `${m}|${y}`;
      if (modelsCache.current.has(cacheKey))
      {
        setModels(modelsCache.current.get(cacheKey));
        return;
      }
      setLoadingModels(true);
      try
      {
        const url = `${VPIC_BASE}/GetModelsForMakeYear/make/${encodeURIComponent(
          m
        )}/modelyear/${encodeURIComponent(y)}?format=json`;
        const resp = await fetch(url);
        const data = await resp.json();
        const results = Array.isArray(data?.Results) ? data.Results : [];
        const norm = results
          .map((r) => ({
            ModelName: (r.Model_Name || r.ModelName || "").trim(),
          }))
          .filter((r) => r.ModelName);
        if (!ignore)
        {
          modelsCache.current.set(cacheKey, norm);
          setModels(norm);
        }
      } catch (e)
      {
        console.error("Failed to load models:", e);
        if (!ignore) setModels([]);
      } finally
      {
        if (!ignore) setLoadingModels(false);
      }
    };

    if (year && make)
    {
      loadModels(make, year);
    } else
    {
      setModels([]);
    }

    return () =>
    {
      ignore = true;
    };
  }, [year, make]);

  // Fetch model ID when year, make, and model are selected
  useEffect(() =>
  {
    const fetchModelId = async () =>
    {
      if (!year || !make || !model) return;

      setLoadingModelId(true);
      try
      {
        const data = await getModelId(year, make, model);
        const modelId = data?.model_id || null;
        setModelId(modelId);
        onModelIdFetched?.(modelId); // Pass modelId to parent
        onVehicleInfoUpdate?.({ year, make, model }); // Pass vehicle info to parent
        message.success(`Model ID fetched: ${modelId}`);
      } catch (error)
      {
        console.error("Failed to fetch model ID:", error);
        message.error("Failed to fetch model ID. Please try again.");
        setModelId(null);
      } finally
      {
        setLoadingModelId(false);
      }
    };

    fetchModelId();
  }, [year, make, model]);

  const handleYear = (v) =>
  {
    setYear(v);
    setMake(null);
    setModel(null);
    setModelId(null); // Reset model ID on year change
  };

  const handleMake = (v) =>
  {
    setMake(v);
    setModel(null);
    setModelId(null); // Reset model ID on make change
  };

  const handleModel = (v) =>
  {
    setModel(v);
    setModelId(null); // Reset model ID on model change
  };

  return (
    <div className={className}>
      {/* Card container */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8">
        {/* Grid: Year / Make / Model */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Year */}
          <div>
            <label className="block text-gray-800 font-medium mb-2">Year</label>
            <Select
              size="large"
              className="w-full"
              placeholder="Select year"
              value={year}
              onChange={handleYear}
              disabled={disabled}
              options={years.map((y) => ({ label: y.toString(), value: y }))}
              showSearch={showSearch}
            />
          </div>

          {/* Make */}
          <div>
            <label className="block text-gray-800 font-medium mb-2">Make</label>
            <Select
              size="large"
              className="w-full"
              placeholder="Select make"
              value={make}
              onChange={handleMake}
              disabled={disabled || !year}
              notFoundContent={loadingMakes ? <Spin size="small" /> : null}
              options={toOptions(makes, "MakeName", "MakeName")}
              showSearch={showSearch}
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-gray-800 font-medium mb-2">Model</label>
            <Select
              size="large"
              className="w-full"
              placeholder="Select model"
              value={model}
              onChange={handleModel}
              disabled={disabled || !year || !make}
              notFoundContent={loadingModels ? <Spin size="small" /> : null}
              options={toOptions(models, "ModelName", "ModelName")}
              showSearch={showSearch}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
