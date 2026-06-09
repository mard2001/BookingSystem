import { db } from '../connect.js';

export const generateUserID = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2,5).toUpperCase();

    return `USR${timestamp}${rand}`;
}

export const generateBookingID = (bookingDate, callback) => {
    const dateStr = bookingDate.replace(/-/g, ''); 

    db.query(
        `SELECT COUNT(*) as count FROM tbl_bookings WHERE bookingDate = ?`,
        [bookingDate],
        (err, results) => {
            if (err) return callback(err);
            const sequence = String(results[0].count + 1).padStart(4, '0');
            callback(null, `BK-${dateStr}-${sequence}`);
        }
    );
};