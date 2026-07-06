import { Banknote, BanknoteArrowDownIcon, CalendarArrowDown, CalendarCheck2Icon, CalendarCheckIcon, CalendarDays, CalendarSync, CalendarX, Edit2Icon, PlusCircle, SkipForwardIcon, User2, XCircleIcon } from 'lucide-react';
import React, { useEffect, useMemo } from 'react'
import { useState } from 'react';
import { DataTable } from '../components/DataTable';
import { getExportFilename } from '../utils/ExportTable';
import { createRegularBooking, editRegularBooking, fetchOfferedSlots, getCancelWholeRegularSched, getRegularBookings, getRegularSchedFutureBookings } from '../api/services/bookingService';
import { Modal } from '../components/Modal';
import { getAvailableCourts, getCourts } from '../api/services/courtService';
import { getAllActiveCustomers } from '../api/services/usersService';
import { toast } from 'sonner';
import { addOneHour, formatCurrency, formatDateOnly, formatReadableDate, formatSlotTime, shortFormatReadableDate, shortFormatReadableDateTime } from '../utils/ValueFormat';
import { validateForm } from '../utils/ValueValidate';
import { editRecurringBookingData, newRecurringBookingRules } from '../Rules/BookingInputRules';
import { ActionDropdownBooking } from '../components/ActionDropdownBooking';
import { getTomorrowDate } from '../utils/Calculate';

const DAYS = [
    { label: "M", value: 1 },
    { label: "T", value: 2 },
    { label: "W", value: 3 },
    { label: "Th", value: 4 },
    { label: "F", value: 5 },
    { label: "S", value: 6 },
    { label: "Su", value: 0 },
];

export const RegularReservationPage = () => {
    const [fieldErrors, setFieldErrors] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newBooking, setNewBooking] = useState({
        "accountID":"", "courtID":"", "frequency":"weekly", "dayOfWeek": [], "dayOfMonth":"0", "selectedTimes":[], "startTime":"", "endTime":"", "startDate":"", "endDate":"", "totalAmount": 0, "remarks":""
    })
    const [customerData, setCustomerData] = useState([]);
    const [courtData, setCourtData] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedBookingData, setSelectedBookingData] = useState(null);      
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editBookingData, setEditBookingData] = useState({
        "scheduleID":"", "endDate":"", "totalAmount": 0, "remarks":"", "paymentStatus": ""
    });
    const [pendingPayload, setPendingPayload] = useState(null);
    const [conflictModalOpen, setConflictModalOpen] = useState(false);
    const [conflictData, setConflictData] = useState(null);


    const formatTime = (timeStr) => {
        if (!timeStr) return "N/A";
        const [hourStr, minStr] = timeStr.split(":");
        let hour = parseInt(hourStr);
        const min = parseInt(minStr);
        const period = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;
        return `${hour}:${min.toString().padStart(2, "0")} ${period}`;
    };

    const displayFrequency = (frequency, dayOfWeek, startTime) => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const day = frequency === "weekly" && dayOfWeek != null
            ? days[dayOfWeek]
            : null;

        const time = formatTime(startTime);

        if (frequency === "weekly" && day) return `Every ${day} ${time}`;
        if (frequency === "monthly") return `Every day of the month ${time}`; // see note below
        if (frequency === "daily") return `Every day ${time}`;
        return `${frequency} ${time}`;
    }

    const columns = useMemo(() => [
        {
            header: "Customer",
            id: "CustomerName",
            accessorFn: (row) => row.firstName,
            cell: ({ row }) => (
                <div className='flex items-center'>
                    <div className='w-7 h-7 bg-secondary/50 flex items-center justify-center rounded-full text-white mr-2'>
                        <User2 className='w-4 h-4' />
                    </div>
                    <div>
                         <p className="whitespace-nowrap text-gray-800">{row.original.firstName + " " + row.original.lastName}</p>
                         <p className="text-xs text-gray-400">{row.original.email}</p>
                    </div>
                </div>
            ),
        },
        {
        header: "Court",
        id: "court",
        accessorFn: (row) => row.courtLabel,
        cell: ({ row }) => (
            <div className='text-center'>
                <p className="font-bold text-gray-800">{row.original.courtLabel}</p>
                <p className="text-xs text-gray-400">{row.original.courtSport}</p>
            </div>
        ),
        },
        { 
            header: "Type", 
            accessorKey: "courtType",
            cell: ({ row }) => (
                <span className="inline-flex w-fit px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {row.original.courtType}
                </span>
            ),
        },
        {
            header: "Regular Schedule",
            accessorFn: (row) => {
                return displayFrequency(row.frequency, row.dayOfWeek, row.startTime);
            },
            cell: ({ getValue }) => {
                const text = getValue() ?? "";
                const MAX = 40;
                return (
                    <span title={text} className="cursor-default text-secondary flex items-center">
                        <CalendarSync className='w-4 h-4 mr-1'/> {text.length > MAX ? text.slice(0, MAX) + "..." : text}
                    </span>
                );
            }
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ getValue }) => {
                const status = getValue();

                const statusMap = {
                    "active": { label: "Active", style: "bg-green-100 text-green-700" },
                    "paused": { label: "Paused", style: "bg-yellow-100 text-yellow-700" },
                    "cancelled": { label: "Cancelled", style: "bg-red-100 text-red-700" },
                };

                const { label, style } = statusMap[status] ?? { label: "Unknown", style: "bg-gray-100 text-gray-600" };

                return (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
                    {status}
                </span>
                );
            }
        },
        { 
            header: "Booked Date", 
            accessorKey: "createdAt",
            cell: ({ row }) => (
                <span>
                    {shortFormatReadableDateTime(row.original.createdAt)}
                </span>
            ),
        },
        // {
        //     header: "Actions",
        //     id: "actions",
        //     cell: ({ row }) => (
        //         <ActionDropdownBooking 
        //             row={row}
        //             onEdit={(data) => {handleViewModal(data)}}
        //         />
        //     ),
        // },
    ], []);

    useEffect(() => {
        const fetchRegularBookings = async () => {
            try {
                setLoading(true);
                const bookings = await getRegularBookings();
                setData(bookings.data);
            } catch (err) {
                toast.error(err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchCourts = async () => {
            try {
                const courts = await getAvailableCourts();
                setCourtData(courts.data);
            } catch (err) {
                toast.error(err.message);
            }
        }

        const fetchCustomers = async () => {
            try {
                const customers = await getAllActiveCustomers();
                setCustomerData(customers.data);
            } catch (err) {
                toast.error(err.message);
            }
        }
        
        fetchRegularBookings();
        fetchCourts();
        fetchCustomers();
    },[]);

    const resetNewBookingTimeSlots = () => {
        setTimeSlots([]);
        setNewBooking(prev => ({ ...prev, selectedTimes: [], startTime: "", endTime: "" }));
    }

    const handleNewRegBookingChange = async (e) => {
        const { name, value } = e.target;

        if (name === "totalAmount") {
            if (!/^\d*$/.test(value)) return; // block non-numeric input
            setNewBooking(prev => ({ ...prev, [name]: parseInt(value) }));
            return;
        }
        setNewBooking(prev => ({ ...prev, [name]: value }));

        if (name === "courtID" && value) {
            try {
                resetNewBookingTimeSlots();
                const response = await fetchOfferedSlots(value);
                setTimeSlots(response.data);
            } catch (err) {
                toast.error(err.message);
            }
        }


    };

    const handleDayToggle = (value) => {
        setNewBooking(prev => {
            const selected = prev.dayOfWeek;
            return {
                ...prev,
                dayOfWeek: selected.includes(value)
                    ? selected.filter(d => d !== value)
                    : [...selected, value]
            };
        });
    };

    const handleSelectTime = (slotTime) => {
        setNewBooking(prev => {
            const selected = prev.selectedTimes;
            const updated = selected.includes(slotTime)
                ? selected.filter(t => t !== slotTime)
                : [...selected, slotTime];

            if (updated.length === 0) {
                return { ...prev, selectedTimes: updated, startTime: "", endTime: "" };
            }

            const sorted = [...updated].sort();
            const startTime = sorted[0]; 

            const lastHour = addOneHour(sorted[sorted.length - 1]); 

            return { ...prev, selectedTimes: updated, startTime, endTime:lastHour };
        });
    };

    const submitRegularBooking = async (payload) => {
        try {
            const added = await createRegularBooking(payload);

            if (added.data?.requiresConfirmation) {
                setPendingPayload(payload);
                setConflictData(added.data.unavailableDates);
                setConflictModalOpen(true);
                return;
            }

            const bookings = await getRegularBookings();
            setData(bookings.data);

            toast.success(added.message);
            setAddModalOpen(false);
            setConflictModalOpen(false);
            setFieldErrors({});
            setPendingPayload(null);
            setConflictData(null);
            setNewBooking({
                "accountID":"", "courtID":"", "frequency":"weekly", "dayOfWeek": [], "dayOfMonth":"0",
                "selectedTimes":[], "startTime":"", "endTime":"", "startDate":"", "endDate":"",
                "totalAmount": 0, "remarks":""
            });
        } catch (err) {
            toast.error(err.message);
            if (err.errors?.missing) {
                const errors = Object.fromEntries(err.errors.missing.map(f => [f, "This field is required."]));
                setFieldErrors(errors);
            }
        }
    };

    const handleAddSubmit = async () => {
        const errors = validateForm(newBooking, newRecurringBookingRules);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors); 
            return;
        }
        setFieldErrors({});
        await submitRegularBooking(newBooking);
    }

    const handleConfirmContinue = async () => {
        if (!pendingPayload) return;
        await submitRegularBooking({ ...pendingPayload, confirmed: true });
    };

    const handleConfirmCancel = () => {
        setConflictModalOpen(false);
        setPendingPayload(null);
        setConflictData(null);
    };

    const handleEditSubmit = async () => {
        const errors = validateForm(editBookingData, editRecurringBookingData);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors); 
            return;
        }
        setFieldErrors({}); 

        try {
            const editData = await editRegularBooking(editBookingData);
            toast.success(editData.message);

            setSelectedBookingData(prev => ({
                ...prev,
                ...editBookingData
            }));

            setEditModalOpen(false);
            setFieldErrors({});
        } catch (error) {
            toast.error(error.message);
        }
    }

    const handleViewModal = async (booking) => {
        setSelectedBookingData(null);
        try {
            const bookingData = await getRegularSchedFutureBookings(booking.scheduleID);
            setSelectedBookingData(bookingData.data);
            if (bookingData.data) setViewModalOpen(true);
            handleSetEditData(bookingData.data)
        } catch (error) {
            toast.error(error.message);
        }
    }

    const handleSchedCancellation = async (schedID) => {
        try {
            const dataResponse = await getCancelWholeRegularSched(schedID);
            if (dataResponse){
                toast.success(dataResponse.message)
                const bookings = await getRegularBookings();
                setData(bookings.data);
                setViewModalOpen(false);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const handleEditRegBookingChange = async (e) => {
        console.log(e)
        const { name, value } = e.target;
        
        setEditBookingData(prev => ({ ...prev, [name]: value }));
    }

    const handleSetEditData = (data) => {
        setEditBookingData(prev => {
            const updated = { ...prev };

            Object.keys(prev).forEach(key => {
                if (key in data) {
                    updated[key] = data[key];
                }
            });

            return updated;
        });
    }
    
    return (
        <>
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">Scheduled Reservations</p>
                    <p className="text-sm text-secondary">Manage recurring court bookings and regular player reservations.</p>
                    </div>
                    <button onClick={() => {setFieldErrors({}); setAddModalOpen(true); resetNewBookingTimeSlots()}}
                        className="flex items-center justify-center w-full sm:w-auto px-6 sm:px-10 py-2 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 hover:cursor-pointer">
                        <PlusCircle className="w-5 h-5 mr-2" /> Add Regular Schedule
                    </button>
                </div>

                <div className='my-10'>
                    <DataTable
                        data={data}
                        columns={columns}
                        loading={loading}
                        error={error}
                        placeholder="Search regular bookings..."
                        pageSize={5}
                        exportable={true}
                        exportFilename={getExportFilename("regular-bookings")}
                        onRowClick={(rowData) => handleViewModal(rowData)}
                    />
                </div>
            </div>

            <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} size="">
                <div>
                    <h2 className="text-xl font-bold text-primary mb-1">Add Regular Schedule</h2>
                    <p className="text-sm text-secondary mb-6">Fill in the details to register a regular schedule.</p>
                    <div>
                        <div className='flex justify-center items-center w-full mt-7'>
                            <hr className='flex-1 text-secondary/30'/>
                            <span className='ml-5 uppercase text-[9px] text-secondary'>Customer Info</span>
                        </div>
                        <div>
                            <div className='mt-2'>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Customer Name</span>
                            </div>
                            <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                ${fieldErrors.accountID 
                                    ? "border-red-500 focus:ring-red-300" 
                                    : "border-gray-200 focus:ring-primary/30"
                                }`}>
                                <select
                                    name='accountID'
                                    id="accountID" 
                                    value={newBooking.accountID}
                                    onChange={handleNewRegBookingChange}
                                    className='h-7 w-full text-secondary bg-transparent focus:outline-none text-gray-700 text-sm hover:cursor-pointer'
                                >
                                    <option value="" disabled>Select Customer</option>
                                    {customerData.map((customer) => (
                                        <option key={customer.id} value={customer.id} className='cursor-pointer'>
                                            {customer.firstName} {customer.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {fieldErrors.accountID && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.accountID} </span>)}
                        </div>
                        <div className='flex justify-center items-center w-full mt-4'>
                            <hr className='flex-1 text-secondary/30'/>
                            <span className='ml-5 uppercase text-[9px] text-secondary'>Schedule Details</span>
                        </div>
                        <div>
                            <div className=''>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Court</span>
                            </div>
                            <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                ${fieldErrors.courtID 
                                    ? "border-red-500 focus:ring-red-300" 
                                    : "border-gray-200 focus:ring-primary/30"
                                }`}>
                                <select
                                    name='courtID'
                                    id="courtID" 
                                    value={newBooking.courtID}
                                    onChange={handleNewRegBookingChange}
                                    className='h-7 w-full text-secondary bg-transparent focus:outline-none text-gray-700 text-sm cursor-pointer'
                                >
                                    <option value="" disabled>Select Court</option>
                                    {courtData.map((court) => (
                                        <option key={court.courtID} value={court.courtID}>
                                            {court.courtLabel} — {court.courtSport} ({court.courtType})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {fieldErrors.courtID && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.courtID} </span>)}
                        </div>
                        <div>
                            <div className='mt-2'>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Frequency (Days)</span>
                            </div>
                            <div className="flex gap-2 mt-1 flex-wrap">
                                {DAYS.map((day) => {
                                    const isSelected = newBooking.dayOfWeek.includes(day.value);
                                    return (
                                        <button
                                            key={day.value}
                                            type="button"
                                            onClick={() => handleDayToggle(day.value)}
                                            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors duration-150 hover:cursor-pointer
                                                ${isSelected
                                                    ? "bg-primary text-white"
                                                    : "bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary"
                                                }`}
                                        >
                                            {day.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {fieldErrors.dayOfWeek && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.dayOfWeek} </span>)}
                        </div>
                        <div>
                            <div className='mt-2'>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Time Slots</span>
                            </div>
                            {timeSlots.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-1">
                                        {timeSlots.map((slot) => {
                                            const isSelected = newBooking.selectedTimes.includes(slot.slotTime);
                                            const formatSlotTime = (timeStr) => {
                                                const [hourStr] = timeStr.split(":");
                                                let hour = parseInt(hourStr);
                                                const period = hour >= 12 ? "PM" : "AM";
                                                hour = hour % 12 || 12;
                                                return `${hour}:00 ${period}`;
                                            };

                                            return (
                                                <button
                                                    key={slot.id}
                                                    type="button"
                                                    onClick={() => handleSelectTime(slot.slotTime)}
                                                    className={`py-2 px-3 rounded-xl text-sm font-semibold border transition-all duration-200 hover:cursor-pointer
                                                        ${isSelected
                                                            ? "bg-primary border-primary text-white shadow-md"
                                                            : "border-primary text-primary hover:bg-primary/10"
                                                        }`}
                                                >
                                                    {formatSlotTime(slot.slotTime)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {fieldErrors.selectedTimes && (
                                        <span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>
                                            *{fieldErrors.selectedTimes}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <div className='pl-5'> 
                                    <span className='text-xs text-secondary'>Choose court first...</span>
                                </div>
                            )}
                        </div>
                        <div className='grid max-lg:grid-cols-1 grid-cols-2 min-lg:gap-4'>
                            <div>
                                <div className='mt-2'>
                                    <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Start Date</span>
                                </div>
                                <input 
                                    type="date" 
                                    name="startDate" 
                                    min={getTomorrowDate()}
                                    value={newBooking.startDate} 
                                    onChange={handleNewRegBookingChange}
                                    className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-secondary
                                    ${fieldErrors.startDate 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`} />
                                {fieldErrors.startDate && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.startDate} </span>)}
                            </div>
                            <div>
                                <div className='mt-2'>
                                    <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>End Date</span>
                                </div>
                                <input 
                                    type="date" 
                                    name="endDate" 
                                    min={getTomorrowDate()}
                                    value={newBooking.endDate} 
                                    onChange={handleNewRegBookingChange}
                                    className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-secondary
                                    ${fieldErrors.endDate 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`} />
                                {fieldErrors.endDate && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.endDate} </span>)}
                            </div>
                        </div>
                        <div>
                            <div className='mt-2'>
                                <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Total Payable Amount</span>
                            </div>
                            <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                ${fieldErrors.totalAmount 
                                    ? "border-red-500 focus:ring-red-300" 
                                    : "border-gray-200 focus:ring-primary/30"
                                }`}>
                                <input 
                                    type="number" 
                                    name="totalAmount" 
                                    id="totalAmount"
                                    value={newBooking.totalAmount}
                                    onChange={handleNewRegBookingChange}
                                    placeholder='e.g 1000'
                                    className={`h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400`}
                                    onKeyDown={(e) => {
                                        const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"]
                                        if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault()
                                    }}
                                />
                            </div>
                            {fieldErrors.totalAmount && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.totalAmount} </span>)}
                        </div>
                        <div className='flex justify-center items-center w-full mt-4'>
                            <hr className='flex-1 text-secondary/30'/>
                            <span className='ml-5 uppercase text-[9px] text-secondary'>Notes / Remarks</span>
                        </div>
                        <div>
                            <div className='mt-2'>
                                    <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Administrative Notes</span>
                                </div>
                            <textarea
                                name="remarks"
                                value={newBooking.remarks}
                                onChange={handleNewRegBookingChange}
                                rows={2}
                                placeholder="Add any specific details or recurring billing instruction here..."
                                className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none
                                ${fieldErrors.remarks 
                                    ? "border-red-500 focus:ring-red-300" 
                                    : "border-gray-200 focus:ring-primary/30"
                                }`}
                            />
                            {fieldErrors.remarks && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.remarks} </span>)}
                        </div>
                    </div>
                    <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
                        <button 
                        // onClick={() => {setIsEditing(false); setEditForm(selectedCourt); setFieldErrors({});}}
                            className="px-5 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:cursor-pointer">
                            Cancel
                        </button>
                        <button 
                        onClick={handleAddSubmit}
                            className="px-5 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 hover:cursor-pointer">
                            Save Changes
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)} size="xl">
                {selectedBookingData && (
                    <div>
                        <h2 className="text-xl font-bold text-primary mb-1">Regular Schedule Details</h2>
                        <div className="text-sm text-secondary mb-6 flex items-center max-sm:flex-col max-sm:items-start">
                            
                            <span className='flex'><CalendarSync className='w-4 h-4 mr-2' /> {selectedBookingData.scheduleID}</span>
                            <span className='mx-2 max-sm:hidden'>|</span>
                            <span>{displayFrequency(
                                selectedBookingData.frequency,
                                selectedBookingData.dayOfWeek,
                                selectedBookingData.startTime,
                                selectedBookingData.dayOfMonth 
                            )}</span>
                            <span className='mx-2 max-sm:hidden'>|</span>
                            <span>{selectedBookingData.courtLabel}</span>
                        </div>
                        <hr className='max-md mb-5 text-secondary/30'/>
                        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                            <div className='order-2 md:order-1 md:col-span-3'>
                                <h4 className='text-xs text-secondary mb-2.5'>Upcoming Bookings</h4>
                                <div className='overflow-y-auto'>
                                    {selectedBookingData.bookings.length > 0 ? 
                                        selectedBookingData.bookings.map((upcomingBooking) => {
                                            const bookingDate= new Date(upcomingBooking.bookingDate);
                                            const shortMonth = bookingDate.toLocaleDateString('en-US', {month: 'short'});
                                            const day = bookingDate.getDate();
                                            
                                            const slots = upcomingBooking.slots;
                                            const firstTime = formatSlotTime(slots[0]?.slotTime);
                                            const lastTime = slots[slots.length - 1]?.slotTime;
                                            const endTime = formatSlotTime(addOneHour(lastTime));
        
                                            const statusMap = {
                                                "confirmed": { label: "Confirmed", style: "bg-green-100 text-green-700" },
                                                "pending":   { label: "Pending",   style: "bg-yellow-100 text-yellow-700" },
                                                "cancelled": { label: "Cancelled", style: "bg-red-100 text-red-700" },
                                                "completed": { label: "Completed", style: "bg-blue-100 text-blue-700" },
                                                "deleted": { label: "Deleted", style: "bg-gray-300 text-gray-700" },
                                            };
                                            const { label, style } = statusMap[upcomingBooking.status] ?? { label: "Unknown", style: "bg-gray-100 text-gray-600" };
        
                                            return(
                                                <div key={`upcomingBooking_${upcomingBooking.bookingID}`} className='border-1 border-primary/20 bg-primary/10 rounded-lg flex space-x-4 px-4 py-3 mb-2'>
                                                    <div className='border-1 border-primary/50 bg-primary/15 text-center px-4 py-1 rounded-lg max-h-[60px]'>
                                                        <span className='uppercase text-[10px] text-primary/50 mt-5'>{shortMonth}</span>
                                                        <p className='text-xl text-primary -mt-2'>{day}</p>
                                                    </div>
                                                    <div className='flex-1 flex flex-col min-md:flex-row min-md:justify-between min-md:items-center'>
                                                        <div className=''>
                                                            <p className='text-sm text-primary font-semibold'>{upcomingBooking.courtLabel} - {upcomingBooking.courtSport}</p>
                                                            <p className='text-xs text-secondary'>{upcomingBooking.bookingID} | {firstTime} - {endTime}</p>
                                                        </div>
                                                        <div>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${style} `}>
                                                                {label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    :(
                                        <div className="text-center text-secondary text-sm">
                                            <span>No Upcoming Bookings. Book Now!</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className='text-xs text-secondary mb-2.5 mt-2'>Remarks / Notes / Comments</h4>
                                    <textarea
                                        value={selectedBookingData.remarks}
                                        readOnly={true}
                                        disabled={true}
                                        rows={2}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none overflow-hidden focus:outline-none ring-1 focus:ring-2 ring-primary/30"
                                    />
                                </div>
                            </div>
                            <div className='order-1 md:order-2'>
                                <div className='mb-5'>
                                    <h4 className='text-xs text-secondary'>Schedule Summary</h4>
                                    <div className='flex flex-row gap-x-3 border-1 border-secondary/30 p-2 rounded-lg my-2 shadow-lg inset-shadow-sm'>
                                        <div className='bg-primary w-9 h-9 flex items-center justify-center rounded-lg'>
                                            <CalendarDays className='w-5 h-5 text-primary-lighter' />
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className='text-primary text-sm font-bold'>{selectedBookingData.bookings.length}</span>
                                            <span className='text-secondary text-xs -mt-1'>Total Sessions</span>
                                        </div>
                                    </div>
                                    <div className='flex flex-row gap-x-3 border-1 border-secondary/30 p-2 rounded-lg my-2 shadow-lg inset-shadow-sm'>
                                        <div className='bg-primary w-9 h-9 flex items-center justify-center rounded-lg'>
                                            <CalendarCheckIcon className='w-5 h-5 text-primary-lighter' />
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className='text-primary text-sm font-bold'>{selectedBookingData.startDate && formatReadableDate(selectedBookingData.startDate)}</span>
                                            <span className='text-secondary text-xs -mt-1'>Started Date</span>
                                        </div>
                                    </div>
                                    <div className='flex flex-row gap-x-3 border-1 border-secondary/30 p-2 rounded-lg my-2 shadow-lg inset-shadow-sm'>
                                        <div className='bg-primary w-9 h-9 flex items-center justify-center rounded-lg'>
                                            <CalendarX className='w-5 h-5 text-primary-lighter' />
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className='text-primary text-sm font-bold'>{selectedBookingData.endDate ? formatReadableDate(selectedBookingData.endDate) : "---"}</span>
                                            <span className='text-secondary text-xs -mt-1'>End Date</span>
                                        </div>
                                    </div>
                                    <div className='flex flex-row gap-x-3 border-1 border-secondary/30 p-2 rounded-lg my-2 shadow-lg inset-shadow-sm'>
                                        <div className='bg-primary w-9 h-9 flex items-center justify-center rounded-lg'>
                                            <Banknote className='w-5 h-5 text-primary-lighter' />
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className='text-primary text-sm font-bold'>{selectedBookingData.totalAmount ? formatCurrency(selectedBookingData.totalAmount) : "---"}</span>
                                            <span className='text-secondary text-xs -mt-1'>Total Payable Amount</span>
                                        </div>
                                    </div>
                                    <div className='flex flex-row gap-x-3 border-1 border-secondary/30 p-2 rounded-lg my-2 shadow-lg inset-shadow-sm'>
                                        <div className='bg-primary w-9 h-9 flex items-center justify-center rounded-lg'>
                                            <BanknoteArrowDownIcon className='w-5 h-5 text-primary-lighter' />
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className='text-primary text-sm font-bold capitalize'>{selectedBookingData.paymentStatus}</span>
                                            <span className='text-secondary text-xs -mt-1'>Payment Status</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='mb-5'>
                                    <h4 className='text-xs text-secondary mb-2'>Quick Actions</h4>
                                    <button 
                                        disabled={selectedBookingData.status == 'cancelled'}
                                        onClick={() => {setEditModalOpen(true)}}
                                        className='mb-2 bg-primary text-white/80 flex items-center justify-center p-2 w-full rounded-lg border-1 border-primary hover:text-white/80 hover:bg-primary/90 hover:cursor-pointer transition-all duration-300 disabled:bg-primary/40 disabled:text-white/50 disabled:border-primary/40 disabled:cursor-not-allowed disabled:hover:bg-primary/40 disabled:hover:text-white/50'
                                    >
                                        <Edit2Icon className='w-4 h-4 mr-3' /> <span className='text-xs'>Edit Regular Schedule</span>
                                    </button>
                                    {/* <button className='mb-2 bg-white/80 text-primary flex items-center justify-center p-2 w-full rounded-lg border-1 border-primary hover:text-white/80 hover:bg-primary hover:cursor-pointer transition-all duration-300'>
                                        <SkipForwardIcon className='w-4 h-4 mr-3' /> <span className='text-xs'>Skip Next Booking</span>
                                    </button> */}

                                    <hr className='max-md mb-2 text-secondary/50'/>
                                    
                                    <button
                                        disabled={selectedBookingData.status == 'cancelled'}
                                        onClick={() => handleSchedCancellation(selectedBookingData.id)} 
                                        className='mb-2 bg-red-200 text-red-500 flex items-center justify-center p-2 w-full rounded-lg border-1 border-red-200 hover:text-red-500 hover:bg-red-300 hover:cursor-pointer transition-all duration-300 disabled:bg-red-100 disabled:text-red-300 disabled:border-red-100 disabled:cursor-not-allowed disabled:hover:bg-red-100 disabled:hover:text-red-300'
                                    >
                                        <XCircleIcon className='w-4 h-4 mr-3' /> <span className='text-xs'>{selectedBookingData.status == 'cancelled' ? "Regular Schedule Cancelled" : "Cancel Regular Schedule"}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} size="">
                {selectedBookingData && (
                    <div>
                        <h2 className="text-xl font-bold text-primary mb-1">Edit Schedule</h2>
                        <p className="text-sm text-secondary mb-6">Edit the details of a regular schedule.</p>
                        <hr className='flex-1 text-secondary/30'/>

                        <div>
                            <div>
                                <div className='mt-2'>
                                    <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Schedule ID</span>
                                </div>
                                <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80`}>
                                    <input 
                                        type="text" 
                                        name="scheduleID" 
                                        id="scheduleID"
                                        value={editBookingData.scheduleID}
                                        disabled={true}
                                        readOnly={true}
                                        placeholder='e.g 1000'
                                        className={`h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400`}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className='mt-2'>
                                    <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Scheduled Court</span>
                                </div>
                                <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80`}>
                                    <input 
                                        type="text" 
                                        name="courtLabel" 
                                        id="courtLabel"
                                        value={selectedBookingData.courtLabel}
                                        disabled={true}
                                        readOnly={true}
                                        className={`h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400`}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className='mt-2'>
                                    <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Scheduled Time</span>
                                </div>
                                <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80`}>
                                    <input 
                                        type="text" 
                                        name="scheduleTime" 
                                        id="scheduleTime"
                                        value={displayFrequency(
                                            selectedBookingData.frequency,
                                            selectedBookingData.dayOfWeek,
                                            selectedBookingData.startTime,
                                            selectedBookingData.dayOfMonth 
                                        )}
                                        disabled={true}
                                        readOnly={true}
                                        className={`h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400`}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className='mt-2'>
                                    <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Date Started</span>
                                </div>
                                <input 
                                    type="date" 
                                    name="startDate" 
                                    value={formatDateOnly(selectedBookingData.startDate)} 
                                    disabled={true}
                                    readOnly={true}
                                    className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-secondary`} />
                            </div>
                            <div>
                                <div className='mt-2'>
                                    <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>End Date</span>
                                </div>
                                <input 
                                    type="date" 
                                    name="endDate" 
                                    min={getTomorrowDate()}
                                    value={editBookingData.endDate ? formatDateOnly(editBookingData.endDate): ''} 
                                    onChange={handleEditRegBookingChange}
                                    className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-secondary
                                    ${fieldErrors.endDate 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`} />
                                {fieldErrors.endDate && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.endDate} </span>)}
                            </div>
                            <div>
                                <div className='mt-2'>
                                    <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Total Payable Amount</span>
                                </div>
                                <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                    ${fieldErrors.totalAmount 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`}>
                                    <input 
                                        type="number" 
                                        name="totalAmount" 
                                        id="totalAmount"
                                        value={editBookingData.totalAmount}
                                        onChange={handleEditRegBookingChange}
                                        placeholder='e.g 1000'
                                        className={`h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400`}
                                        onKeyDown={(e) => {
                                            const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"]
                                            if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault()
                                        }}
                                    />
                                </div>
                                {fieldErrors.totalAmount && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.totalAmount} </span>)}
                            </div>
                            <div>
                                <div className='mt-2'>
                                    <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Payment Status</span>
                                </div>
                                <div className={`flex items-center border border-gray-200 rounded-xl text-sm bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                                    ${fieldErrors.paymentStatus 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`}>
                                    <select
                                        name='paymentStatus'
                                        id="paymentStatus" 
                                        value={editBookingData.paymentStatus}
                                        onChange={handleEditRegBookingChange}
                                        className='h-7 w-full text-secondary bg-transparent focus:outline-none text-gray-700 text-sm hover:cursor-pointer'
                                    >
                                        <option value="" disabled>Select Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="partially paid">Partially Paid</option>
                                        <option value="fully paid">Fully Paid</option>
                                    </select>
                                </div>
                                {fieldErrors.paymentStatus && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.paymentStatus} </span>)}
                            </div>
                            <div>
                                <div className='mt-2'>
                                    <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Remarks / Notes / Comments</span>
                                </div>
                                <textarea
                                    name="remarks"
                                    value={editBookingData.remarks}
                                    onChange={handleEditRegBookingChange}
                                    rows={2}
                                    placeholder="Add any specific details or recurring billing instruction here..."
                                    className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none
                                    ${fieldErrors.remarks 
                                        ? "border-red-500 focus:ring-red-300" 
                                        : "border-gray-200 focus:ring-primary/30"
                                    }`}
                                />
                                {fieldErrors.remarks && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.remarks} </span>)}
                            </div>
                        </div>
                        <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
                            <button 
                            onClick={() => {setFieldErrors({}); setEditModalOpen(false)}}
                                className="px-5 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:cursor-pointer">
                                Cancel Edit
                            </button>
                            <button 
                            onClick={handleEditSubmit}
                                className="px-5 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 hover:cursor-pointer">
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal open={conflictModalOpen} onClose={handleConfirmCancel} size="">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <CalendarX className="w-5 h-5 text-yellow-500" />
                        <h2 className="text-xl font-bold text-primary">Some Dates Are Unavailable</h2>
                    </div>
                    <p className="text-sm text-secondary mb-6">
                        The following upcoming dates in this recurring schedule conflict with existing bookings or blackout dates. These dates will be skipped automatically — the rest of the schedule will proceed as normal.
                    </p>

                    <div className="max-h-64 overflow-y-auto space-y-3">
                        {conflictData?.map((dayGroup, i) => (
                            <div key={i}>
                                {dayGroup.dates.map((d, j) => (
                                    <div key={j} className="border border-yellow-200 bg-yellow-50 rounded-lg px-4 py-2 mb-1.5 flex items-center justify-between">
                                        <span className="text-sm text-gray-700">{formatReadableDate(d.date)}</span>
                                        <span className="text-xs text-yellow-700 font-medium">
                                            {d.reason === 'blackout'
                                                ? 'Venue/court closed'
                                                : `Conflicts at ${d.conflictingSlots?.map(formatSlotTime).join(', ')}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 mt-4 pt-4 flex justify-end gap-3">
                        <button
                            onClick={handleConfirmCancel}
                            className="px-5 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:cursor-pointer"
                        >
                            Go Back &amp; Edit
                        </button>
                        <button
                            onClick={handleConfirmContinue}
                            className="px-5 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 hover:cursor-pointer"
                        >
                            Continue Anyway
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
