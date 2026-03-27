import urls from "../config";
import { getValidToken } from "./getValidToken";

export async function getHelpCategories() {
    const url = `${urls.javaApiUrl}/support/categories`;
    const token = getValidToken();
    
    console.log('📂 getHelpCategories Debug:');
    console.log('- URL:', url);
    console.log('- Token exists:', !!token);
    
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
        });
        
        console.log('📡 Categories Response status:', response.status);
        console.log('📡 Categories Response ok:', response.ok);
        
        if (!response.ok) {
            console.error('❌ Categories Response error:', response.status, response.statusText);
            throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📂 Categories API Response data:', data);
        console.log('📂 Categories Data length:', Array.isArray(data) ? data.length : 'Not an array');
        
        return data;
    } catch (error) {
        console.error("❌ Failed to fetch help categories:", error);
        console.error("❌ Categories Error details:", error.message);
        throw error;
    }
}
