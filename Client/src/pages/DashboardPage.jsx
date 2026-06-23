import { BanknoteArrowDown, CalendarCheck, PercentCircleIcon, PhilippinePeso, RatioIcon, TicketPercent, User2, Users2Icon } from 'lucide-react';
import React from 'react'
import { useState } from 'react';
import { useMemo } from 'react';
import { useEffect } from 'react';
import { StatsGrid } from "../components/StatsGrid";
import { getExportFilename } from '../utils/ExportTable';
import { DataTable } from '../components/DataTable';
import { fetchBookingRevenue, fetcRevenueBySport, getAllStats, getUpcomingReservations } from '../api/services/dashboardService';
import { addOneHour, formatCurrency, formatSlotTime, getTimeRange, shortFormatReadableDate } from '../utils/ValueFormat';
import BookingsRevenueChart from '../components/Charts/BookingsRevenueChart';
import RevenueBySportDonutChart from '../components/Charts/RevenueBySportDonutChart';

export const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [bookingRevenueData, setBookingRevenueData] = useState(null);
  const [revenueBySportData, setRevenueBySportData] = useState(null);
  const [upcomingReservData, setUpcomingReservData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [dataTableLoading, setDataTableLoading] = useState(false);
  const [dataTableError, setDataTableError] = useState(null);

  useEffect(()=>{
    fetchStatisticsData();
    fetchUpcomingReservationData();
    fetchBookingRevenueData();
    fetchRevenueBySportData();
  },[]);

  const fetchStatisticsData = async () => {
    try {
      const res = await getAllStats();
      setDashboardData(res.data);
    } catch (error) {
      setError("Failed to load statistics.");
    }
  }

  const fetchUpcomingReservationData = async () => {
    try {
      const res = await getUpcomingReservations();
      setUpcomingReservData(res.data);
    } catch (error) {
      setError("Failed to load statistics.");
    }
  }

  const fetchBookingRevenueData = async () => {
    try {
      const res = await fetchBookingRevenue();
      setBookingRevenueData(res.data);
    } catch (error) {
      setError("Failed to load statistics.");
    }
  }

  const fetchRevenueBySportData = async () => {
    try {
      const res = await fetcRevenueBySport();
      setRevenueBySportData(res.data);
    } catch (error) {
      setError("Failed to load statistics.");
    }
  }

  const dashboardStats = useMemo(() => [
    { icon: CalendarCheck, iconColor: "text-primary", label: "Total Bookings", value: Number(dashboardData?.totalBookings) || 0 },
    { icon: TicketPercent, iconColor: "text-primary", label: "Occupancy Rate", value: (dashboardData?.occupancyRate + "%") || "-" },
    { icon: BanknoteArrowDown, iconColor: "text-primary", label: "Today's Revenue", value: formatCurrency(dashboardData?.totalRevenue) || 0 },
    { icon: Users2Icon, iconColor: "text-primary", label: "Registered Customers", value: Number(dashboardData?.totalCustomers) || 0 },
    { icon: RatioIcon, iconColor: "text-primary", label: "Active Courts", value: Number(dashboardData?.totalActiveCourts) || 0 },
  ], [dashboardData]);

  const upcomingReservColumns = useMemo(() => [
    { 
      header: "Date & Time", 
      accessorFn: (row) => row.bookingDate,
      cell: ({ row }) => {
        const { start } = getTimeRange(row.original.timeSlots);
        const slots = row.original.timeSlots?.split(',') ?? [];
        const endTime = slots.length > 0 
            ? formatSlotTime(addOneHour(slots[slots.length - 1].trim())) 
            : '—';
        return (
            <div className='text-center'>
              <p className="text-sm font-bold text-gray-800">{shortFormatReadableDate(row.original.bookingDate)}</p>
              <p className="text-xs text-gray-500">{start} - {endTime}</p>
            </div>
        )
      },
    },
    {
      header: "Customer",
      id: "CustomerName",
      accessorFn: (row) => row.firstName,
      cell: ({ row }) => (
        
        <div className='flex items-center'>
          <div className='w-7 h-7 bg-secondary/50 flex items-center justify-center rounded-full text-white mr-1'>
            <User2 className='w-4 h-4' />
          </div>
          <div>
            <p className="font-bold text-gray-800">{row.original.bookerFullName}</p>
            <p className="text-xs text-gray-400 whitespace-nowrap">{row.original.bookerContactNumber + " | " + row.original.bookerEmail}</p>
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
          <p className="text-xs text-gray-800">{row.original.courtLabel}</p>
        </div>
      ),
    },
    {
      header: "Sport",
      id: "sport",
      accessorFn: (row) => row.courtSport,
      cell: ({ row }) => (
        <div className='text-center'>
          <p className="text-xs text-gray-800">{row.original.courtSport}</p>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ getValue }) => {
        const status = getValue();

        const statusMap = {
          'confirmed': { label: "Confirmed", style: "bg-green-200 text-green-700" },
          'pending': { label: "Pending Payment", style: "bg-primary/70 text-white" },
        };

        const { label, style } = statusMap[status] ?? { label: "Unknown", style: "bg-gray-100 text-gray-600" };

        return (
          <div className='text-center mx-auto'>
            <span className={` px-2 py-1 rounded-full text-xs font-medium ${style}`}>
              {label}
            </span>
          </div>
        );
      }
    },
  ], []);

  return (
      <>
        <div>
          <StatsGrid items={dashboardStats} maxCols={5} />

          <div className='bg-card p-5 rounded-2xl shadow-xl mb-5'>
            <div className='mb-5 flex items-center justify-between'>
                <p className='text-primary font-semibold '>Recent Activities</p>
            </div>
            <div className='overflow-y-auto max-h-[175px]'>
                {recentActivity.length > 0 ? 
                    recentActivity.map((activity) => {
                        const bookingDate= new Date(activity.bookingDate);
                        const shortMonth = bookingDate.toLocaleDateString('en-US', {month: 'short'});
                        const day = bookingDate.getDate();
                        
                        const slots = activity.timeSlots.split(', ');
                        const firstTime = slots[0];
                        const startTime = formatSlotTime(firstTime);
                        const lastTime = slots[slots.length - 1];
                        const endTime = formatSlotTime(addOneHour(lastTime));

                        const statusMap = {
                            "confirmed": { label: "Confirmed", style: "bg-green-100 text-green-700" },
                            "pending":   { label: "Pending",   style: "bg-yellow-100 text-yellow-700" },
                            "cancelled": { label: "Cancelled", style: "bg-red-100 text-red-700" },
                            "completed": { label: "Completed", style: "bg-blue-100 text-blue-700" },
                            "deleted": { label: "Deleted", style: "bg-gray-300 text-gray-700" },
                        };
                        const { label, style } = statusMap[activity.bookingStatus] ?? { label: "Unknown", style: "bg-gray-100 text-gray-600" };

                        return(
                            <div key={`activity_${activity.bookingID}`} className='border-1 border-primary/20 bg-primary/10 rounded-lg flex space-x-4 px-4 py-3 mb-2'>
                                <div className='border-1 border-primary/50 bg-primary/15 text-center px-4 py-1 rounded-lg'>
                                    <span className='uppercase text-[10px] text-primary/50 mt-5'>{shortMonth}</span>
                                    <p className='text-xl text-primary -mt-2'>{day}</p>
                                </div>
                                <div className='flex-1 flex justify-between items-center'>
                                    <div className=''>
                                        <p className='text-sm text-primary font-semibold'>{activity.courtLabel} - {activity.courtSport}</p>
                                        <p className='text-xs text-secondary'>{activity.bookingID} | {startTime} - {endTime}</p>
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
                        <span>No recent activity as of the moment ...</span>
                    </div>
                )}
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
            <div className='lg:col-span-3 bg-card p-5 rounded-2xl shadow-xl mb-5'>
              <div className='mb-5 flex items-center justify-between'>
                <p className='text-primary font-semibold '>Booking Trends (Last 12 months)</p>
              </div>
              {bookingRevenueData && (
                <BookingsRevenueChart data={bookingRevenueData} />
              )}
            </div>

            <div className='lg:col-span-2 bg-card p-5 rounded-2xl shadow-xl mb-5'>
              <div className='mb-5 flex items-center justify-between'>
                <p className='text-primary font-semibold '>Revenue by Sport</p>
              </div>
              {bookingRevenueData && (
                <RevenueBySportDonutChart data={revenueBySportData} />
              )}
            </div>
          </div>

          <DataTable
            data={upcomingReservData}
            columns={upcomingReservColumns}
            loading={dataTableLoading}
            error={dataTableError}
            placeholder="Search reservations..."
            pageSize={5}
            exportable={true}
            exportFilename={getExportFilename("UpcomingReservations")}
          />
        </div>
      </>
  )
}
