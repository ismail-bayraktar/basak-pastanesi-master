/**
 * Standardized API Response Helper
 */

/**
 * Send a success response
 * @param {import('express').Response} res Express response object
 * @param {any} data Data to send
 * @param {string} message Optional success message
 * @param {number} statusCode HTTP status code (default: 200)
 */
export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

/**
 * Send an error response
 * @param {import('express').Response} res Express response object
 * @param {string} message Error message
 * @param {number} statusCode HTTP status code (default: 500)
 * @param {any} errors Optional detailed errors (e.g. validation errors)
 */
export const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors
    });
};
