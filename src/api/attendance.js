import urls from "../config";
import { getProfile } from "./getProfile";
import { getEmployees } from "./getEmployees";

// Helper to get current employee details
export async function getCurrentEmployee(token) {
    try {
        // 1. Get User Profile to get userId
        const profile = await getProfile(token);
        if (!profile || !profile.userId) {
            throw new Error("User profile not found");
        }

        // 2. Get All Employees
        const employees = await getEmployees(token);

        // 3. Find match
        // Assuming employee record has a userId field provided by backend to link with auth user
        // If not, we might need to match by email, but userId is safer if available.
        // Based on Profile.jsx, createEmployee sends userId. So we expect it back.
        const employee = employees.find(e => e.userId === profile.userId || e.email === profile.email);

        if (!employee) {
            console.warn("No employee record found for this user.");
            return null;
        }

        return { ...employee, userType: profile.userType };
    } catch (error) {
        console.error("Error fetching current employee:", error);
        throw error;
    }
}

export async function clockIn(token, employeeId, location) {
    const url = `${urls.javaApiUrl}/v1/attendance/clock-in`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                employeeId,
                latitude: location?.latitude,
                longitude: location?.longitude,
                address: location?.address // Optional, if we reverse geocode
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Clock In failed: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Clock In Error:", error);
        throw error;
    }
}

export async function clockOut(token, employeeId, location) {
    const url = `${urls.javaApiUrl}/v1/attendance/clock-out`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                employeeId, // Sometimes clock-out might just need attendanceId, but usually employeeId is enough to find active session
                latitude: location?.latitude,
                longitude: location?.longitude,
                address: location?.address
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Clock Out failed: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Clock Out Error:", error);
        throw error;
    }
}

export async function recordAttendance(token, data) {
    const url = `${urls.javaApiUrl}/v1/attendance/record`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Record Attendance failed: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Record Attendance Error:", error);
        throw error;
    }
}


export async function getAttendanceHistory(token, employeeId) {
    const url = `${urls.javaApiUrl}/v1/attendance/employee/${employeeId}`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error(`Fetch History Failed: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Get Attendance History Error:", error);
        throw error;
    }
}

export async function getAllAttendance(token, params = {}) {
    // Construct query string from params (e.g., date, status)
    const queryString = new URLSearchParams(params).toString();
    const url = `${urls.javaApiUrl}/v1/attendance${queryString ? `?${queryString}` : ''}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error(`Fetch All Attendance Failed: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Get All Attendance Error:", error);
        throw error;
    }
}
