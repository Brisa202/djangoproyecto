import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api';
import '../styles/DashboardPage.css';
import logoImage from '../assets/logo.jpg'; 

const DashboardPage = () => {
    const [userRoles, setUserRoles] = useState([]);
    const [summaryData, setSummaryData] = useState({
        ingresos_mes: '$0.00',
        alquileres_activos: 0,
        pedidos_pendientes: 0,
        incidentes_abiertos: 0,
    });
    const [message, setMessage] = useState('Cargando datos protegidos...');
    const [username, setUsername] = useState('Administrador');
    const navigate = useNavigate();
    const location = useLocation();

    // 🔒 Cerrar sesión (con useCallback)
    const handleLogout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username_login'); 
        navigate('/login');
    }, [navigate]);

    // 🚀 Cargar datos del usuario y dashboard
    useEffect(() => {
        const fetchProtectedData = async () => {
            try {
                // 1️⃣ Obtener información del usuario
                const userInfoResponse = await api.get('user/info/');
                const userDisplayName = userInfoResponse.data.username;
                const roles = userInfoResponse.data.roles || [];

                setUsername(userDisplayName);
                setUserRoles(roles);
                localStorage.setItem('username_login', userDisplayName);

                const displayName = userDisplayName.includes('@')
                    ? userDisplayName.split('@')[0]
                    : userDisplayName;

                setMessage(`¡Bienvenid@ ${displayName}! Has accedido a una ruta segura con éxito.`);

                // 2️⃣ Obtener datos del dashboard
                const summaryResponse = await api.get('dashboard/summary/');

                const formattedIngresos = new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                }).format(summaryResponse.data.ingresos_mes || 0);

                setSummaryData({
                    ingresos_mes: formattedIngresos,
                    alquileres_activos: summaryResponse.data.alquileres_activos,
                    pedidos_pendientes: summaryResponse.data.pedidos_pendientes,
                    incidentes_abiertos: summaryResponse.data.incidentes_abiertos,
                });

            } catch (error) {
                console.error('Error al cargar datos:', error);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    handleLogout(); 
                }
            }
        };

        fetchProtectedData();
    }, [handleLogout]);

    // 🧩 Roles (basado en los grupos del backend)
    const isAdmin = userRoles?.includes('Admin') || userRoles?.includes('Administrador');
    const isEmployee = userRoles?.includes('Empleado');
    
    // 🔗 Menú de entidades
    let entityItems = [
        { name: "Alquileres", path: "/rentals" },
        { name: "Entregas", path: "/deliveries" },
        { name: "Pedidos", path: "/orders" },
        { name: "Clientes", path: "/clients" },
        { name: "Caja", path: "/cashregister"},
        { name: "Facturas", path: "/invoices" },
        { name: "Pagos", path: "/payments" },
    ];

    // ✅ Función para determinar si un link está activo
    const isActive = (path) => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="dashboard-layout">
            {/* -------------------- SIDEBAR -------------------- */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <img src={logoImage} alt="HP Logo" className="sidebar-logo"/>
                </div>

                {/* ADMIN */}
                {isAdmin && (
                    <>
                        <nav className="sidebar-menu">
                            <Link 
                                to="/dashboard" 
                                className={`menu-item ${isActive('/dashboard') ? 'current' : ''}`}
                            >
                                📦 Panel de Control
                            </Link>
                            <Link 
                                to="/dashboard/empleados" 
                                className={`menu-item ${isActive('/dashboard/empleados') ? 'current' : ''}`}
                            >
                                👨‍💼 Empleados
                            </Link>
                            <Link 
                                to="/roles" 
                                className={`menu-item ${isActive('/roles') ? 'current' : ''}`}
                            >
                                🔑 Roles
                            </Link>
                            <Link 
                                to="/dashboard/productos" 
                                className={`menu-item ${isActive('/dashboard/productos') ? 'current' : ''}`}
                            >
                                🏷️ Productos
                            </Link>
                            <Link 
                                to="/dashboard/incidentes" 
                                className={`menu-item ${isActive('/dashboard/incidentes') ? 'current' : ''}`}
                            >
                                ⚠️ Incidentes
                            </Link>
                        </nav>
                        <div className="sidebar-section">
                            <p className="section-title">Menú de gestión</p>
                            {entityItems.map((item) => (
                                <Link 
                                    key={item.name} 
                                    to={item.path} 
                                    className={`menu-item entity-item ${isActive(item.path) ? 'current' : ''}`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </>
                )}

                {/* EMPLEADO */}
                {isEmployee && (
                    <>
                        <nav className="sidebar-menu">
                            <Link 
                                to="/dashboard" 
                                className={`menu-item ${isActive('/dashboard') ? 'current' : ''}`}
                            >
                                📦 Panel de Control
                            </Link>
                            <Link 
                                to="/dashboard/productos" 
                                className={`menu-item ${isActive('/dashboard/productos') ? 'current' : ''}`}
                            >
                                🏷️ Productos
                            </Link>
                            <Link 
                                to="/dashboard/incidentes" 
                                className={`menu-item ${isActive('/dashboard/incidentes') ? 'current' : ''}`}
                            >
                                ⚠️ Incidentes
                            </Link>
                        </nav>
                        <div className="sidebar-section">
                            <p className="section-title">Menú de gestión</p>
                            <Link 
                                to="/rentals" 
                                className={`menu-item entity-item ${isActive('/rentals') ? 'current' : ''}`}
                            >
                                Alquileres
                            </Link>
                            <Link 
                                to="/orders" 
                                className={`menu-item entity-item ${isActive('/orders') ? 'current' : ''}`}
                            >
                                Pedidos
                            </Link>
                            <Link 
                                to="/invoices" 
                                className={`menu-item entity-item ${isActive('/invoices') ? 'current' : ''}`}
                            >
                                Facturas
                            </Link>
                            <Link 
                                to="/payments" 
                                className={`menu-item entity-item ${isActive('/payments') ? 'current' : ''}`}
                            >
                                Pagos
                            </Link>
                        </div>
                    </>
                )}
                
                <button onClick={handleLogout} className="logout-button-sidebar">
                    ← Cerrar Sesión
                </button>
            </div>
            
            {/* -------------------- CONTENIDO PRINCIPAL -------------------- */}
            <main className="main-content">
                <header className="dashboard-header">
                    <div className="user-profile">
                        <p className="admin-email">
                            {username} ({isAdmin ? 'Administrador' : 'Empleado'})
                        </p> 
                        <span className="admin-icon">👤</span>
                    </div>
                </header>
                
                <h2 className="main-dashboard-title">Panel de control</h2>
                <p className="subtitle">Resumen ejecutivo del estado de su negocio</p>
                
                {/* ADMIN */}
                {isAdmin && (
                    <div className="dashboard-summary">
                        <div className="summary-box ingresos">
                            <span className="icon">$</span>
                            <p>Ingresos del Mes</p>
                            <p className="value">{summaryData.ingresos_mes}</p> 
                        </div>
                        <div className="summary-box alquileres">
                            <span className="icon">🗓️</span>
                            <p>Alquileres Activos</p>
                            <p className="value">{summaryData.alquileres_activos}</p> 
                        </div>
                        <div className="summary-box pedidos">
                            <span className="icon">📝</span>
                            <p>Pedidos Pendientes</p>
                            <p className="value">{summaryData.pedidos_pendientes}</p> 
                        </div>
                        <div className="summary-box incidentes">
                            <span className="icon">⚠️</span>
                            <p>Incidentes Abiertos</p>
                            <p className="value">{summaryData.incidentes_abiertos}</p> 
                        </div>
                    </div>
                )}
                
                {/* EMPLEADO */}
                {isEmployee && (
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mt-4 rounded-lg" role="alert">
                        <p className="font-bold">Vista de Empleado</p>
                        <p>Tu vista está optimizada para la gestión de productos, incidentes, alquileres, pedidos, facturas y pagos. Las métricas financieras y de administración no son visibles.</p>
                    </div>
                )}

                <h2 className="activity-title">Resumen de Actividad Reciente</h2>
                <div className="activity-log">
                    <div className="welcome-message-box">
                        <p>{message}</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;