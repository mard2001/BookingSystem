import axios from 'axios';
import crypto from 'crypto';
import { db, getConnection } from '../connect.js';
import { getCurrentTimestamp } from '../utils/calculateValues.js';
import * as response from '../utils/response.js';
import { validateFields } from '../utils/validateFields.js';
import 'dotenv/config';

const PAYMONGO_BASE = 'https://api.paymongo.com/v1';
const authHeader = () =>
    'Basic ' + Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString('base64');

// ─── Initiate QRPh Payment ───────────────────────────────────────────────────

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

        // 4. Persist intent ID to booking record
        db.query(
            'UPDATE tbl_bookings SET paymentIntentId = ?, paymentStatus = ?, updatedAt = ? WHERE bookingID = ?',
            [intentId, 'pending_payment', getCurrentTimestamp(), bookingID],
            (err, result) => {
                if (err) return response.serverError(res, 'Database error', err);
                if (!result.affectedRows) return response.notFound(res, 'Booking not found.');

                return response.ok(res, 'Payment initiated successfully.', { intentId, qrImageUrl });
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

// ─── Poll Payment Status ──────────────────────────────────────────────────────

export const getPaymentStatus = (req, res) => {
    const { intentId } = req.params;
    if (!intentId) return response.badRequest(res, 'Payment intent ID is required.');

    axios
        .get(`${PAYMONGO_BASE}/payment_intents/${intentId}`, {
            headers: { Authorization: authHeader() },
        })
        .then((pmRes) => {
            const attrs = pmRes.data.data.attributes;
            return response.ok(res, 'Payment status retrieved.', {
                status: attrs.status,         // 'awaiting_payment_method' | 'awaiting_next_action' | 'succeeded' | 'payment_error'
                intentId,
            });
        })
        .catch((err) => response.serverError(res, 'Failed to retrieve payment status.', err));
};

// ─── Webhook Handler ──────────────────────────────────────────────────────────
// Note: Must receive raw body — use express.raw() in your route definition, NOT express.json()

export const handleWebhook = async (req, res) => {
    const sigHeader = req.headers['paymongo-signature'];
    if (!sigHeader) return response.badRequest(res, 'Missing signature header.');

    try {
        // Verify PayMongo signature
        const parts = Object.fromEntries(sigHeader.split(',').map(p => p.split('=')));
        const timestamp = parts['t'];
        const receivedSig = parts['te'] ?? parts['li']; // 'te' = test, 'li' = live
        const rawBody = req.body.toString();

        const computed = crypto
            .createHmac('sha256', process.env.PAYMONGO_WEBHOOK_SECRET)
            .update(`${timestamp}.${rawBody}`)
            .digest('hex');

        if (computed !== receivedSig) return res.status(400).json({ error: 'Invalid signature.' });

        const event = JSON.parse(rawBody);
        const eventType = event.data.attributes.type;

        if (eventType === 'payment.paid') {
            const paymentAttrs = event.data.attributes.data.attributes;
            const bookingID = paymentAttrs.metadata?.booking_id;

            if (!bookingID) return res.sendStatus(200); // not our payment, ignore

            db.query(
                `UPDATE tbl_bookings 
                 SET paymentStatus = 'paid', status = 'confirmed', updatedAt = ? 
                 WHERE bookingID = ?`,
                [getCurrentTimestamp(), bookingID],
                (err, result) => {
                    if (err) {
                        console.error('[Webhook] DB update error:', err);
                        return res.sendStatus(500);
                    }
                    if (!result.affectedRows) {
                        console.warn(`[Webhook] Booking not found: ${bookingID}`);
                    }
                    return res.sendStatus(200);
                }
            );
        } else {
            // Unhandled event type — acknowledge and move on
            return res.sendStatus(200);
        }

    } catch (err) {
        console.error('[Webhook] Error:', err);
        return res.sendStatus(500);
    }
};