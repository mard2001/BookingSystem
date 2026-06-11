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
import { useState } from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import { toast } from 'sonner'
import { getBookingsCalendarData } from '../../api/services/bookingService'
import { formatBookingEndDateTime, formatBookingStartDateTime } from '../../utils/ValueFormat'


function CalendarBookingApp() {
    const eventsService = useState(() => createEventsServicePlugin())[0];
    const eventModal = useState(() => createEventModalPlugin())[0];
    const [calendarData, setCalendarData] = useState([]);
    const fetchedRanges = useRef([]);

    const calendar = useCalendarApp({
        views: [createViewDay(), createViewWeekAgenda(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
        events: [],
        plugins: [eventsService, eventModal], 
        timezone: 'Asia/Manila'
    })

    const isRangeAlreadyFetched = (start, end) => {
        if (!start || !end) return false;  
        if (fetchedRanges.current.length === 0) return false; 

        const FIVE_MINUTES = 5 * 60 * 1000;
        return fetchedRanges.current.some(range => 
            range.start && range.end &&  
            range.start <= start && 
            range.end >= end &&
            Date.now() - range.fetchedAt < FIVE_MINUTES
        );
    };

    const fetchBookings = async (start, end) => {
        if (!start || !end) return;
        // if (isRangeAlreadyFetched(start, end)) return;

        try {
            const response = await getBookingsCalendarData(start, end);

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
            fetchedRanges.current.push({ start, end, fetchedAt: Date.now() });
        } catch (err) {
            toast.error(err.message);
            console.error('Failed to fetch bookings', err);
        }
    };

    useEffect(() => {
        if (!calendar) return;

        eventsService.getAll()

        const range = calendar.$app.calendarState.range.value;
        fetchBookings(range.start, range.end);

        calendar.$app.calendarState.range.subscribe((range) => {
            fetchBookings(range.start, range.end);
        });
    }, [calendar]);
 
    return (
        <div>
            <ScheduleXCalendar calendarApp={calendar} />
        </div>
    )
}
 
export default CalendarBookingApp