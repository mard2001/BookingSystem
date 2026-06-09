const sendResponse = (res, statusCode, success, message, data = null, errors = null) => {
    const response = {
        success, statusCode, message, data, errors, timestamp: new Date().toISOString()
    };

    // Remove NULL Fields
    Object.keys(response).forEach(key => response[key] === null && delete response[key]);

    return res.status(statusCode).json(response);
}

const cookieOptions = (overrides = {}) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    ...overrides
});

export const ok = (res, message, data, cookies = null) => {
    if(cookies){
        Object.entries(cookies).forEach(([name, { value, options }]) => {
            res.cookie(name, value, options);
        });
    }
    return sendResponse(res, 200, true,  message, data);
};

export const created = (res, message, data) => sendResponse(res, 201, true,  message, data);
export const badRequest = (res, message, errors) => sendResponse(res, 400, false, message, null, errors);
export const conflict = (res, message) => sendResponse(res, 409, false, message);
export const notFound = (res, message) => sendResponse(res, 404, false, message);
export const serverError = (res, message, errors) => sendResponse(res, 500, false, message, null, errors);
export const unauthorized = (res, message) => sendResponse(res, 401, false, message);
export const clearCookieResponse = (res, cookieNames = [], message, overrides = {}) => {
    const names = Array.isArray(cookieNames) ? cookieNames : [cookieNames];

    names.forEach(name => {
        res.clearCookie(name, cookieOptions(overrides));
    });

    return sendResponse(res, 200, true, message);
};




