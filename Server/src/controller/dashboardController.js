import { db, getConnection } from '../connect.js';
import { getCurrentTimestamp } from '../utils/calculateValues.js';
import * as response from '../utils/response.js';
import 'dotenv/config';

export const dashboardStats = (req, res) => {
    const now = getCurrentTimestamp();
    const queries = [
        db.promise().query(`
            SELECT COUNT(*) AS totalBookings, SUM(totalAmount) as totalRevenue 
            FROM tbl_bookings 
            WHERE status NOT IN ("deleted","cancelled","pending")
                AND YEAR(bookingDate) = YEAR('${now}')
                AND MONTH(bookingDate) = MONTH('${now}')`),
        db.promise().query('SELECT COUNT(*) AS totalCustomer FROM tbl_accounts WHERE userType = "customer"'),
        db.promise().query('SELECT COUNT(*) AS totalActiveCourts FROM tbl_courts WHERE isActive = 1'),
        db.promise().query(`
            SELECT 
                COUNT(bs.slotTime) AS bookedHours,
                (SELECT COUNT(*) FROM tbl_courts WHERE isActive = 1) 
                    * 6
                    * DAY(LAST_DAY('${now}')) AS totalAvailableHours,
                ROUND(
                    COUNT(bs.slotTime) /  
                    (
                        (SELECT COUNT(*) FROM tbl_courts WHERE isActive = 1) 
                        * 6 
                        * DAY(LAST_DAY('${now}'))
                    ) * 100, 2
                ) AS occupancyRate
            FROM tbl_bookings b
            JOIN tbl_booking_slots bs ON b.bookingID = bs.bookingID
            WHERE 
                b.status IN ('confirmed','completed')
                AND MONTH(b.bookingDate) = MONTH('${now}')
                AND YEAR(b.bookingDate) = YEAR('${now}');
        `),
        db.promise().query(`SELECT 
                                status,
                                COUNT(*) AS totalBookings
                            FROM tbl_bookings
                            WHERE status IN ('pending', 'cancelled', 'confirmed', 'completed')
                                AND bookingDate >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                                AND bookingDate < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
                            GROUP BY status;`)
    ];

    Promise.all(queries)
        .then(([[bookings], [customers], [courts], [occupancy], [statusRows]]) => {

            const statusMap = { pending: 0, cancelled: 0, confirmed: 0, completed: 0 };
            statusRows.forEach(row => {
                statusMap[row.status] = row.totalBookings;
            });

            return response.ok(res, 'Dashboard stats retrieved.', {
                totalBookings:     bookings[0].totalBookings,
                totalRevenue:      bookings[0].totalRevenue ?? 0,
                totalCustomers:    customers[0].totalCustomer,
                totalActiveCourts: courts[0].totalActiveCourts,
                bookedHours:       occupancy[0].bookedHours,
                totalAvailableHours: occupancy[0].totalAvailableHours,
                occupancyRate:     occupancy[0].occupancyRate ?? 0,
                monthCancelled: statusMap.cancelled ?? 0,
                monthPending: statusMap.pending ?? 0,
                monthConfirmed: statusMap.confirmed ?? 0,
                monthCompleted: statusMap.completed ?? 0,
            });
        })
        .catch(err => response.serverError(res, 'Failed to retrieve dashboard stats.', err));
}

export const getUpcomingReservations = (req, res) => {
    const sql = `SELECT 
            b.bookingID,
            b.bookerFullName,
            b.bookerContactNumber,
            b.bookerEmail,
            b.bookingDate,
            b.totalAmount,
            b.paymentMethod,
            b.status,
            c.courtLabel,
            c.courtSport,
            GROUP_CONCAT(bs.slotTime ORDER BY bs.slotTime ASC) AS timeSlots
        FROM tbl_bookings b
        JOIN tbl_courts c ON b.courtID = c.courtID
        JOIN tbl_booking_slots bs ON b.bookingID = bs.bookingID
        WHERE 
            b.status IN ('confirmed','pending')
            AND b.bookingDate >= CURDATE()
        GROUP BY 
            b.bookingID, b.bookerFullName,b.bookerContactNumber, b.bookerEmail,  b.bookingDate, 
            b.totalAmount, b.paymentMethod, b.status,
            c.courtLabel, c.courtSport
        ORDER BY b.bookingDate ASC, MIN(bs.slotTime) ASC`;

    db.query(sql,(err, results) => {
        if (err) return response.serverError(res, 'Failed to retrieve upcoming reservations.', err);
        return response.ok(res, 'Upcoming reservations retrieved.', results);
    });
};

export const getBookingMonthlyRevenue = (req, res) => {
    const sql = `WITH RECURSIVE month_series AS (
                SELECT 
                    DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 12 MONTH), '%Y-%m-01') AS month_start

                UNION ALL

                SELECT DATE_ADD(month_start, INTERVAL 1 MONTH)
                FROM month_series
                WHERE DATE_ADD(month_start, INTERVAL 1 MONTH) <= DATE_FORMAT(CURDATE(), '%Y-%m-01')
            ),
            bookings_agg AS (
                SELECT
                    DATE_FORMAT(b.bookingDate, '%Y-%m-01') AS month_start,
                    COUNT(b.bookingID) AS total_bookings,
                    COALESCE(SUM(b.totalAmount), 0) AS total_revenue
                FROM tbl_bookings b
                WHERE
                    b.bookingDate >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                    AND b.status IN ('confirmed', 'completed')
                GROUP BY
                    DATE_FORMAT(b.bookingDate, '%Y-%m-01')
            )
            SELECT
                DATE_FORMAT(ms.month_start, '%Y-%m') AS month,
                DATE_FORMAT(ms.month_start, '%b %Y') AS month_label,
                COALESCE(ba.total_bookings, 0) AS total_bookings,
                COALESCE(ba.total_revenue, 0) AS total_revenue
            FROM month_series ms
            LEFT JOIN bookings_agg ba ON ba.month_start = ms.month_start
            ORDER BY ms.month_start ASC;`;

    db.query(sql, (err, result)=> {
        if(err) return response.serverError(res, 'Failed to retrieve booking revenue data.', err);
        
        return response.ok(res, 'Booking revenue retrieved.', result);
    })
}

export const getSportRevenue = (req, res) => {
    const sql = `SELECT
                    c.courtLabel,
                    c.courtSport,
                    COALESCE(SUM(b.totalAmount), 0) AS total_sport_revenue
                FROM tbl_bookings b
                JOIN tbl_courts c ON b.courtID = c.courtID
                WHERE
                    b.status IN ('confirmed', 'completed')
                    AND b.bookingDate >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY
                    c.courtID,
                    c.courtLabel,
                    c.courtSport`;

    db.query(sql, (err, result)=> {
        if(err) return response.serverError(res, 'Failed to retrieve revenue per sport/court data.', err);
        
        return response.ok(res, 'Revenue per sport/court data retrieved.', result);
    })
}