
import urls from '../config';
import { getValidToken } from './getValidToken';

export const getTaxSettings = async () => {
    const token = getValidToken();
    if (!token) throw new Error("No valid token found");

    const response = await fetch(`${urls.javaApiUrl}/v1/users/tax-settings`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'accept': '*/*'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch tax settings: ${response.statusText}`);
    }

    return await response.json();
};

export const saveTaxSettings = async (settings) => {
    const token = getValidToken();
    if (!token) throw new Error("No valid token found");

    const response = await fetch(`${urls.javaApiUrl}/v1/users/tax-settings`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'accept': '*/*'
        },
        body: JSON.stringify(settings)
    });

    if (!response.ok) {
        throw new Error(`Failed to save tax settings: ${response.statusText}`);
    }

    return await response.json();
};
