import api from "../axiosInstance.js";


export async function getAllStats() {
    try {
        const response = await api.get("/api/v1/dashboard/get/statistics");
        return response;
    } catch (error) {
        console.error("Get dashboard statistics failed:", error);

        throw error;
    }
}

export async function getUpcomingReservations() {
    try {
        const response = await api.get("/api/v1/dashboard/get/upcoming/reservations");
        return response;
    } catch (error) {
        console.error("Get dashboard statistics failed:", error);

        throw error;
    }
}
