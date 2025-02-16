import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

//context is a way to manage state globally. this is better than passing props through nested components
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [token, setToken] = useState();
    const login = (userToken) => {
        setToken(userToken);
        /*
        Use the HttpOnly flag to prevent client-side scripts from accessing the cookie.
        Use the Secure flag to ensure the cookie is only sent over HTTPS.
        Use the SameSite attribute to prevent cross-site request forgery (CSRF) attacks.
        */
        //localStorage.setItem("jwt", token)
    };
    // const logout = () => {
    //     Cookies.remove("jwt");
    //     setToken(null);
    //     navigate("/login");
    // };
    // used to explicitly convert a value to a boolean.
    // NOT(NOT(EMPTY STRING)) = FALSY. NOT(NOT(STRING)) = TRUTHY
    const isAuthenticated = !!token;
    return (
        <AuthContext.Provider value={{ token, isAuthenticated, login }}>
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