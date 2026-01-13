// src/components/PublicContact/GroupedOptionTiles.jsx
import React from 'react';

const GroupedOptionTiles = ({ groupedOptions, onSelect, themeColor }) => {
    // Validate groupedOptions is an object with content
    if (!groupedOptions || typeof groupedOptions !== 'object') return null;

    const entries = Object.entries(groupedOptions);
    if (entries.length === 0) return null;

    // Helper to safely get display text from an option
    const getOptionLabel = (option) => {
        if (option === null || option === undefined) return '';
        if (typeof option === 'string') return option;
        if (typeof option === 'number') return String(option);
        if (typeof option === 'object') {
            return option.label || option.name || option.value || option.text || '';
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

    // Helper to get description if it exists
    const getOptionDescription = (option) => {
        if (option && typeof option === 'object' && option.description) {
            return option.description;
        }
        return null;
    };

    return (
        <div className="grouped-tiles-container">
            {entries.map(([groupName, options]) => {
                // Validate options is an array
                if (!Array.isArray(options) || options.length === 0) return null;

                return (
                    <div key={groupName} className="tile-group">
                        <div className="tile-group-label">{groupName}</div>
                        <div className="tile-group-grid">
                            {options.map((option, index) => {
                                const displayLabel = getOptionLabel(option);
                                // Skip rendering if we can't get a valid label
                                if (!displayLabel) return null;

                                const description = getOptionDescription(option);

                                return (
                                    <button
                                        key={getOptionKey(option, index)}
                                        className="grouped-tile"
                                        onClick={() => onSelect(option)}
                                        style={{ '--theme-color': themeColor }}
                                    >
                                        <div className="grouped-tile-name">
                                            {displayLabel}
                                        </div>
                                        {description && (
                                            <div className="grouped-tile-desc">{description}</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default GroupedOptionTiles;

