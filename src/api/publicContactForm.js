// src/api/publicContactForm.js
import urls from '../config';

/**
 * Validate a business slug and get business information
 * @param {string} slug - The business slug to validate
 * @returns {Promise<Object>} - Business info if valid, error if invalid
 */
export async function validateSlug(slug) {
    const response = await fetch(`${urls.pythonApiUrl}agp/v1/user-by-slug/${slug}`, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to validate slug');
    }

    const data = await response.json();
    return data;
}

/**
 * Send a message to the AI chat endpoint
 * @param {string} sessionId - Unique session identifier
 * @param {string} message - User's message
 * @param {number} userId - User ID from slug validation
 * @returns {Promise<Object>} - AI response with message, options, and collected data
 */
export async function sendAiChatMessage(sessionId, message, userId) {
    const response = await fetch(`${urls.pythonApiUrl}agp/v1/ai-chat`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            session_id: sessionId,
            message: message,
            user_id: userId,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to send message');
    }

    const data = await response.json();
    return data;
}

/**
 * Submit contact form data as a chat message to create a lead
 * @param {Object} formData - Form data
 * @param {string} sessionId - Unique session ID
 * @param {number} userId - Business User ID
 * @returns {Promise<Object>} - Response from AI chat
 */
export async function submitContactForm(formData, sessionId, userId) {
    const {
        name,
        email,
        phone,
        location,
        vin,
        year,
        make,
        model,
        serviceType,
        servicePreference,
        windshieldFeatures,
        message
    } = formData;

    // Format the message effectively for the AI to parse it as a lead
    let formattedMessage = `Contact Form Submission:
Name: ${name}
Email: ${email}
Phone: ${phone}
Location: ${location || 'N/A'}
VIN: ${vin || 'N/A'}
Vehicle: ${year || ''} ${make || ''} ${model || ''}
Service Type: ${serviceType || 'N/A'}
Service Preference: ${servicePreference || 'N/A'}`;

    if (serviceType === 'Windshield Replacement' && windshieldFeatures && windshieldFeatures.length > 0) {
        formattedMessage += `\nWindshield Features: ${windshieldFeatures.join(', ')}`;
    }

    if (serviceType === 'Window Rolling Issue' && windowRollingLocation) {
        formattedMessage += `\nWindow Rolling Issue Location: ${windowRollingLocation}`;
    }

    if (serviceType === 'Vent Glass Replacement' && ventGlassLocation) {
        formattedMessage += `\nVent Glass Location: ${ventGlassLocation}`;
    }

    if (serviceType === 'Door Glass Replacement' && doorGlassLocation) {
        formattedMessage += `\nDoor Glass Location: ${doorGlassLocation}`;
    }

    if (serviceType === 'Quarter Glass Replacement' && quarterGlassLocation) {
        formattedMessage += `\nQuarter Glass Location: ${quarterGlassLocation}`;
    }

    formattedMessage += `\nMessage: ${message || 'No additional message provided.'}

Please create a lead for this customer.`;

    return await sendAiChatMessage(sessionId, formattedMessage, userId);
}
