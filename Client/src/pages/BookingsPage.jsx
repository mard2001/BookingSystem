import React, { useEffect } from 'react'
import { StatsGrid } from '../components/StatsGrid';
import { Banknote, CalendarDaysIcon, CalendarRangeIcon, ClockAlertIcon, EditIcon, Trash2Icon, User2, UsersRoundIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useState } from 'react';
import { DataTable } from '../components/DataTable';
import { getExportFilename } from '../utils/ExportTable';
import { getAllBookings, updateBookingDetails, updateBookingStatus } from '../api/services/bookingService';
import { addOneHour, formatCurrency, formatSlotTime, getTimeRange, shortFormatReadableDate, shortFormatReadableDateTime } from '../utils/ValueFormat';
import { ActionDropdownBooking } from '../components/ActionDropdownBooking';
import { toast } from 'sonner';
import { Modal } from '../components/Modal';
import { statusTransitionTo, validateForm } from '../utils/ValueValidate';
import { editBookingRules } from '../Rules/BookingInputRules';

export const BookingsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [editDetailsModalOpen, setEditDetailsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState({});
  const [editForm, setEditForm] = useState({bookerFullName: "", bookerEmail: "", bookerContactNumber: "", bookingStatus: ""});

  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));

  const bookingStats = useMemo(() => [
    { 
      icon: CalendarRangeIcon, 
      iconColor: "text-primary", 
      label: "Total Booking ", 
      subtext: "This month",
      value: data?.filter(book => {
        const bookingDate = new Date(new Date(book.bookingDate).toLocaleString("en-US", { timeZone: "Asia/Manila" }));
        return (
          bookingDate.getMonth() === now.getMonth() &&
          bookingDate.getFullYear() === now.getFullYear()
        );
      }).length ?? 0
    },
    { 
      icon: UsersRoundIcon, 
      iconColor: "text-primary", 
      label: "Customers Booked", 
      subtext: "Unique this month",
      value: new Set(
        data?.filter(book => {
          const bookingDate = new Date(new Date(book.bookingDate).toLocaleString("en-US", { timeZone: "Asia/Manila" }));
          return (
            bookingDate.getMonth() === now.getMonth() &&
            bookingDate.getFullYear() === now.getFullYear()
          );
        }).map(book => book.accountID)
      ).size ?? 0
    },
    {
      icon: CalendarDaysIcon,
      iconColor: "text-primary",
      label: "Booked Days",
      subtext: `this ${now.toLocaleDateString('en-US', { month: 'short' })}`,
      value: (() => {
        const count = new Set(
          data?.filter((booking) => {
            const date = new Date(booking.bookingDate);
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
          }).map((booking) => new Date(booking.bookingDate).toDateString())
        ).size ?? 0;
        return `${count} ${count === 1 ? "day" : "days"}`;
      })()
    },
    {
      icon: Banknote,
      iconColor: "text-primary",
      label: "Amount Earned",
      subtext: "this month",
      value:
        "₱" +
        data
          ?.reduce((sum, booking) => sum + (Number(booking.computedTotal) || 0),0)
          .toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2,}),
    }
  ], [data]);

  const columns = useMemo(() => [
    { header: "Booking ID", accessorKey: "bookingID" },
    {
      header: "Status",
      accessorKey: "bookingStatus",
      cell: ({ getValue }) => {
        const status = getValue();

        const statusMap = {
          "booked": { label: "Booked", style: "bg-green-100 text-green-700" },
          "pending":   { label: "Pending",   style: "bg-yellow-100 text-yellow-700" },
          "cancelled": { label: "Cancelled", style: "bg-red-100 text-red-700" },
          "completed": { label: "Completed", style: "bg-blue-100 text-blue-700" },
          "deleted": { label: "Deleted", style: "bg-gray-300 text-gray-700" },
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
      header: "Customer Name",
      id: "CustomerName",
      accessorFn: (row) => `${row.bookerFullName} ${row.bookerEmail} ${row.bookerContactNumber}`,
      cell: ({ row }) => (
        <div className='flex items-center'>
          <div className='mr-1'>
            <div className='w-7 h-7 bg-secondary/50 flex items-center justify-center rounded-full text-white '>
              <User2 className='w-4 h-4' />
            </div>
          </div>
          <div className='flex flex-col'>
            <p className="font-bold text-gray-800">{row.original.bookerFullName}</p>
            <span className="text-secondary whitespace-nowrap">{row.original.bookerEmail} | {row.original.bookerContactNumber}</span>
          </div>
        </div>
      ),
    },
    { 
      header: "Booking Date", 
      accessorKey: "bookingDate",
      cell: ({ row }) => (
        <span>
          On {shortFormatReadableDate(row.original.bookingDate)}
        </span>
      ),
    },
    {
        header: "Start Time",
        id: "start_time",
        cell: ({ row }) => {
            const { start } = getTimeRange(row.original.timeSlots);
            return <span>{start}</span>;
        },
    },
    {
        header: "End Time",
        id: "end_time",
        cell: ({ row }) => {
            const slots = row.original.timeSlots.split(', ');
            const lastTime = slots[slots.length - 1];
            const endTime = formatSlotTime(addOneHour(lastTime));
            return <span>{endTime}</span>;
        },
    },
    { 
      header: "Court", 
      id: "courtType",
      accessorFn: (row) => `${row.courtType} ${row.courtLabel}`,
      cell: ({ row }) => (
        <div className='w-fit px-6 py-0.5 rounded-full bg-primary/10 text-primary'>
          <div className='flex flex-col items-center'>
            <span className="font-medium text-xs whitespace-nowrap">
              {row.original.courtLabel}
            </span>
            <span className=" text-[10px] whitespace-nowrap">
              {row.original.courtSport }
            </span>
          </div>
        </div>
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
      header: "Total Amount", 
      accessorKey: "computedTotal",
      cell: ({ row }) => (
        <span className='flex justify-end pr-5'>
          {formatCurrency(row.original.computedTotal)}
        </span>
      ), 
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
      header: "",
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <ActionDropdownBooking
          row={row}
          onEdit={(data) => {handleEditModal(data)}}
          onConfirm={(data) => handleEditBookingStatus("booked", data)}
          onComplete={(data) => handleEditBookingStatus("completed", data)}
          onCancel={(data) => handleEditBookingStatus("cancelled", data)}
          onDelete={(data) => handleEditBookingStatus("deleted", data)}
        />
      ),
    },
  ], []);

  const allStatuses = [
    { value: "pending",   label: "Pending" },
    { value: "booked",    label: "Booked" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" },
    { value: "rejected",  label: "Rejected" },
    { value: "deleted",   label: "Deleted" },
  ];

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const bookings = await getAllBookings();
        setData(bookings.data);
      } catch (err) {
        toast.error("Failed to load bookings.");
        setError("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleEditBookingStatus = async (status, bookingData) => {
    try {
      const editResponse = await updateBookingStatus(status, bookingData.bookingID);
      toast.success(editResponse.message);
    } catch (error) {
      toast.error(error.message);
    }
  }

  const assignEditForm = (booking) => {
    setEditForm({bookerFullName: booking.bookerFullName, bookerEmail: booking.bookerEmail, bookerContactNumber: booking.bookerContactNumber, bookingStatus: booking.bookingStatus})
  }

  const handleEditModal = (booking) => {
    console.log(booking)
    setEditDetailsModalOpen(true);
    setIsEditing(false);
    setSelectedDetails(booking);
    assignEditForm(booking);
    setFieldErrors({}); 
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    const errors = validateForm(editForm, editBookingRules);
    console.log(errors)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors); 
      return;
    }

    try {
      const updateRes = await updateBookingDetails(editForm, selectedDetails.bookingID);
      toast.success(updateRes.message);
      setIsEditing(false);
      setEditDetailsModalOpen(false);

      // update row in-place, no refetch needed
      setData(prev => prev.map(b =>
        b.bookingID === selectedDetails.bookingID
          ? { ...b, ...editForm }
          : b
      ));
    } catch (error) {
      toast.error(error.message);
      if (error.errors?.missing) {
        const errors = Object.fromEntries(error.errors.missing.map(f => [f, "This field is required."]));
        setFieldErrors(errors);
      }
    }
  }

  return (
    <>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-primary">All Bookings</p>
            <p className="text-sm text-secondary">Manage and monitor all court reservations</p>
          </div>
        </div>
      </div>

      <StatsGrid items={bookingStats} maxCols={4} />

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        error={error}
        placeholder="Search bookings..."
        pageSize={5}
        exportable={true}
        exportFilename={getExportFilename("bookings")}
      />

      <Modal open={editDetailsModalOpen} onClose={() => {setEditDetailsModalOpen(false); setIsEditing(false);}} size="lg">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl font-bold text-primary">
              {isEditing ? "Edit Booking Details" : "Booking Details"}
            </h2>
            {!isEditing && ['pending', 'booked'].includes(selectedDetails.bookingStatus) && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 hover:cursor-pointer"
              >
                <EditIcon className="w-4 h-4" /> Edit
              </button>
            )}
          </div>
          <p className="text-sm text-secondary mb-6">
            {isEditing ? "Update the details for this booking." : "Review booking information, schedule, and current status."}
          </p>

          <div className='flex justify-center items-center w-full mt-12 mb-3'>
            <hr className='flex-1 text-secondary/30'/>
            <span className='mx-5 uppercase text-[9px] text-secondary'>Court Details</span>
            <hr className='flex-1 text-secondary/30'/>
          </div>

          <div>
            <div className='grid grid-cols-1 md:grid-cols-2 md:gap-4'>
              <div className='max-md:mt-3'>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Booking ID</label>
                <input 
                  type="text" 
                  name="bookingID" 
                  value={selectedDetails.bookingID} readOnly={true} disabled={true}
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30`} />
              </div>
              <div className='max-md:mt-3'>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Booking Date</label>
                <input 
                  type="text" 
                  name="bookingDate" 
                  value={shortFormatReadableDate(selectedDetails.bookingDate)} readOnly={true} disabled={true}
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30`} />
              </div>

              <div className='max-md:mt-3'>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Court Sport</label>
                <input 
                  type="text" 
                  name="courtSport" 
                  value={selectedDetails.courtSport} readOnly={true} disabled={true}
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30`} />
              </div>
              <div className='max-md:mt-3'>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Court Label</label>
                <input 
                  type="text" 
                  name="courtLabel" 
                  value={selectedDetails.courtLabel} readOnly={true} disabled={true}
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30`} />
              </div>

              <div className='max-md:mt-3'>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Total Payement</label>
                <input 
                  type="text" 
                  name="computedTotal" 
                  value={formatCurrency(selectedDetails.computedTotal)} readOnly={true} disabled={true}
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30`} />
              </div>
              <div className='max-md:mt-3'>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Booking Status</label>
                <select
                  name="bookingStatus"
                  value={editForm.bookingStatus}
                  onChange={handleEditChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2
                    ${isEditing && fieldErrors.bookingStatus
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-200 focus:ring-primary/30"
                    }`}
                >
                  <option value={selectedDetails.bookingStatus}>
                    {allStatuses.find(s => s.value === selectedDetails.bookingStatus)?.label ?? selectedDetails.bookingStatus}
                  </option>
                  {allStatuses.filter(s => statusTransitionTo(selectedDetails.bookingStatus, s.value))
                    .map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))
                  }
                </select>
                {isEditing && fieldErrors.bookingStatus && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.bookingStatus} </span>)}
              </div>
              {selectedDetails.timeSlots && (() => {
                const slots = selectedDetails.timeSlots.split(", ")
                const start = slots[0];
                const startTime = formatSlotTime(start);
                const end = addOneHour(slots[slots.length-1]);
                const endTime = formatSlotTime(end);
                return (
                    <>
                        <div className='max-md:mt-3'>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Start Time</label>
                            <input
                                type="text"
                                name="startTime"
                                value={startTime}
                                readOnly
                                disabled
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                        <div className='max-md:mt-3'>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">End Time</label>
                            <input
                                type="text"
                                name="endTime"
                                value={endTime}
                                readOnly
                                disabled
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                    </>
                );
            })()}
              
              
            </div>
            <div className='mt-3'>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Booking Time Slots Selected</label>
              <div className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30'>
                {selectedDetails.timeSlots && selectedDetails.timeSlots.split(", ").map((slot) => {
                  return (
                    <button
                      key={slot}
                      className={`mx-1 py-1.5 px-5 rounded-xl text-sm font-semibold border transition-all duration-200 border-primary text-primary`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className='flex justify-center items-center w-full mt-3 mb-3'>
            <hr className='flex-1 text-secondary/30'/>
            <span className='mx-5 uppercase text-[9px] text-secondary'>Booker Details</span>
            <hr className='flex-1 text-secondary/30'/>
          </div>
          <div>
            <div className='mt-3'>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Booker Full Name</label>
              <input 
                type="text" 
                name="bookerFullName" 
                value={editForm.bookerFullName} onChange={handleEditChange} readOnly={!isEditing} disabled={!isEditing}
                className={`w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2
                  ${isEditing && fieldErrors.bookerFullName
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-200 focus:ring-primary/30"
                  }`} />
            </div>
            {isEditing && fieldErrors.bookerFullName && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.bookerFullName} </span>)}
            <div className='mt-3'>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Booker Contact Number</label>
              <input 
                type="text" 
                name="bookerContactNumber" 
                maxLength={11}
                onKeyDown={(e) => {
                  const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"]
                  if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault()
                }}
                value={editForm.bookerContactNumber} onChange={handleEditChange} readOnly={!isEditing} disabled={!isEditing}
                className={`w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2
                  ${isEditing && fieldErrors.bookerContactNumber
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-200 focus:ring-primary/30"
                  }`} />
            </div>
            {isEditing && fieldErrors.bookerContactNumber && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.bookerContactNumber} </span>)}
            <div className='mt-3'>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Booker Email</label>
              <input 
                type="text" 
                name="bookerEmail" 
                value={editForm.bookerEmail} onChange={handleEditChange} readOnly={!isEditing} disabled={!isEditing}
                className={`w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2
                  ${isEditing && fieldErrors.bookerEmail
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-200 focus:ring-primary/30"
                  }`} />
            </div>
            {isEditing && fieldErrors.bookerEmail && (<span className='text-red-500 text-[10px] ml-3 font-normal normal-case tracking-normal'>*{fieldErrors.bookerEmail} </span>)}
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
            {isEditing ? (
              <>
                <button onClick={() => {setIsEditing(false); assignEditForm(selectedDetails); setFieldErrors({});}}
                  className="px-5 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleEditSubmit}
                  className="px-5 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 hover:cursor-pointer">
                  Save Changes
                </button>
              </>
            ):(
              <button onClick={() => { setEditDetailsModalOpen(false); setIsEditing(false); }}
                className="px-5 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:cursor-pointer">
                Close
              </button>
            )}
            
          </div>
        </div>
      </Modal>
    </>
  )
}
