import api from "../axiosInstance.js";


export async function getCourts() {
    try {
        const response = await api.get("/api/v1/courts/getall");
        return response.data;
    } catch (error) {
        console.error("Get courts failed:", error);

        throw error;
    }
}

export async function getAvailableCourts() {
    try {
        const response = await api.get("/api/v1/courts/getall/available");
        return response;
    } catch (error) {
        console.error("Get courts failed:", error);

        throw error;
    }
}

export async function getCountTotalCourts() {
    try {
        const response = await api.get("/api/v1/courts/getcount/all");
        console.log
        return response.data[0].totalCount;
    } catch (error) {
        console.error("Get courts failed:", error);

        throw error;
    }
}

export async function getCountAvailableCourts() {
    try {
        const response = await api.get("/api/v1/courts/getcount/available");
        console.log
        return response.data[0].totalCount;
    } catch (error) {
        console.error("Get courts failed:", error);

        throw error;
    }
}

export async function getCountUnavailableCourts() {
    try {
        const response = await api.get("/api/v1/courts/getcount/unavailable");
        console.log
        return response.data[0].totalCount;
    } catch (error) {
        console.error("Get courts failed:", error);

        throw error;
    }
}

export async function getCountMaintenanceCourts() {
    try {
        const response = await api.get("/api/v1/courts/getcount/undermaintenance");
        console.log
        return response.data[0].totalCount;
    } catch (error) {
        console.error("Get courts failed:", error);

        throw error;
    }
}

export async function addCourt(court) {
    try {
        const response = await api.post("/api/v1/courts/add/new", court);
        return response.data;
    } catch (error) {
        console.error("Add court failed:", error);
        throw error;
    }
}

export async function updateCourt(courtID, court) {
    try {
        const response = await api.put(`/api/v1/courts/update/${courtID}`, court);
        return response;
    } catch (error) {
        console.error("Update court failed:", error);
        throw error;
    }
}

export async function deleteCourt(courtID) {
    try {
        const response = await api.put(`/api/v1/courts/delete/${courtID}`);
        return response;
    } catch (error) {
        console.error("Deactivate court failed:", error);
        throw error;
    }
}