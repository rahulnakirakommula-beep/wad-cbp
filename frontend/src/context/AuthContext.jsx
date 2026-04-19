import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

// Create an axios instance for authenticated requests
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Interceptor to attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('coa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem('coa_token');
    const savedUser = localStorage.getItem('coa_user');
    
    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${api.defaults.baseURL}/auth/login`, { email, password });
      
      localStorage.setItem('coa_token', data.token);
      localStorage.setItem('coa_user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        onboardingComplete: data.onboardingComplete
      }));
      
      setUser(data);
      
      if (data.role === 'admin') {
        navigate('/admin');
      } else if (!data.onboardingComplete) {
        navigate('/onboarding');
      } else {
        navigate('/app/feed');
      }
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const { data } = await axios.post(`${api.defaults.baseURL}/auth/signup`, { name, email, password });
      
      localStorage.setItem('coa_token', data.token);
      localStorage.setItem('coa_user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        onboardingComplete: data.onboardingComplete
      }));
      
      setUser(data);
      navigate('/onboarding');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('coa_token');
    localStorage.removeItem('coa_user');
    setUser(null);
    navigate('/login');
  };

  // Profile update helper
  const updateOnboarding = (updatedUser) => {
    localStorage.setItem('coa_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateOnboarding, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
