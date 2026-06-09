import { toast } from "sonner";
import api from "../axiosInstance.js";


export async function getAllUsers() {
    try {
        const response = await api.get("/api/v1/users/getall");
        return response.data;
    } catch (error) {
        console.error("Get users failed:", error);

        throw error;
    }
}

export async function getAllActiveUsers() {
    try {
        const response = await api.get("/api/v1/users/getall/active");
        return response.data;
    } catch (error) {
        console.error("Get active users failed:", error);

        throw error;
    }
}

export async function getAllCustomers() {
    try {
        const response = await api.get("/api/v1/users/getall/customers");
        return response.data;
    } catch (error) {
        console.error("Get customers failed:", error);

        throw error;
    }
}

export async function getAllActiveCustomers() {
    try {
        const response = await api.get("/api/v1/users/getall/customers/active");
        return response.data;
    } catch (error) {
        console.error("Get active customers failed:", error);

        throw error;
    }
}

export async function getAllAdmin() {
    try {
        const response = await api.get("/api/v1/users/getall/admins");
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function getAllActiveAdmin() {
    try {
        const response = await api.get("/api/v1/users/getall/admins/active");
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function registerUserAdmin(user) {
    try {
        const response = await api.post("/api/v1/users/register/admin", user);
        return response;
    } catch (err) {
        throw err;
    }
}

export async function registerUserCustomer(user) {
    try {
        const response = await api.post("/api/v1/users/register/customer", user);
        return response;
    } catch (err) {
        throw err;
    }
}

export async function updateCustomer(userID, user) {
    try {
        const response = await api.put(`/api/v1/users/update/${userID}`, user);
        return response;
    } catch (error) {
        console.error("Update user details failed:", error);
        throw error;
    }
}

export async function deleteUser(userID) {
    try {
        const response = await api.put(`/api/v1/users/delete/${userID}`);
        return response;
    } catch (error) {
        console.error("Deactivate user failed:", error);
        throw error;
    }
}