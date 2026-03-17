import { getValidToken } from './getValidToken';
import config from '../config';

const BASE_URL = `${config.pythonApiUrl}agp/v1/shop-proxy-kb`;

const getHeaders = () => {
    const token = getValidToken();
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorText = await response.text();
        let errMsg = errorText;
        try {
            const parsed = JSON.parse(errorText);
            errMsg = parsed.message || parsed.error || errorText;
        } catch (e) {
            // Ignore parse error
        }
        throw new Error(errMsg || `API request failed with status ${response.status}`);
    }
    
    // Some endpoints returning 200 might have empty bodies like DELETE
    const text = await response.text();
    return text ? JSON.parse(text) : {};
};

/**
 * Fetch the Shop Proxy Knowledge Base configuration.
 */
export const getShopProxyKb = async () => {
    const response = await fetch(BASE_URL, {
        method: 'GET',
        headers: getHeaders()
    });
    return handleResponse(response);
};

/**
 * Create or replace the Shop Proxy Knowledge Base configuration.
 */
export const upsertShopProxyKb = async (data) => {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

/**
 * Partially update the Shop Proxy Knowledge Base configuration.
 */
export const updateShopProxyKb = async (data) => {
    const response = await fetch(BASE_URL, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

/**
 * Delete the Shop Proxy Knowledge Base configuration.
 */
export const deleteShopProxyKb = async () => {
    const response = await fetch(BASE_URL, {
        method: 'DELETE',
        headers: getHeaders()
    });
    return handleResponse(response);
};
