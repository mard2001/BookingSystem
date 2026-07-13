import { useCallback, useEffect } from 'react';
import { usePayment } from '../../hooks/usePayment';
import { CircleCheck, ClockAlertIcon, QrCodeIcon, RefreshCcw, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { addOneHour, formatReadableDate, formatSlotTime } from '../../utils/ValueFormat';

export default function QRPayment({ booking, onClose, onPaymentSuccess, onIntentCreated }) {
    // console.log("booking", booking)

    const handlePaymentSuccess = useCallback(() => {
        onPaymentSuccess?.();
    }, [onPaymentSuccess]);

    const { qrImage, intentId, paymentState, formattedTime, errorMessage, initiate, reset } = usePayment({
        onPaymentSuccess: handlePaymentSuccess,
    });

    const formattedTimes = () => {
        if (!booking.bookingDetails.dateTimeInfo.time || booking.bookingDetails.dateTimeInfo.time.length === 0) return "";
        const times = booking.bookingDetails.dateTimeInfo.time;
        const startTime = formatSlotTime(times[0]);
        const endTime = formatSlotTime(addOneHour(times[times.length - 1]));
        return `${startTime} - ${endTime}`;
    };

    const totalHourDuration = () => {
        const len = booking.bookingDetails.dateTimeInfo.time?.length ?? 0;
        return len > 0 ? `${len}${len > 1 ? 'hrs.' : 'hr.'}` : "No time selected";
    };

    useEffect(() => {
        initiate({
            bookingID: booking.bookingID,
            amount: booking.bookingDetails.paymentInfo.totalAmount,
            customerName: booking.bookingDetails.contactPersonInfo.fullname,
            customerEmail: booking.bookingDetails.contactPersonInfo.email,
        });

        return () => reset();
    }, [booking]);

    useEffect(() => {
        if (intentId) {
            onIntentCreated?.(intentId);
        }
    }, [intentId, onIntentCreated]);

    const handleRetry = () => {
        initiate({
            bookingID: booking.bookingID,
            amount: booking.bookingDetails.paymentInfo.totalAmount,
            customerName: booking.bookingDetails.contactPersonInfo.fullname,
            customerEmail: booking.bookingDetails.contactPersonInfo.email,
        });
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors hover:cursor-pointer"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="text-center mb-5">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <QrCodeIcon size={22} className="text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-800">Pay via QRPh</h2>
                    </div>
                    <p className="text-sm text-gray-500">
                        Scan with GCash, Maya, BPI, or any QRPh-supported app
                    </p>
                </div>

                {/* Booking summary */}
                <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5 text-sm">
                    <div className="flex justify-between text-gray-500 mt-1">
                        <span>Booking:</span>
                        <span className="font-medium text-xs text-gray-700">{booking.bookingID}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 mt-1">
                        <span>Booking Name:</span>
                        <span className="font-medium text-xs text-gray-700">{booking.bookingDetails.contactPersonInfo.fullname}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 mt-1">
                        <span>Booking Date:</span>
                        <span className="font-medium text-xs text-gray-700">{formatReadableDate(booking.bookingDetails.dateTimeInfo.date)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 mt-1">
                        <span>Booking Slot:</span>
                        <span className="font-medium text-xs text-gray-700">{formattedTimes()} ({totalHourDuration()})</span>
                    </div>
                    <div className="flex justify-between text-gray-500 mt-1">
                        <span>Amount:</span>
                        <span className="font-semibold text-gray-800">
                            ₱{parseFloat(booking.bookingDetails.paymentInfo.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {/* States */}
                <div className="min-h-64 flex flex-col items-center justify-center">

                    {/* Loading */}
                    {paymentState === 'loading' && (
                        <div className="flex flex-col items-center gap-3 text-gray-400">
                            <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                            <p className="text-sm">Generating QR code...</p>
                        </div>
                    )}

                    {/* Awaiting payment */}
                    {paymentState === 'awaiting' && qrImage && (
                        <div className="flex flex-col items-center gap-3 w-full">
                            <img
                                src={qrImage}
                                alt="QRPh Code"
                                className="w-52 h-52 rounded-xl border border-gray-200 shadow-sm"
                            />
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                <ClockAlertIcon size={16} className="text-amber-500" />
                                Expires in{' '}
                                <span className="font-mono font-semibold text-amber-500">
                                    {formattedTime}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 animate-pulse">
                                Waiting for payment confirmation...
                            </p>
                        </div>
                    )}

                    {/* Paid */}
                    {paymentState === 'paid' && (
                        <div className="flex flex-col items-center gap-3 text-center">
                            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                                <CircleCheck size={40} className="text-green-500" />
                            </div>
                            <div>
                                <p className="font-semibold text-green-600 text-lg">Payment Successful!</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Your booking has been confirmed.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="mt-2 px-6 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    )}

                    {/* Expired */}
                    {paymentState === 'expired' && (
                        <div className="flex flex-col items-center gap-3 text-center">
                            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                                <ClockAlertIcon size={40} className="text-amber-500" />
                            </div>
                            <div>
                                <p className="font-semibold text-amber-600">QR Code Expired</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    The QR code is only valid for 10 minutes.
                                </p>
                            </div>
                            <button
                                onClick={handleRetry}
                                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                <RefreshCcw size={16} />
                                Generate New QR
                            </button>
                        </div>
                    )}

                    {/* Error */}
                    {paymentState === 'error' && (
                        <div className="flex flex-col items-center gap-3 text-center">
                            <p className="text-sm text-red-500">{errorMessage}</p>
                            <button
                                onClick={handleRetry}
                                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                <RefreshCcw size={16} />
                                Try Again
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer note */}
                {paymentState === 'awaiting' && (
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Supports GCash · Maya · BPI · UnionBank · ShopeePay · and 30+ more
                    </p>
                )}
            </div>
        </div>,
        document.body
    );
}