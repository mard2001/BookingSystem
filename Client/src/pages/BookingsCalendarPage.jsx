import React from 'react'
import CalendarApp from '../components/Calendar'
import { useState } from 'react'
import { useEffect } from 'react';
import { toast } from 'sonner';

export const BookingsCalendarPage = () => {

    return (
        <>
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-2xl sm:text-3xl font-bold text-primary">Reservation Calendar</p>
                        <p className="text-sm text-secondary">Manage court schedules and bookings</p>
                    </div>
                </div>
                <div className='bg-white/70 rounded-xl overflow-hidden mt-10 shadow-xl'>
                    <CalendarApp />
                </div>
            </div>
        </>
        
    )
}
