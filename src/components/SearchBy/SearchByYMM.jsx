import React, { useEffect, useMemo, useRef, useState } from "react";
import { Select, Spin, message, Button } from "antd";
import { getModels, getBodyTypes, getVehicleDetails, getMakes } from "../../api/getModels";

const buildYears = (start = 1949) => {
  const current = new Date().getFullYear();
  const arr = [];
  for (let y = current; y >= start; y--) arr.push(y);
  return arr;
};

export default function SearchByYMM({
  onModelIdFetched,
  onVehicleInfoUpdate,
  value,
  onChange,
  onContinue,
  className,
  disabled = false,
  minYear = 1949,
  showSearch = true,
}) {
  // --- YMM state with IDs ---
  const [year, setYear] = useState(value?.year || null);

  // Make state: store both ID and name
  const [makeId, setMakeId] = useState(value?.makeId || null);
  const [makeName, setMakeName] = useState(value?.make || null);

  // Model state: store ID, name, and optional modifier
  const [makeModelId, setMakeModelId] = useState(value?.makeModelId || null);
  const [modelName, setModelName] = useState(value?.model || null);
  const [vehModifierId, setVehModifierId] = useState(value?.vehModifierId || null);

  // Body type and vehicle details
  const [bodyType, setBodyType] = useState(null);
  const [vehId, setVehId] = useState(null);
  const [modelId, setModelId] = useState(null);
  const [modelImage, setModelImage] = useState(null);
  const [modelDescription, setModelDescription] = useState(null);

  const [pendingBodyType, setPendingBodyType] = useState(null);

  // Data lists from API
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [bodyTypes, setBodyTypes] = useState([]);

  // Loading states
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingBodyTypes, setLoadingBodyTypes] = useState(false);
  const [loadingModelId, setLoadingModelId] = useState(false);

  // Caches
  const makesCache = useRef(new Map()); // key: year
  const modelsCache = useRef(new Map()); // key: `${makeId}|${year}`
  const bodyTypesCache = useRef(new Map()); // key: `${year}|${makeId}|${makeModelId}|${vehModifierId}`

  const years = useMemo(() => buildYears(minYear), [minYear]);

  // Sync state with value prop
  useEffect(() => {
    if (value && Object.keys(value).length > 0) {
      setYear(value.year || null);

      // Handle make - could be ID or name from VIN decode
      if (value.makeId) {
        setMakeId(value.makeId);
        setMakeName(value.make || null);
      } else if (value.make) {
        // Legacy support: if only make name is provided
        setMakeName(value.make);
      }

      // Handle model - could be ID or name
      if (value.makeModelId) {
        setMakeModelId(value.makeModelId);
        setModelName(value.model || null);
        setVehModifierId(value.vehModifierId || null);
      } else if (value.model) {
        // Legacy support: if only model name is provided
        setModelName(value.model);
      }

      // Handle body type
      if (value.bodyStyleId) {
        setBodyType(value.bodyStyleId);
        setPendingBodyType(null);
      } else if (value.bodyType) {
        setPendingBodyType(value.bodyType);
      }
    } else {
      // Reset all states
      setYear(null);
      setMakeId(null);
      setMakeName(null);
      setMakeModelId(null);
      setModelName(null);
      setVehModifierId(null);
      setBodyType(null);
      setPendingBodyType(null);
      setVehId(null);
      setModelId(null);
      setModelImage(null);
      setModelDescription(null);
    }
  }, [value]);

  // Resolve pending body type string to ID
  useEffect(() => {
    if (pendingBodyType && bodyTypes.length > 0) {
      const lowerPending = pendingBodyType.toLowerCase();
      const match = bodyTypes.find(bt =>
        (bt.desc && bt.desc.toLowerCase() === lowerPending) ||
        (bt.name && bt.name.toLowerCase() === lowerPending)
      );

      if (match) {
        setBodyType(match.body_style_id);
        setPendingBodyType(null);
      }
    }
  }, [bodyTypes, pendingBodyType]);

  // Fetch makes when year changes
  useEffect(() => {
    let ignore = false;
    const loadMakes = async (y) => {
      if (!y) {
        setMakes([]);
        return;
      }

      const cacheKey = `makes|${y}`;
      if (makesCache.current.has(cacheKey)) {
        setMakes(makesCache.current.get(cacheKey));
        return;
      }
      setLoadingMakes(true);
      try {
        const data = await getMakes(y);
        const results = Array.isArray(data?.makes) ? data.makes : [];

        // Normalize: ensure we have make_id and name
        const norm = results.map((m) => ({
          make_id: m.make_id,
          name: m.name || m.abbrev,
        }));

        norm.sort((a, b) => a.name.localeCompare(b.name));

        if (!ignore) {

          // Auto-resolve Make ID if we have a name but no ID
          if (makeName && !makeId) {
            const match = norm.find(m => m.name.toLowerCase() === makeName.toLowerCase());
            if (match) {
              setMakeId(match.make_id);
            }
          }

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

    if (year) {
      loadMakes(year);
    } else {
      setMakes([]);
    }

    return () => {
      ignore = true;
    };
  }, [year, makeId, makeName]);

  // Fetch models when year + makeId set
  useEffect(() => {
    let ignore = false;
    const loadModels = async (mId, y) => {
      const cacheKey = `${mId}|${y}`;
      if (modelsCache.current.has(cacheKey)) {
        setModels(modelsCache.current.get(cacheKey));
        return;
      }
      setLoadingModels(true);
      try {
        const data = await getModels(y, mId);
        const modelsList = Array.isArray(data?.models) ? data.models : [];

        // Normalize model data - each item has make_model_id, model_name, veh_modifier_id
        const norm = modelsList.map(m => ({
          make_model_id: m.make_model_id,
          model_name: m.model_name,
          veh_modifier_id: m.veh_modifier_id || null,
        }));

        norm.sort((a, b) => a.model_name.localeCompare(b.model_name));

        if (!ignore) {

          // Auto-resolve Model ID if we have a name but no ID
          if (modelName && !makeModelId) {
            const match = norm.find(m => m.model_name.toLowerCase() === modelName.toLowerCase());
            if (match) {
              setMakeModelId(match.make_model_id);
              setVehModifierId(match.veh_modifier_id || null);
            }
          }

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

    if (year && makeId) {
      loadModels(makeId, year);
    } else {
      setModels([]);
    }

    return () => {
      ignore = true;
    };
  }, [year, makeId, makeModelId, modelName]);

  // Fetch body types when year + makeId + makeModelId set
  useEffect(() => {
    let ignore = false;
    const loadBodyTypes = async (y, mId, mmId, vModId) => {
      const cacheKey = `${y}|${mId}|${mmId}|${vModId || 'null'}`;
      if (bodyTypesCache.current.has(cacheKey)) {
        setBodyTypes(bodyTypesCache.current.get(cacheKey));
        return;
      }
      setLoadingBodyTypes(true);
      try {
        const data = await getBodyTypes(y, mId, mmId, vModId);
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

    if (year && makeId && makeModelId) {
      loadBodyTypes(year, makeId, makeModelId, vehModifierId);
    } else {
      setBodyTypes([]);
    }

    return () => {
      ignore = true;
    };
  }, [year, makeId, makeModelId, vehModifierId]);

  // Auto-trigger Find Parts when VIN provides complete data including body type
  useEffect(() => {
    if (year && makeId && makeModelId && bodyType && value?.bodyStyleId === bodyType && value?.bodyStyleId) {
      const timer = setTimeout(() => {
        handleFindParts();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [year, makeId, makeModelId, bodyType, value?.bodyStyleId]);

  // Fetch vehicle details and parts when "Find Parts" is clicked
  const handleFindParts = async () => {
    if (!year || !makeId || !makeModelId || !bodyType) {
      message.warning("Please select year, make, model, and body type");
      return;
    }

    setLoadingModelId(true);
    try {
      // Fetch vehicle details using all IDs
      const vehicleData = await getVehicleDetails(year, makeId, makeModelId, bodyType, vehModifierId);

      const vId = vehicleData?.veh_id || null;
      const mId = vehicleData?.model_id || null;

      setVehId(vId);
      setModelId(mId);
      setModelImage(vehicleData?.image || null);
      setModelDescription(vehicleData?.description || null);

      // Notify parent components with the vehicle info
      onModelIdFetched?.(mId);

      // Find the selected body type description
      const selectedBodyType = bodyTypes.find(bt => bt.body_style_id === bodyType);
      const bodyTypeDescription = selectedBodyType ? selectedBodyType.desc : String(bodyType);

      onVehicleInfoUpdate?.({
        year,
        make: makeName,           // Display name
        makeId,                   // ID for API calls
        model: modelName,         // Display name
        makeModelId,              // ID for API calls
        vehModifierId,            // Optional modifier ID
        bodyType: bodyTypeDescription,
        bodyTypeId: bodyType,
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

  // Handler for year selection
  const handleYear = (v) => {
    setYear(v);
    setMakeId(null);
    setMakeName(null);
    setMakeModelId(null);
    setModelName(null);
    setVehModifierId(null);
    setBodyType(null);
    setModelId(null);
    setModelImage(null);
    setModelDescription(null);
  };

  // Handler for make selection - receives make_id, looks up name
  const handleMake = (selectedMakeId) => {
    const selectedMake = makes.find(m => m.make_id === selectedMakeId);
    setMakeId(selectedMakeId);
    setMakeName(selectedMake?.name || null);
    setMakeModelId(null);
    setModelName(null);
    setVehModifierId(null);
    setBodyType(null);
    setModelId(null);
    setModelImage(null);
    setModelDescription(null);
  };

  // Handler for model selection - receives composite key, parses both IDs
  const handleModel = (compositeValue) => {
    // Parse composite value: "make_model_id|veh_modifier_id" or "make_model_id|null"
    const [mmIdStr, vModIdStr] = compositeValue.split('|');
    const selectedMakeModelId = parseInt(mmIdStr, 10);
    const selectedVehModifierId = vModIdStr === 'null' ? null : parseInt(vModIdStr, 10);

    // Find the matching model
    const selectedModel = models.find(m =>
      m.make_model_id === selectedMakeModelId &&
      (m.veh_modifier_id || null) === selectedVehModifierId
    );

    setMakeModelId(selectedMakeModelId);
    setModelName(selectedModel?.model_name || null);
    setVehModifierId(selectedVehModifierId);
    setBodyType(null);
    setModelId(null);
    setModelImage(null);
    setModelDescription(null);
  };

  // Generate model options with composite key (make_model_id|veh_modifier_id)
  const modelOptions = models.map(m => {
    // Create composite value: "make_model_id|veh_modifier_id" 
    const compositeValue = `${m.make_model_id}|${m.veh_modifier_id ?? 'null'}`;
    return {
      label: m.model_name,
      value: compositeValue,
    };
  });

  // Get current composite value for the select
  const currentModelValue = makeModelId !== null
    ? `${makeModelId}|${vehModifierId ?? 'null'}`
    : null;

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
              virtual={false}
              getPopupContainer={() => document.body}
              dropdownStyle={{ maxHeight: 300, overflow: 'auto', zIndex: 9999 }}
              popupMatchSelectWidth={false}
            />
          </div>

          {/* Make */}
          <div className="w-full">
            <label className="block text-gray-800 text-xs font-medium mb-1">Make</label>
            <Select
              size="middle"
              className="w-full !rounded-lg"
              placeholder="Make"
              value={makeId}
              onChange={handleMake}
              disabled={disabled || !year}
              notFoundContent={loadingMakes ? <Spin size="small" /> : null}
              options={makes.map(m => ({
                label: m.name,
                value: m.make_id
              }))}
              showSearch={showSearch}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              virtual={false}
              getPopupContainer={() => document.body}
              dropdownStyle={{ maxHeight: 300, overflow: 'auto', zIndex: 9999 }}
              popupMatchSelectWidth={false}
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
              value={currentModelValue}
              onChange={handleModel}
              disabled={disabled || !year || !makeId}
              notFoundContent={loadingModels ? <Spin size="small" /> : null}
              options={modelOptions}
              showSearch={showSearch}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              virtual={false}
              getPopupContainer={() => document.body}
              dropdownStyle={{ maxHeight: 300, overflow: 'auto', zIndex: 9999 }}
              popupMatchSelectWidth={false}
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
              disabled={disabled || !year || !makeId || !makeModelId}
              notFoundContent={loadingBodyTypes ? <Spin size="small" /> : null}
              options={bodyTypes.map(bt => ({
                label: `${bt.desc} (${bt.abbrev})`,
                value: bt.body_style_id
              }))}
              showSearch={showSearch}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              virtual={false}
              getPopupContainer={() => document.body}
              dropdownStyle={{ maxHeight: 300, overflow: 'auto', zIndex: 9999 }}
              popupMatchSelectWidth={false}
            />
          </div>
        </div>

        {/* Row 3: Find Parts Button */}
        <div className="w-full flex-1 flex flex-col">
          <div className="mt-2 flex-1 flex flex-col">
            <Button
              htmlType="button"
              onClick={handleFindParts}
              disabled={disabled || !makeModelId || !year || !makeId || !bodyType}
              loading={loadingModelId}
              block
              className="w-full bg-white border border-slate-800 text-slate-900 font-semibold text-sm hover:!border-[#7E5CFE] hover:!text-[#7E5CFE] transition-colors !rounded-md shadow-sm flex-1 h-full min-h-[40px]"
            >
              Find Parts
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
