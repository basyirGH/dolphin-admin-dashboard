// src/utils/request.js

const API_BASE_URL = 'http://localhost:8080/api/v1'; // Set your base API URL

export const apiRequestUtility = async (token, endpoint, options = {}) => {

    let defaultHeaders = {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '', // Add token if available
    };

    // Merge default headers with any custom headers
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            // Handle HTTP errors
            const responseBody = await response.json();
            const error = new Error('Something went wrong');
            error.httpStatus = response.status;
            error.code = responseBody.code;
            error.message = responseBody.message;
            throw error;
        }

        // Parse response JSON
        return await response.json();
    } catch (error) {
        // Centralized error logging or rethrowing
        //console.error(error);
        throw error; // Re-throw to handle in calling code
    }
};
