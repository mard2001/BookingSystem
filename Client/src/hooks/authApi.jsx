import { useState } from "react";
import { login } from "../api/services/authService";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { encrypt } from "../utils/Crypto";

export const useLogin = () => {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);
    const { setLoggedInUser } = useAuth();

    const mutate = async (credentials, { onSuccess } = {}) => {
        setIsPending(true);
        try {
            const data = await login(credentials);

            const raw = Array.isArray(data.data) ? data.data[0] : data.data;

            const user = {
                id: data.data[0].id,
                userID: data.data[0].userID,
                username: data.data[0].username,
                email: data.data[0].email,
                firstName: data.data[0].firstName,
                middleName: data.data[0].middleName,
                lastName: data.data[0].lastName,
                suffix: data.data[0].suffix,
                contactNumber: data.data[0].contactNumber,
                userType: data.data[0].userType
            };

            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("role", encrypt(user.userType));
            setLoggedInUser(user); 
            toast.success(data.message);
            onSuccess?.(data);
        } catch (err) {
            setError(err.message || "Login failed");
            toast.error(err.message);
        } finally {
            setIsPending(false);
        }
    };

    return { mutate, isPending, error };
};