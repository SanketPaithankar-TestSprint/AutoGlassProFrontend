import urls from "../config";

export async function updateEmployee(token, employeeId, employeeData) {
    const url = `${urls.javaApiUrl}/v1/employees/${employeeId}`;
    try {
        console.log("Updating employee payload:", JSON.stringify(employeeData, null, 2));
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(employeeData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Employee update failed:", response.status, errorText);
            throw new Error(`Error: ${response.status} - ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to update employee:", error);
        throw error;
    }
}
