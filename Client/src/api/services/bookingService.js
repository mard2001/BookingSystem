import api from "../axiosInstance.js";

export async function getAllBookings() {
    try {
        const response = await api.get("/api/v1/bookings/getall");
        return response;
    } catch (error) {
        throw error;
    }
};

export const fetchOfferedSlots = async (courtID, date) => {
    try {
        const response = await api.get(`/api/v1/bookings/get/slots/${courtID}`);
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
        const formattedDate = new Date(date).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

        const response = await api.post(`/api/v1/bookings/check/availability`, {
            courtID,
            bookingDate: formattedDate,
            slotTimes: selectedSlots
        });

        return { 
            available: true, 
            takenSlots: [], 
            message: response.message 
        };

    } catch (error) {
        if (error.response?.status === 409) {
            const { takenSlots, message } = error.response.data;
            return { 
                available: false, 
                takenSlots: takenSlots ?? [], 
                message: message ?? 'Some slots are unavailable.' 
            };
        }
        throw error;
    }
};

export const confirmBooking = async (courtID, bookingDetails, bookingDate, slotTimes, paymentMethod, userID) => {
    try {
        const response = await api.post(`/api/v1/bookings/confirmbooking`, {
            courtID,
            bookingDate,  
            bookerFullName: bookingDetails.contactPersonInfo.fullname, 
            bookerEmail: bookingDetails.contactPersonInfo.email, 
            bookerContactNumber: bookingDetails.contactPersonInfo.phoneNumber,      
            slotTimes,          
            paymentMethod, 
            userID    
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

export const getBookingsCalendarData = async(startDate, endDate) => {
    try {
        const response = await api.get(`/api/v1/bookings/get/calendar-data?startDate=${startDate}&endDate=${endDate}`);
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

export const updateBookingStatus = async(status, bookingID) => {
    try {
        const response = await api.put(`/api/v1/bookings/update/${bookingID}/status`,{
            status
        });
        return response;
    } catch (error) {
        throw error;
    }
}

export const updateBookingDetails = async(bookingDetails, bookingID) => {
    try {
        const response = await api.put(`/api/v1/bookings/update/${bookingID}/booker-details`,{
            bookerFullName : bookingDetails.bookerFullName,
            bookerEmail : bookingDetails.bookerEmail,
            bookerContactNumber : bookingDetails.bookerContactNumber,
            status : bookingDetails.bookingStatus,
        });
        return response;
    } catch (error) {
        throw error;
    }

}

export const cancelBookingInitiation = async(bookingID, paymentIntentID) => {
    try {
        const response = await api.put(`/api/v1/bookings/cancel/${bookingID}/${paymentIntentID}`);
        return response;
    } catch (error) {
        throw error;
    }
}

export const cancelBookingInitiationViaEwallet = async(bookingID) => {
    try {
        const response = await api.put(`/api/v1/bookings/cancel-ewallet-booking/${bookingID}`);
        return response;
    } catch (error) {
        throw error;
    }
}

export const confirmBookingViaEwallet = async(bookingID) => {
    try {
        const response = await api.put(`/api/v1/bookings/confirmbooking-viaewallet/${bookingID}`);
        return response;
    } catch (error) {
        throw error;
    }
}


export const getRegularBookings = async () => {
    try {
        const response = await api.get("/api/v1/bookings/getall/recurring-schedule");
        return response;
    } catch (error) {
        throw error;
    }
};

export const createRegularBooking = async (bookingDetail) => {
    console.log(bookingDetail)
    try {
        const response = await api.post("/api/v1/bookings/regularbooking",{
            ...bookingDetail
        });
        return response;
    } catch (error) {
        throw error;
    }
}

export const getRegularSchedFutureBookings = async (scheduleID) => {
    try {
        const response = await api.get(`/api/v1/bookings/get/regular-booking-data/${scheduleID}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getCancelWholeRegularSched = async (scheduleID) => {
    try {
        const response = await api.put(`/api/v1/bookings/cancel-regular-schedule/${scheduleID}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const editRegularBooking = async (editData) => {
    try {
        const response = await api.put(`/api/v1/bookings/update-regular-schedule`, {...editData});
        return response;
    } catch (error) {
        throw error;
    }
}
