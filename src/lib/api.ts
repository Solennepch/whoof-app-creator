import axios from "axios";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ozdaxhiqnfapfevdropz.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZGF4aGlxbmZhcGZldmRyb3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0ODc2NjcsImV4cCI6MjA3NzA2MzY2N30.2NFz6vswkGWSJYIsI4pqc6Y1QgpgTjxtyDT2aPcRqTs";

// Utilise l'URL personnalisée si définie, sinon les edge functions Supabase
const baseURL = import.meta.env.VITE_API_URL || `${supabaseUrl}/functions/v1`;

export const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur: ajoute automatiquement le JWT et l'apikey
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Ajoute l'apikey Supabase (requis pour les edge functions)
  if (supabaseAnonKey) {
    config.headers.apikey = supabaseAnonKey;
  }
  
  return config;
});

// Gestion des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
