import { CalendarDaysIcon, CalendarFold, Eye, EyeOff, FileUser, LibraryBigIcon, LucideCalendarDays, MapPin, Pen, PlusCircleIcon, User } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react'
import { DataTable } from '../components/DataTable';
import { getExportFilename } from '../utils/ExportTable';
import { addOneHour, formatBookingEndDateTime, formatBookingStartDateTime, formatDateOnly, formatReadableDate, formatSlotTime, getTimeRange, getTimeType, shortFormatReadableDate } from '../utils/ValueFormat';
import { Modal } from '../components/Modal';
import { AppointmentFormProvider } from '../context/AppointmentFormContext';
import { MultiStepForm } from '../components/MultiForm/MultiStepForm';
import { getStoredUser } from '../utils/LocalVariables';
import { getPreviousBookings, getUpcomingBookings } from '../api/services/bookingService';
import { getLoggedUserAccountDetails } from '../api/services/authService';
import { decrypt } from '../utils/Crypto';
import { validateForm } from '../utils/ValueValidate';
import { userProfileEditRules } from '../Rules/UserInputRules';
import { toast } from 'sonner';
import { updateCustomer } from '../api/services/usersService';

export const ProfilePage = () => {
    const user = getStoredUser();
    const [userFullDetails, setUserFullDetails] = useState({});
    const [bookingHistData, setBookingHistData] = useState([]);
    const [bookingUpcomingData, setBookingUpcomingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [ isPasswordVisible, setIsPasswordVisible ] = useState(false);
    const toggleVisibility = () => setIsPasswordVisible(!isPasswordVisible);
    const [editUserForm, setEditUserForm] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});

    const bookingHistColumns = useMemo(() => [
        {
            header: "Court / Booking ID",
            id: "bookingID",
            accessorFn: (row) => `${row.courtSport} ${row.courtLabel} ${row.bookingID}`,
            cell: ({ row }) => (
                <div className='flex items-center'>
                    <div className='flex flex-col'>
                        <p className="font-bold text-gray-800">{row.original.courtLabel} | {row.original.courtSport}</p>
                        <span className="text-secondary">{row.original.bookingID}</span>
                    </div>
                </div>
            ),
        },
        { 
            header: "Booking Date", 
            accessorKey: "bookingDate",
            cell: ({ row }) => (
                <span>
                Last {shortFormatReadableDate(row.original.bookingDate)}
                </span>
            ),
        },
        { 
            header: "Duration", 
            accessorFn: (row) => row.timeSlots?.split(',').length ?? 0,
            cell: ({ row }) => {
                const count = row.original.timeSlots?.split(',').length ?? 0;
                const label = count > 1 ? "hrs." : "hr";

                return (
                <span>
                {count + " " + label} 
                </span>
            )}, 
        },
        {
            header: "Status",
            accessorKey: "bookingStatus",
            cell: ({ getValue }) => {
                const status = getValue();

                const statusMap = {
                    "confirmed": { label: "Confirmed", style: "bg-green-100 text-green-700" },
                    "pending":   { label: "Pending",   style: "bg-yellow-100 text-yellow-700" },
                    "cancelled": { label: "Cancelled", style: "bg-red-100 text-red-700" },
                    "completed": { label: "Completed", style: "bg-blue-100 text-blue-700" },
                };

                const { label, style } = statusMap[status] ?? { label: "Unknown", style: "bg-gray-100 text-gray-600" };

                return (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
                    {label}
                </span>
                );
            }
        },
        {
            header: "Actions",
            id: "actions",
            cell: ({ row }) => (
                <></>
            ),
        },
    ], []);

    const fetchBookingHistoryData = async () => {
        setLoading(true);
        const bookingHistData = await getPreviousBookings(user.id);
        setBookingHistData(bookingHistData.data);
        setLoading(false);
    }

    const fetchUpcomingBookingData = async () => {
        const bookingUpcomingData = await getUpcomingBookings(user.id);
        setBookingUpcomingData(bookingUpcomingData.data);
    }

    const fetchUserDetials = async () => {
        const userDetails = await getLoggedUserAccountDetails(user.id);
        setUserFullDetails(userDetails.data[0]);
        setEditUserForm({...userDetails.data[0], password: decrypt(userDetails.data[0].password), birthDate: formatDateOnly(userDetails.data[0].birthDate)});
    }

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditUserForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async () => {
        const errors = validateForm(editUserForm, userProfileEditRules);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        try {
            const updatedUserDetails = await updateCustomer(user.id, editUserForm);
            toast.success(updatedUserDetails.message);

            await fetchUserDetials();
            setEditModalOpen(false);
            setFieldErrors({});
        } catch (err) {
            toast.error(err.message);
            if (err.errors?.missing) {
                const errors = Object.fromEntries(err.errors.missing.map(f => [f, "This field is required."]));
                setFieldErrors(errors);
            }
        }
    }

    useEffect(() => {
        setLoading(false);

        fetchBookingHistoryData();
        fetchUpcomingBookingData();
        fetchUserDetials();

    },[])
    return (
        <>
            <div className='profileHeader mb-5'>
                <div className='flex justify-between items-center bg-card p-10 rounded-2xl shadow-xl'>
                    <div className='flex space-x-5 items-center'>
                        <div className='p-5 bg-secondary/50 text-white/60 rounded-full'>
                            <User className='w-13 h-13' />
                        </div>
                        <div>
                            <p className='text-xl font-semibold text-primary'>{`${userFullDetails?.firstName ?? ''} ${userFullDetails?.middleName ? userFullDetails.middleName.charAt(0) + '.' : ''} ${userFullDetails?.lastName ?? ''} ${userFullDetails?.suffix ?? ''}`} </p>
                            <div className='mb-2 flex items-center'>
                                <span className='mr-3 text-sm text-secondary'>
                                    {userFullDetails?.userID}
                                </span>
                                <span className="inline-flex w-fit px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                                    {userFullDetails?.userType}
                                </span>
                            </div>
                            <span className='flex space-x-2 text-secondary text-xs'>
                                <CalendarDaysIcon className='w-4 h-4 mr-2' />
                                <span>Joined {formatReadableDate(userFullDetails.createdAt)}</span>
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <button onClick={() => {setIsPasswordVisible(false); setEditModalOpen(true)}}
                            className="flex items-center justify-center px-6 py-2 text-xs bg-primary border-1 border-primary text-white rounded-lg hover:bg-primary-darker hover:text-white hover:cursor-pointer mb-1">
                            <Pen className="w-5 h-5 mr-2" /> Edit Account
                        </button>
                        <button onClick={() => {setAddModalOpen(true)}}
                            className="flex items-center justify-center px-6 py-2 text-xs border-1 border-primary text-primary rounded-lg hover:bg-primary/90 hover:text-white hover:cursor-pointer mb-1">
                            <PlusCircleIcon className="w-5 h-5 mr-2" /> Add New Booking
                        </button>
                    </div>
                </div>
            </div>
            <div className='flex space-x-5'>
                <div className='bg-card p-5 rounded-2xl shadow-xl w-[300px]'>
                    <div className='mb-5 flex items-center justify-between'>
                        <p className='text-primary font-semibold '>Account Info</p>
                        <FileUser className='w-5 h-5 text-secondary' />
                    </div>
                    <div className="border-1 border-secondary/30 rounded-lg py-1 px-5 w-full mb-2">
                        <span className='uppercase text-xs text-secondary'>Full Name</span>
                        <p className='text-sm '>{userFullDetails?.firstName} {userFullDetails?.middleName} {userFullDetails?.lastName} {userFullDetails?.suffix}</p>
                    </div>
                    <div className="border-1 border-secondary/30 rounded-lg py-1 px-5 w-full mb-2">
                        <span className='uppercase text-xs text-secondary'>Email</span>
                        <p className='text-sm '>{userFullDetails?.email}</p>
                    </div>
                    <div className="border-1 border-secondary/30 rounded-lg py-1 px-5 w-full mb-2">
                        <span className='uppercase text-xs text-secondary'>Phone</span>
                        <p className='text-sm '>{userFullDetails?.contactNumber}</p>
                    </div>
                    <div className="border-1 border-secondary/30 rounded-lg py-1 px-5 w-full mb-2">
                        <span className='uppercase text-xs text-secondary'>Birthday</span>
                        <p className='text-sm '>{formatReadableDate(userFullDetails?.birthDate)}</p>
                    </div>
                    <div className="border-1 border-secondary/30 rounded-lg py-1 px-5 w-full mb-2">
                        <span className='uppercase text-xs text-secondary'>Age</span>
                        <p className='text-sm '>{userFullDetails?.age} yrs old</p>
                    </div>
                    <div className="border-1 border-secondary/30 rounded-lg py-1 px-5 w-full mb-2">
                        <span className='uppercase text-xs text-secondary'>Gender</span>
                        <p className='text-sm '>{userFullDetails?.gender}</p>
                    </div>
                    <div className="border-1 border-secondary/30 rounded-lg py-1 px-5 w-full mb-2">
                        <span className='uppercase text-xs text-secondary'>Username</span>
                        <p className='text-sm '>{userFullDetails?.username}</p>
                    </div>
                    <div className="border-1 border-secondary/30 rounded-lg py-1 px-5 w-full mb-2">
                        <span className='uppercase text-xs text-secondary'>Password</span>
                        <p className='text-sm '>{'*'.repeat(userFullDetails.password? decrypt(userFullDetails?.password).length: 8)}</p>
                    </div>
                </div>
                <div className='flex flex-col space-y-5 flex-1'>
                    <div className='bg-card p-5 rounded-2xl shadow-xl'>
                        <div className='mb-5 flex items-center justify-between'>
                            <p className='text-primary font-semibold '>Upcoming Bookings</p>
                            <LucideCalendarDays className='w-5 h-5 text-secondary' />
                        </div>
                        <div className='overflow-y-auto max-h-[175px]'>
                            {bookingUpcomingData.length > 0 ? 
                                bookingUpcomingData.map((upcomingBooking) => {
                                    const bookingDate= new Date(upcomingBooking.bookingDate);
                                    const shortMonth = bookingDate.toLocaleDateString('en-US', {month: 'short'});
                                    const day = bookingDate.getDate();
                                    
                                    const slots = upcomingBooking.timeSlots.split(', ');
                                    const firstTime = slots[0];
                                    const startTime = formatSlotTime(firstTime);
                                    const lastTime = slots[slots.length - 1];
                                    const endTime = formatSlotTime(addOneHour(lastTime));

                                    const statusMap = {
                                        "confirmed": { label: "Confirmed", style: "bg-green-100 text-green-700" },
                                        "pending":   { label: "Pending",   style: "bg-yellow-100 text-yellow-700" },
                                        "cancelled": { label: "Cancelled", style: "bg-red-100 text-red-700" },
                                        "completed": { label: "Completed", style: "bg-blue-100 text-blue-700" },
                                    };
                                    const { label, style } = statusMap[upcomingBooking.bookingStatus] ?? { label: "Unknown", style: "bg-gray-100 text-gray-600" };

                                    return(
                                        <div key={`upcomingBooking_${upcomingBooking.bookingID}`} className='border-1 border-primary/20 bg-primary/10 rounded-lg flex space-x-4 px-4 py-3 mb-2'>
                                            <div className='border-1 border-primary/50 bg-primary/15 text-center px-4 py-1 rounded-lg'>
                                                <span className='uppercase text-[10px] text-primary/50 mt-5'>{shortMonth}</span>
                                                <p className='text-xl text-primary -mt-2'>{day}</p>
                                            </div>
                                            <div className='flex-1 flex justify-between items-center'>
                                                <div className=''>
                                                    <p className='text-sm text-primary font-semibold'>{upcomingBooking.courtLabel} - {upcomingBooking.courtSport}</p>
                                                    <p className='text-xs text-secondary'>{upcomingBooking.bookingID} | {startTime} - {endTime}</p>
                                                </div>
                                                <div>
                                                    {/* <span className="inline-flex w-fit px-2 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-400">
                                                        {statusMap[upcomingBooking.bookingStatus]}
                                                    </span> */}
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
                    </div>
                    <div className='bg-card p-5 rounded-2xl shadow-xl'>
                        <div className='mb-1 flex items-center justify-between'>
                            <p className='text-primary font-semibold '>Booking History</p>
                            <CalendarFold className='w-5 h-5 text-secondary' />
                        </div>

                        <DataTable
                            data={bookingHistData}
                            columns={bookingHistColumns}
                            loading={loading}
                            error={error}
                            placeholder="Search bookings..."
                            pageSize={2}
                            exportable={true}
                            exportFilename={getExportFilename("bookings_History")}
                        />
                    </div>
                </div>
            </div>

            <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} size="xl">
                <AppointmentFormProvider>
                    <div className='min-h-screen'>
                        <h2 className="text-xl font-bold text-primary mb-1">New Court Reservation</h2>
                        <p className="text-sm text-secondary mb-6"> Fill in the reservation details to book a court for your preferred date and time.</p>

                        <hr className='max-md mb-10 text-secondary/30'/>
                        <MultiStepForm onSuccess={() => { 
                            setAddModalOpen(false);
                            fetchUpcomingBookingData(); 
                        }} />
                    </div>
                </AppointmentFormProvider>
            </Modal>

            <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} >
                <div className='min-h-screen'>
                    <h2 className="text-xl font-bold text-primary mb-1">Edit Account</h2>
                    <p className="text-sm text-secondary mb-6">Update your personal information and account credentials.</p>

                    <hr className='max-md mb-10 text-secondary/30'/>

                    <div className='flex justify-center items-center w-full mt-7'>
                        <hr className='flex-1 text-secondary/30'/>
                        <span className='ml-5 uppercase text-[9px] text-secondary'>Account Details</span>
                    </div>
                    <div>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Email</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80`}>
                            <input 
                                type="text" 
                                name="email" 
                                id="email" 
                                value={editUserForm.email}
                                // onChange={handleEditChange}
                                readOnly={true} disabled={true}
                                className={`h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400 text-sm`}
                            />
                        </div>
                    </div>
                    <div>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Username</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80`}>
                            <input 
                                type="text" 
                                name="username" 
                                id="username" 
                                value={editUserForm.username}
                                // onChange={handleEditChange}
                                readOnly={true} disabled={true}
                                className={`h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400 text-sm`}
                            />
                        </div>
                        {fieldErrors.role && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'> *{fieldErrors.role} </span>)}
                    </div>
                    <div className=''>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Password</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                            ${fieldErrors.password 
                                ? "border-red-500 focus:ring-red-300" 
                                : "border-gray-200 focus:ring-primary/30"
                            }`}>
                            <input 
                                type={ isPasswordVisible? "text": "password" } 
                                name="password" 
                                id="password" 
                                value={editUserForm.password}
                                onChange={handleEditChange}
                                placeholder='**********'
                                className='h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400 text-sm' 
                            />
                            <button type='button' className='text-gray-500 hover:text-primary transition-colors duration-200 hover:cursor-pointer' onClick={toggleVisibility}>
                            { isPasswordVisible ? <Eye size={20}/> : <EyeOff size={20}/> }
                            </button>
                        </div>
                        {fieldErrors.password && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'> *{fieldErrors.password} </span>)}
                    </div>
                    
                    <div className='flex justify-center items-center w-full mt-7'>
                        <hr className='flex-1 text-secondary/30'/>
                        <span className='ml-5 uppercase text-[9px] text-secondary'>Personal Details</span>
                    </div>
                    <div>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>First Name</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                            ${fieldErrors.firstName 
                                ? "border-red-500 focus:ring-red-300" 
                                : "border-gray-200 focus:ring-primary/30"
                            }`}>
                            <input 
                                type="text" 
                                name="firstName" 
                                id="firstName" 
                                value={editUserForm.firstName}
                                onChange={handleEditChange}
                                className={`h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400 text-sm`}
                            />
                        </div>
                        {fieldErrors.firstName && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'> *{fieldErrors.firstName} </span>)}
                    </div>
                    <div>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Middle Name</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                            ${fieldErrors.middleName 
                                ? "border-red-500 focus:ring-red-300" 
                                : "border-gray-200 focus:ring-primary/30"
                            }`}>
                            <input 
                                type="text" 
                                name="middleName" 
                                id="middleName" 
                                value={editUserForm.middleName}
                                onChange={handleEditChange}
                                className={`h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400 text-sm`}
                            />
                        </div>
                        {fieldErrors.middleName && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'> *{fieldErrors.middleName} </span>)}
                    </div>
                    <div>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Last Name</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                            ${fieldErrors.lastName 
                                ? "border-red-500 focus:ring-red-300" 
                                : "border-gray-200 focus:ring-primary/30"
                            }`}>
                            <input 
                                type="text" 
                                name="lastName" 
                                id="lastName" 
                                value={editUserForm.lastName}
                                onChange={handleEditChange}
                                className={`h-7 w-full bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400 text-sm`}
                            />
                        </div>
                        {fieldErrors.lastName && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'> *{fieldErrors.lastName} </span>)}
                    </div>
                    <div>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Suffix</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                            ${fieldErrors.suffix 
                                ? "border-red-500 focus:ring-red-300" 
                                : "border-gray-200 focus:ring-primary/30"
                            }`}>
                            <select
                                name='suffix'
                                value={editUserForm.suffix}
                                onChange={handleEditChange}
                                className='h-7 w-full text-secondary bg-transparent focus:outline-none text-sm cursor-pointer'
                                defaultValue=""
                            >
                                <option value="" disabled>Select suffix</option>
                                <option value="jr">Jr.</option>
                                <option value="sr">Sr.</option>
                                <option value="ii">II</option>
                                <option value="iii">III</option>
                                <option value="iv">IV</option>
                                <option value="">None</option>
                            </select>
                        </div>
                        {fieldErrors.suffix && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'> *{fieldErrors.suffix} </span>)}
                    </div>
                    <div>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary text-secondary'>Birthday</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                            ${fieldErrors.birthDate 
                                ? "border-red-500 focus:ring-red-300" 
                                : "border-gray-200 focus:ring-primary/30"
                            }`}>
                            <input 
                                type="date"
                                name="birthDate"
                                value={editUserForm.birthDate}
                                onChange={handleEditChange}
                                className='h-7 w-full bg-transparent focus:outline-none text-gray-700 text-sm cursor-pointer'
                            />
                        </div>
                        {fieldErrors.birthDate && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'> *{fieldErrors.birthDate} </span>)}
                    </div>
                    <div>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Gender</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                            ${fieldErrors.gender 
                                ? "border-red-500 focus:ring-red-300" 
                                : "border-gray-200 focus:ring-primary/30"
                            }`}>
                            <select
                                name='gender'
                                value={editUserForm.gender}
                                onChange={handleEditChange}
                                className='h-7 w-full bg-transparent focus:outline-none text-gray-700 text-sm text-sm cursor-pointer'
                                defaultValue=""
                            >
                                <option value="" disabled>Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        {fieldErrors.gender && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'> *{fieldErrors.gender} </span>)}
                    </div>
                    <div>
                        <div className='mt-2'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>Contact Number</span>
                        </div>
                        <div className={`flex items-center border border-gray-200 rounded-xl bg-white/60 px-4 py-1 shadow-sm hover:shadow-md transition-shadow duration-300 gap focus-within:ring-2 focus:bg-white/80
                            ${fieldErrors.contactNumber 
                                ? "border-red-500 focus:ring-red-300" 
                                : "border-gray-200 focus:ring-primary/30"
                            }`}>
                            <input 
                                type="text" 
                                name="contactNumber" 
                                id="contactNumber" 
                                value={editUserForm.contactNumber}
                                onChange={handleEditChange}
                                placeholder='09*********'
                                className='h-7 w-full bg-transparent focus:outline-none text-gray-700 text-sm placeholder:text-gray-400' 
                                maxLength={11}
                                onKeyDown={(e) => {
                                    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"]
                                    if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault()
                                }}
                            />
                        </div>
                        {fieldErrors.contactNumber && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'> *{fieldErrors.contactNumber} </span>)}
                    </div>

                    <div className='mt-5 flex justify-end space-x-3'>
                        <button onClick={() => { setFieldErrors({});}}
                            className="px-5 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:cursor-pointer">
                            Cancel
                        </button>
                        <button 
                            onClick={handleEditSubmit}
                            type="button" 
                            className='px-5 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 bg-primary text-white shadow-sm hover:shadow-lg hover:bg-primary/90 hover:cursor-pointer'>
                            {/* // className='rounded-2xl h-15 flex justify-center items-center space-x-4 bg-primary text-white shadow-sm hover:shadow-lg hover:bg-primary/90 hover:cursor-pointer'> */}
                            Update Account 
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
