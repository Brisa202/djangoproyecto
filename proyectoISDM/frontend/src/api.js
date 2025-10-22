// frontend/src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',  // URL de la API de Django
});

// Interceptor para añadir el token de autenticación a cada solicitud
api.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem('access_token');  // Obtener el token de localStorage
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;  // Incluir el token en las cabeceras
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
