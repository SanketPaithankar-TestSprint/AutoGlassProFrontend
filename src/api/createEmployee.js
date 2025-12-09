import urls from "../config";

export async function createEmployee(token, employeeData) {
    const url = `${urls.javaApiUrl}/v1/employees`;
    try {
        console.log("Creating employee payload:", JSON.stringify(employeeData, null, 2));
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(employeeData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Employee creation failed:", response.status, errorText);
            throw new Error(`Error: ${response.status} - ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to create employee:", error);
        throw error;
    }
}
