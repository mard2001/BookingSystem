import api from "../axiosInstance.js";


export async function checkPaymentStatus(intentId) {
    try {
        const response = await api.get(`/api/v1/payments/status/${intentId}`);
        return response;  
    } catch (error) {
        throw error;
    }
}

export const initiatePayment = async (bookingID, amount, customerName, customerEmail) => {
    try {
        const response = await api.post(`/api/v1/payments/initiate`, {
            bookingID, amount, customerName, customerEmail,
        });
        return response; 
    } catch (error) {
        throw error;
    }
}

export const getBookingPaymentStatus = async (bookingID) => {
    try{
        const res = await api.get(`/api/v1/payments/booking-status/${bookingID}`);
        return res;
    } catch (error) {
        throw error;
    }
};