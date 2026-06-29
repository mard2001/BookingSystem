import { db, getConnection, getPromiseConnection } from '../connect.js';
import { generateSlots, getCurrentTimestamp, getUpcomingDates } from '../utils/calculateValues.js';
import { generateBookingID, generateRegularBookingID } from '../utils/codeGenerator.js';
import * as response from '../utils/response.js';
import 'dotenv/config';
import { getDayType, getRateKey, getTimeType } from '../utils/valueFormats.js';
import { validateFields, validateTransition } from '../utils/validateFields.js';


export const getAvailableSlots = (req, res) => {
    const { courtID } = req.params;
    const { date } = req.query;

    if (!date) return response.badRequest(res, 'Date is required');
    
    const query = `
        SELECT 
            ts.slotTime,
            CASE 
                WHEN booked.slotTime IS NOT NULL THEN 0
                WHEN pending.slotTime IS NOT NULL THEN 0
                WHEN blackout.id IS NOT NULL THEN 0
                ELSE 1 
            END AS isAvailable,
            CASE
                WHEN booked.slotTime IS NOT NULL THEN 'booked'
                WHEN pending.slotTime IS NOT NULL THEN 'pending'
                WHEN blackout.id IS NOT NULL THEN 'blackout'
                ELSE 'available'
            END AS unavailableReason
        FROM tbl_time_slots ts
        LEFT JOIN (
            SELECT bs.slotTime
            FROM tbl_booking_slots bs
            JOIN tbl_bookings b ON b.bookingID = bs.bookingID
            WHERE b.courtID = ?
            AND b.bookingDate = ?
            AND b.status NOT IN ('cancelled', 'rejected')
            AND bs.status = 'confirmed'
        ) AS booked ON booked.slotTime = ts.slotTime
        LEFT JOIN (
            SELECT bs.slotTime
            FROM tbl_booking_slots bs
            JOIN tbl_bookings b ON b.bookingID = bs.bookingID
            WHERE b.courtID = ?
            AND b.bookingDate = ?
            AND b.status = 'pending'
            AND bs.status = 'pending'
        ) AS pending ON pending.slotTime = ts.slotTime
        LEFT JOIN tbl_blackout_dates blackout
            ON blackout.isActive = 1
            AND ? BETWEEN DATE(blackout.blackoutDateStart) AND DATE(blackout.blackoutDateEnd)
            AND (
                blackout.scope = 'all'
                OR FIND_IN_SET(?, blackout.courtID)
            )
        WHERE ts.courtID = ? AND ts.isActive = 1
        ORDER BY ts.slotTime ASC
    `;

    db.query(query, [courtID, date, courtID, date, date, courtID, courtID], (err, results) => {
        if (err) return response.serverError(res, 'Database error', err);

        return response.ok(res, 'Slots fetched successfully', results);
    });
};

export const getCourtSlots = (req, res) => {
    const { courtID } = req.params;

    if (!courtID) return response.badRequest(res, 'Date is required');
    
    const query = `
        SELECT id, courtID, slotTime FROM tbl_time_slots WHERE courtID = ? AND isActive = 1;
    `;

    db.query(query, [courtID], (err, results) => {
        if (err) return response.serverError(res, 'Database error', err);

        return response.ok(res, 'Slots fetched successfully', results);
    });
};

export const checkAvailability = (req, res) => {
    const { courtID, bookingDate, slotTimes } = req.body;

    if (!courtID || !bookingDate || !slotTimes?.length)
        return response.badRequest(res, 'courtID, bookingDate and slotTimes are required');

    const placeholders = slotTimes.map(() => '?').join(',');

    // Fetch all conflicting slots with their booking status
    const query = `
        SELECT 
            bs.slotTime,
            bs.status AS slotStatus,
            b.status AS bookingStatus
        FROM tbl_booking_slots bs
        JOIN tbl_bookings b ON b.bookingID = bs.bookingID
        WHERE b.courtID = ?
          AND b.bookingDate = ?
          AND bs.slotTime IN (${placeholders})
          AND b.status NOT IN ('cancelled', 'rejected')
          AND bs.status NOT IN ('cancelled')
    `;

    db.query(query, [courtID, bookingDate, ...slotTimes], (err, results) => {
        if (err) return response.serverError(res, 'Database error', err);

        if (results.length === 0)
            return response.ok(res, 'All slots are available');

        const takenSlots = results.map(r => {
            let reason;
            if (r.bookingStatus === 'confirmed' || r.slotStatus === 'confirmed') {
                reason = 'confirmed';
            } else if (r.bookingStatus === 'pending' || r.slotStatus === 'pending') {
                reason = 'pending';
            } else {
                reason = 'unavailable';
            }
            return { slotTime: r.slotTime, reason };
        });

        const hasConfirmed = takenSlots.some(s => s.reason === 'confirmed');
        const hasPending   = takenSlots.some(s => s.reason === 'pending');

        let message;
        if (hasConfirmed && hasPending) {
            message = 'Some slots are already confirmed by another booking, and others are currently being booked by someone else.';
        } else if (hasConfirmed) {
            message = 'These slots are already confirmed and no longer available.';
        } else if (hasPending) {
            message = 'These slots are currently being booked by someone else. Try again in a moment.';
        } else {
            message = 'Some slots are unavailable.';
        }

        return response.conflict(res, message, { takenSlots });
    });
};

export const getBookings = (req, res) => {
    const query = `
            SELECT 
                b.accountID,
                b.bookingID,
                b.bookerFullName,
                b.bookerEmail,
                b.bookerContactNumber,
                b.courtID,
                c.courtSport,
                c.courtLabel,
                b.bookingDate,
                b.totalAmount,
                b.paymentMethod,
                b.status AS bookingStatus,
                b.createdAt,
            GROUP_CONCAT(bs.slotTime ORDER BY bs.slotTime SEPARATOR ', ') AS timeSlots,
            COUNT(bs.id) AS totalSlots,
            SUM(bs.rateApplied) AS computedTotal
            FROM tbl_bookings b
            LEFT JOIN tbl_booking_slots bs ON b.bookingID = bs.bookingID
            JOIN tbl_courts c ON b.courtID = c.courtID
            GROUP BY 
                b.bookingID,
                b.accountID,
                b.bookerFullName,
                b.bookerEmail,
                b.bookerContactNumber,
                b.courtID,
                c.courtSport,
                c.courtLabel,
                b.bookingDate,
                b.totalAmount,
                b.paymentMethod,
                b.status,
                b.createdAt
            ORDER BY b.createdAt DESC`;

    db.query(query, (err, data) => {
        if (err) {
            return response.serverError(res, "Database error", err);
        }
        return (data.length > 0)
            ? response.ok(res, 'All bookings successfully retrieved.', data)
            : response.ok(res, 'No booking found',[]);
    })
}

export const getCalendarBookings = (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return response.badRequest(res, 'Date range is required.');

    const query = `
        SELECT 
            b.accountID,
            b.bookingID,
            b.bookerFullName,
            b.bookerEmail,
            b.bookerContactNumber,
            b.courtID,
            c.courtSport,
            c.courtLabel,
            b.bookingDate,
            b.totalAmount,
            b.paymentMethod,
            b.status AS bookingStatus,
            b.createdAt,
            MIN(bs.slotTime) AS startTime,
            MAX(bs.slotTime) AS endTime,
            GROUP_CONCAT(bs.slotTime ORDER BY bs.slotTime SEPARATOR ', ') AS timeSlots,
            COUNT(bs.id) AS totalSlots,
            SUM(bs.rateApplied) AS computedTotal
        FROM tbl_bookings b
        LEFT JOIN tbl_booking_slots bs ON b.bookingID = bs.bookingID
        JOIN tbl_courts c ON b.courtID = c.courtID
        WHERE b.bookingDate BETWEEN ? AND ?
        AND b.status IN ('confirmed', 'completed')
        GROUP BY 
            b.bookingID,
            b.accountID,
            b.bookerFullName,
            b.bookerEmail,
            b.bookerContactNumber,
            b.courtID,
            c.courtSport,
            c.courtLabel,
            b.bookingDate,
            b.totalAmount,
            b.paymentMethod,
            b.status,
            b.createdAt
        ORDER BY b.createdAt DESC
    `;

    db.query(query, [startDate, endDate], (err, data) => {
        if (err) return response.serverError(res, 'Database error', err);

        return response.ok(res, 'Bookings retrieved.', data ?? []);
    });
}

export const getUpcomingBookings = (req, res) => {
    if (!req.params.accountID) return response.badRequest(res, "User ID is required.");

    const { accountID } = req.params;

    const q = `
            SELECT 
                b.accountID,
                b.bookingID,
                b.bookerFullName,
                b.bookerEmail,
                b.bookerContactNumber,
                b.courtID,
                c.courtSport,
                c.courtLabel,
                b.bookingDate,
                b.totalAmount,
                b.paymentMethod,
                b.status AS bookingStatus,
                b.createdAt,
                GROUP_CONCAT(bs.slotTime ORDER BY bs.slotTime SEPARATOR ', ') AS timeSlots,
                COUNT(bs.id) AS totalSlots,
                SUM(bs.rateApplied) AS computedTotal
            FROM tbl_bookings b
            LEFT JOIN tbl_booking_slots bs ON b.bookingID = bs.bookingID
            JOIN tbl_courts c ON b.courtID = c.courtID
            WHERE b.accountID = ?
            AND b.bookingDate >= CURDATE()
            AND b.status NOT IN ('cancelled', 'rejected')
            GROUP BY 
                b.bookingID,
                b.accountID,
                b.bookerFullName,
                b.bookerEmail,
                b.bookerContactNumber,
                b.courtID,
                c.courtSport,
                c.courtLabel,
                b.bookingDate,
                b.totalAmount,
                b.paymentMethod,
                b.status,
                b.createdAt
            ORDER BY b.bookingDate ASC, MIN(bs.slotTime) ASC;`;
    
    db.query(q, [accountID], (err,data) => {
        if (err) return response.serverError(res, "Database error", err);

        return (data.length > 0)
            ? response.ok(res, 'All upcoming bookings successfully retrieved.', data)
            : response.ok(res, 'No upcoming booking found',[]);
    })
}

export const getHistoricalBookings = (req, res) => {
    if (!req.params.accountID) return response.badRequest(res, "User ID is required.");

    const { accountID } = req.params;

    const q = `
            SELECT 
                b.accountID,
                b.bookingID,
                b.bookerFullName,
                b.bookerEmail,
                b.bookerContactNumber,
                b.courtID,
                c.courtSport,
                c.courtLabel,
                b.bookingDate,
                b.totalAmount,
                b.paymentMethod,
                b.status AS bookingStatus,
                b.createdAt,
                GROUP_CONCAT(bs.slotTime ORDER BY bs.slotTime SEPARATOR ', ') AS timeSlots,
                COUNT(bs.id) AS totalSlots,
                SUM(bs.rateApplied) AS computedTotal
            FROM tbl_bookings b
            LEFT JOIN tbl_booking_slots bs ON b.bookingID = bs.bookingID
            JOIN tbl_courts c ON b.courtID = c.courtID
            WHERE b.accountID = ?
            AND (
                b.bookingDate < CURDATE()
                OR b.status IN ('cancelled', 'rejected', 'completed')
            )
            GROUP BY 
                b.bookingID,
                b.accountID,
                b.bookerFullName,
                b.bookerEmail,
                b.bookerContactNumber,
                b.courtID,
                c.courtSport,
                c.courtLabel,
                b.bookingDate,
                b.totalAmount,
                b.paymentMethod,
                b.status,
                b.createdAt
            ORDER BY b.bookingDate DESC, MIN(bs.slotTime) DESC`;
    
    db.query(q, [accountID], (err,data) => {
        if (err) return response.serverError(res, "Database error", err);

        return (data.length > 0)
            ? response.ok(res, 'All previous bookings successfully retrieved.', data)
            : response.ok(res, 'No previous bookings found',[]);
    })
}

export const confirmBooking2 = (req, res) => {
    // return response.ok(res, 'Booking confirmed', req.body);
    const { courtID, bookingDate, bookerFullName, bookerEmail, bookerContactNumber, slotTimes, paymentMethod } = req.body;
    const accountID = req.user.id;
    if (!courtID || !bookingDate || !slotTimes?.length || !paymentMethod)
        return response.badRequest(res, 'Missing required fields');

    // begin transaction
    db.beginTransaction(async (err) => {
        if (err) return response.serverError(res, 'Transaction error', err);

        // check conflicts
        const placeholders = slotTimes.map(() => '?').join(',');
        const conflictQuery = `
            SELECT bs.slotTime
            FROM tbl_booking_slots bs
            JOIN tbl_bookings b ON b.bookingID = bs.bookingID
            WHERE b.courtID = ?
              AND b.bookingDate = ?
              AND bs.slotTime IN (${placeholders})
              AND bs.status = 'confirmed'
              AND b.status NOT IN ('cancelled')
        `;

        db.query(conflictQuery, [courtID, bookingDate, ...slotTimes], (err, conflicts) => {
            if (err) return db.rollback(() => response.serverError(res, 'Database error', err));

            if (conflicts.length > 0) {
                const takenSlots = conflicts.map(r => r.slotTime);
                return db.rollback(() => response.conflict(res, 'Some slot was just taken by someone else. Please go back and reselect.', { takenSlots }));
            }

            db.query('SELECT * FROM tbl_courts WHERE courtID = ?', [courtID], (err, courts) => {
                if (err) return db.rollback(() => response.serverError(res, 'Database error', err));

                const court = courts[0];
                const dayType = getDayType(bookingDate);

                // compute total
                let totalAmount = 0;
                const slotData = slotTimes.map(slotTime => {
                    const timeType = getTimeType(slotTime);
                    const rateKey = getRateKey(dayType, timeType);
                    const rateApplied = parseFloat(court[rateKey]);
                    totalAmount += rateApplied;
                    return { slotTime, rateApplied };
                });

                // insert booking header
                generateBookingID(bookingDate, (err, bookingID) => {
                    if (err) return db.rollback(() => response.serverError(res, 'Failed to generate booking ID', err));

                    const insertBookingQuery = `
                        INSERT INTO tbl_bookings (bookingID, accountID, courtID, bookingDate, bookerFullName, bookerEmail, bookerContactNumber, totalAmount, paymentMethod, status, createdAt, updatedAt)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?)
                    `;

                    db.query(insertBookingQuery, [bookingID, accountID, courtID, bookingDate, bookerFullName, bookerEmail, bookerContactNumber, totalAmount, paymentMethod, getCurrentTimestamp(), getCurrentTimestamp()], (err, result) => {
                        if (err) return db.rollback(() => response.serverError(res, 'Database error', err));

                        const newBookingID = result.insertId;
                        if (!newBookingID) return db.rollback(() => response.serverError(res, 'Database error', err));

                        const slotValues = slotData.map(s => [bookingID, s.slotTime, s.rateApplied, 'confirmed',getCurrentTimestamp(), getCurrentTimestamp()]);

                        db.query(
                            `INSERT INTO tbl_booking_slots (bookingID, slotTime, rateApplied, status, updatedAt, createdAt) VALUES ?`,
                            [slotValues],
                            (err) => {
                                if (err) return db.rollback(() => response.serverError(res, 'Database error', err));

                                db.commit((err) => {
                                    if (err) return db.rollback(() => response.serverError(res, 'Commit error', err));
                                    return response.ok(res, 'Booking confirmed', { bookingID, totalAmount });
                                });
                            }
                        );
                    });
                });
            });
        });
    });
};

export const confirmBooking = async (req, res) => {
    const { courtID, bookingDate, bookerFullName, bookerEmail, bookerContactNumber, slotTimes, paymentMethod } = req.body;
    const accountID = -1;

    if (!courtID || !bookingDate || !slotTimes?.length || !paymentMethod)
        return response.badRequest(res, 'Missing required fields');

    const conn = await getConnection();

    const query = (sql, params) => new Promise((resolve, reject) => {
        conn.query(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    const beginTransaction = () => new Promise((resolve, reject) => {
        conn.beginTransaction(err => err ? reject(err) : resolve());
    });

    const commit = () => new Promise((resolve, reject) => {
        conn.commit(err => err ? reject(err) : resolve());
    });

    const rollback = () => new Promise((resolve, reject) => {
        conn.rollback(() => resolve());
    });

    try {
        await beginTransaction();

        // check conflicts
        const placeholders = slotTimes.map(() => '?').join(',');
        const conflicts = await query(`
            SELECT bs.slotTime
            FROM tbl_booking_slots bs
            JOIN tbl_bookings b ON b.bookingID = bs.bookingID
            WHERE b.courtID = ?
              AND b.bookingDate = ?
              AND bs.slotTime IN (${placeholders})
              AND bs.status = 'confirmed'
              AND b.status NOT IN ('cancelled')
        `, [courtID, bookingDate, ...slotTimes]);

        if (conflicts.length > 0) {
            await rollback();
            return response.conflict(res, 'Some slot was just taken by someone else. Please go back and reselect.', {
                takenSlots: conflicts.map(r => r.slotTime)
            });
        }

        // get court rates
        const courts = await query('SELECT * FROM tbl_courts WHERE courtID = ?', [courtID]);
        const court = courts[0];
        const dayType = getDayType(bookingDate);

        // compute total
        let totalAmount = 0;
        const slotData = slotTimes.map(slotTime => {
            const timeType = getTimeType(slotTime);
            const rateKey = getRateKey(dayType, timeType);
            const rateApplied = parseFloat(court[rateKey]);
            totalAmount += rateApplied;
            return { slotTime, rateApplied };
        });

        // generate booking ID
        const bookingID = await new Promise((resolve, reject) => {
            generateBookingID(bookingDate, (err, id) => err ? reject(err) : resolve(id));
        });

        const bookingInitialStatus = paymentMethod == "online" ? "pending" : "confirmed";

        // insert booking header
        await query(`
            INSERT INTO tbl_bookings (bookingID, accountID, courtID, bookingDate, bookerFullName, bookerEmail, bookerContactNumber, totalAmount, paymentMethod, status, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [bookingID, accountID, courtID, bookingDate, bookerFullName, bookerEmail, bookerContactNumber, totalAmount, paymentMethod, bookingInitialStatus, getCurrentTimestamp(), getCurrentTimestamp()]);

        // insert slots
        const slotValues = slotData.map(s => [bookingID, s.slotTime, s.rateApplied, bookingInitialStatus, getCurrentTimestamp(), getCurrentTimestamp()]);
        await query(
            `INSERT INTO tbl_booking_slots (bookingID, slotTime, rateApplied, status, updatedAt, createdAt) VALUES ?`,
            [slotValues]
        );

        await commit();
        return response.ok(res, 'Booking confirmed', { bookingID, totalAmount });

    } catch (err) {
        await rollback();
        return response.serverError(res, 'Database error', err);
    } finally {
        conn.release();
    }
};

export const updateBookingStatus = (req, res) => {
    const { bookingID } = req.params;
    const { status } = req.body;

    if (!bookingID) return response.badRequest(res, 'Booking ID is required.');
    if (!validateFields(req, res, ['status'])) return;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'rejected', 'deleted'];
    if (!validStatuses.includes(status)) return response.badRequest(res, 'Invalid status value.');

    // 1. Fetch current status
    db.query('SELECT status FROM tbl_bookings WHERE bookingID = ?', [bookingID], (err, result) => {
        if (err) return response.serverError(res, 'Database error', err);
        if (!result.length) return response.notFound(res, 'Booking not found.');

        const currentStatus = result[0].status;

        // 2. Validate transition
        if (!validateTransition(currentStatus, status)) {
            return response.badRequest(res, `Invalid transition: ${currentStatus} → ${status}.`);
        }

        // 3. Determine slot status based on booking status
        // const slotStatus = ['cancelled', 'rejected'].includes(status) ? 'available' : 'unavailable';
        const now = getCurrentTimestamp();

        // 4. Update both tables
        db.query(
            'UPDATE tbl_bookings SET status = ?, updatedAt = ? WHERE bookingID = ?',
            [status, now, bookingID],
            (errBooking, bookingResult) => {
                if (errBooking) return response.serverError(res, 'Database error', errBooking);
                if (!bookingResult.affectedRows) return response.badRequest(res, 'Failed to update booking.');

                db.query(
                    'UPDATE tbl_booking_slots SET status = ?, updatedAt = ? WHERE bookingID = ?',
                    [status, now, bookingID],
                    (errSlots, slotsResult) => {
                        if (errSlots) return response.serverError(res, 'Database error', errSlots);
                        if (!slotsResult.affectedRows) return response.badRequest(res, 'Failed to update booking slots.');

                        return response.ok(res, `Booking successfully updated to ${status}.`);
                    }
                );
            }
        );
    });
};

export const updateBookingBookerDetails = (req, res) => {
    if (!validateFields(req, res, [
        'bookerFullName', 'bookerEmail', 'bookerContactNumber', 'status'
    ])) return;

    if (!req.params.bookingID) return response.badRequest(res, "Booking ID is required.");
    
    const { bookingID } = req.params;
    const { bookerFullName, bookerEmail, bookerContactNumber, status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'rejected', 'deleted'];
    if (!validStatuses.includes(status)) return response.badRequest(res, 'Invalid status value.');

    const updatequery = `
        UPDATE tbl_bookings 
        SET bookerFullName = ?, bookerEmail = ?, bookerContactNumber = ?, status = ?, updatedAt = ?
        WHERE bookingID = ?
    `;

    const values = [bookerFullName, bookerEmail, bookerContactNumber, status, getCurrentTimestamp(), bookingID];

    db.query(updatequery, values, (err, result) => {
        if (err) return response.serverError(res, "Database error.", err);
        if (result.affectedRows === 0) return response.notFound(res, "Booking not found.");

        return response.ok(res, "Booking details updated successfully.", result);
    });
}

export const cancelBooking = async (req, res) => {
    if (!req.params.bookingID || !req.params.paymentIntent) return response.badRequest(res, "Booking ID is required.");
    const { bookingID, paymentIntent } = req.params;

    let conn;
    try {
        conn = await getConnection();
        await new Promise((resolve, reject) => conn.beginTransaction(err => err ? reject(err) : resolve()));

        const [paymentResult] = await new Promise((resolve, reject) =>
            conn.query(
                `UPDATE tbl_booking_payment
                SET payment_status = 'failed', status = 'cancelled', updatedAt = ?
                WHERE bookingID = ? AND payment_intent_id = ?`,
                [getCurrentTimestamp(), bookingID, paymentIntent ],
                (err, result) => err ? reject(err) : resolve([result])
            )
        );

        if (paymentResult.affectedRows === 0) {
            conn.rollback(() => conn.release());
            return response.notFound(res, "Payment Intent not found.");
        }

        const [bookingResult] = await new Promise((resolve, reject) =>
            conn.query(
                `UPDATE tbl_bookings SET status = ?, updatedAt = ? WHERE bookingID = ?`,
                ['cancelled', getCurrentTimestamp(), bookingID],
                (err, result) => err ? reject(err) : resolve([result])
            )
        );

        if (bookingResult.affectedRows === 0) {
            conn.rollback(() => conn.release());
            return response.notFound(res, "Booking not found.");
        }

        const [slotsResult] = await new Promise((resolve, reject) =>
            conn.query(
                `UPDATE tbl_booking_slots SET status = ?, updatedAt = ? WHERE bookingID = ?`,
                ['cancelled', getCurrentTimestamp(), bookingID],
                (err, result) => err ? reject(err) : resolve([result])
            )
        );

        if (slotsResult.affectedRows === 0) {
            conn.rollback(() => conn.release());
            return response.notFound(res, "Booking slots not found.");
        }

        await new Promise((resolve, reject) => conn.commit(err => err ? reject(err) : resolve()));
        conn.release();

        return response.ok(res, 'Booking cancelled', { bookingID });
    } catch (err) {
        if (conn) {
            conn.rollback(() => conn.release());
        }
        return response.serverError(res, 'Cancellation error', err);
    }
};

export const generateBookingsForSchedule = async (scheduleID) => {
    const conn = await getPromiseConnection();
    try {
        const [rows] = await conn.query(`
            SELECT * FROM tbl_recurring_schedules WHERE scheduleID = ?
        `, [scheduleID]);

        if (rows.length === 0) throw new Error('Schedule not found.');
        const schedule = rows[0];

        const targetDates = getUpcomingDates(schedule, 4);

        let generated = 0;
        let skipped = 0;
        const skippedDates = [];
        // Fetch user details once — not inside the date loop
        const [userRows] = await conn.query(`
            SELECT a.id, ud.firstName, ud.lastName, a.email, ud.contactNumber
            FROM tbl_accounts a
            JOIN tbl_user_details ud ON a.id = ud.accountID
            WHERE a.id = ?
        `, [schedule.accountID]);

        if (userRows.length === 0) throw new Error('Account not found.');
        const user = userRows[0];
        const bookerFullName = `${user.firstName} ${user.lastName}`;

        for (const date of targetDates) {
            // 1. Check blackout dates
            const [blackout] = await conn.query(`
                SELECT id FROM tbl_blackout_dates
                WHERE isActive = 1
                    AND ? BETWEEN blackoutDateStart AND blackoutDateEnd
                    AND (scope = 'venue' OR (scope = 'court' AND courtID = ?))
            `, [date, schedule.courtID]);

            if (blackout.length > 0) {
                skipped++;
                skippedDates.push({ date, reason: 'blackout' });
                continue;
            }

            const slots = generateSlots(schedule.startTime, schedule.endTime);
            // 2. Check if already generated
            const [existing] = await conn.query(`
                SELECT bs.slotTime
                FROM tbl_booking_slots bs
                JOIN tbl_bookings b ON b.bookingID = bs.bookingID
                WHERE b.scheduleID = ?
                AND b.bookingDate = ?
                AND bs.slotTime IN (?)
            `, [scheduleID, date, slots]);

            if (existing.length > 0) {
                skipped++;
                skippedDates.push({ date, reason: 'already_generated' });
                continue;
            }

            // 3. Check slot conflicts
            const [conflict] = await conn.query(`
                SELECT bs.slotTime
                FROM tbl_booking_slots bs
                JOIN tbl_bookings b ON b.bookingID = bs.bookingID
                WHERE b.courtID = ?
                  AND b.bookingDate = ?
                  AND b.status NOT IN ('cancelled', 'rejected')
                  AND bs.slotTime IN (?)
            `, [schedule.courtID, date, slots]);

            if (conflict.length > 0) {
                skipped++;
                skippedDates.push({
                    date,
                    reason: 'conflict',
                    conflictingSlots: conflict.map(c => c.slotTime)
                });
                continue;
            }

            // 4. Generate booking — wrapped in transaction
            const now = getCurrentTimestamp();
            const bookingID = `${schedule.scheduleID}_${date.replace(/-/g, '')}`;

            try {
                await conn.beginTransaction();

                await conn.query(`
                    INSERT INTO tbl_bookings
                        (bookingID, scheduleID, courtID, accountID, bookingDate,
                         bookerFullName, bookerEmail, bookerContactNumber,
                         totalAmount, paymentMethod, status, createdAt, updatedAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'court', 'confirmed', ?, ?)
                `, [
                    bookingID, schedule.id, schedule.courtID, user.id, date, 
                    bookerFullName, user.email, user.contactNumber,
                    schedule.totalAmount, now, now
                ]);

                await conn.query(`
                    INSERT INTO tbl_booking_slots (bookingID, slotTime, status, createdAt, updatedAt)
                    VALUES ?
                `, [slots.map(slot => [bookingID, slot, 'confirmed', now, now])]);

                await conn.commit();
                generated++;

            } catch (err) {
                await conn.rollback();
                skipped++;
                skippedDates.push({ date, reason: 'insert_failed', error: err.message });
            }
        }

        return { generated, skipped, skippedDates };

    } finally {
        conn.release();
    }
};

export const createRecurringSched2 = async (req, res) => {
    // return response.ok(res,'Recurring schedule created successfully.')
    
    if (!validateFields(req, res, [
        'accountID', 'courtID', 'frequency', 'startTime', 'endTime', 'startDate', 'totalAmount'
    ])) return;

    const { accountID, courtID, frequency, dayOfWeek, dayOfMonth, startTime, endTime, startDate, endDate, totalAmount } = req.body;

    if (frequency === 'weekly' && dayOfWeek == null)
        return response.badRequest(res, 'Day of the week is required for weekly regular schedules.');
    if (frequency === 'monthly' && dayOfMonth == null)
        return response.badRequest(res, 'Day of the month is required for monthly regular schedules.');

    const sanitizedEndDate = (endDate && endDate !== '' && endDate !== '0000-00-00') ? endDate : null;
    const bookingSchedID = await generateRegularBookingID();
    const now = getCurrentTimestamp();
    const sqlCreate = `
        INSERT INTO tbl_recurring_schedules
            (scheduleID, accountID, courtID, frequency, dayOfWeek, dayOfMonth,
            startTime, endTime, startDate, endDate,
            totalAmount, paymentStatus, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'active', ?, ?)`;

    try {
        const scheduleID = await new Promise((resolve, reject) => {
            db.query(sqlCreate, [
                bookingSchedID, accountID, courtID, frequency, dayOfWeek ?? null, dayOfMonth ?? null,
                startTime, endTime, startDate, sanitizedEndDate,
                totalAmount, now, now
            ], (err, result) => {
                if (err) return reject(err);
                if (result.affectedRows === 0) return reject(new Error('Creation failed.'));
                resolve(result.insertId);
            });
        });

        const report = await generateBookingsForSchedule(bookingSchedID);

        return response.ok(res, 'Recurring schedule created successfully.', {
            scheduleID,
            ...report
        });

    } catch (err) {
        console.error('[createRecurringSched]', err);
        return response.serverError(res, 'Failed to create recurring schedule.', err);
    }
};

export const createRecurringSched = async (req, res) => {
    if (!validateFields(req, res, [
        'accountID', 'courtID', 'frequency', 'startTime', 'endTime', 'startDate', 'totalAmount'
    ])) return;

    const { accountID, courtID, frequency, dayOfWeek, dayOfMonth, startTime, endTime, startDate, endDate, totalAmount, remarks } = req.body;

    // normalize dayOfWeek to array
    const daysArray = Array.isArray(dayOfWeek) ? dayOfWeek : dayOfWeek != null ? [dayOfWeek] : [];

    if (frequency === 'weekly' && daysArray.length === 0)
        return response.badRequest(res, 'At least one day of the week is required for weekly schedules.');
    if (frequency === 'monthly' && (dayOfMonth == null || dayOfMonth === ''))
        return response.badRequest(res, 'Day of the month is required for monthly schedules.');

    const sanitizedEndDate = (endDate && endDate !== '' && endDate !== '0000-00-00') ? endDate : null;
    const now = getCurrentTimestamp();

    const sqlCreate = `
        INSERT INTO tbl_recurring_schedules
            (scheduleID, accountID, courtID, frequency, dayOfWeek, dayOfMonth,
            startTime, endTime, startDate, endDate,
            totalAmount, paymentStatus, status, remarks, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'active', ?, ?, ?)`;

    try {
        const createdSchedules = [];

        // insert one row per day
        const dayList = frequency === 'weekly' ? daysArray : [null];

        for (const day of dayList) {
            const bookingSchedID = await generateRegularBookingID();

            const scheduleID = await new Promise((resolve, reject) => {
                db.query(sqlCreate, [
                    bookingSchedID, accountID, courtID, frequency,
                    day ?? null,
                    frequency === 'monthly' ? dayOfMonth : null,
                    startTime, endTime, startDate, sanitizedEndDate,
                    totalAmount, remarks ?? null, now, now
                ], (err, result) => {
                    if (err) return reject(err);
                    if (result.affectedRows === 0) return reject(new Error('Creation failed.'));
                    resolve(bookingSchedID);
                });
            });

            const report = await generateBookingsForSchedule(scheduleID);
            createdSchedules.push({ scheduleID, ...report });
        }

        return response.ok(res, 'Recurring schedule created successfully.', createdSchedules);

    } catch (err) {
        console.error('[createRecurringSched]', err);
        return response.serverError(res, 'Failed to create recurring schedule.', err);
    }
};

export const getRegularUser = (req, res) => {
    const query = `
            SELECT a.scheduleID, a.frequency, a.dayOfWeek, a.dayOfMonth, a.startTime, a.endTime, a.totalAmount, a.paymentStatus, a.status, 
                    a.accountID, b.email, c.firstName, c.lastName,
                    a.courtID, d.courtSport, d.courtLabel, d.courtType, a.createdAt
            FROM tbl_recurring_schedules a
            JOIN tbl_accounts b ON a.accountID = b.id
            JOIN tbl_user_details c ON b.id = c.accountID
            JOIN tbl_courts d ON d.courtID = a.courtID
            -- WHERE b.userType = 'customer'
            ORDER BY a.scheduleID DESC`;

    db.query(query, (err, data) => {
        if (err) {
            return response.serverError(res, "Database error", err);
        }
        return (data.length > 0)
            ? response.ok(res, 'All regular bookings successfully retrieved.', data)
            : response.ok(res, 'No regular booking found',[]);
    })
}