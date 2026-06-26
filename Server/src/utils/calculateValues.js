const EXPIRY_MINUTES = 16;

export const calculateAgeFromBirthDate = (birthDate) => {
    const birthDay = new Date(birthDate);
    const todaysDate = new Date();

    let age = todaysDate.getFullYear() - birthDay.getFullYear();

    // Check if birthday has passed this year
    const hasBirthdayPassed = 
        todaysDate.getMonth() > birthDay.getMonth() ||
        (todaysDate.getMonth() === birthDay.getMonth() && todaysDate.getDate() >= birthDay.getDate());

    if (!hasBirthdayPassed) age--;

    return age;
}

export const getCurrentTimestamp = () => {
    return new Date().toLocaleString('en-CA', {
        timeZone: 'Asia/Manila',
        hour12: false
    }).replace(',', '');
};

export const getExpiryTimestamp = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + EXPIRY_MINUTES);
    return now.toLocaleString('en-CA', {
        timeZone: 'Asia/Manila',
        hour12: false
    }).replace(',', '');
};

export const getUpcomingDates = (schedule, weeksAhead = 4) => {
    const dates = [];

    // Parse dates as local (not UTC) to avoid timezone shift
    const parseLocalDate = (d) => {
        const str = typeof d === 'string' ? d : d.toISOString().split('T')[0];
        const [year, month, day] = str.split('-').map(Number);
        return new Date(year, month - 1, day); // local midnight
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0); // strip time

    const start = parseLocalDate(schedule.startDate);
    const endRaw = schedule.endDate ? parseLocalDate(schedule.endDate) : null;
    const end = endRaw && endRaw.getFullYear() > 1900 ? endRaw : null;

    const limit = new Date(today);
    limit.setDate(today.getDate() + weeksAhead * 7);

    // Start from whichever is later: today or startDate
    let cursor = new Date(start);

    while (cursor <= limit) {
        const dayMatch = schedule.frequency === 'weekly'
            ? cursor.getDay() === Number(schedule.dayOfWeek)
            : cursor.getDate() === Number(schedule.dayOfMonth);

        if (dayMatch && (!end || cursor <= end)) {
            // Format as YYYY-MM-DD using local date parts
            const y = cursor.getFullYear();
            const m = String(cursor.getMonth() + 1).padStart(2, '0');
            const d = String(cursor.getDate()).padStart(2, '0');
            dates.push(`${y}-${m}-${d}`);
        }

        cursor.setDate(cursor.getDate() + 1);
    }
    console.log(dates)
    return dates;
};

export const generateSlots = (startTime, endTime) => {
    const slots = [];
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH] = endTime.split(':').map(Number);

    for (let h = startH; h < endH; h++) {
        slots.push(`${String(h).padStart(2, '0')}:${String(startM).padStart(2, '0')}:00`);
    }

    return slots;
};