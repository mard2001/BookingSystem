import { CalendarSync, PlusCircle, User2 } from 'lucide-react';
import React, { useEffect, useMemo } from 'react'
import { useState } from 'react';
import { DataTable } from '../components/DataTable';
import { getExportFilename } from '../utils/ExportTable';
import { createRegularBooking, fetchOfferedSlots, getRegularBookings } from '../api/services/bookingService';
import { Modal } from '../components/Modal';
import { getCourts } from '../api/services/courtService';
import { getAllActiveCustomers } from '../api/services/usersService';
import { toast } from 'sonner';
import { addOneHour, shortFormatReadableDateTime } from '../utils/ValueFormat';
import { validateForm } from '../utils/ValueValidate';
import { newRecurringBookingRules } from '../Rules/BookingInputRules';

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
        "accountID":"", "courtID":"", "frequency":"weekly", "dayOfWeek": [], "dayOfMonth":"", "selectedTimes":[], "startTime":"", "endTime":"", "startDate":"", "endDate":"", "totalAmount": 0, "remarks":""
    })
    const [customerData, setCustomerData] = useState([]);
    const [courtData, setCourtData] = useState([]);
    const [timeSlots, setTimeSlots] = useState([])      

    const formatTime = (timeStr) => {
        if (!timeStr) return "N/A";
        const [hourStr, minStr] = timeStr.split(":");
        let hour = parseInt(hourStr);
        const min = parseInt(minStr);
        const period = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;
        return `${hour}:${min.toString().padStart(2, "0")} ${period}`;
    };

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
                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const day = row.frequency === "weekly" && row.dayOfWeek != null
                    ? days[row.dayOfWeek]
                    : null;

                const time = formatTime(row.startTime);

                if (row.frequency === "weekly" && day) return `Every ${day} ${time}`;
                if (row.frequency === "monthly") return `Every ${row.dayOfMonth} of the month ${time}`;
                if (row.frequency === "daily") return `Every day ${time}`;
                return `${row.frequency} ${time}`;
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
        {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
            <div className="flex gap-2">
                {/* <button
                    onClick={() => handleEdit(row.original)}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 hover:cursor-pointer"
                >
                    <EditIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => handleDelete(row.original)}
                    className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 hover:cursor-pointer"
                >
                    <Trash2Icon className="w-5 h-5" />
                </button> */}
            </div>
        ),
        },
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
                const courts = await getCourts();
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

    const handleAddSubmit = async () => {
        const errors = validateForm(newBooking, newRecurringBookingRules);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors); 
            console.log(errors)
            return;
        }
        setFieldErrors({}); 

        try {
            const added = await createRegularBooking(newBooking);
            const bookings = await getRegularBookings();
            setData(bookings.data);
    
            toast.success(added.message);
            setAddModalOpen(false);
            setFieldErrors({});
            setNewBooking({
                "accountID":"", "courtID":"", "frequency":"weekly", "dayOfWeek": [], "dayOfMonth":"", "selectedTimes":[], "startTime":"", "endTime":"", "startDate":"", "endDate":"", "totalAmount": 0, "remarks":""
            });
        } catch (err) {
            toast.error(err.message);
            if (err.errors?.missing) {
                const errors = Object.fromEntries(err.errors.missing.map(f => [f, "This field is required."]));
                setFieldErrors(errors);
            }
        }
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
                                rows={3}
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
        </>
    )
}
