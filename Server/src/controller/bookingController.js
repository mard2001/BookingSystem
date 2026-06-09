import { db } from '../connect.js';
import { getCurrentTimestamp } from '../utils/calculateValues.js';
import { generateBookingID } from '../utils/codeGenerator.js';
import * as response from '../utils/response.js';
import 'dotenv/config';
import { getDayType, getRateKey, getTimeType } from '../utils/valueFormats.js';
import { validateFields } from '../utils/validateFields.js';


export const getAvailableSlots = (req, res) => {
    const { courtID } = req.params;
    const { date } = req.query;

    if (!date) return response.badRequest(res, 'Date is required');
    
    const query = `
        SELECT 
            ts.slotTime,
            CASE WHEN booked.slotTime IS NOT NULL THEN 0 ELSE 1 END AS isAvailable
        FROM tbl_time_slots ts
        LEFT JOIN (
            SELECT bs.slotTime
            FROM tbl_booking_slots bs
            JOIN tbl_bookings b ON b.bookingID = bs.bookingID
            WHERE b.courtID = ?
            AND b.bookingDate = ?
            AND b.status NOT IN ('cancelled')
            AND bs.status = 'booked'
        ) AS booked ON booked.slotTime = ts.slotTime
        WHERE ts.courtID = ? AND ts.isActive = 1
        ORDER BY ts.slotTime ASC
    `;



    db.query(query, [courtID, date, courtID], (err, results) => {
        if (err) return response.serverError(res, 'Database error', err);

        return response.ok(res, 'Slots fetched successfully', results);
    });
};

export const checkAvailability = (req, res) => {
    const { courtID, bookingDate, slotTimes } = req.body;

    if (!courtID || !bookingDate || !slotTimes?.length)
        return response.badRequest(res, 'courtID, bookingDate and slotTimes are required');

    const placeholders = slotTimes.map(() => '?').join(',');

    const query = `
        SELECT bs.slotTime
        FROM tbl_booking_slots bs
        JOIN tbl_bookings b ON b.bookingID = bs.bookingID
        WHERE b.courtID = ?
          AND b.bookingDate = ?
          AND bs.slotTime IN (${placeholders})
          AND bs.status = 'booked'
          AND b.status NOT IN ('cancelled')
    `;

    db.query(query, [courtID, bookingDate, ...slotTimes], (err, results) => {
        if (err) return response.serverError(res, 'Database error', err);

        if (results.length > 0) {
            const takenSlots = results.map(r => r.slotTime);
            return response.conflict(res, 'Some slot was just taken by someone else. Please go back and reselect.', { takenSlots });
        }

        return response.ok(res, 'All slots are available');
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
    if (!req.params.userID) return response.badRequest(res, "User ID is required.");

    const { userID } = req.params;

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
    
    db.query(q, [userID], (err,data) => {
        if (err) return response.serverError(res, "Database error", err);

        return (data.length > 0)
            ? response.ok(res, 'All upcoming bookings successfully retrieved.', data)
            : response.ok(res, 'No upcoming booking found',[]);
    })
}

export const getHistoricalBookings = (req, res) => {
    if (!req.params.userID) return response.badRequest(res, "User ID is required.");

    const { userID } = req.params;

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
    
    db.query(q, [userID], (err,data) => {
        if (err) return response.serverError(res, "Database error", err);

        return (data.length > 0)
            ? response.ok(res, 'All previous bookings successfully retrieved.', data)
            : response.ok(res, 'No previous bookings found',[]);
    })
}

export const confirmBooking = (req, res) => {
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
              AND bs.status = 'booked'
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

                        // const newBookingID = result.insertId;
                        // if (!newBookingID) return db.rollback(() => response.serverError(res, 'Database error', err));

                        const slotValues = slotData.map(s => [bookingID, s.slotTime, s.rateApplied, 'booked',getCurrentTimestamp(), getCurrentTimestamp()]);

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

export const updateBookingStatus = (req, res) => {
    const { bookingID } = req.params;
    const { status } = req.body;
    if (!bookingID) return response.badRequest(res, 'Booking ID is required.');
    if (!validateFields(req, res, ['status'])) return;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) return response.badRequest(res, 'Invalid status value.');

    const checkqry = 'SELECT status FROM tbl_bookings WHERE bookingID = ?';

    db.query(checkqry, [bookingID], (err, result) => {
        if (err) return response.serverError(res, 'Database error', err);
        if (result.length == 0) return response.notFound(res, 'Specific booking not found');
        
        const updateqry = 'UPDATE tbl_bookings SET status = ?, updatedAt = ? WHERE bookingID = ?';

        db.query(updateqry, [status, getCurrentTimestamp(), bookingID], (err, updatedData) => {
            if (err) return response.serverError(res, 'Database error', err);
            if (updatedData.affectedRows === 0) return response.badRequest(res, 'Failed to update booking.');

            return response.ok(res, `Booking successfully updated to ${status}.`);
        })
    })
}

export const updateBookingBookerDetails = (req, res) => {
    if (!validateFields(req, res, [
        'bookerFullName', 'bookerEmail', 'bookerContactNumber'
    ])) return;

    if (!req.params.bookingID) return response.badRequest(res, "Booking ID is required.");
    
    const { bookingID } = req.params;
    const { bookerFullName, bookerEmail, bookerContactNumber } = req.body;

    const updatequery = `
        UPDATE tbl_bookings 
        SET bookerFullName = ?, bookerEmail = ?, bookerContactNumber = ?, updatedAt = ?
        WHERE bookingID = ?
    `;

    const values = [bookerFullName, bookerEmail, bookerContactNumber, getCurrentTimestamp(), bookingID];

    db.query(updatequery, values, (err, result) => {
        if (err) return response.serverError(res, "Database error.", err);
        if (result.affectedRows === 0) return response.notFound(res, "Booking not found.");

        return response.ok(res, "Booking details updated successfully.", result);
    });
}