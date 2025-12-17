// Helper function to get the user's labor rate from localStorage
// This is populated during login and can be updated via the Profile page

export const getUserLaborRate = () => {
    const laborRate = localStorage.getItem("userLaborRate");
    if (laborRate) {
        const rate = parseFloat(laborRate);
        return isNaN(rate) ? null : rate;
    }
    return null;
};

// Helper to set labor rate (can be called after updating in profile)
export const setUserLaborRate = (rate) => {
    if (rate !== null && rate !== undefined) {
        localStorage.setItem("userLaborRate", rate.toString());
    } else {
        localStorage.removeItem("userLaborRate");
    }
};

// Helper to clear labor rate (on logout)
export const clearUserLaborRate = () => {
    localStorage.removeItem("userLaborRate");
};
