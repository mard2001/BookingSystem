import { db } from '../connect.js';
import { getCurrentTimestamp } from '../utils/helpers.js';

let isRunning = false;

export const expireOverduePayments = async () => {
    if (isRunning) return;
    isRunning = true;

    try {
        const [expired] = await db.query(`
            SELECT 
                bp.id,
                bp.bookingID
            FROM tbl_booking_payment bp
            JOIN tbl_bookings b ON b.bookingID = bp.bookingID
            WHERE bp.status = 'initiated'
                AND bp.expiresAt <= NOW()
        `);

        if (expired.length === 0) return;

        const now = getCurrentTimestamp();

        for (const payment of expired) {
            const conn = await db.getConnection();
            try {
                await conn.beginTransaction();

                // Lock the row — prevents race with PayMongo webhook
                const [rows] = await conn.query(`
                    SELECT id
                    FROM tbl_booking_payment
                    WHERE id = ? AND status = 'initiated'
                    FOR UPDATE
                `, [payment.id]);

                if (rows.length === 0) {
                    // Webhook already handled it
                    await conn.rollback();
                    continue;
                }

                await conn.query(`
                    UPDATE tbl_booking_payment
                    SET status = 'failed', updatedAt = ?
                    WHERE id = ?
                `, [now, payment.id]);

                await conn.query(`
                    UPDATE tbl_bookings
                    SET status = 'cancelled', updatedAt = ?
                    WHERE bookingID = ?
                `, [now, payment.bookingID]);

                await conn.commit();

            } catch (err) {
                await conn.rollback();
                console.error(`[CRON] Failed to expire payment id ${payment.id}:`, err);
            } finally {
                conn.release();
            }
        }

        console.log(`[CRON] Expired ${expired.length} payment(s).`);

    } finally {
        isRunning = false;
    }
};