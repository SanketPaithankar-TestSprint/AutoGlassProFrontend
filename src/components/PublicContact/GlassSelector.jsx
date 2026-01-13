// src/components/PublicContact/GlassSelector.jsx
import React, { useState } from 'react';

const GlassSelector = ({ groupedOptions, onSubmit, themeColor, label }) => {
    const [expandedGroups, setExpandedGroups] = useState({});
    const [selectedGlasses, setSelectedGlasses] = useState([]);

    // Validate groupedOptions is an object with content
    if (!groupedOptions || typeof groupedOptions !== 'object') return null;

    const entries = Object.entries(groupedOptions);
    if (entries.length === 0) return null;

    // Toggle group expansion
    const toggleGroup = (groupName) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    // Toggle glass selection
    const toggleGlassSelection = (glass) => {
        setSelectedGlasses(prev => {
            const isSelected = prev.some(g => g.code === glass.code);
            if (isSelected) {
                return prev.filter(g => g.code !== glass.code);
            } else {
                return [...prev, glass];
            }
        });
    };

    // Check if a glass is selected
    const isGlassSelected = (glass) => {
        return selectedGlasses.some(g => g.code === glass.code);
    };

    // Handle submit
    const handleSubmit = () => {
        if (selectedGlasses.length === 0) return;

        // Send all selected glasses as a comma-separated string
        const glassNames = selectedGlasses.map(g => g.label || g.desc).join(', ');
        onSubmit({
            type: 'multiple',
            glasses: selectedGlasses,
            displayText: glassNames
        });
    };

    // Get count of selected items in a group
    const getGroupSelectedCount = (options) => {
        return options.filter(opt => isGlassSelected(opt)).length;
    };

    return (
        <div className="glass-selector-container">
            {label && <div className="glass-selector-label">{label}</div>}

            <div className="glass-groups">
                {entries.map(([groupName, options]) => {
                    if (!Array.isArray(options) || options.length === 0) return null;

                    const isExpanded = expandedGroups[groupName];
                    const selectedCount = getGroupSelectedCount(options);

                    return (
                        <div key={groupName} className="glass-group">
                            <button
                                className={`glass-group-header ${isExpanded ? 'expanded' : ''}`}
                                onClick={() => toggleGroup(groupName)}
                                style={{ '--theme-color': themeColor }}
                            >
                                <div className="glass-group-header-left">
                                    <svg
                                        className={`chevron-icon ${isExpanded ? 'expanded' : ''}`}
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                    <span className="group-name">{groupName}</span>
                                    <span className="group-count">({options.length})</span>
                                </div>
                                {selectedCount > 0 && (
                                    <span
                                        className="selected-badge"
                                        style={{ backgroundColor: themeColor }}
                                    >
                                        {selectedCount} selected
                                    </span>
                                )}
                            </button>

                            {isExpanded && (
                                <div className="glass-options">
                                    {options.map((option, index) => {
                                        const displayLabel = option.label || option.desc || option.name || '';
                                        if (!displayLabel) return null;

                                        const isChecked = isGlassSelected(option);

                                        return (
                                            <label
                                                key={option.code || option.id || index}
                                                className={`glass-option ${isChecked ? 'selected' : ''}`}
                                                style={{ '--theme-color': themeColor }}
                                            >
                                                <div className="checkbox-wrapper">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleGlassSelection(option)}
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
                                                <span className="option-label">{displayLabel}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Selected Summary & Submit Button */}
            <div className="glass-selector-footer">
                {selectedGlasses.length > 0 && (
                    <div className="selected-summary">
                        <span className="selected-count">{selectedGlasses.length} glass type(s) selected</span>
                        <div className="selected-items">
                            {selectedGlasses.map(glass => (
                                <span key={glass.code} className="selected-tag">
                                    {glass.label || glass.desc}
                                    <button
                                        className="remove-tag"
                                        onClick={() => toggleGlassSelection(glass)}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                <button
                    className="submit-selection-btn"
                    onClick={handleSubmit}
                    disabled={selectedGlasses.length === 0}
                    style={{
                        backgroundColor: selectedGlasses.length > 0 ? themeColor : '#cbd5e1',
                        cursor: selectedGlasses.length > 0 ? 'pointer' : 'not-allowed'
                    }}
                >
                    Confirm Selection ({selectedGlasses.length})
                </button>
            </div>
        </div>
    );
};

export default GlassSelector;
