import * as response from "./response.js";

export const validateFields = (req, res, fields) => {
    const missing = fields.filter(field => !req.body[field]);
    if (missing.length > 0) {
        response.badRequest(res, "Missing required fields.", { missing });
        return false;
    }
    return true;
};

export const validateTransition = (current, next) => {
    const allowed = {
        pending:   ['confirmed', 'cancelled', 'rejected', 'deleted'],
        confirmed: ['completed', 'cancelled', 'rejected', 'deleted'],
        completed: [],
        cancelled: ['deleted'],
        rejected:  ['deleted']
    };

    return allowed[current]?.includes(next) ?? false;
};