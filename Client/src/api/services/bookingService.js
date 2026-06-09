import api from "../axiosInstance.js";

export async function getAllBookings() {
    try {
        const response = await api.get("/api/v1/bookings/getall");
        return response;
    } catch (error) {
        throw error;
    }
};

export const fetchAvailableSlots = async (courtID, date) => {
    const formattedDate = date.toLocaleDateString('en-CA', {timeZone: 'Asia/Manila'});
    
    try {
        const response = await api.get(`/api/v1/bookings/get/availableslots/${courtID}/slots?date=${formattedDate}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const checkAvailability = async (courtID, date, selectedSlots) => {
    try {
        const formattedDate = new Date(date).toLocaleDateString('en-CA', {timeZone: 'Asia/Manila'});

        const response = await api.post(`/api/v1/bookings/check/availability`, {
            courtID,
            bookingDate: formattedDate,
            slotTimes: selectedSlots
        });

        return { available: true, takenSlots: [] };

    } catch (error) {
        // backend returns 409 conflict with takenSlots when slots are taken
        if (error.response?.status === 409) {
            const takenSlots = error.response.data.data?.takenSlots ?? [];
            return { available: false, takenSlots };
        }
        throw error; // rethrow other errors (500, network, etc.)
    }
};

export const confirmBooking = async (courtID, bookingDetails, bookingDate, slotTimes, paymentMethod) => {
    try {
        const response = await api.post(`/api/v1/bookings/confirmbooking`, {
            courtID,
            bookingDate,  
            bookerFullName: bookingDetails.contactPersonInfo.fullname, 
            bookerEmail: bookingDetails.contactPersonInfo.email, 
            bookerContactNumber: bookingDetails.contactPersonInfo.phoneNumber,      
            slotTimes,          
            paymentMethod,     
        });

        return response;
    } catch (error) {
        if (error.response?.status === 409) {
            const takenSlots = error.response.data.data?.takenSlots ?? [];
            return { available: false, takenSlots };
        }
        throw error;  
    }
}

export const getBookingsCalendarData = async(startDateTime, endDateTime) => {
    try {
        const response = await api.get("/api/v1/bookings/get/calendar-data?startDate=2026-05-01&endDate=2026-06-31");
        return response;
    } catch (error) {
        throw error;
    }
}

export const getPreviousBookings = async(userID) => {
    try {
        const response = await api.get(`/api/v1/bookings/get/previous/${userID}`);
        return response;
    } catch (error) {
        throw error;
    }
}

export const getUpcomingBookings = async(userID) => {
    try {
        const response = await api.get(`/api/v1/bookings/get/upcoming/${userID}`);
        return response;
    } catch (error) {
        throw error;
    }
}