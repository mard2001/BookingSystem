import { useState, useEffect, useCallback, useRef } from 'react';
import { initiatePayment, checkPaymentStatus, getBookingPaymentStatus } from '../api/services/paymentService'; // ✅ import checkPaymentStatus

const QR_EXPIRY_SECONDS = 10 * 60;
const POLL_INTERVAL_MS = 5000;

export const usePayment = ({ onPaymentSuccess }) => {
    const onPaymentSuccessRef = useRef(onPaymentSuccess);
    const [qrImage, setQrImage] = useState(null);
    const [intentId, setIntentId] = useState(null);
    const [paymentState, setPaymentState] = useState('idle');
    const [timeLeft, setTimeLeft] = useState(QR_EXPIRY_SECONDS);
    const [errorMessage, setErrorMessage] = useState(null);
    const [bookingID, setBookingID] = useState(null);

    const pollRef = useRef(null);
    const timerRef = useRef(null);
    const bookingIDRef = useRef(null);

    const clearTimers = () => {
        clearInterval(pollRef.current);
        clearInterval(timerRef.current);
    };

    useEffect(() => {
        onPaymentSuccessRef.current = onPaymentSuccess;
    }, [onPaymentSuccess]);

    // Poll for payment confirmation
    useEffect(() => {
        if (!intentId || paymentState !== 'awaiting') return;

        pollRef.current = setInterval(async () => {
            try {
                const res = await getBookingPaymentStatus(intentId); // ← pass intentId
                if (res?.data?.status === 'confirmed') {
                    clearTimers();
                    setPaymentState('paid');
                    onPaymentSuccessRef.current?.();
                }
            } catch {
                // silent
            }
        }, POLL_INTERVAL_MS);

        return () => clearInterval(pollRef.current);
    }, [intentId, paymentState]);

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
        setBookingID(bookingID);
        bookingIDRef.current = bookingID;

        try {
            const data = await initiatePayment(bookingID, amount, customerName, customerEmail);
            console.log('initiate data:', data);  
            setQrImage(data.data.qrImageUrl);  
            setIntentId(data.data.intentId);    
            setPaymentState('awaiting');
        } catch (err) {
            setErrorMessage(err.message ?? 'Failed to generate QR code.');
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
        bookingIDRef.current = null; 
    }, []);

    const formatTime = (s) =>
        `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    return {
        qrImage,
        intentId,
        paymentState,
        timeLeft,
        formattedTime: formatTime(timeLeft),
        errorMessage,
        initiate,
        reset,
    };
};