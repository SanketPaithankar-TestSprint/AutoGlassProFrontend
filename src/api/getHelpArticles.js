import urls from "../config";
import { getValidToken } from "./getValidToken";

export async function getHelpArticles(params = {}) {
    const { category, search, limit = 10, offset = 0 } = params;
    const queryParams = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
    });

    if (category) {
        queryParams.append('category', category);
        console.log('🔍 Adding category param:', category);
    }

    if (search) {
        queryParams.append('search', search);
    }

    const url = `${urls.javaApiUrl}/support/articles?${queryParams}`;
    const token = getValidToken();
    
    console.log('🔍 getHelpArticles Debug:');
    console.log('- URL:', url);
    console.log('- Token exists:', !!token);
    console.log('- Token preview:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('- Params:', params);
    
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        if (!response.ok) {
            console.error('❌ Response error:', response.status, response.statusText);
            throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 API Response data:', data);
        console.log('📊 Data length:', Array.isArray(data) ? data.length : 'Not an array');
        
        return data;
    } catch (error) {
        console.error("❌ Failed to fetch help articles:", error);
        console.error("❌ Error details:", error.message);
        throw error;
    }
}

export async function getHelpArticleById(id) {
    const url = `${urls.javaApiUrl}/support/articles/${id}`;
    const token = getValidToken();
    
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch help article with id ${id}:`, error);
        throw error;
    }
}
