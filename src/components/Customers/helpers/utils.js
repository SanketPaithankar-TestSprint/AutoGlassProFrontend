export const applyCustomerFilters = (items, filters) => {
    let filtered = [...items];

    // 1. Search Term
    if (filters.searchTerm) {
        const lowerTerm = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(item => {
            // Check common fields
            const firstName = item.firstName?.toLowerCase() || '';
            const lastName = item.lastName?.toLowerCase() || '';
            const companyName = item.companyName?.toLowerCase() || '';
            const email = item.email?.toLowerCase() || '';
            const phone = item.phone || '';
            const taxId = item.taxId || '';

            return (
                firstName.includes(lowerTerm) ||
                lastName.includes(lowerTerm) ||
                companyName.includes(lowerTerm) ||
                email.includes(lowerTerm) ||
                phone.includes(lowerTerm) ||
                taxId.includes(lowerTerm)
            );
        });
    }

    // 2. Date Range (Created At - assuming items have createdAt or similar if available, 
    // real API might not return it for customers yet, but let's assume standard JPA audit fields or basic availability)
    // If API doesn't return createdAt, this filter won't work well, but I'll add the logic.
    if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        let startDate = null;
        let endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);

        switch (filters.dateRange) {
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'custom':
                if (filters.customStartDate) {
                    startDate = new Date(filters.customStartDate);
                    startDate.setHours(0, 0, 0, 0);
                }
                if (filters.customEndDate) {
                    endDate = new Date(filters.customEndDate);
                    endDate.setHours(23, 59, 59, 999);
                }
                break;
            default:
                break;
        }

        if (startDate) {
            filtered = filtered.filter(item => {
                // Determine date field. Usually 'createdAt' or 'dateAdded'
                const itemDateStr = item.createdAt || item.dateAdded;
                if (!itemDateStr) return true; // If no date, maybe include? Or exclude? Let's include to be safe or investigate API.
                const itemDate = new Date(itemDateStr);
                return itemDate >= startDate && itemDate <= endDate;
            });
        }
    }

    // 3. Has Vehicle
    if (filters.hasVehicle) {
        filtered = filtered.filter(item => !!item.vehicle || (Array.isArray(item.vehicles) && item.vehicles.length > 0));
    }

    // 4. Has Email
    if (filters.hasEmail) {
        filtered = filtered.filter(item => !!item.email);
    }

    // 5. Tax Exempt (Only relevant for Organizations usually)
    if (filters.taxExempt) {
        filtered = filtered.filter(item => !!item.taxExempt || !!item.isTaxExempt);
    }

    return filtered;
};

export const getDateRangeOptions = () => [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'custom', label: 'Custom Range' },
];
