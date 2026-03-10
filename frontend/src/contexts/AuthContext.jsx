import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem('token');
            if (savedToken) {
                setToken(savedToken);
                try {
                    const userData = JSON.parse(localStorage.getItem('user'));
                    if (userData) setUser(userData);
                } catch (error) {
                    console.error('Failed to parse user data', error);
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (idToken, name, email) => {
        try {
            const data = await authService.login(idToken);
            const userObj = { id: data.user_id, name, email };
            setToken(data.access_token);
            setUser(userObj);
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(userObj));
            return data;
        } catch (error) {
            throw error;
        }
    };

    const signup = async (idToken, name, email) => {
        try {
            const data = await authService.signup(idToken, name, email);
            const userObj = { id: data.user_id, name, email };
            setToken(data.access_token);
            setUser(userObj);
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(userObj));
            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
