import { useState, useEffect } from "react";

/**
 * Hook to track whether quote items have changed since the last save.
 * Returns { hasChanges, savedItems, markAsSaved }.
 */
export function useQuoteDirtyState(items) {
    const [hasChanges, setHasChanges] = useState(false);
    const [savedItems, setSavedItems] = useState(items);

    useEffect(() => {
        const itemsChanged = JSON.stringify(items) !== JSON.stringify(savedItems);
        setHasChanges(itemsChanged);
    }, [items, savedItems]);

    const markAsSaved = (currentItems) => {
        setSavedItems(currentItems);
        setHasChanges(false);
    };

    return { hasChanges, savedItems, markAsSaved };
}
