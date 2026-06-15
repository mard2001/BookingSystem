import { decrypt } from "./Crypto";

export const getStoredUser = () => {
    try {
        const stored = decrypt(localStorage.getItem("user"));
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};