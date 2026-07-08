import { X, Copy, Check } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { BUSINESS_INFO } from '../../constants/contants'
import { addOneHour, formatReadableDate, formatSlotTime } from '../../utils/ValueFormat'

export const GCashPayment = ({ booking, onClose, onPaymentSuccess }) => {
    
    const [copied, setCopied] = useState(false);

    const eWalletAccount = BUSINESS_INFO.bankaccounts.find(
        (account) => account.accountProvider === booking.bookingDetails.paymentInfo.paymentMethod
    );
    console.log(booking, eWalletAccount)
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleCopy = async () => {
        if (!eWalletAccount?.accountNumber) return;
        try {
            await navigator.clipboard.writeText(eWalletAccount.accountNumber);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

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

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
                onClick={(e) => e.stopPropagation()} // prevent modal clicks from closing
                role="dialog"
                aria-modal="true"
                aria-labelledby="gcash-payment-title"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors hover:cursor-pointer"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="text-center mb-5">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <img src={`images/${eWalletAccount.accountProviderLogo}`} alt="GCash" className="w-10" />
                        <h2 id="gcash-payment-title" className="text-lg font-semibold text-gray-800">
                            Pay via <span className='capitalize'>{eWalletAccount.accountProvider}</span>
                        </h2>
                    </div>
                    <p className="text-sm text-gray-500">
                        Scan with your <span className='capitalize'>{eWalletAccount.accountProvider}</span> account
                    </p>
                    {booking?.amount && (
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                            ₱{booking.amount.toLocaleString()}
                        </p>
                    )}
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
                            ₱{parseFloat(booking.bookingDetails.paymentInfo.totalAmount).toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="min-h-64 flex flex-col items-center justify-center">
                    <img
                        src={`images/${eWalletAccount?.accountQR ?? ''}`}
                        alt=""
                        className="w-50 h-50 object-contain"
                    />
                    <span className='text-[9px] bg-secondary/10 py-1 px-3 rounded-xl text-secondary/70 mb-3'>Transfer fees may apply</span>

                    <div className="flex justify-center items-center w-full mt-3 mb-3">
                        <hr className="flex-1 text-secondary/30" />
                        <span className="mx-5 uppercase text-[9px] text-secondary">or</span>
                        <hr className="flex-1 text-secondary/30" />
                    </div>

                    <div className="flex flex-col justify-center items-center">
                        <p className="text-[10px] text-secondary">Account Number:</p>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 text-lg text-[#000] hover:opacity-70 transition-opacity"
                            title="Click to copy"
                        >
                            {eWalletAccount?.accountNumber ?? 'N/A'}
                            {copied ? (
                                <Check size={14} className="text-green-600" />
                            ) : (
                                <Copy size={14} className="text-gray-400" />
                            )}
                        </button>
                    </div>

                    <div className="flex flex-col justify-center items-center mt-3">
                        <p className="text-[10px] text-secondary">Account Name:</p>
                        <span className="text-sm text-[#000]">
                            {eWalletAccount?.accountName ?? 'N/A'}
                        </span>
                    </div>
                </div>

                <button 
                    onClick={() => onPaymentSuccess(booking)}
                    className="w-full mt-6 bg-primary-darker text-white py-3 rounded-xl font-medium transition-opacity hover:opacity-80 hover:cursor-pointer duration-300 transition-colors">
                    Confirm Payment
                </button>
            </div>
        </div>,
        document.body
    )
}