import api from "../axiosInstance.js";

export const fetchRecentActivities = async () => {
    try {
        const response = await api.get(`/api/v1/logs/getall`);
        return response;
    } catch (error) {
        throw error;
    }
}