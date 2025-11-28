import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // -----------------------
  // LOGIN (FIXED)
  // -----------------------
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    // Backend returns: token, user
    const token = res.data.token;   // ✅ FIXED
    const userPayload = res.data.user;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userPayload));

    setUser(userPayload);
    return userPayload;
  };

  // -----------------------
  // SIGNUP (FIXED)
  // -----------------------
  const signup = async (name, email, password, role) => {
    await api.post("/auth/register", {
      name,
      email,
      password,
      role,   // ✅ backend expects role, NOT company
    });
  };

  // -----------------------
  // LOGOUT
  // -----------------------
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
