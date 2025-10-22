import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api'; 

const PrivateRoute = () => {

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('access_token');

            if (!token) {
                console.log("PrivateRoute: Token no encontrado. Redirigiendo a /login.");
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/user/info/`, {
                    headers: {
                      
                        Authorization: `Bearer ${token}`, 
                    },
                });

                if (response.status === 200) {
            
                    setIsAuthenticated(true);
                    console.log("PrivateRoute: Token validado exitosamente. Acceso concedido.");
                } else {
                    setIsAuthenticated(false);
                }

            } catch (err) {
                console.error("PrivateRoute: Fallo en la validación del Token.", err.response || err);
                
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError("Token inválido o expirado. Vuelve a iniciar sesión.");
                } else if (err.code === 'ERR_NETWORK') {
                    setError("Error de red. ¿Está el servidor de Django (8000) activo?");
                } else {
                    setError("Error desconocido en la validación.");
                }

                localStorage.removeItem('access_token');
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        validateToken();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', marginTop: '100px' }}>
                <p style={{ fontSize: '1.2em' }}>Verificando sesión...</p>
            </div>
        );
    }

    if (error) {
        console.error("Redirigiendo por error:", error);
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
