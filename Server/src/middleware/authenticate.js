import jwt from 'jsonwebtoken';
import "dotenv/config";

export const authenticate = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);  
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });  
    }
};

export const genericMiddleware = (req, res, next) => {
    const token = req.cookies.accessToken;

    if (!token) {
        req.user = null;
        return next(); // no token — proceed anyway
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        req.user = decoded;
    } catch (err) {
        req.user = null; // invalid/expired token — still proceed, just unauthenticated
    }

    next();
};