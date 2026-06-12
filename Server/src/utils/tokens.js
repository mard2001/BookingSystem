import jwt from 'jsonwebtoken';
import "dotenv/config";

export const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.ACCESS_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

    return { accessToken, refreshToken, expiresAt };
};

export const cookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: process.env.NODE_STAT === 'PRODUCTION',
    ...(process.env.NODE_STAT === 'PRODUCTION' && { partitioned: true }),
    sameSite: process.env.NODE_STAT === 'PRODUCTION' ? 'None' : 'Lax',
    ...(maxAge && { maxAge })
});