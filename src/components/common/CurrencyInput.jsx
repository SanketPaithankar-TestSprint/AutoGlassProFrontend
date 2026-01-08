import React, { useState, useEffect, useRef } from 'react';

const CurrencyInput = ({
    value,
    onChange,
    onBlur,
    className,
    placeholder = "$0.00",
    disabled = false
}) => {
    // Local state for the input value
    const [localValue, setLocalValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Refs for stable access inside effects
    const onChangeRef = useRef(onChange);
    const valueRef = useRef(value);

    // Update refs
    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
    useEffect(() => { valueRef.current = value; }, [value]);

    // Sync local value with prop value when not focused
    // This allows external updates (like tax calculation) to reflect
    useEffect(() => {
        if (!isFocused) {
            // Format as currency when not focused
            // Handle various falsy inputs carefully
            if (value === '' || value === null || value === undefined) {
                setLocalValue('');
            } else {
                const num = parseFloat(value);
                setLocalValue(!isNaN(num) ? `$${num.toFixed(2)}` : '');
            }
        }
    }, [value, isFocused]);

    const handleFocus = () => {
        setIsFocused(true);
        // On focus, show the raw number for easier editing
        const unformatted = localValue.replace(/[^0-9.]/g, '');
        setLocalValue(unformatted);
    };

    const emitChange = (val) => {
        const unformatted = val.replace(/[^0-9.]/g, '');
        if (onChangeRef.current) {
            onChangeRef.current(unformatted);
        }
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        emitChange(localValue);
        if (onBlur) {
            onBlur(e);
        }
    };

    const handleChange = (e) => {
        const val = e.target.value;
        setLocalValue(val);
    };

    // Debounce updates while typing
    useEffect(() => {
        if (isFocused) {
            const timeoutId = setTimeout(() => {
                const unformatted = localValue.replace(/[^0-9.]/g, '');
                // Check if it's different to minimize updates
                if (parseFloat(unformatted) !== parseFloat(valueRef.current)) {
                    emitChange(localValue);
                }
            }, 500); // 500ms debounce
            return () => clearTimeout(timeoutId);
        }
    }, [localValue, isFocused]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    return (
        <input
            type="text"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            className={className}
            placeholder={placeholder}
            disabled={disabled}
        />
    );
};

export default CurrencyInput;
