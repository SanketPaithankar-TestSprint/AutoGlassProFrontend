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

  // Track the last auto-searched combination to prevent infinite loops
  const lastAutoSearch = useRef(null);

  const years = useMemo(() => buildYears(minYear), [minYear]);

  // Track if we received complete VIN data with veh_id
  const [vinVehId, setVinVehId] = useState(null);

  // Sync state with value prop
  useEffect(() => {
    if (value && Object.keys(value).length > 0) {
      // Always set year
      setYear(value.year || null);

      // Handle make - set ID if provided, otherwise reset and try to resolve by name
      if (value.makeId) {
        setMakeId(value.makeId);
        setMakeName(value.make || null);
      } else {
        // Reset make ID when not provided (important for new VIN decodes)
        setMakeId(null);
        if (value.make) {
          // Legacy support: if only make name is provided, will be resolved later
          setMakeName(value.make);
        } else {
          setMakeName(null);
        }
      }

      // Handle model - set ID if provided, otherwise reset and try to resolve by name
      if (value.makeModelId) {
        setMakeModelId(value.makeModelId);
        setModelName(value.model || null);
        setVehModifierId(value.vehModifierId || null);
      } else {
        // Reset model ID when not provided (important for VINs where model lookup failed)
        setMakeModelId(null);
        setVehModifierId(value.vehModifierId || null);
        if (value.model) {
          // Model name provided but no ID - will be resolved after models list loads
          setModelName(value.model);
        } else {
          setModelName(null);
        }
      }

      // Handle body type - set ID if provided, otherwise reset
      if (value.bodyStyleId) {
        setBodyType(value.bodyStyleId);
        setPendingBodyType(null);
      } else {
        setBodyType(null);
        if (value.bodyType || value.body) {
          // Body type name provided but no ID - will be resolved after body types list loads
          setPendingBodyType(value.bodyType || value.body);
        } else {
          setPendingBodyType(null);
        }
      }

      // Handle veh_id from VIN decode - if present, we have complete data
      if (value.vehId) {
        console.log('[SearchByYMM] Received vehId from props:', value.vehId);
        // Just set the local vehId state - don't trigger vinVehId effect
        setVehId(value.vehId);
        setVinVehId(null);
      } else {
        // Reset veh_id when not provided
        console.log('[SearchByYMM] No vehId in props, resetting state');
        setVinVehId(null);
        setVehId(null);
      }

      // Reset display-related state that depends on API calls
      setModelId(null);
      setModelImage(null);
      setModelDescription(null);
    } else {
      // Reset all states when value is empty/null
      setYear(null);
      setMakeId(null);
      setMakeName(null);
      setMakeModelId(null);
      setModelName(null);
      setVehModifierId(null);
      setBodyType(null);
      setPendingBodyType(null);
      setVehId(null);
      setVinVehId(null);
      setModelId(null);
      setModelImage(null);
      setModelDescription(null);
    }
  }, [value]);

  // Auto-notify parent when VIN provides complete veh_id (skip body type selection)
  useEffect(() => {
    if (vinVehId && year && makeId && makeModelId) {
      console.log('[SearchByYMM] VIN provided veh_id, auto-notifying parent:', vinVehId);

      // Find body type description if we have bodyStyleId
      let bodyTypeDescription = value?.body || '';
      if (bodyType && bodyTypes.length > 0) {
        const selectedBodyType = bodyTypes.find(bt => bt.body_style_id === bodyType);
        if (selectedBodyType) {
          bodyTypeDescription = selectedBodyType.desc;
        }
      }

      // Notify parent with complete vehicle info
      onModelIdFetched?.(null); // model_id may not be available from VIN

      onVehicleInfoUpdate?.({
        year,
        make: makeName,
        makeId,
        model: modelName,
        makeModelId,
        vehModifierId,
        bodyType: bodyTypeDescription || value?.body,
        bodyTypeId: bodyType,
        veh_id: vinVehId,
        model_id: null,
        image: null,
        description: `${year} ${makeName} ${modelName}`
      });

      message.success(`VIN decoded: ${year} ${makeName} ${modelName}`);

      // Clear vinVehId to prevent re-triggering
      setVinVehId(null);
    }
  }, [vinVehId, year, makeId, makeModelId, makeName, modelName, bodyType, bodyTypes]);

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

  // Helper to pre-populate single item list if we have data (for lazy loading)
  useEffect(() => {
    // If we have make data but no list, populate with just that one to satisfy the Select
    if (makeId && makeName && makes.length === 0) {
      setMakes([{ make_id: makeId, name: makeName }]);
    }
    // If we have model data but no list
    if (makeModelId && modelName && models.length === 0) {
      setModels([{ make_model_id: makeModelId, model_name: modelName, veh_modifier_id: vehModifierId }]);
    }
    // If we have body type data but no list
    if (bodyType && (value?.body || value?.bodyType) && bodyTypes.length === 0) {
      const desc = value.body || value.bodyType;
      // We need to match the structure expected by Select options
      setBodyTypes([{ body_style_id: bodyType, desc: desc, abbrev: "" }]);
    }
  }, [makeId, makeName, makeModelId, modelName, bodyType, value]);

  // Fetch makes when year changes OR user interacts
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
      const norm = results.map((m) => ({ make_id: m.make_id, name: m.name || m.abbrev }));
      norm.sort((a, b) => a.name.localeCompare(b.name));
      makesCache.current.set(cacheKey, norm);
      setMakes(norm);
    } catch (e) {
      console.error("Failed to load makes:", e);
    } finally {
      setLoadingMakes(false);
    }
  };

  // Triggered when user opens Make dropdown
  const handleMakeDropdownVisibleChange = (open) => {
    if (open && year) {
      // Fetch full list if we only have the single pre-filled item or empty
      if (makes.length <= 1) {
        loadMakes(year);
      }
    }
  };

  // Fetch models when year + makeId set OR user interacts
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
      const norm = modelsList.map(m => ({
        make_model_id: m.make_model_id,
        model_name: m.model_name,
        veh_modifier_id: m.veh_modifier_id || null,
      }));
      norm.sort((a, b) => a.model_name.localeCompare(b.model_name));
      modelsCache.current.set(cacheKey, norm);
      setModels(norm);
    } catch (e) {
      console.error("Failed to load models:", e);
    } finally {
      setLoadingModels(false);
    }
  };

  // Triggered when user opens Model dropdown
  const handleModelDropdownVisibleChange = (open) => {
    if (open && year && makeId) {
      if (models.length <= 1) {
        loadModels(makeId, year);
      }
    }
  };

  // Fetch body types
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
      bodyTypesCache.current.set(cacheKey, bodyTypesList);
      setBodyTypes(bodyTypesList);
    } catch (e) {
      console.error("Failed to load body types:", e);
    } finally {
      setLoadingBodyTypes(false);
    }
  };

  // Triggered when user opens Body Type dropdown
  const handleBodyTypeDropdownVisibleChange = (open) => {
    if (open && year && makeId && makeModelId) {
      if (bodyTypes.length <= 1) {
        loadBodyTypes(year, makeId, makeModelId, vehModifierId);
      }
    }
  };

  // --- Initial Effects (REPLACED by lazy logic) ---
  // We still need to react to changes if the user manually changes upstream selections
  // But we want to avoid the "initial load" cascade.

  // Rule: If the user changes State (Year/Make), we MUST fetch downstream.
  // But how to distinguish "User changed" from "Initial Load"?
  // Initial load sets everything at once.

  // We can use the 'makes' length check. If empty or 1, and the user just changed 'year',
  // well if user changed 'year', makes should be cleared, so length is 0.
  // Then we can fetch.

  useEffect(() => {
    if (year && makes.length === 0 && !makeId) {
      // Year selected, but no make yet (normal manual flow) -> Fetch
      loadMakes(year);
    } else if (!year) {
      setMakes([]);
    }
  }, [year, makeId]); // Added makeId to deps to prevent re-fetching if makeId gets set by value prop

  useEffect(() => {
    if (year && makeId && models.length === 0 && !makeModelId) {
      // Make selected, no model yet (manual flow) -> Fetch
      loadModels(makeId, year);
    } else if (!makeId) {
      setModels([]);
    }
  }, [year, makeId, makeModelId]); // Added makeModelId to deps

  useEffect(() => {
    if (year && makeId && makeModelId && bodyTypes.length === 0 && !bodyType) {
      // Model selected, no body yet (manual flow) -> Fetch
      loadBodyTypes(year, makeId, makeModelId, vehModifierId);
    } else if (!makeModelId) {
      setBodyTypes([]);
    }
  }, [year, makeId, makeModelId, vehModifierId, bodyType]); // Added bodyType to deps

  // Auto-trigger Find Parts whenever all required fields are selected
  useEffect(() => {
    if (year && makeId && makeModelId && bodyType) {
      const currentKey = `${year}|${makeId}|${makeModelId}|${bodyType}`;

      // Prevent infinite loops: only trigger if the parameters have changed from the last auto-search
      if (lastAutoSearch.current === currentKey) {
        return;
      }

      const timer = setTimeout(() => {
        lastAutoSearch.current = currentKey;
        handleFindParts();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [year, makeId, makeModelId, bodyType]);

  // Fetch vehicle details and parts when "Find Parts" is clicked
  const handleFindParts = async () => {
    console.log('[SearchByYMM] handleFindParts triggered. Current State:', { year, makeId, makeModelId, bodyType, vehId });

    if (!year || !makeId || !makeModelId || !bodyType) {
      console.log('[SearchByYMM] Missing required fields, skipping search');
      message.warning("Please select year, make, model, and body type");
      return;
    }

    // Update ref to prevent auto-trigger from firing immediately after manual search works
    lastAutoSearch.current = `${year}|${makeId}|${makeModelId}|${bodyType}`;

    // Optimization: If we already have the vehId (e.g. from service document), skip the API call
    if (vehId) {
      console.log('[SearchByYMM] Using existing veh_id, skipping duplicate lookup:', vehId);

      // Notify parent components with the vehicle info directly
      onModelIdFetched?.(modelId || makeModelId);

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
        veh_id: vehId,
        model_id: modelId || makeModelId,
        image: modelImage || null,
        description: modelDescription || `${year} ${makeName} ${modelName}`
      });

      return;
    }

    console.log('[SearchByYMM] No existing vehId, fetching from API...');
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
    <div className={`${className} flex flex-col h-full pb-3`}>
      <style>{`
        /* Ant Select Modernization */
        .ant-select-selector {
          border-color: #E2E8F0 !important;
          border-radius: 6px !important;
          box-shadow: none !important;
        }
        .ant-select:hover .ant-select-selector {
          border-color: #3B82F6 !important;
        }
        .ant-select-focused .ant-select-selector,
        .ant-select-open .ant-select-selector {
          border-color: #3B82F6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
      `}</style>
      {/* Grid: Year / Make / Model - Customized Layout */}
      <div className="flex flex-col gap-2 w-full flex-1">
        {/* Row 1: Year & Make */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
              onDropdownVisibleChange={handleMakeDropdownVisibleChange}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Model */}
          <div className="w-full">
            <label className="block text-gray-800 text-xs font-medium mb-1">Model</label>
            <Select
              size="middle"
              className="w-full !rounded-lg"
              placeholder="Model"
              value={currentModelValue}
              onChange={handleModel}
              onDropdownVisibleChange={handleModelDropdownVisibleChange}
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
              value={bodyType ? String(bodyType) : undefined}
              onChange={(val) => setBodyType(Number(val))}
              onDropdownVisibleChange={handleBodyTypeDropdownVisibleChange}
              disabled={disabled || !year || !makeId || !makeModelId}
              notFoundContent={loadingBodyTypes ? <Spin size="small" /> : null}
              // Format options: label = full description, value = ID
              options={bodyTypes.map((bt) => ({
                label: bt.desc,
                value: String(bt.body_style_id),
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
          <div className="flex-1 flex flex-col">
            <Button
              htmlType="button"
              onClick={handleFindParts}
              disabled={disabled || !makeModelId || !year || !makeId || !bodyType}
              loading={loadingModelId}
              block
              className="w-full bg-[#3B82F6] hover:!bg-[#7E5CFE] text-white hover:!text-white font-semibold text-sm border-0 transition-colors !rounded-md shadow-sm flex-1 h-full min-h-[40px]"
            >
              Find Parts
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
