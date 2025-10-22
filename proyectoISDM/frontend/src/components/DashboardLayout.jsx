import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoImage from "../assets/logo.jpg";

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username_login');
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <img src={logoImage} alt="HP Logo" className="sidebar-logo" />
        </div>
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
          <p className="section-title">Gestión de Entidades</p>
          <Link 
            to="/dashboard/alquileres"
            className={`menu-item entity-item ${isActive('/dashboard/alquileres') ? 'current' : ''}`}
          >
            Alquileres
          </Link>
          <Link 
            to="/dashboard/pedidos"
            className={`menu-item entity-item ${isActive('/dashboard/pedidos') ? 'current' : ''}`}
          >
            Pedidos
          </Link>
          <Link 
            to="/dashboard/facturas"
            className={`menu-item entity-item ${isActive('/dashboard/facturas') ? 'current' : ''}`}
          >
            Facturas
          </Link>
          <Link 
            to="/dashboard/pagos"
            className={`menu-item entity-item ${isActive('/dashboard/pagos') ? 'current' : ''}`}
          >
            Pagos
          </Link>
        </div>

        <button onClick={handleLogout} className="logout-button-sidebar">
          ← Cerrar Sesión
        </button>
      </div>

      <main className="main-content">{children}</main>
    </div>
  );
};

export default DashboardLayout;
