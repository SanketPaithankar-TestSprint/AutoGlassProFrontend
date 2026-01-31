import urls from '../config';

/**
 * Create or Update User Slug Information
 * @param {string} token - JWT Token
 * @param {Object} data - Slug data
 * @param {number} data.userId - User ID
 * @param {string} data.slug - User Slug
 * @param {string} [data.themeColor] - Theme Color (optional)
 * @returns {Promise<Object>} Response data
 */
export async function createOrUpdateUserSlug(token, {
    slug,
    themeColor,
    businessName,
    tagline,
    name,
    address,
    phone,
    alternatePhone,
    latitude,
    longitude,
    maps
}) {
    const response = await fetch(`${urls.javaApiUrl}/v1/user-slug-info`, {
        method: 'POST', // Based on Swagger link provided: createOrUpdate typically implies POST or PUT. Swagger says POST usually if it's "create". I'll assume POST based on typical usage, user said "createOrUpdate".
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            slug,
            themeColor,
            businessName,
            tagline,
            name,
            address,
            phone,
            alternatePhone,
            latitude,
            longitude,
            maps
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to save slug: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Get User Slug Information by User ID
 * @param {string} token - JWT Token
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User Slug data
 */
export async function getUserSlugByUserId(token, userId) {
    const response = await fetch(`${urls.javaApiUrl}/v1/user-slug-info/user/${userId}`, {
        method: 'GET',
        headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        // Handle 404 specifically if needed, but for now generic error
        throw new Error(`Failed to fetch slug: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}
