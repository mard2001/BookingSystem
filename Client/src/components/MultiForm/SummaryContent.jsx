import React, { forwardRef, useImperativeHandle, useState, useCallback } from 'react'
import { useAppointmentFormContext } from '../../context/AppointmentFormContext'
import { Banknote, CalendarCheck2, CreditCard, Ratio, User2Icon } from 'lucide-react';
import { paymentOptions } from '../../constants/contants';
import { addOneHour, formatSlotTime, getDayType, getRateKey, getTimeType } from '../../utils/ValueFormat';
import { checkAvailability, confirmBooking } from '../../api/services/bookingService';
import { toast } from 'sonner';
import { delay } from '../../utils/ApiHandler';
import { BookingConfirmation } from './BookingConfirmation';
import { useEffect } from 'react';

export const SummaryContent = ({ setIsChecking, setIsSubmitting, isConfirmed, setIsConfirmed, onSuccess, onConfirm }) => {
    const { formData, resetForm, updatePaymentMethod, updateBookingResult, nextStep, goToStep } = useAppointmentFormContext();
    
    const [selectedPayment, setSelectedPayment] = useState("online");
    const [conflictSlots, setConflictSlots] = useState([]);
    const [error, setError] = useState(null);
    const [isConfirmBooking, setIsConfirmBooking] = useState({});
    const [isResetForm, setIsResetForm] = useState(false);

    const court = formData.courtInfo.court;
    const date = formData.dateTimeInfo.date;
    const times = formData.dateTimeInfo.time;
    const bookingDate = date?.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

    const formattedDate = date
        ? date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
        : "No date selected";

    const formattedTimes = () => {
        if (!times || times.length === 0) return "";
        const startTime = formatSlotTime(times[0]);
        const endTime = formatSlotTime(addOneHour(times[times.length - 1]));
        return `${startTime} - ${endTime}`;
    };

    const totalHourDuration = () => {
        const len = times?.length ?? 0;
        return len > 0 ? `${len}${len > 1 ? 'hrs.' : 'hr.'}` : "No time selected";
    };

    const slotBreakdown = (date && times?.length > 0)
        ? times.map(slotTime => {
            const dayType = getDayType(date);
            const timeType = getTimeType(slotTime);
            const rateKey = getRateKey(dayType, timeType);
            const rate = parseFloat(court?.[rateKey] ?? 0);
            return { slotTime, dayType, timeType, rate };
        })
        : [];

    const totalAmount = slotBreakdown.reduce((sum, s) => sum + s.rate, 0);

    const rateGroups = slotBreakdown.reduce((acc, s) => {
        const label = `${s.dayType.charAt(0).toUpperCase() + s.dayType.slice(1)} ${s.timeType}`;
        if (!acc[label]) acc[label] = { rate: s.rate, count: 0 };
        acc[label].count++;
        return acc;
    }, {});

    const handleConfirmBooking = useCallback(async () => {
        setError(null);
        setConflictSlots([]);

        try {
            setIsChecking(true);
            await delay(1000);
            console.log('calling checkAvailability...');
            const res = await checkAvailability(court.courtID, date, times);
            console.log('checkAvailability result:', res);
            const { available, takenSlots, message } = res;
            await delay(500);
            setIsChecking(false);

            if (!available) {
                setConflictSlots(takenSlots ?? []);
                setError(message);
                return;
            }

            setIsSubmitting(true);
            await delay(1000);

            const bookingStatus = selectedPayment === 'online' ? 'pending' : 'confirmed';
            const submitRes = await confirmBooking(court.courtID, formData, bookingDate, times, selectedPayment, bookingStatus);
            await delay(500);

            if (!submitRes.success) {
                toast.error(submitRes.message);
                return;
            }

            if (selectedPayment === 'online') {
                updatePaymentMethod('qrph');
                updateBookingResult(submitRes.data.bookingID, totalAmount);
                goToStep(5); // ✅ instead of nextStep()
            } else {
                toast.success(submitRes.message);
                setIsConfirmed(true);
                setIsConfirmBooking(submitRes.data);
                onSuccess?.();
            }

        } catch (err) {
            toast.error(err.message ?? 'Something went wrong.');
            setConflictSlots(err.errors?.takenSlots ?? []);
            setError(err.message ?? null);
        } finally {
            setIsChecking(false);
            setIsSubmitting(false);
        }
    }, [court, date, times, selectedPayment, formData, bookingDate, totalAmount, nextStep, updatePaymentMethod, updateBookingResult, setIsConfirmed, onSuccess]);

    useEffect(() => {
        onConfirm(handleConfirmBooking);
    }, [handleConfirmBooking]);

    const handleResetFormNow = useCallback(() => {
        setIsConfirmed(false);
        setIsConfirmBooking({});
        setIsResetForm(true);
        resetForm();
    }, [resetForm]);

    console.log(formData)
    return (
        <>
            {!isConfirmed ? (
                <div>
                    <div className='text-center'>
                        <span className='uppercase text-xs text-primary/70 font-bold tracking-wider'>final step</span>
                        <h1 className='capitalize font-semibold text-3xl mb-1 -mt-1'>Review your Booking</h1>
                        <p className='text-sm text-secondary'>Please verify your details before confirming your reservation.</p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 md:gap-2 md:px-5 mt-6'>
                        <div>
                            {/* Court */}
                            <div className='flex space-x-3 mb-8 max-md:w-full w-xs mx-auto'>
                                <div>
                                    <div className='bg-primary/20 p-2 rounded-xl text-primary/80 mt-3'>
                                        <Ratio className='w-5' />
                                    </div>
                                </div>
                                <div>
                                    <span className="uppercase text-[10px] text-secondary font-semibold">selected court</span>
                                    <p className="font-bold">{court?.courtLabel} ({court?.courtSport})</p>
                                    <p className='text-xs text-secondary'>{court?.courtDesc}</p>
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className='flex space-x-3 mb-8 max-md:w-full w-xs mx-auto'>
                                <div>
                                    <div className='bg-primary/20 p-2 rounded-xl text-primary/80 mt-3'>
                                        <CalendarCheck2 className='w-5' />
                                    </div>
                                </div>
                                <div>
                                    <span className="uppercase text-[10px] text-secondary font-semibold">date & time</span>
                                    <p className="font-bold">{formattedDate}</p>
                                    <p className='text-xs text-secondary'>{formattedTimes()} ({totalHourDuration()})</p>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className='flex space-x-3 mb-8 max-md:w-full w-xs mx-auto'>
                                <div>
                                    <div className='bg-primary/20 p-2 rounded-xl text-primary/80 mt-3'>
                                        <User2Icon className='w-5' />
                                    </div>
                                </div>
                                <div>
                                    <span className="uppercase text-[10px] text-secondary font-semibold">Booking for</span>
                                    <p className="font-bold">{formData.contactPersonInfo.fullname}</p>
                                    <p className='text-xs text-secondary'>{formData.contactPersonInfo.phoneNumber} • {formData.contactPersonInfo.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className='mt-2 relative'>
                            <p className='uppercase text-[10px] text-secondary font-semibold'>Payment info</p>

                            {/* Rate breakdown */}
                            <div className='min-md:mx-5 max-sm:w-full max-md:w-md w-70 pb-5 mb-5 border-b border-secondary/20'>
                                {Object.entries(rateGroups).map(([label, { rate, count }]) => (
                                    <div key={label} className="flex justify-between items-center mt-2">
                                        <p className='text-xs text-secondary'>{count}x {label} Rate</p>
                                        <p className='text-xs text-secondary'>₱{(rate * count).toLocaleString()}</p>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center mt-1">
                                    <p className='text-xs text-secondary'>Duration</p>
                                    <p className='text-xs text-secondary'>{times?.length ?? 0} Hr{times?.length !== 1 ? 's' : ''}.</p>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <p className='text-md font-semibold'>Total Amount</p>
                                    <p className='text-md text-primary font-semibold'>₱{totalAmount.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Payment method */}
                            <p className='uppercase text-[10px] text-secondary font-semibold'>Payment method</p>
                            <div className="space-y-3">
                                {paymentOptions.map((option) => {
                                    const isSelected = selectedPayment === option.id;
                                    return (
                                        <div
                                            key={option.id}
                                            onClick={() => setSelectedPayment(option.id)}
                                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all
                                                ${isSelected ? "border-primary bg-primary/5" : "border-gray-200 bg-white"}`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-full ${isSelected ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-400"}`}>
                                                    {option.icon}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm text-black/80">{option.label}</p>
                                                    <p className="text-xs text-secondary">{option.description}</p>
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                                                ${isSelected ? "border-primary" : "border-gray-300"}`}>
                                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Conflict slots error */}
                            {conflictSlots.length > 0 && (
                                <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600'>
                                    <p className='font-semibold mb-1'>These slots are no longer available:</p>
                                    <ul className='list-disc list-inside'>
                                        {conflictSlots.map(slot => (
                                            <li key={slot.slotTime}>
                                                {formatSlotTime(slot.slotTime)} — {
                                                    slot.reason === 'confirmed' ? 'Already confirmed' :
                                                    slot.reason === 'pending'   ? 'Currently being booked by someone else' :
                                                                                'Unavailable'
                                                }
                                            </li>
                                        ))}
                                    </ul>
                                    <p className='mt-1 text-xs'>Please go back and choose different time slots.</p>
                                </div>
                            )}

                            {/* General error */}
                            {error && !conflictSlots.length && (
                                <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600'>
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                // Pay at Court success screen
                <BookingConfirmation bookingId={isConfirmBooking.bookingID} onReset={handleResetFormNow} />
            )}
        </>
    );
};