import { db, getPromiseConnection } from '../../connect.js';
import { getCurrentTimestamp } from '../../utils/calculateValues.js';

export const completeBookings = async () => {
    const now = getCurrentTimestamp();

    try {
        const [shouldComplete] = await db.promise().query(`
            SELECT b.bookingID
            FROM tbl_bookings b
            JOIN (
                SELECT bookingID, MAX(slotTime) AS lastSlotTime
                FROM tbl_booking_slots
                GROUP BY bookingID
            ) s ON s.bookingID = b.bookingID
            WHERE b.status = 'confirmed'
                AND DATE_ADD(TIMESTAMP(b.bookingDate, s.lastSlotTime), INTERVAL 1 HOUR) <= ?
        `, [now]);

        if (shouldComplete.length === 0) return;

        const bookingIDs = shouldComplete.map(b => b.bookingID);
        const conn = await getPromiseConnection();

        try {
            await conn.beginTransaction();

            await conn.query(`
                UPDATE tbl_bookings
                SET status = 'completed', updatedAt = ?
                WHERE bookingID IN (?)
            `, [now, bookingIDs]);

            await conn.query(`
                UPDATE tbl_booking_slots
                SET status = 'completed'
                WHERE bookingID IN (?)
            `, [bookingIDs]);

            await conn.commit();
            console.log(`[CRON] Completed ${bookingIDs.length} booking(s):`, bookingIDs);
        } catch (error) {
            await conn.rollback();
            console.error('[CRON] Failed to complete bookings, rolled back:', error);
        } finally {
            conn.release();
        }

    } catch (error) {
        console.error('[CRON] Failed to fetch bookings to complete:', error);
    }
}