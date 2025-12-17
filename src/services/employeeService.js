// Helper functions to manage employee data in localStorage

/**
 * Save employees data to localStorage
 * @param {Array} employees - Array of employee objects
 */
export const saveEmployees = (employees) => {
    if (employees && Array.isArray(employees)) {
        const employeeData = employees.map(emp => ({
            employeeId: emp.employeeId,
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            phone: emp.phone,
            role: emp.role
        }));
        localStorage.setItem("employees_cache", JSON.stringify(employeeData));
    }
};

/**
 * Get all cached employees from localStorage
 * @returns {Array} - Array of employee objects or empty array
 */
export const getEmployees = () => {
    try {
        const cached = localStorage.getItem("employees_cache");
        return cached ? JSON.parse(cached) : [];
    } catch (e) {
        console.error("Failed to parse employees cache", e);
        return [];
    }
};

/**
 * Get employee by ID from cache
 * @param {number} employeeId - Employee ID
 * @returns {Object|null} - Employee object or null
 */
export const getEmployeeById = (employeeId) => {
    const employees = getEmployees();
    return employees.find(emp => emp.employeeId === employeeId) || null;
};

/**
 * Get employee full name by ID
 * @param {number} employeeId - Employee ID
 * @returns {string} - Full name or 'Unknown'
 */
export const getEmployeeName = (employeeId) => {
    const employee = getEmployeeById(employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
};

/**
 * Get employee email by ID
 * @param {number} employeeId - Employee ID
 * @returns {string|null} - Email or null
 */
export const getEmployeeEmail = (employeeId) => {
    const employee = getEmployeeById(employeeId);
    return employee?.email || null;
};

/**
 * Clear employees cache
 */
export const clearEmployeesCache = () => {
    localStorage.removeItem("employees_cache");
};
