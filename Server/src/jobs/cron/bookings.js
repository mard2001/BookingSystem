import { db, getPromiseConnection } from '../../connect.js';
import { generateBookingsForDates, generateBookingsForSchedule, getNextOccurrenceAfter } from '../../controller/bookingController.js';
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
                SET status = 'completed', updatedAt = ?
                WHERE bookingID IN (?)
            `, [now, bookingIDs]);

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

export const pendingBookingsExceededAllocatedTime = async () => {
    const now = getCurrentTimestamp();

    try {
        const [pendingBookings] = await db.promise().query(`
            SELECT b.bookingID
            FROM tbl_bookings b
            WHERE b.status = 'pending'
                AND b.scheduleID IS NULL
                AND b.updatedAt <= NOW() - INTERVAL 1 MINUTE
        `);

        if (pendingBookings.length === 0) return;

        const bookingIDs = pendingBookings.map(b => b.bookingID);
        const conn = await getPromiseConnection();
        try {
            await conn.beginTransaction();

            await conn.query(`
                UPDATE tbl_bookings
                SET status = 'cancelled', updatedAt = ?
                WHERE bookingID IN (?)
            `, [now, bookingIDs]);

            await conn.query(`
                UPDATE tbl_booking_slots
                SET status = 'cancelled', updatedAt = ?
                WHERE bookingID IN (?)
            `, [now, bookingIDs]);

            await conn.commit();
            console.log(`[CRON] Cancelled ${bookingIDs.length} booking(s):`, bookingIDs);
        } catch (error) {
            await conn.rollback();
            console.error('[CRON] Failed to update pending bookings, rolled back:', error);
        } finally {
            conn.release();
        }
        
    } catch (error) {
        console.error('[CRON] Failed to fetct expired bookings making it available once again:', error);
    }
}

const MIN_UPCOMING_CONFIRMED = 6;

export const extendActiveRecurringSchedules = async () => {
    const conn = await getPromiseConnection();
    let schedules;

    try {
        [schedules] = await conn.query(`
            SELECT * FROM tbl_recurring_schedules 
            WHERE status = 'active' 
            AND (endDate IS NULL OR endDate >= CURDATE())
        `);
    } finally {
        conn.release();
    }

    let totalGenerated = 0;
    let schedulesSkipped = 0;
    let schedulesExtended = 0;

    for (const schedule of schedules) {
        const checkConn = await getPromiseConnection();
        let upcomingCount, lastDate;

        try {
            const [[{ upcomingCount: uc }]] = await checkConn.query(`
                SELECT COUNT(*) AS upcomingCount FROM tbl_bookings 
                WHERE scheduleID = ? AND status = 'confirmed' AND bookingDate >= CURDATE()
            `, [schedule.scheduleID]);
            upcomingCount = uc;

            const [[{ lastDate: ld }]] = await checkConn.query(`
                SELECT DATE_FORMAT(MAX(bookingDate), '%Y-%m-%d') AS lastDate 
                FROM tbl_bookings WHERE scheduleID = ?
            `, [schedule.scheduleID]);
            lastDate = ld;
        } finally {
            checkConn.release();
        }

        if (upcomingCount >= MIN_UPCOMING_CONFIRMED) {
            schedulesSkipped++;
            continue; // buffer is healthy — don't touch this schedule
        }

        const neededCount = MIN_UPCOMING_CONFIRMED - upcomingCount;
        let anchor = lastDate ?? schedule.startDate;
        const datesToGenerate = [];

        for (let i = 0; i < neededCount; i++) {
            const next = getNextOccurrenceAfter(schedule, anchor);
            if (!next) break; // schedule ended — no more occurrences possible
            datesToGenerate.push(next);
            anchor = next;
        }

        if (datesToGenerate.length === 0) {
            console.log(`[CRON] Schedule ${schedule.scheduleID} — no further occurrences (likely reached endDate).`);
            continue;
        }

        try {
            const report = await generateBookingsForDates(schedule, datesToGenerate);
            totalGenerated += report.generated;
            schedulesExtended++;

            if (report.skippedDates.length > 0) {
                console.log(`[CRON] Schedule ${schedule.scheduleID} skipped dates:`, report.skippedDates);
            }
        } catch (err) {
            console.error(`[CRON] Failed to extend schedule ${schedule.scheduleID}:`, err);
        }
    }

    console.log(`[CRON] Recurring extension complete — generated: ${totalGenerated}, extended: ${schedulesExtended} schedule(s), skipped (buffer healthy): ${schedulesSkipped}`);
};