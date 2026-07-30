import { createContext, useContext, useEffect, useState } from "react";
import api from "../service/api";

const AuthContext = createContext();

const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (!payload.exp) return false;
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem("token");
        const stored = localStorage.getItem("user");
        if (!token || !stored || isTokenExpired(token)) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return null;
        }

        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    });

    const login = async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data.user;
    };

    // Registering only creates the account — it does not log the person in
    // (the backend register endpoint doesn't return a token), so callers
    // should navigate to /login afterwards, same as Register.jsx already does.
    const register = async ({ name, email, password, phone }) => {
        const res = await api.post("/auth/register", { name, email, password, phone });
        return res.data.user;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    useEffect(() => {
        window.addEventListener("auth:unauthorized", logout);
        return () => window.removeEventListener("auth:unauthorized", logout);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => useContext(AuthContext);

export { AuthContext };