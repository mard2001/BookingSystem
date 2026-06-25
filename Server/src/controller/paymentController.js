import axios from 'axios';
import crypto from 'crypto';
import { db, getConnection } from '../connect.js';
import { getCurrentTimestamp, getExpiryTimestamp } from '../utils/calculateValues.js';
import * as response from '../utils/response.js';
import { validateFields } from '../utils/validateFields.js';
import 'dotenv/config';

const PAYMONGO_BASE = 'https://api.paymongo.com/v1';
const authHeader = () =>
    'Basic ' + Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString('base64');

export const initiatePayment = async (req, res) => {
    if (!validateFields(req, res, ['bookingID', 'amount', 'customerName', 'customerEmail'])) return;

    const { bookingID, amount, customerName, customerEmail } = req.body;
    const amountInCentavos = Math.round(parseFloat(amount) * 100);

    if (amountInCentavos <= 0) return response.badRequest(res, 'Invalid payment amount.');

    try {
        // 1. Create Payment Intent
        const intentRes = await axios.post(
            `${PAYMONGO_BASE}/payment_intents`,
            {
                data: {
                    attributes: {
                        amount: amountInCentavos,
                        payment_method_allowed: ['qrph'],
                        currency: 'PHP',
                        capture_type: 'automatic',
                        description: `Booking #${bookingID} - Ylaya Smash Rally`,
                        metadata: { booking_id: bookingID },
                    },
                },
            },
            { headers: { Authorization: authHeader(), 'Content-Type': 'application/json' } }
        );

        const intentId = intentRes.data.data.id;
        const clientKey = intentRes.data.data.attributes.client_key;

        // 2. Create Payment Method
        const methodRes = await axios.post(
            `${PAYMONGO_BASE}/payment_methods`,
            {
                data: {
                    attributes: {
                        type: 'qrph',
                        billing: { name: customerName, email: customerEmail },
                    },
                },
            },
            { headers: { Authorization: authHeader(), 'Content-Type': 'application/json' } }
        );

        const methodId = methodRes.data.data.id;

        // 3. Attach Payment Method to Intent
        const attachRes = await axios.post(
            `${PAYMONGO_BASE}/payment_intents/${intentId}/attach`,
            {
                data: {
                    attributes: {
                        payment_method: methodId,
                        client_key: clientKey,
                    },
                },
            },
            { headers: { Authorization: authHeader(), 'Content-Type': 'application/json' } }
        );

        const nextAction = attachRes.data.data.attributes.next_action;
        const qrImageUrl = nextAction?.display?.qr_image ?? nextAction?.code?.image_url ?? null;

        if (!qrImageUrl) return response.serverError(res, 'QR code not returned from PayMongo.');

        const now = getCurrentTimestamp();

        // 4. Check if a payment record already exists for this booking
        db.query(
            'SELECT id FROM tbl_booking_payment WHERE bookingID = ?',
            [bookingID],
            (err, existing) => {
                if (err) return response.serverError(res, 'Database error', err);

                if (existing.length > 0) {
                    // Update existing record with new intent (e.g. QR expired, user retrying)
                    db.query(
                        `UPDATE tbl_booking_payment 
                         SET payment_intent_id = ?, payment_status = 'pending_payment', status = 'initiated', updatedAt = ?
                         WHERE bookingID = ?`,
                        [intentId, now, bookingID],
                        (err) => {
                            if (err) return response.serverError(res, 'Database error', err);
                            return response.ok(res, 'Payment initiated successfully.', { intentId, qrImageUrl });
                        }
                    );
                } else {
                    // Insert new payment record
                    db.query(
                        `INSERT INTO tbl_booking_payment 
                         (payment_intent_id, bookingID, payment_status, status, paidAt, expiresAt, createdAt, updatedAt)
                         VALUES (?, ?, 'pending_payment', 'initiated', NULL, ?, ?, ?)`,
                        [intentId, bookingID, getExpiryTimestamp(), now, now],
                        (err) => {
                            if (err) return response.serverError(res, 'Database error', err);
                            return response.ok(res, 'Payment initiated successfully.', { intentId, qrImageUrl });
                        }
                    );
                }
            }
        );

    } catch (err) {
        const paymongoError = err.response?.data?.errors?.[0];
        if (paymongoError) {
            return response.badRequest(res, paymongoError.detail ?? 'PayMongo error.');
        }
        return response.serverError(res, 'Failed to initiate payment.', err);
    }
};

export const getPaymentStatus = (req, res) => {
    const { intentId } = req.params;
    if (!intentId) return response.badRequest(res, 'Payment intent ID is required.');

    const findBooking = 'SELECT bookingID, payment_status, status FROM tbl_booking_payment WHERE payment_intent_id = ?';

    db.query( findBooking, [intentId], async (err, results) => {
        if (err) return response.serverError(res, 'Failed to retrieve payment status.', err);
        if (!results.length) return response.notFound(res, 'Booking not found.');

        const { payment_status, booking_id } = results[0];

        // ✅ Already confirmed — return immediately
        if (payment_status === 'paid') {
            return response.ok(res, 'Payment status retrieved.', {
                status: 'paid',
                bookingID: booking_id,
            });
        }

        // ⚠️ Still pending — fallback to PayMongo
        if (payment_status === 'initiated') {
            try {
                const pmRes = await axios.get(
                    `${PAYMONGO_BASE}/payment_intents/${intentId}`,
                    { headers: { Authorization: authHeader() } }
                );

                const pmStatus = pmRes.data.data.attributes.status;

                if (pmStatus === 'succeeded') {
                    // Self-heal missed webhook
                    db.query(
                        `UPDATE tbl_booking_payment SET payment_status = 'paid' WHERE payment_intent_id = ?`,
                        [intentId],
                        (updateErr) => {
                            if (updateErr) console.error('Self-heal update failed:', updateErr);
                        }
                    );

                    return response.ok(res, 'Payment status retrieved.', {
                        status: 'confirmed',
                        bookingID: booking_id,
                    });
                }

                return response.ok(res, 'Payment status retrieved.', {
                    status: payment_status,
                    bookingID: booking_id,
                });

            } catch (pmErr) {
                console.error('PayMongo fallback failed:', pmErr.message);
                return response.ok(res, 'Payment status retrieved.', {
                    status: payment_status,
                    bookingID: booking_id,
                });
            }
        }

        return response.ok(res, 'Payment status retrieved.', {
            status: payment_status,
            bookingID: booking_id,
        });
        }
    );
};

export const handleWebhookTEST = (req, res) => {
    const sigHeader = req.headers['paymongo-signature'];
    
    // Only verify signature if header is present (skip for manual testing)
    if (sigHeader) {
        try {
            const parts = Object.fromEntries(sigHeader.split(',').map(p => p.split('=')));
            const timestamp = parts['t'];
            const receivedSig = parts['te'] ?? parts['li'];

            const rawBody = req.body.toString();
            const computed = crypto
                .createHmac('sha256', process.env.PAYMONGO_WEBHOOK_SECRET)
                .update(`${timestamp}.${rawBody}`)
                .digest('hex'); 

            if (computed !== receivedSig) return response.badRequest(res, 'Invalid signature.');
        } catch (err) {
            console.error('[Webhook] Signature error:', err);
            return response.serverError(res, "Signature error", err);
        }
    }

    try {
        const rawBody = req.body.toString();
        const event = JSON.parse(rawBody);
        const eventType = event.data.attributes.type;

        if (eventType !== 'payment.paid') return res.sendStatus(200);

        const paymentAttrs = event.data.attributes.data.attributes;
        const bookingID = paymentAttrs.metadata?.booking_id;
        const intentId = event.data.attributes.data.id;

        if (!bookingID) return res.sendStatus(200);

        const now = getCurrentTimestamp();

        db.query(
            `UPDATE tbl_booking_payment
                SET payment_status = 'paid', status = 'completed', paidAt = ?, updatedAt = ?
                WHERE bookingID = ? AND payment_intent_id = ?`,
            [now, now, bookingID, intentId],
            (err) => {
                if (err) {
                    console.error('[Webhook] Payment update error:', err);
                    return response.serverError(res, "Payment update error", err);
                }

                db.query(
                    `UPDATE tbl_bookings SET status = 'confirmed', updatedAt = ? WHERE bookingID = ?`,
                    [now, bookingID],
                    (err) => {
                        if (err) {
                            console.error('[Webhook] Booking update error:', err);
                            return response.serverError(res, "Booking update error", err);
                        }

                        db.query(
                            `UPDATE tbl_booking_slots SET status = 'confirmed', updatedAt = ? WHERE bookingID = ?`,
                            [now, bookingID],
                            (err) => {
                                if (err) {
                                    console.error('[Webhook] Booking update error:', err);
                                    return response.serverError(res, "Booking update error", err);
                                }

                                console.log(`[Webhook] Booking ${bookingID} confirmed after payment.`);
                                return res.sendStatus(200);
                            }
                        );
                    }
                );
            }
        );
    } catch (err) {
        console.error('[Webhook] Error:', err);
        return response.serverError(res, "Database error", err);
    }
};

export const handleWebhook = (req, res) => {
    const sigHeader = req.headers['paymongo-signature'];
    if (!sigHeader) return response.badRequest(res, 'Missing signature header.'); // ✅ strict

    try {
        const parts = Object.fromEntries(sigHeader.split(',').map(p => p.split('=')));
        const timestamp = parts['t'];
        const receivedSig = parts['te'] ?? parts['li'];

        const rawBody = req.body.toString();
        const computed = crypto
            .createHmac('sha256', process.env.PAYMONGO_WEBHOOK_SECRET)
            .update(`${timestamp}.${rawBody}`)
            .digest('hex');

        if (computed !== receivedSig) return res.status(400).json({ error: 'Invalid signature.' });

        const event = JSON.parse(rawBody);
        const eventType = event.data.attributes.type;

        if (eventType !== 'payment.paid') return res.sendStatus(200);

        const paymentAttrs = event.data.attributes.data.attributes;
        const bookingID = paymentAttrs.metadata?.booking_id;
        const intentId = event.data.attributes.data.id;

        if (!bookingID) return res.sendStatus(200);

        const now = getCurrentTimestamp();

        db.query(
            `UPDATE tbl_booking_payment
             SET payment_status = 'paid', status = 'completed', paidAt = ?, updatedAt = ?
             WHERE bookingID = ? AND payment_intent_id = ?`,
            [now, now, bookingID, intentId],
            (err) => {
                if (err) {
                    console.error('[Webhook] Payment update error:', err);
                    return res.sendStatus(500);
                }

                db.query(
                    `UPDATE tbl_bookings SET status = 'confirmed', updatedAt = ? WHERE bookingID = ?`,
                    [now, bookingID],
                    (err) => {
                        if (err) {
                            console.error('[Webhook] Booking update error:', err);
                            return res.sendStatus(500);
                        }

                        db.query(
                            `UPDATE tbl_booking_slots SET status = 'confirmed', updatedAt = ? WHERE bookingID = ?`,
                            [now, bookingID],
                            (err) => {
                                if (err) {
                                    console.error('[Webhook] Booking update error:', err);
                                    return res.sendStatus(500);
                                }

                                console.log(`[Webhook] Booking ${bookingID} confirmed after payment.`);
                                return res.sendStatus(200);
                            }
                        );
                    }
                );
            }
        );

    } catch (err) {
        console.error('[Webhook] Error:', err);
        return res.sendStatus(500);
    }
};

export const getBookingPaymentStatus = (req, res) => {
    const { bookingID } = req.params;

    db.query(
        `SELECT payment_status FROM tbl_booking_payment WHERE bookingID = ?`,
        [bookingID],
        (err, results) => {
            if (err) return response.serverError(res, 'Database error', err);
            if (!results.length) return response.notFound(res, 'Payment not found');
            return response.ok(res, 'Payment status retrieved.', { 
                status: results[0].payment_status  // 'pending_payment' | 'paid'
            });
        }
    );
};