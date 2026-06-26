import { PlusCircle } from 'lucide-react';
import React from 'react'
import { useState } from 'react';

export const RegularReservationPage = () => {
    const [fieldErrors, setFieldErrors] = useState({});
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">Scheduled Reservations</p>
                    <p className="text-sm text-secondary">Manage recurring court bookings and regular player reservations.</p>
                    </div>
                    <button onClick={() => {setFieldErrors({}); setAddModalOpen(true)}}
                    className="flex items-center justify-center w-full sm:w-auto px-6 sm:px-10 py-2 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 hover:cursor-pointer">
                    <PlusCircle className="w-5 h-5 mr-2" /> Add Regular Schedule
                    </button>
                </div>
            </div>
        </>
    )
}
