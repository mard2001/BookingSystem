import { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUser } from '../utils/LocalVariables';
import { logout } from '../api/services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [loggedInUser, setLoggedInUser] = useState(null);

    useEffect(() => {
        const user = getStoredUser();
        if (user) setLoggedInUser(user);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            localStorage.removeItem('user');
            setLoggedInUser(null); 
        }
    };

    return (
        <AuthContext.Provider value={{ loggedInUser, setLoggedInUser, handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);