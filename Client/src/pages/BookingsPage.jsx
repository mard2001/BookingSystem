import React, { useEffect } from 'react'
import { StatsGrid } from '../components/StatsGrid';
import { Banknote, CalendarDaysIcon, CalendarRangeIcon, ClockAlertIcon, EditIcon, Trash2Icon, User2, UsersRoundIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useState } from 'react';
import { DataTable } from '../components/DataTable';
import { getExportFilename } from '../utils/ExportTable';
import { getAllBookings } from '../api/services/bookingService';
import { addOneHour, formatCurrency, formatSlotTime, getTimeRange, shortFormatReadableDate, shortFormatReadableDateTime } from '../utils/ValueFormat';
import { ActionDropdownBooking } from '../components/ActionDropdownBooking';
import { toast } from 'sonner';

export const BookingsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));

  const bookingStats = useMemo(() => [
    { 
      icon: CalendarRangeIcon, 
      iconColor: "text-primary", 
      label: "Total Booking ", 
      subtext: "This month",
      value: data?.filter(book => {
        const bookingDate = new Date(new Date(book.bookingDate).toLocaleString("en-US", { timeZone: "Asia/Manila" }));
        console.log("data",data, bookingDate)
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
            <span className="text-secondary">{row.original.bookerEmail} | {row.original.bookerContactNumber}</span>
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
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <ActionDropdownBooking
          row={row}
          onEdit={(data) => console.log("Edit", data)}
          onCancel={(data) => console.log("Cancel", data)}
          onDelete={(data) => console.log("Delete", data)}
        />
      ),
    },
  ], []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const bookings = await getAllBookings();
        console.log(bookings)
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
    </>
  )
}
