// src/components/PublicContact/OptionTiles.jsx
import React from 'react';

const OptionTiles = ({ options, onSelect, themeColor, label }) => {
    // Validate options is an array
    if (!options || !Array.isArray(options) || options.length === 0) return null;

    // Helper to safely get display text from an option
    const getOptionLabel = (option) => {
        if (option === null || option === undefined) return '';
        if (typeof option === 'string') return option;
        if (typeof option === 'number') return String(option);
        if (typeof option === 'object') {
            return option.label || option.name || option.value || option.text || JSON.stringify(option);
        }
        return String(option);
    };

    // Helper to get a unique key for an option
    const getOptionKey = (option, index) => {
        if (option === null || option === undefined) return `option-${index}`;
        if (typeof option === 'string' || typeof option === 'number') return `${option}-${index}`;
        if (typeof option === 'object') {
            return option.id || option.value || option.name || `option-${index}`;
        }
        return `option-${index}`;
    };

    return (
        <div className="option-tiles-container">
            {label && <div className="option-tiles-label">{label}</div>}
            <div className="option-tiles-grid">
                {options.map((option, index) => {
                    const displayLabel = getOptionLabel(option);
                    // Skip rendering if we can't get a valid label
                    if (!displayLabel) return null;

                    return (
                        <button
                            key={getOptionKey(option, index)}
                            className="option-tile"
                            onClick={() => onSelect(option)}
                            style={{ '--theme-color': themeColor }}
                        >
                            {displayLabel}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default OptionTiles;

