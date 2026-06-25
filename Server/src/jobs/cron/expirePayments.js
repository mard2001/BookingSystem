import db from '../config/db.js';
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
                AND bp.expires_at <= NOW()
            `);

            if (expired.length === 0) return;

    const now = getCurrentTimestamp();

    for (const payment of expired) {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();

        // Lock the row — prevents race with PayMongo webhook
        const [rows] = await conn.query(`
          SELECT payment_id
          FROM tbl_booking_payment
          WHERE payment_id = ? AND status = 'pending'
          FOR UPDATE
        `, [payment.payment_id]);

        if (rows.length === 0) {
          // Webhook already handled it
          await conn.rollback();
          continue;
        }

        await conn.query(`
          UPDATE tbl_booking_payment
          SET status = 'failed', updated_at = ?
          WHERE payment_id = ?
        `, [now, payment.payment_id]);

        await conn.query(`
          UPDATE tbl_bookings
          SET status = 'cancelled', updated_at = ?
          WHERE booking_id = ?
        `, [now, payment.booking_id]);

        await conn.commit();

        logActivity({
          user_id: payment.user_id,
          action: 'PAYMENT_EXPIRED',
          description: `Payment for booking #${payment.booking_id} expired automatically.`,
          target_id: payment.booking_id,
          target_table: 'tbl_bookings',
        });

      } catch (err) {
        await conn.rollback();
        console.error(`[CRON] Failed to expire payment_id ${payment.payment_id}:`, err);
      } finally {
        conn.release();
      }
    }

    console.log(`[CRON] Expired ${expired.length} payment(s).`);

  } finally {
    isRunning = false;
  }
};