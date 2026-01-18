# VIN API Update Implementation Plan

## Overview

The VIN API now supports a new `lookup_ids=true` parameter that returns all necessary database IDs directly in the response. This eliminates the need for complex fuzzy matching and multiple API calls to resolve vehicle information.

## New VIN API Response (with `lookup_ids=true`)

```json
{
  "vin": "1GYKPDRSXMZ200993",
  "year": "2021",
  "make": "CADILLAC",
  "model": "XT6",
  "body_type": "4 Door Utility",
  "vehicle_type": "MULTIPURPOSE PASSENGER VEHICLE (MPV)",
  "engine": "LGX",
  "transmission": "Automatic",
  "fuel_type": "Gasoline",
  "drive_type": "AWD/All-Wheel Drive",
  "doors": "4",
  "manufacturer": "GENERAL MOTORS LLC",
  "plant_country": "UNITED STATES (USA)",
  "plant_state": "TENNESSEE",
  "errors": ["0"],
  "make_id": 57,
  "make_model_id": 13486,
  "veh_modifier_id": null,
  "body_style_id": 263,
  "veh_id": 70208
}
```

## Current Implementation Issues

The current flow is complex and involves multiple steps:

1. **SearchByVin.jsx** - Calls VIN API (without `lookup_ids`)
2. **handleVinDecoded** in SearchByRoot.jsx - Receives basic VIN data
3. **resolveVinModel.js** - Makes additional API calls to:
   - `getMakes()` to find `make_id` from make name (fuzzy matching)
   - `getModels()` to find `make_model_id` from model name (fuzzy matching)
   - `getBodyTypes()` to get body style options
4. **vinHelpers.js** - Contains fuzzy matching utilities
5. **SearchByYMM.jsx** - Needs to be populated with resolved IDs

This approach is:
- **Slow** (multiple API calls)
- **Error-prone** (fuzzy matching can fail)
- **Complex** (lots of code to maintain)

## New Simplified Flow

```
User enters VIN
       ↓
SearchByVin calls: /agp/v1/vin?vin={VIN}&lookup_ids=true
       ↓
API returns complete data with all IDs:
  - make_id, make_model_id, veh_modifier_id, body_style_id, veh_id
       ↓
handleVinDecoded receives full response
       ↓
Directly populate SearchByYMM dropdowns with values
       ↓
Auto-click "Find Parts" if all required IDs are present
```

## Files to Modify

### 1. `src/components/SearchBy/SearchByvin.jsx`

**Changes:**
- Update the API call to include `lookup_ids=true` parameter
- Pass the complete response to `onDecoded` callback

```javascript
// Line ~54: Update API call
const res = await fetch(`${baseUrl}agp/v1/vin?vin=${vin}&lookup_ids=true`, {
  headers: { accept: "application/json" },
});
```

### 2. `src/components/SearchBy/SearchByRoot.jsx`

**Changes:**
- Simplify `handleVinDecoded` function
- Remove dependency on `resolveVinModel`
- Remove dependency on `getBodyTypes` for VIN flow
- Directly use IDs from VIN API response
- Pass IDs to `SearchByYMM` via props or update method

**Before (lines ~333-413):**
```javascript
const handleVinDecoded = async (data) => {
  // Complex logic with resolveVinModel, getBodyTypes, etc.
};
```

**After:**
```javascript
const handleVinDecoded = async (data) => {
  setVinData(data);
  if (!data) return;

  // All IDs come directly from the API now
  const {
    year, make, model, body_type,
    make_id, make_model_id, veh_modifier_id, body_style_id, veh_id
  } = data;

  // Build vehicle info with all IDs
  const info = {
    year,
    make,
    makeId: make_id,
    model,
    makeModelId: make_model_id,
    vehModifierId: veh_modifier_id,
    body: body_type,
    bodyStyleId: body_style_id,
    vehId: veh_id
  };

  setVehicleInfo(info);
  setVehId(veh_id); // For CarGlassViewer

  // Update customer data
  setCustomerData(prev => ({
    ...prev,
    vehicleYear: year,
    vehicleMake: make,
    vehicleModel: model,
    vehicleStyle: body_type,
    bodyType: body_type,
    vin: data.vin
  }));

  // Trigger "Find Parts" if veh_id is available
  if (veh_id) {
    // Either auto-fetch parts or signal to SearchByYMM to enable Find Parts
  }
};
```

### 3. `src/components/SearchBy/SearchByYMM.jsx`

**Changes:**
- Add new props to accept pre-populated IDs from VIN decode
- Update state to accept external ID values
- Add `useEffect` to detect when VIN data is passed and populate dropdowns
- Auto-trigger "Find Parts" when VIN provides complete data

**Add new props:**
```javascript
SearchByYMM({
  onModelIdFetched,
  onVehicleInfoUpdate,
  value,
  onChange,
  onContinue,
  className,
  disabled = false,
  minYear = 1949,
  showSearch = true,
  // NEW PROPS for VIN integration
  vinData,           // Complete VIN API response
  autoFindParts,     // Boolean to auto-trigger Find Parts
})
```

**Add useEffect for VIN data:**
```javascript
useEffect(() => {
  if (vinData && vinData.veh_id) {
    // Set year
    setYear(vinData.year);
    
    // Set make with ID
    setMakeId(vinData.make_id);
    setMakeName(vinData.make);
    
    // Set model with ID
    setMakeModelId(vinData.make_model_id);
    setModelName(vinData.model);
    setVehModifierId(vinData.veh_modifier_id);
    
    // Set body type with ID
    setBodyStyleId(vinData.body_style_id);
    setBodyTypeName(vinData.body_type);
    
    // Set veh_id
    setVehId(vinData.veh_id);
    
    // Optionally auto-trigger Find Parts
    if (autoFindParts) {
      handleFindParts();
    }
  }
}, [vinData]);
```

### 4. `src/api/resolveVinModel.js`

**Changes:**
- This file can be **deprecated/removed** or kept for backward compatibility
- Update `resolveCompleteVinData` to simply pass through the new VIN data
- Remove fuzzy matching logic (no longer needed)

**Option A: Simplify**
```javascript
export const resolveVinModel = async (vinData) => {
  // Just return the data as-is since VIN API now provides all IDs
  return {
    resolvedModel: vinData.model,
    matchFound: vinData.veh_id !== null,
    makeId: vinData.make_id,
    makeName: vinData.make,
    makeModelId: vinData.make_model_id,
    vehModifierId: vinData.veh_modifier_id,
    bodyStyleId: vinData.body_style_id,
    vehId: vinData.veh_id
  };
};
```

**Option B: Remove entirely**
- Remove import from SearchByRoot.jsx
- Delete the file (or keep for reference)

### 5. Files That Can Be Simplified/Removed

| File | Action |
|------|--------|
| `src/api/resolveVinModel.js` | Simplify or Remove |
| `src/utils/vinHelpers.js` | Keep only `extractDoorCount` if needed elsewhere, remove fuzzy matching functions |

## Implementation Steps

### Phase 1: Update VIN API Call (Low Risk)
1. Modify `SearchByVin.jsx` to add `lookup_ids=true` to the API call
2. Test that the response includes all new fields

### Phase 2: Simplify VIN Decode Handler (Medium Risk)
1. Update `handleVinDecoded` in `SearchByRoot.jsx`
2. Remove calls to `resolveVinModel`
3. Remove calls to `getBodyTypes` in VIN flow
4. Pass complete VIN data to `SearchByYMM`

### Phase 3: Update SearchByYMM Component (Medium Risk)
1. Add new props for VIN data integration
2. Add `useEffect` to handle incoming VIN data
3. Populate dropdowns directly from VIN data
4. Add auto "Find Parts" trigger option
5. Test dropdown population works correctly

### Phase 4: Clean Up (Low Risk)
1. Remove or simplify `resolveVinModel.js`
2. Clean up unused imports
3. Remove unused functions from `vinHelpers.js`

### Phase 5: Testing
1. Test VIN decode with various VINs
2. Verify dropdowns populate correctly
3. Verify "Find Parts" works with VIN-decoded vehicles
4. Test edge cases:
   - VIN with null `veh_modifier_id`
   - VIN with null `body_style_id`
   - Invalid VINs
   - VINs that don't exist in database

## Rollback Plan

If issues are discovered:
1. Revert `lookup_ids=true` parameter change
2. Restore original `handleVinDecoded` logic
3. Keep `resolveVinModel.js` intact until new flow is stable

## Benefits of New Approach

| Aspect | Before | After |
|--------|--------|-------|
| API Calls | 3-4 sequential calls | 1 call |
| Latency | High (multiple round trips) | Low (single round trip) |
| Accuracy | Fuzzy matching (can fail) | Exact IDs (always correct) |
| Code Complexity | High | Low |
| Maintenance | Complex | Simple |

## Notes

- The `veh_id` from the API can be used directly for the CarGlassViewer component
- If `veh_modifier_id` is null, it means no specific modifier/trim is needed
- If `body_style_id` is null, body type selection may still be required manually
- The existing manual YMM selection flow should continue to work unchanged
