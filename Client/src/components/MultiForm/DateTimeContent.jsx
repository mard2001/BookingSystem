import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Info, InfoIcon } from "lucide-react"
import { useAppointmentFormContext } from "../../context/AppointmentFormContext"
import { fetchAvailableSlots } from "../../api/services/bookingService"
import { formatSlotTime } from "../../utils/ValueFormat"

const DAYS = ["S", "M", "T", "W", "T", "F", "S"]

const TIME_SLOTS = [
  { time: "08:00 AM", available: true },
  { time: "09:00 AM", available: true },
  { time: "10:00 AM", available: true },
  { time: "11:00 AM", available: false },
  { time: "12:00 PM", available: true },
  { time: "01:00 PM", available: true },
  { time: "02:00 PM", available: true },
  { time: "03:00 PM", available: false },
  { time: "04:00 PM", available: true },
]

export const DateTimeContent = () => {
    const { formData, errors, updateDateTimeSelected } = useAppointmentFormContext();
    const selectedDate = formData.dateTimeInfo.date;
    const selectedTimes = formData.dateTimeInfo.time;
    const courtID = formData.courtInfo.court.courtID;

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [timeSlots, setTimeSlots] = useState([])      
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [slotsError, setSlotsError] = useState(null)

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const monthLabel = currentMonth.toLocaleString("default", { month: "long", year: "numeric" })
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrev = new Date(year, month, 0).getDate()

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

    const today = new Date()
    const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
    const isSelected = (d) =>
        selectedDate &&
        d === selectedDate.getDate() &&
        month === selectedDate.getMonth() &&
        year === selectedDate.getFullYear()
    const isPast = (d) => new Date(year, month, d) < new Date(today.setHours(0, 0, 0, 0))


    const handleSelectDate = (date) => {
        updateDateTimeSelected(date, [])
    }

    const handleSelectTime = (time) => {
        const updated = selectedTimes.includes(time)
            ? selectedTimes.filter(t => t !== time)
            : [...selectedTimes, time]
        updateDateTimeSelected(selectedDate, updated)
    }

    // Fetch slots whenever selected date or court changes
    useEffect(() => {
        if (!selectedDate || !courtID) return;

        const loadSlots = async () => {
            setLoadingSlots(true);
            setSlotsError(null);
            setTimeSlots([]);
            try {
                const res = await fetchAvailableSlots(courtID, selectedDate);
                const formatted = res.data.map(slot => ({
                    time: formatSlotTime(slot.slotTime),  
                    value: slot.slotTime,                 
                    available: slot.isAvailable === 1
                }));
                setTimeSlots(formatted);
            } catch (err) {
                setSlotsError('Failed to load available slots.');
            } finally {
                setLoadingSlots(false);
            }
        };

        loadSlots();
    }, [selectedDate, courtID]);

    // Build calendar grid
    const cells = []
    for (let i = 0; i < firstDay; i++) {
        cells.push({ day: daysInPrev - firstDay + 1 + i, type: "prev" })
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, type: "current" })
    }
    const remaining = 42 - cells.length
    for (let i = 1; i <= remaining; i++) {
        cells.push({ day: i, type: "next" })
    }

    return (
        <div className="space-y-5">
            {/* Calendar */}
            <div className="border border-slate-200 rounded-2xl p-5 shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-base">Select Date</p>
                <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft size={16} className="text-slate-500" />
                    </button>
                    <span className="text-primary font-semibold text-sm">{monthLabel}</span>
                    <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronRight size={16} className="text-slate-500" />
                    </button>
                </div>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                {DAYS.map((d, i) => (
                    <div key={i} className="text-center text-xs font-semibold text-slate-400 py-1">
                    {d}
                    </div>
                ))}
                </div>

                {/* Date grid */}
                <div className="grid grid-cols-7 gap-y-1">
                {cells.map((cell, i) => {
                    const isCurrent = cell.type === "current"
                    const past = isCurrent && isPast(cell.day)
                    const sel = isCurrent && isSelected(cell.day)
                    const tod = isCurrent && isToday(cell.day)

                    return (
                    <button
                        key={i}
                        disabled={!isCurrent || past}
                        onClick={() => isCurrent && !past && handleSelectDate(new Date(year, month, cell.day))}
                        className={`
                        w-9 h-9 mx-auto flex items-center justify-center text-sm rounded-xl font-medium transition-all duration-200
                        ${!isCurrent ? "text-slate-300 cursor-default" : ""}
                        ${isCurrent && !past && !sel ? "text-slate-700 hover:bg-slate-100 cursor-pointer" : ""}
                        ${past ? "text-slate-300 cursor-not-allowed" : ""}
                        ${sel ? "bg-primary text-white font-bold rounded-2xl scale-105 shadow-md" : ""}
                        ${tod && !sel ? "text-primary font-bold" : ""}
                        `}
                    >
                        {cell.day}
                    </button>
                    )
                })}
                </div>
            </div>

            {/* ✅ Dynamic Time Slots */}
            <div className="border border-slate-200 rounded-2xl p-5 shadow-sm">
                <p className="font-bold text-base mb-4">Available Slots</p>

                {/* No date selected yet */}
                {!selectedDate && (
                    <p className="text-sm text-slate-400 text-center py-4">Please select a date first.</p>
                )}

                {/* Loading */}
                {loadingSlots && (
                    <p className="text-sm text-slate-400 text-center py-4">Loading available slots...</p>
                )}

                {/* Error */}
                {slotsError && (
                    <p className="text-sm text-red-400 text-center py-4">{slotsError}</p>
                )}

                {/* Slots grid */}
                {!loadingSlots && !slotsError && timeSlots.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {timeSlots.map((slot) => {
                            const isTimeSel = selectedTimes.includes(slot.value)
                            return (
                                <button
                                    key={slot.value}
                                    disabled={!slot.available}
                                    onClick={() => slot.available && handleSelectTime(slot.value)}
                                    className={`
                                        py-2 px-3 rounded-xl text-sm font-semibold border transition-all duration-200
                                        ${!slot.available
                                            ? "border-slate-200 text-slate-300 line-through cursor-not-allowed"
                                            : isTimeSel
                                                ? "bg-primary border-primary text-white shadow-md"
                                                : "border-primary text-primary hover:bg-primary/10 cursor-pointer"
                                        }
                                    `}
                                >
                                    {slot.time}
                                </button>
                            )
                        })}
                    </div>
                )}

                <p className="mt-4 text-xs text-slate-400 flex items-center gap-1">
                    <Info size={12} />
                    Standard booking duration is 60 minutes.
                </p>
            </div>

            {(errors.courtID || errors.date || errors.time) && (
                <div className='mt-4 p-3 bg-[#FF0000]/5 border border-[#FF0000]/10 rounded-lg text-sm text-[#FF0000]/60 font-medium flex flex-col gap-1'>
                    {[errors.courtID, errors.date, errors.time].filter(Boolean).map((error, i) => (
                        <div key={i} className="flex items-center">
                            <InfoIcon className="w-4 mr-2 shrink-0" /> {error}
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}