import api from "../axiosInstance.js";

export async function login(credentials) {
    try {
        return await api.post("/api/v1/users/login", credentials);
    } catch (error) {
        throw error; 
    }
}

export async function logout() {
    try {
        await api.post("/api/v1/users/logout", {}, { withCredentials: true });
    } catch (error) {
        console.error("Logout failed:", error);
    }
}

export async function getLoggedUserAccountDetails(userID) {
    try {
        return await api.get(`/api/v1/users/get/details/${userID}`);
    } catch (error) {
        throw error; 
    }
}