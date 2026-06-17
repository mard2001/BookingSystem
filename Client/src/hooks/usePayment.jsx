import { useState, useEffect, useCallback, useRef } from 'react';
import { initiatePayment } from '../api/services/paymentService';

const QR_EXPIRY_SECONDS = 10 * 60; // 10 minutes
const POLL_INTERVAL_MS = 5000;     // poll every 5 seconds

export const usePayment = ({ onPaymentSuccess }) => {
    const [qrImage, setQrImage] = useState(null);
    const [intentId, setIntentId] = useState(null);
    const [paymentState, setPaymentState] = useState('idle'); // idle | loading | awaiting | paid | expired | error
    const [timeLeft, setTimeLeft] = useState(QR_EXPIRY_SECONDS);
    const [errorMessage, setErrorMessage] = useState(null);

    const pollRef = useRef(null);
    const timerRef = useRef(null);

    const clearTimers = () => {
        clearInterval(pollRef.current);
        clearInterval(timerRef.current);
    };

    // Poll PayMongo for payment confirmation
    useEffect(() => {
        if (!intentId || paymentState !== 'awaiting') return;

        pollRef.current = setInterval(async () => {
            try {
                const response = await checkPaymentStatus(intentId);
                if (data.data?.status === 'succeeded') {
                    clearTimers();
                    setPaymentState('paid');
                    onPaymentSuccess?.();
                }
            } catch {
                // silent — don't break UX on a failed poll
            }
        }, POLL_INTERVAL_MS);

        return () => clearInterval(pollRef.current);
    }, [intentId, paymentState, onPaymentSuccess]);

    // Countdown timer
    useEffect(() => {
        if (paymentState !== 'awaiting') return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearTimers();
                    setPaymentState('expired');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [paymentState]);

    const initiate = useCallback(async ({ bookingID, amount, customerName, customerEmail }) => {
        setPaymentState('loading');
        setErrorMessage(null);
        setTimeLeft(QR_EXPIRY_SECONDS);

        try {
            const data = await initiatePayment(bookingID, amount, customerName, customerEmail);

            setQrImage(data.data.qrImageUrl);
            setIntentId(data.data.intentId);
            setPaymentState('awaiting');
        } catch (err) {
            setErrorMessage(err.response?.data?.message ?? 'Failed to generate QR code.');
            setPaymentState('error');
        }
    }, []);

    const reset = useCallback(() => {
        clearTimers();
        setQrImage(null);
        setIntentId(null);
        setPaymentState('idle');
        setTimeLeft(QR_EXPIRY_SECONDS);
        setErrorMessage(null);
    }, []);

    const formatTime = (s) =>
        `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    return {
        qrImage,
        intentId,
        paymentState,  // 'idle' | 'loading' | 'awaiting' | 'paid' | 'expired' | 'error'
        timeLeft,
        formattedTime: formatTime(timeLeft),
        errorMessage,
        initiate,
        reset,
    };
};