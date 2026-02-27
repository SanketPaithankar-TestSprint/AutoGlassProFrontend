import { useState } from "react";

/**
 * Hook to track whether quote items have changed since the last save.
 * Uses a version counter from the store instead of JSON.stringify.
 *
 * @param {number} currentVersion - quoteItemsVersion from the Zustand store
 * @returns {{ hasChanges: boolean, markAsSaved: () => void }}
 */
export function useQuoteDirtyState(currentVersion) {
    const [savedVersion, setSavedVersion] = useState(currentVersion);

    const hasChanges = currentVersion !== savedVersion;

    const markAsSaved = () => {
        setSavedVersion(currentVersion);
    };

    return { hasChanges, markAsSaved };
}
