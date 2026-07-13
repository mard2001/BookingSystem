// Fri Jul 24 2026 00:00:00 GMT+0800 (Singapore Standard Time)

import { WEEKDAY_PM_START, WEEKEND_PM_START } from "../constants/contants";

// Friday, July 24, 2026
export function formatReadableDate2(dateInput) {
    const date = new Date(dateInput);
    return date.toLocaleDateString("en-PH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Manila"
    });
}

// "2025-05-20T08:00:00.000Z"
// "May 20, 2025"
export const formatReadableDate = (date) => {
    const formattedDate = new Date(date)
    return formattedDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

// "2025-05-20T08:00:00.000Z"
// "Jul 20, 2025"
export const shortFormatReadableDate = (date) => {
    const formattedDate = new Date(date)
    return formattedDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

// "2025-05-20T08:00:00.000Z"
// "May 20, 2025, 04:00 PM"
export const shortFormatReadableDateTime = (date) => {
    const formattedDate = new Date(date)
    return formattedDate.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    })
}

// "14:30"
// "02:30 PM"
export const formatSlotTime = (slotTime) => {
    const [hour, minute] = slotTime.split(':').map(Number);
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
};

export const formatHour = (hour) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        return `${displayHour}${period}`;
    };

// "2025-05-20"
// "weekday"
export const getDayType = (date) => {
    const day = new Date(date).getDay();
    return (day === 0 || day === 6) ? 'weekend' : 'weekday';
};

// "14:30"
// "PM"
export const getTimeType = (slotTime, dayType) => {
    const pmStart = dayType === 'weekend' ? WEEKEND_PM_START : WEEKDAY_PM_START;
    if (pmStart == null) return 'AM'; // if no PM split — always use the AM rate key
    const hour = parseInt(slotTime.split(':')[0]);
    return hour < pmStart ? 'AM' : 'PM';
};

// "weekday", "AM"
// "rate1"
export const getRateKey = (dayType, timeType) => {
    if (dayType === 'weekday' && timeType === 'AM') return 'rate1';
    if (dayType === 'weekday' && timeType === 'PM') return 'rate2';
    if (dayType === 'weekend' && timeType === 'AM') return 'rate3';
    if (dayType === 'weekend' && timeType === 'PM') return 'rate4';
};

// "1500"
// "₱1,500.00"
export const formatCurrency = (value, currency = 'PHP', locale = 'en-PH') => {
    const amount = Number(value);

    if (isNaN(amount)) return '₱0';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

// "1500, 8600000"
// "₱1,5k, ₱8,6M"
export const formatShortenCurrency = (value) => {
  const num = Number(value || 0);

  if (num >= 1_000_000) {
    return `₱${(num / 1_000_000).toFixed(1)}M`;
  }

  if (num >= 1_000) {
    return `₱${(num / 1_000).toFixed(0)}k`;
  }

  return `₱${num}`;
};

// "08:00, 09:00, 10:00"
// { start: "08:00 AM", end: "10:00 AM" }
export const getTimeRange = (timeSlots) => {
    if (!timeSlots) return { start: '—', end: '—' };
    const slots = timeSlots.split(',').map(t => t.trim());

    return {
        start: formatSlotTime(slots[0]),
        end: formatSlotTime(slots[slots.length - 1]),
    };
};

// "2025-05-20T00:00:00.000Z", "08:00"
// "2025-05-20T08:00+08:00[Asia/Manila]"
export const formatBookingStartDateTime = (bookingDate, time) => {
    const date = new Date(bookingDate)
        .toLocaleDateString('en-CA', {
            timeZone: 'Asia/Manila',
        });

    return `${date}T${time}+08:00[Asia/Manila]`;
};

// "2025-05-20T00:00:00.000Z", "08:00"
// "2025-05-20T09:00:00+08:00[Asia/Manila]"
export const formatBookingEndDateTime = (bookingDate, time) => {
    const [hours, minutes, seconds = "00"] = time.split(":");

    const date = new Date(bookingDate);
    date.setHours(
        parseInt(hours, 10),
        parseInt(minutes, 10),
        parseInt(seconds, 10)
    );
    date.setHours(date.getHours() + 1);

    const formattedDate = date.toLocaleDateString("en-CA", {
        timeZone: "Asia/Manila",
    });

    const formattedTime = date
        .toLocaleTimeString("en-GB", {
            timeZone: "Asia/Manila",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });

    return `${formattedDate}T${formattedTime}+08:00[Asia/Manila]`;
};

// "08:00:00"
// "09:00:00"
export const addOneHour = (time) => {
    const [hour, minute, second] = time.split(':').map(Number);

    const date = new Date();
    date.setHours(hour + 1, minute, second || 0);

    const newHour = String(date.getHours()).padStart(2, '0');
    const newMinute = String(date.getMinutes()).padStart(2, '0');
    const newSecond = String(date.getSeconds()).padStart(2, '0');

    return `${newHour}:${newMinute}:${newSecond}`;
};

// "2001-07-13T16:00:00.000Z"
// "2001-07-13"
export const formatDateOnly = (date) => {
    return new Date(date).toLocaleDateString('en-CA', {
        timeZone: 'Asia/Manila',
    });
};

// 600 (in seconds) 
// 10:00
export const formatClockTime = (s) =>
        `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;