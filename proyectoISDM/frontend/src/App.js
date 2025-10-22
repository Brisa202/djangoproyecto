import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importamos los componentes
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import EmpleadosListPage from './pages/admin/EmpleadosListPage.jsx';
import EmpleadoCreationForm from './pages/admin/CreateEmployeeForm.jsx';
import EditEmployeeForm from './pages/admin/EditEmployeeForm.jsx';
import ProductsListPage from "./pages/admin/productos/ProductsListPage.jsx";
import CreateProductForm from "./pages/admin/productos/CreateProductForm.jsx";
import EditProductForm from "./pages/admin/productos/EditProductForm.jsx";
import EmployeeDetailsPage from './pages/admin/EmployeeDetailsPage';
import ProductDetailsPage from "./pages/admin/productos/ProductDetailsPage";
import CreateIncidenteForm from './pages/incidentes/CreateIncidenteForm.jsx';
import EditIncidenteForm from './pages/incidentes/EditIncidenteForm.jsx'; // ✅ AGREGADO
import ListIncidentesPage from './pages/incidentes/ListIncidentesPage.jsx';
import IncidenteDetailsPage from './pages/incidentes/IncidenteDetailsPage.jsx';


function App() {
    return (
        <Router>
            <Routes>
                {/* Ruta de entrada (Pública) */}
                <Route path="/" element={<HomePage />} />
                
                {/* Ruta de Login (Pública) */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Rutas Protegidas: Usan PrivateRoute */}
                <Route element={<PrivateRoute />}>
                    {/* Ruta del Panel de Control principal */}
                    <Route path="/dashboard" element={<DashboardPage />} />
                    
                    {/* Rutas de empleados */}
                    <Route path="/dashboard/empleados" element={<EmpleadosListPage />} />
                    <Route path="/dashboard/empleados/crear" element={<EmpleadoCreationForm />} />
                    <Route path="/dashboard/empleados/editar/:id" element={<EditEmployeeForm />} />
                    <Route path="/dashboard/empleados/detalles/:id" element={<EmployeeDetailsPage />} />
                    
                    {/* Rutas de productos */}
                    <Route path="/dashboard/productos" element={<ProductsListPage />} />
                    <Route path="/dashboard/productos/crear" element={<CreateProductForm />} />
                    <Route path="/dashboard/productos/editar/:id" element={<EditProductForm />} />
                    <Route path="/dashboard/productos/detalles/:id" element={<ProductDetailsPage />} />
                    
                    {/* Rutas de incidentes - ✅ CORREGIDAS */}
                    <Route path="/dashboard/incidentes" element={<ListIncidentesPage />} />
                    <Route path="/dashboard/incidentes/crear" element={<CreateIncidenteForm />} />
                    <Route path="/dashboard/incidentes/editar/:id" element={<EditIncidenteForm />} />
                    <Route path="/dashboard/incidentes/detalles/:id" element={<IncidenteDetailsPage />} />
                </Route>

                {/* Ruta de 404 */}
                <Route path="*" element={<h1 style={{ marginTop: '100px' }}>404 - Página no encontrada</h1>} />
            </Routes>
        </Router>
    );
}

export default App;