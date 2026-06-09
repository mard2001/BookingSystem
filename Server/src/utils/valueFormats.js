
export const getDayType = (date) => {
    const day = new Date(date).getDay();
    return (day === 0 || day === 6) ? 'weekend' : 'weekday';
};

export const getTimeType = (slotTime) => {
    const hour = parseInt(slotTime.split(':')[0]);
    return hour < 12 ? 'AM' : 'PM';
};

export const getRateKey = (dayType, timeType) => {
    if (dayType === 'weekday' && timeType === 'AM') return 'rate1';
    if (dayType === 'weekday' && timeType === 'PM') return 'rate2';
    if (dayType === 'weekend' && timeType === 'AM') return 'rate3';
    if (dayType === 'weekend' && timeType === 'PM') return 'rate4';
};