import React, { useEffect, useMemo, useRef, useState } from "react";
import { Select, Spin, message, Button } from "antd";
import { getModelId } from "../../api/getModel"; // Import the API function
import { getModels, getBodyTypes, getVehicleDetails } from "../../api/getModels"; // Import the models lookup API
import CarGlassViewer from "../carGlassViewer/CarGlassViewer";
import config from "../../config";

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
  const [bodyType, setBodyType] = useState(null); // State for body type
  const [vehId, setVehId] = useState(null); // State for vehicle ID
  const [modelId, setModelId] = useState(null); // State to store the model ID
  const [modelImage, setModelImage] = useState(null);
  const [modelDescription, setModelDescription] = useState(null);

  // Sync state with value prop and handle VIN-provided body type
  useEffect(() => {
    if (value) {
      setYear(value.year || null);
      setMake(value.make || null);
      setModel(value.model || null);

      // Handle pre-selected body type from VIN decode
      if (value.bodyStyleId) {
        setBodyType(value.bodyStyleId);
      }
    }
  }, [value]);

  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [bodyTypes, setBodyTypes] = useState([]);

  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingBodyTypes, setLoadingBodyTypes] = useState(false);
  const [loadingModelId, setLoadingModelId] = useState(false); // State for loading model ID

  const makesCache = useRef(new Map()); // key: vehicleType
  const modelsCache = useRef(new Map()); // key: `${make}|${year}`
  const bodyTypesCache = useRef(new Map()); // key: `${year}|${make}|${model}`

  const years = useMemo(() => buildYears(minYear), [minYear]);

  // Fetch makes (cached) - using internal API
  useEffect(() => {
    let ignore = false;
    const loadMakes = async () => {
      const cacheKey = "makes"; // Simple cache key since we're not filtering by vehicle type
      if (makesCache.current.has(cacheKey)) {
        setMakes(makesCache.current.get(cacheKey));
        return;
      }
      setLoadingMakes(true);
      try {
        // Use internal API - get makes for a recent year to get comprehensive list
        const currentYear = new Date().getFullYear();
        const resp = await fetch(
          `${config.pythonApiUrl}agp/v1/model-lookup?year=${currentYear}`,
          {
            headers: { accept: "application/json" },
          }
        );
        const data = await resp.json();
        const results = Array.isArray(data?.makes) ? data.makes : [];

        // Transform to expected format: {make_id, abbrev, name} -> {MakeId, MakeName}
        const norm = results.map((m) => ({
          MakeId: m.make_id,
          MakeName: m.name || m.abbrev,
        }));

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
        // Use autopaneai.com API instead of VPIC
        const data = await getModels(y, m);
        const modelsList = Array.isArray(data?.models) ? data.models : [];

        // Transform to expected format
        const norm = modelsList.map(modelName => ({ ModelName: modelName }));
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

  // Fetch body types when year+make+model set
  useEffect(() => {
    let ignore = false;
    const loadBodyTypes = async (y, m, mod) => {
      const cacheKey = `${y}|${m}|${mod}`;
      if (bodyTypesCache.current.has(cacheKey)) {
        setBodyTypes(bodyTypesCache.current.get(cacheKey));
        return;
      }
      setLoadingBodyTypes(true);
      try {
        // Use autopaneai.com API to fetch body types
        const data = await getBodyTypes(y, m, mod);
        const bodyTypesList = Array.isArray(data?.body_types) ? data.body_types : [];

        if (!ignore) {
          bodyTypesCache.current.set(cacheKey, bodyTypesList);
          setBodyTypes(bodyTypesList);
        }
      } catch (e) {
        console.error("Failed to load body types:", e);
        if (!ignore) setBodyTypes([]);
      } finally {
        if (!ignore) setLoadingBodyTypes(false);
      }
    };

    if (year && make && model) {
      loadBodyTypes(year, make, model);
    } else {
      setBodyTypes([]);
    }

    return () => {
      ignore = true;
    };
  }, [year, make, model]);

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

  // Sync state with value prop and handle VIN-provided body type
  useEffect(() => {
    if (value) {
      setYear(value.year || null);
      setMake(value.make || null);
      setModel(value.model || null);

      // Handle pre-selected body type from VIN decode
      if (value.bodyStyleId) {
        setBodyType(value.bodyStyleId);
      }
    }
  }, [value]);

  // Auto-trigger Find Parts when VIN provides complete data including body type
  useEffect(() => {
    // Only auto-trigger if:
    // 1. We have all required fields
    // 2. Body type was auto-selected from VIN (not manually set)
    // 3. The current bodyType matches the VIN-provided bodyStyleId
    if (year && make && model && bodyType && value?.bodyStyleId === bodyType && value?.bodyStyleId) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        handleFindParts();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [year, make, model, bodyType, value?.bodyStyleId]);

  // Fetch vehicle details and parts when "Find Parts" is clicked
  const handleFindParts = async () => {
    if (!year || !make || !model || !bodyType) {
      message.warning("Please select year, make, model, and body type");
      return;
    }

    setLoadingModelId(true);
    try {
      // Step 1: Fetch vehicle details using body_style_id
      const vehicleData = await getVehicleDetails(year, make, model, bodyType);

      const vId = vehicleData?.veh_id || null;
      const mId = vehicleData?.model_id || null;

      setVehId(vId);
      setModelId(mId);
      setModelImage(vehicleData?.image || null);
      setModelDescription(vehicleData?.description || null);

      // Step 2: Notify parent components with the vehicle info
      onModelIdFetched?.(mId);

      // Find the selected body type description
      const selectedBodyType = bodyTypes.find(bt => bt.body_style_id === bodyType);
      const bodyTypeDescription = selectedBodyType ? selectedBodyType.desc : String(bodyType);

      onVehicleInfoUpdate?.({
        year,
        make,
        model,
        bodyType: bodyTypeDescription, // Pass the description instead of ID
        bodyTypeId: bodyType, // Keep the ID for reference
        veh_id: vId,
        model_id: mId,
        image: vehicleData?.image || null,
        description: vehicleData?.description || null
      });

      message.success(`Vehicle found: ${vehicleData?.description || 'Success'}`);
    } catch (error) {
      console.error("Failed to fetch vehicle details:", error);
      message.error("Failed to fetch vehicle details. Please try again.");
      setVehId(null);
      setModelId(null);
      setModelImage(null);
      setModelDescription(null);
    } finally {
      setLoadingModelId(false);
    }
  };

  const handleYear = (v) => {
    setYear(v);
    setMake(null);
    setModel(null);
    setBodyType(null); // Reset body type on year change
    setModelId(null); // Reset model ID on year change
    setModelImage(null);
    setModelDescription(null);
  };

  const handleMake = (v) => {
    setMake(v);
    setModel(null);
    setBodyType(null); // Reset body type on make change
    setModelId(null); // Reset model ID on make change
    setModelImage(null);
    setModelDescription(null);
  };

  const handleModel = (v) => {
    setModel(v);
    setBodyType(null); // Reset body type on model change
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

        {/* Row 2: Model & Body Type */}
        <div className="grid grid-cols-2 gap-2">
          {/* Model */}
          <div className="w-full">
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
          </div>

          {/* Body Type */}
          <div className="w-full">
            <label className="block text-gray-800 text-xs font-medium mb-1">Body Type</label>
            <Select
              size="middle"
              className="w-full !rounded-lg"
              placeholder="Body Type"
              value={bodyType}
              onChange={setBodyType}
              disabled={disabled || !year || !make || !model}
              notFoundContent={loadingBodyTypes ? <Spin size="small" /> : null}
              options={bodyTypes.map(bt => ({
                label: `${bt.desc} (${bt.abbrev})`,
                value: bt.body_style_id
              }))}
              showSearch={showSearch}
            />
          </div>
        </div>

        {/* Row 3: Find Parts Button */}
        <div className="w-full flex-1 flex flex-col">
          <div className="mt-2 flex-1 flex flex-col">
            <Button
              htmlType="button"
              onClick={handleFindParts}
              disabled={disabled || !model || !year || !make || !bodyType}
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
