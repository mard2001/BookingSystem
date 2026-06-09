import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { useAppointmentFormContext } from '../../context/AppointmentFormContext'
import { Banknote, CalendarCheck2, CreditCard, Ratio, User2Icon } from 'lucide-react';
import { paymentOptions } from '../../constants/contants';
import { addOneHour, formatSlotTime, getDayType, getRateKey, getTimeType } from '../../utils/ValueFormat';
import { checkAvailability, confirmBooking } from '../../api/services/bookingService';
import { toast } from 'sonner';
import { delay } from '../../utils/ApiHandler';
import { BookingConfirmation } from './BookingConfirmation';
import { useCallback } from 'react';

export const SummaryContent = forwardRef(({ setIsChecking, setIsSubmitting, isConfirmed, setIsConfirmed, onSuccess }, ref) => {
    const { formData, resetForm  } = useAppointmentFormContext();
    const [selectedPayment, setSelectedPayment] = useState("online");
    const [conflictSlots, setConflictSlots] = useState([]);
    const [error, setError] = useState(null);
    const [isConfirmBooking, setIsConfirmBooking] = useState({});
    const [isResetForm, setIsResetForm] = useState(false);

    const court = formData.courtInfo.court;
    const date = formData.dateTimeInfo.date;
    const times = formData.dateTimeInfo.time;
    const bookingDate = date?.toLocaleDateString('en-CA', {timeZone: 'Asia/Manila'});

    const formattedDate = formData.dateTimeInfo.date 
        ? formData.dateTimeInfo.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
        : "No date selected";

    const formattedTimes = () => {
        const time = formData.dateTimeInfo.time;

        if (!time || time.length === 0) {
            toast.error("Time slot error.");
            return "";
        }

        const firstTime = time[0];
        const startTime = formatSlotTime(firstTime);
        const lastTime = time[time.length - 1];
        const endTime = formatSlotTime(addOneHour(lastTime));

        return `${startTime} - ${endTime}`;
    }

    const totalDuration = times?.length > 0
        ? `${60 * times.length} Minutes`
        : "No time selected";    
        
    const totalHourDuration = () => {
        const timeLength = formData.dateTimeInfo.time.length;
        const label = timeLength > 1? 'hrs.':'hr.';

        if (!timeLength || formData.dateTimeInfo.time == 0) {
            toast.error("No time selected.");
            return "";
        }

        return timeLength + label;
    }

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

    const handleConfirmBooking = async () => {
        setError(null);
        setConflictSlots([]);

        try {
            // Step 1 — check availability first
            setIsChecking(true);
            await delay(1000);
            const { available, takenSlots } = await checkAvailability(court.courtID, date, times);
            await delay(500);
            setIsChecking(false);
            
            // Step 2 — if conflict, show which slots were taken
            if (!available) {
                setConflictSlots(takenSlots.map(s => s.slotTime));
                setError('Some of your selected slots are no longer available. Please go back and pick different slots.');
                return;
            }

            // Step 3 — all clear, submit booking
            setIsSubmitting(true);
            await delay(1000);
            const submitRes = await confirmBooking(court.courtID, formData, bookingDate, times, selectedPayment)
            await delay(500);

            // Step 4 — success
            if(submitRes.success){
                toast.success(submitRes.message);

                setIsConfirmed(true);
                setIsConfirmBooking(submitRes.data);
                onSuccess?.();
            } else{
                toast.error(submitRes.message);
            }

        } catch (err) {
            console.log("err",err)
            toast.error(err.message);
            if (!err.success) {
                setError('A slot was just taken by someone else. Please go back and reselect.');
                toast.error(err.message)
            } else {
                toast.error(err.message)
            }
        } finally {
            setIsChecking(false);
            setIsSubmitting(false);
            
            await delay(10000);
            if(!isResetForm){
                handleResetFormNow();
            }
        }
    };
    
    useImperativeHandle(ref, () => ({
        handleConfirmBooking,
    }));
    
    const handleResetFormNow = useCallback(() => {
        setIsConfirmed(false);
        setIsConfirmBooking({});
        setIsResetForm(true);
        resetForm();
    }, [resetForm]);
    
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

                        {/* Dynamic rate breakdown */}
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

                        {/* Payment method — unchanged */}
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
                        {conflictSlots.length > 0 && (
                    <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600'>
                        <p className='font-semibold mb-1'>These slots are no longer available:</p>
                        <ul className='list-disc list-inside'>
                            {conflictSlots.map(slot => <li key={slot}>{slot}</li>)}
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

                {/* Confirm button */}
                {/* <button
                    onClick={handleConfirmBooking}
                    disabled={isChecking || isSubmitting}
                    className='w-full mt-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm
                        hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    {isChecking
                        ? 'Checking availability...'
                        : isSubmitting
                            ? 'Confirming booking...'
                            : 'Confirm Booking'
                    }
                </button> */}
                    </div>
                </div>
            </div>
        ) : (
            <BookingConfirmation  bookingId={isConfirmBooking.bookingID} onReset={handleResetFormNow} />
        )}
        </>
    )
})
