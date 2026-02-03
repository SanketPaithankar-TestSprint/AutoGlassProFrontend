/**
 * Sales Report API
 * Fetches sales report PDF from the backend
 */

const BASE_URL = "https://api.autopaneai.com/agp/v1";

/**
 * Fetches a sales report PDF for the given date range
 * @param {number} userId - User ID to filter records
 * @param {string} fromDate - Start date in YYYY-MM-DD format
 * @param {string} toDate - End date in YYYY-MM-DD format
 * @param {number[]} [doctypes=[0]] - Array of document types to filter (0: Invoice, 1: Work Order, 2: Quote)
 * @returns {Promise<Blob>} - PDF blob
 */
export async function getSalesReport(userId, fromDate, toDate, doctypes = [0]) {
    const queryParams = new URLSearchParams({
        user_id: userId,
        from_date: fromDate,
        to_date: toDate
    });

    if (Array.isArray(doctypes)) {
        doctypes.forEach(type => queryParams.append('doctype', type));
    }

    const url = `${BASE_URL}/sales-report?${queryParams.toString()}`;

    console.log('[getSalesReport] Fetching report from:', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'accept': 'application/json'
        }
    });

    console.log('[getSalesReport] Response status:', response.status);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[getSalesReport] Error response:', errorText);
        throw new Error(`Failed to fetch sales report: ${response.status} - ${errorText}`);
    }

    // The API returns a PDF, so we get it as a blob
    const blob = await response.blob();
    console.log('[getSalesReport] Received blob, size:', blob.size, 'type:', blob.type);
    return blob;
}

export default getSalesReport;
