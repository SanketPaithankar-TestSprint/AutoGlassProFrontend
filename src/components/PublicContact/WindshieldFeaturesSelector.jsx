// src/components/PublicContact/WindshieldFeaturesSelector.jsx
import React, { useState } from 'react';

const WindshieldFeaturesSelector = ({ options, onSubmit, themeColor, label }) => {
    const [selectedFeatures, setSelectedFeatures] = useState([]);

    // Validate options is an array
    if (!options || !Array.isArray(options) || options.length === 0) return null;

    // Toggle feature selection
    const toggleFeatureSelection = (feature) => {
        setSelectedFeatures(prev => {
            // If selecting "No Sensor", clear all other selections
            if (feature.id === 'no_sensor') {
                return prev.some(f => f.id === 'no_sensor') ? [] : [feature];
            }

            // If selecting any other feature, remove "No Sensor" if selected
            const withoutNoSensor = prev.filter(f => f.id !== 'no_sensor');

            const isSelected = withoutNoSensor.some(f => f.id === feature.id);
            if (isSelected) {
                return withoutNoSensor.filter(f => f.id !== feature.id);
            } else {
                return [...withoutNoSensor, feature];
            }
        });
    };

    // Check if a feature is selected
    const isFeatureSelected = (feature) => {
        return selectedFeatures.some(f => f.id === feature.id);
    };

    // Handle submit
    const handleSubmit = () => {
        if (selectedFeatures.length === 0) return;

        // Send all selected features as a comma-separated string
        const featureNames = selectedFeatures.map(f => f.name || f.id).join(', ');
        onSubmit({
            type: 'windshield_features',
            features: selectedFeatures,
            displayText: featureNames
        });
    };

    // Handle "Skip / None" action
    const handleSkip = () => {
        onSubmit({
            type: 'windshield_features',
            features: [],
            displayText: 'none'
        });
    };

    return (
        <div className="windshield-features-container">
            {label && <div className="windshield-features-label">{label}</div>}

            <div className="windshield-features-grid">
                {options.map((option) => {
                    const displayLabel = option.name || option.id || '';
                    if (!displayLabel) return null;

                    const isChecked = isFeatureSelected(option);

                    return (
                        <label
                            key={option.id}
                            className={`windshield-feature-option ${isChecked ? 'selected' : ''}`}
                            style={{ '--theme-color': themeColor }}
                        >
                            <div className="checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleFeatureSelection(option)}
                                />
                                <div
                                    className={`custom-checkbox ${isChecked ? 'checked' : ''}`}
                                    style={isChecked ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
                                >
                                    {isChecked && (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <span className="feature-label">{displayLabel}</span>
                        </label>
                    );
                })}
            </div>

            {/* Selected Summary & Submit Button */}
            <div className="windshield-features-footer">
                {selectedFeatures.length > 0 && (
                    <div className="selected-summary">
                        <span className="selected-count">{selectedFeatures.length} feature(s) selected</span>
                        <div className="selected-items">
                            {selectedFeatures.map(feature => (
                                <span key={feature.id} className="selected-tag">
                                    {feature.name || feature.id}
                                    <button
                                        className="remove-tag"
                                        onClick={() => toggleFeatureSelection(feature)}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                <div className="windshield-features-actions">
                    <button
                        className="skip-btn"
                        onClick={handleSkip}
                        style={{
                            borderColor: themeColor,
                            color: themeColor
                        }}
                    >
                        Skip / None
                    </button>
                    <button
                        className="submit-selection-btn"
                        onClick={handleSubmit}
                        disabled={selectedFeatures.length === 0}
                        style={{
                            backgroundColor: selectedFeatures.length > 0 ? themeColor : '#cbd5e1',
                            cursor: selectedFeatures.length > 0 ? 'pointer' : 'not-allowed'
                        }}
                    >
                        Confirm Selection ({selectedFeatures.length})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WindshieldFeaturesSelector;
