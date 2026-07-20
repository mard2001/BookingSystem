import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewWeekAgenda,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import 'temporal-polyfill/global'
import '@schedule-x/theme-default/dist/index.css'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { getBookingsCalendarData } from '../../api/services/bookingService'
import { formatBookingEndDateTime, formatBookingStartDateTime } from '../../utils/ValueFormat'

const monthKey = (year, month) => `${year}-${String(month).padStart(2, '0')}`;

// Returns [{year, month}, ...] for every calendar month touched by [start, end]
const getMonthsInRange = (start, end) => {
    const months = [];
    let cursor = start.toPlainDate().with({ day: 1 });
    const endMonth = end.toPlainDate().with({ day: 1 });

    while (Temporal.PlainDate.compare(cursor, endMonth) <= 0) {
        months.push({ year: cursor.year, month: cursor.month });
        cursor = cursor.add({ months: 1 });
    }
    return months;
};

const monthBounds = (year, month) => {
    // month is 1-indexed here (e.g. 7 = July) to match your Temporal version
    const first = new Date(year, month - 1, 1);
    const last = new Date(year, month, 0); // day 0 of next month = last day of this month

    const toDateString = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    return { startDate: toDateString(first), endDate: toDateString(last) };
};


function CalendarBookingApp() {
    const eventsService = useState(() => createEventsServicePlugin())[0];
    const eventModal = useState(() => createEventModalPlugin())[0];
    const fetchedMonths = useRef(new Set()); // e.g. "2026-05"
    const inFlightMonths = useRef(new Set()); // guards against duplicate concurrent fetches

    const calendar = useCalendarApp({
        views: [createViewDay(), createViewWeekAgenda(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
        events: [],
        plugins: [eventsService, eventModal],
        timezone: 'Asia/Manila',
        // dayBoundaries: {
        //     start: '16:00',
        //     end: '23:00',
        // },
    });

    const fetchMonth = async (year, month) => {
        const key = monthKey(year, month);
        if (fetchedMonths.current.has(key) || inFlightMonths.current.has(key)) return;

        inFlightMonths.current.add(key);
        try {
            const { startDate, endDate } = monthBounds(year, month);

            const response = await getBookingsCalendarData(startDate, endDate);

            const existingIds = new Set(eventsService.getAll().map(e => e.id));

            const mapped = response.data
                .filter(booking => !existingIds.has(booking.bookingID))
                .map(booking => {
                    const startDateTime = formatBookingStartDateTime(booking.bookingDate, booking.startTime);
                    const endDateTime = formatBookingEndDateTime(booking.bookingDate, booking.endTime);

                    return {
                        id: booking.bookingID,
                        title: `${booking.courtSport} • ${booking.courtLabel}`,
                        start: Temporal.ZonedDateTime.from(startDateTime),
                        end: Temporal.ZonedDateTime.from(endDateTime),
                        description:
                            `👤 Booker: ${booking.bookerFullName} | ` +
                            `📞 ${booking.bookerContactNumber} | ` +
                            `⏱ ${booking.totalSlots} hrs | ` +
                            `📌 ${booking.bookingStatus}`
                    };
                });

            mapped.forEach(event => eventsService.add(event));
            fetchedMonths.current.add(key);
        } catch (err) {
            toast.error(err.message);
            console.error('Failed to fetch bookings for', key, err);
        } finally {
            inFlightMonths.current.delete(key);
        }
    };

    const fetchVisibleRange = (start, end) => {
        if (!start || !end) return;
        const months = getMonthsInRange(start, end);
        months.forEach(({ year, month }) => fetchMonth(year, month));
        console.log('MONTHS', months);
    };

    useEffect(() => {
        if (!calendar) return;

        const range = calendar.$app.calendarState.range.value;
        fetchVisibleRange(range.start, range.end);

        const unsubscribe = calendar.$app.calendarState.range.subscribe((range) => {
            fetchVisibleRange(range.start, range.end);
        });

        return () => unsubscribe?.();
    }, [calendar]);

    return (
        <div>
            <ScheduleXCalendar calendarApp={calendar} />
        </div>
    );
}

export default CalendarBookingApp;