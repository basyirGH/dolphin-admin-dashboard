import React, { createContext, useContext, useState } from "react";

//context is a way to manage state globally. this is better than passing props through nested components
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const login = (userToken) => {
        setToken(userToken);
    };
    const logout = () => {
        setToken(null);
    };
    const isAuthenticated = !!token;
    return (
        <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};