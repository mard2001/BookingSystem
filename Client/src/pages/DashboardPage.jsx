import { BanknoteArrowDown, CalendarCheck, CalendarPlus, CheckCheckIcon, CheckSquareIcon, ChevronRight, Grid2x2Plus, HourglassIcon, LucideSquareX, PercentCircleIcon, PhilippinePeso, RatioIcon, TicketPercent, User2, UserPlus, Users2Icon } from 'lucide-react';
import React from 'react'
import { useState } from 'react';
import { useMemo } from 'react';
import { useEffect } from 'react';
import { StatsGrid } from "../components/StatsGrid";
import { StatsGrid2 } from "../components/StatsGrid2";
import { getExportFilename } from '../utils/ExportTable';
import { DataTable } from '../components/DataTable';
import { fetchBookingRevenue, fetcRevenueBySport, getAllStats, getUpcomingReservations } from '../api/services/dashboardService';
import { addOneHour, formatCurrency, formatSlotTime, getTimeRange, shortFormatReadableDate } from '../utils/ValueFormat';
import BookingsRevenueChart from '../components/Charts/BookingsRevenueChart';
import RevenueBySportDonutChart from '../components/Charts/RevenueBySportDonutChart';

export const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [bookingRevenueData, setBookingRevenueData] = useState(null);
  const [revenueBySportData, setRevenueBySportData] = useState([]);
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
    { icon: BanknoteArrowDown, iconColor: "text-primary", label: "Monthly Revenue", value: formatCurrency(dashboardData?.totalRevenue) || 0 },
    { icon: Users2Icon, iconColor: "text-primary", label: "Registered Customers", value: Number(dashboardData?.totalCustomers) || 0 },
    { icon: RatioIcon, iconColor: "text-primary", label: "Active Courts", value: Number(dashboardData?.totalActiveCourts) || 0 },
  ], [dashboardData]);

  const dashboardStatusStats = useMemo(() => [
    { icon: HourglassIcon, accentColor: "bg-[#F59E0B]", label: "Pending Bookings", value: Number(dashboardData?.monthPending) || 0 },
    { icon: CheckSquareIcon, accentColor: "bg-[#10B981]", label: "Confirmed Bookings", value: Number(dashboardData?.monthConfirmed) || 0 },
    { icon: CheckCheckIcon, accentColor: "bg-[#3B82F6]", label: "Completed Bookings", value: Number(dashboardData?.monthCompleted) || 0 },
    { icon: LucideSquareX, accentColor: "bg-[#EF4444]", label: "Cancelled Bookings", value: Number(dashboardData?.monthCancelled) || 0 },
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
        <div className='flex flex-col 2xl:flex-row gap-5'>
          <div className='flex-1'>
            <StatsGrid items={dashboardStats} maxCols={5} />
            <StatsGrid2 items={dashboardStatusStats} maxCols={4} />

            <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-5 gap-1 lg:gap-4 '>
              <div className='lg:col-span-3 bg-card p-5 rounded-2xl shadow-xl mb-5'>
                <div className='mb-12 flex items-center justify-between'>
                  <p className='text-primary font-semibold '>Booking Trends (Last 12 months)</p>
                </div>
                {bookingRevenueData && (
                  <BookingsRevenueChart data={bookingRevenueData} chartHeight="300" />
                )}
              </div>

              <div className='lg:col-span-2 bg-card p-5 rounded-2xl shadow-xl mb-5'>
                <div className='mb-5 flex items-center justify-between'>
                  <p className='text-primary font-semibold '>Revenue by Sport</p>
                </div>
                {revenueBySportData && (
                  <RevenueBySportDonutChart data={revenueBySportData} chartHeight="300" />
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
          <div className='flex flex-col gap-5 2xl:w-[320px]'>
            <div className="bg-primary p-5 rounded-2xl shadow-xl">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-card font-semibold">Quick Actions</p>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { icon: Grid2x2Plus, label: "Add Court", desc: "Register a new court" },
                  { icon: UserPlus, label: "Add User", desc: "Create a new account" },
                  { icon: CalendarPlus, label: "Add Booking", desc: "Schedule a reservation" },
                ].map(({ icon: Icon, label, desc }) => (
                  <button
                    key={label}
                    className="group flex items-center gap-3 rounded-xl border border-white/20 bg-white/5 p-3 text-left transition-all duration-150 hover:bg-secondary/10 hover:border-secondary/40 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 hover:cursor-pointer"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition-colors group-hover:bg-secondary/20">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-white">{label}</span>
                      <span className="text-[10px] text-white/60 truncate">{desc}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 ml-auto text-secondary/40 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
            <div className='bg-card p-5 rounded-2xl shadow-xl flex-1 flex flex-col min-h-0'>
              <div className='mb-5 flex items-center justify-between'>
                  <p className='text-primary font-semibold '>Recent Activities</p>
              </div>
              <div className='overflow-y-auto min-h-[175px] min-h-[100%]'>
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
          </div>
        </div>
      </>
  )
}
