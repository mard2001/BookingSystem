import { db, getConnection } from '../connect.js';
import * as response from '../utils/response.js';
import 'dotenv/config';

export const dashboardStats = (req, res) => {
    const queries = [
        db.promise().query('SELECT COUNT(*) AS totalBookings, SUM(totalAmount) as totalRevenue FROM tbl_bookings WHERE status NOT IN ("deleted","cancelled")'),
        db.promise().query('SELECT COUNT(*) AS totalCustomer FROM tbl_accounts WHERE userType = "customer"'),
        db.promise().query('SELECT COUNT(*) AS totalActiveCourts FROM tbl_courts WHERE isActive = 1'),
        db.promise().query(`
            SELECT 
                COUNT(bs.slotTime) AS bookedHours,
                (SELECT COUNT(*) FROM tbl_courts WHERE isActive = 1) 
                    * 14
                    * DAY(LAST_DAY(NOW())) AS totalAvailableHours,
                ROUND(
                    COUNT(bs.slotTime) /  
                    (
                        (SELECT COUNT(*) FROM tbl_courts WHERE isActive = 1) 
                        * 24 
                        * DAY(LAST_DAY(NOW()))
                    ) * 100, 2
                ) AS occupancyRate
            FROM tbl_bookings b
            JOIN tbl_booking_slots bs ON b.bookingID = bs.bookingID
            WHERE 
                b.status IN ('confirmed','completed')
                AND MONTH(b.bookingDate) = MONTH(NOW())
                AND YEAR(b.bookingDate) = YEAR(NOW());
        `),
    ];

    Promise.all(queries)
        .then(([[bookings], [customers], [courts], [occupancy]]) => {
            return response.ok(res, 'Dashboard stats retrieved.', {
                totalBookings:     bookings[0].totalBookings,
                totalRevenue:      bookings[0].totalRevenue ?? 0,
                totalCustomers:    customers[0].totalCustomer,
                totalActiveCourts: courts[0].totalActiveCourts,
                bookedHours:       occupancy[0].bookedHours,
                totalAvailableHours: occupancy[0].totalAvailableHours,
                occupancyRate:     occupancy[0].occupancyRate ?? 0,
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
            b.bookingID, b.bookerFullName, b.bookingDate, 
            b.totalAmount, b.paymentMethod, b.status,
            c.courtLabel, c.courtSport
        ORDER BY b.bookingDate ASC, MIN(bs.slotTime) ASC`;

    db.query(sql,(err, results) => {
        if (err) return response.serverError(res, 'Failed to retrieve upcoming reservations.', err);
        return response.ok(res, 'Upcoming reservations retrieved.', results);
    });
};

export const getBookingMonthlyRevenue = (req, res) => {
    const sql = `SELECT
                    DATE_FORMAT(b.bookingDate, '%Y-%m') AS month,
                    DATE_FORMAT(b.bookingDate, '%b %Y') AS month_label,
                    COUNT(b.bookingID) AS total_bookings,
                    COALESCE(SUM(b.totalAmount), 0) AS total_revenue
                FROM tbl_bookings b
                WHERE
                    b.bookingDate >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                    AND b.status NOT IN ('cancelled', 'rejected')
                GROUP BY
                    DATE_FORMAT(b.bookingDate, '%Y-%m'),
                    DATE_FORMAT(b.bookingDate, '%b %Y')
                ORDER BY
                    month ASC`;

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
                    b.status IN ('confirmed', 'pending')
                    AND b.bookingDate >= CURDATE()
                GROUP BY
                    c.courtID,
                    c.courtLabel,
                    c.courtSport`;

    db.query(sql, (err, result)=> {
        if(err) return response.serverError(res, 'Failed to retrieve revenue per sport/court data.', err);
        
        return response.ok(res, 'Revenue per sport/court data retrieved.', result);
    })
}