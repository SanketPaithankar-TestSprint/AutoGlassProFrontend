const BASELINE_DAYS_FOR_OVERDUE = 0;
// =====================================================
// FILTER FUNCTIONS
// =====================================================

/**
 * Filter documents by status (multi-select support)
 * @param {Array} documents - Array of documents
 * @param {string|Array} status - Status string or array of statuses
 * @returns {Array} Filtered documents
 */
const filterDocumentsByStatus = (documents, status) => {
    if (!status || status === 'all' || (Array.isArray(status) && status.length === 0)) {
        return documents;
    }
    
    // Support for multi-select (array of statuses)
    if (Array.isArray(status)) {
        return documents.filter(doc => 
            status.some(s => doc.status?.toLowerCase() === s.toLowerCase())
        );
    }
    
    return documents.filter(doc => doc.status?.toLowerCase() === status.toLowerCase());
};

/**
 * Filter documents by document type (multi-select support)
 * @param {Array} documents - Array of documents
 * @param {string|Array} type - Document type string or array of types
 * @returns {Array} Filtered documents
 */
const filterDocumentsByType = (documents, type) => {
    if (!type || type === 'all' || (Array.isArray(type) && type.length === 0)) {
        return documents;
    }
    
    // Support for multi-select (array of types)
    if (Array.isArray(type)) {
        return documents.filter(doc => 
            type.some(t => doc.documentType?.toLowerCase() === t.toLowerCase())
        );
    }
    
    return documents.filter(doc => doc.documentType?.toLowerCase() === type.toLowerCase());
};

/**
 * Filter documents by amount range
 * @param {Array} documents - Array of documents
 * @param {number} from - Minimum amount (default: 0)
 * @param {number} to - Maximum amount (default: Infinity)
 * @returns {Array} Filtered documents
 */
const filterDocumentsByAmountRange = (documents, from = 0, to = Infinity) => {
    return documents.filter(doc => {
        const amount = doc.totalAmount || 0;
        return amount >= from && amount <= to;
    });
};

/**
 * Filter documents by date range
 * @param {Array} documents - Array of documents
 * @param {string} rangeType - 'week', 'month', 'custom'
 * @param {Date|string} customStartDate - Start date for custom range
 * @param {Date|string} customEndDate - End date for custom range
 * @returns {Array} Filtered documents
 */
const filterDocumentsByDateRange = (documents, rangeType, customStartDate = null, customEndDate = null) => {
    if (!rangeType || rangeType === 'all') {
        return documents;
    }
    
    const now = new Date();
    let startDate = null;
    let endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
    
    switch (rangeType) {
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
            if (customStartDate) {
                startDate = new Date(customStartDate);
                startDate.setHours(0, 0, 0, 0);
            }
            if (customEndDate) {
                endDate = new Date(customEndDate);
                endDate.setHours(23, 59, 59, 999);
            }
            break;
        default:
            return documents;
    }
    
    return documents.filter(doc => {
        const docDate = new Date(doc.createdAt);
        if (startDate && docDate < startDate) return false;
        if (endDate && docDate > endDate) return false;
        return true;
    });
};

/**
 * Filter documents by search term (searches document number, customer name, vehicle info)
 * @param {Array} documents - Array of documents
 * @param {string} searchTerm - Search string
 * @returns {Array} Filtered documents
 */
const filterDocumentsBySearch = (documents, searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) {
        return documents;
    }
    
    const lowerTerm = searchTerm.toLowerCase();
    return documents.filter(doc =>
        doc.documentNumber?.toLowerCase().includes(lowerTerm) ||
        doc.customerName?.toLowerCase().includes(lowerTerm) ||
        doc.vehicleInfo?.toLowerCase().includes(lowerTerm)
    );
};

/**
 * Apply all filters to documents
 * @param {Array} documents - Array of documents
 * @param {Object} filters - Filter object containing all filter values
 * @returns {Array} Filtered documents
 */
const applyAllFilters = (documents, filters) => {
    let filtered = [...documents];
    
    // Apply search filter
    if (filters.searchTerm) {
        filtered = filterDocumentsBySearch(filtered, filters.searchTerm);
    }
    
    // Apply document type filter
    if (filters.documentType && filters.documentType !== 'all') {
        filtered = filterDocumentsByType(filtered, filters.documentType);
    }
    
    // Apply status filter
    if (filters.status && filters.status !== 'all') {
        filtered = filterDocumentsByStatus(filtered, filters.status);
    }
    
    // Apply amount range filter
    if (filters.amountFrom !== undefined || filters.amountTo !== undefined) {
        filtered = filterDocumentsByAmountRange(
            filtered, 
            filters.amountFrom || 0, 
            filters.amountTo || Infinity
        );
    }
    
    // Apply date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
        filtered = filterDocumentsByDateRange(
            filtered, 
            filters.dateRange, 
            filters.customStartDate, 
            filters.customEndDate
        );
    }
    
    // Apply overdue filter
    if (filters.overdueOnly) {
        filtered = filtered.filter(doc => isOverdue(doc));
    }
    
    return filtered;
};

// =====================================================
// OVERDUE DETECTION FUNCTIONS
// =====================================================



/**
 * Check if a document is overdue based on baseline due date
 * Uses createdAt + BASELINE_DAYS_FOR_OVERDUE as the due date
 * @param {Object} doc - Document object
 * @returns {boolean} True if overdue
 */
const isOverdue = (doc) => {
    if (!doc.createdAt) return false;
    if (!(doc.documentType?.toLowerCase() === 'invoice')) return false;
    // Only check overdue for unpaid documents with balance due
    if ((doc.balanceDue || 0) <= 0) return false;
    if (doc.status?.toLowerCase() === 'paid' || doc.status?.toLowerCase() === 'cancelled') return false;
    
    // Parse dates and extract just the date parts (YYYY-MM-DD) to avoid timezone issues
    const createdDate = new Date(doc.createdAt);
    const currentDate = new Date();
    
    // Use UTC dates to avoid timezone issues
    const createdUTC = Date.UTC(createdDate.getUTCFullYear(), createdDate.getUTCMonth(), createdDate.getUTCDate());
    const currentUTC = Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate());
    
    // Calculate difference in days
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysDifference = Math.floor((currentUTC - createdUTC) / msPerDay);
    
    // Document is overdue if days since creation >= baseline days
    return daysDifference >= BASELINE_DAYS_FOR_OVERDUE;
};

/**
 * Get all overdue documents
 * @param {Array} documents - Array of documents
 * @returns {Array} Documents that are overdue
 */
const getOverdueDocuments = (documents) => {
    return documents.filter(doc => isOverdue(doc));
};

/**
 * Calculate days overdue for a document
 * @param {Object} doc - Document object
 * @returns {number} Number of days overdue (0 if not overdue)
 */
const getDaysOverdue = (doc) => {
    if (!doc.createdAt) return 0;
    
    // Parse dates using UTC to match isOverdue logic
    const createdDate = new Date(doc.createdAt);
    const currentDate = new Date();
    
    const createdUTC = Date.UTC(createdDate.getUTCFullYear(), createdDate.getUTCMonth(), createdDate.getUTCDate());
    const currentUTC = Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate());
    
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysDifference = Math.floor((currentUTC - createdUTC) / msPerDay);
    
    // Return how many days past the baseline (if overdue)
    // e.g., created 2 days ago, baseline 1 => 2 - 1 = 1 day overdue
    const daysOverdue = daysDifference - BASELINE_DAYS_FOR_OVERDUE;
    
    return daysOverdue > 0 ? daysOverdue : 0;
};

// =====================================================
// UI HELPER FUNCTIONS (moved from OpenRoot)
// =====================================================

/**
 * Get Ant Design color tag for document status
 * @param {string} status - Document status
 * @returns {string} Ant Design color string
 */
const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'pending': return 'gold';
        case 'in_progress': return 'blue';
        case 'completed': return 'green';
        case 'paid': return 'purple';
        case 'cancelled': return 'red';
        case 'overdue': return 'orange';
        default: return 'default';
    }
};

/**
 * Get Ant Design color tag for document type
 * @param {string} type - Document type
 * @returns {string} Ant Design color string
 */
const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
        case 'quote': return 'purple';
        case 'work_order': return 'orange';
        case 'workorder': return 'orange';
        case 'invoice': return 'cyan';
        default: return 'default';
    }
};

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency 
    }).format(amount || 0);
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
};

/**
 * Get document status options for filter
 * @returns {Array} Array of status options
 */
const getStatusOptions = () => [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' },
];

/**
 * Get document type options for filter
 * @returns {Array} Array of document type options
 */
const getDocumentTypeOptions = () => [
    { value: 'all', label: 'All Types' },
    { value: 'quote', label: 'Quote' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'work_order', label: 'Work Order' },
];

/**
 * Get date range options for filter
 * @returns {Array} Array of date range options
 */
const getDateRangeOptions = () => [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'custom', label: 'Custom Range' },
];

// =====================================================
// EXPORTS
// =====================================================

export { 
    // Filter functions
    filterDocumentsByStatus, 
    filterDocumentsByType, 
    filterDocumentsByAmountRange,
    filterDocumentsByDateRange,
    filterDocumentsBySearch,
    applyAllFilters,
    
    // Overdue functions
    isOverdue,
    getOverdueDocuments,
    getDaysOverdue,
    BASELINE_DAYS_FOR_OVERDUE,
    
    // UI helpers
    getStatusColor,
    getTypeColor,
    formatCurrency,
    formatDate,
    getStatusOptions,
    getDocumentTypeOptions,
    getDateRangeOptions,
};