import { useState, useEffect } from "react";
import { AuthContext } from "./authContext";
import { getValidToken } from "../../api/getValidToken";

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication on mount
  useEffect(() => {
    const token = getValidToken();
    setIsAuthenticated(!!token);
  }, []);

  // Listen for storage changes (login/logout from other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = getValidToken();
      setIsAuthenticated(!!token);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
