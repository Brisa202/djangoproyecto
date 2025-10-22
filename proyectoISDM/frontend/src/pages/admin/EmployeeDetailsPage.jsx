import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import DashboardLayout from "../../components/DashboardLayout";
import { ArrowLeft, Power } from "lucide-react";
import "../../styles/employeeDetails.css";
import Swal from "sweetalert2";

const EmployeeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmpleadoDetails();
  }, [id]);

  const fetchEmpleadoDetails = async () => {
    try {
      const response = await api.get(`empleados-detail/${id}/`);
      console.log("👤 Detalles del empleado:", response.data);
      
      setEmpleado(response.data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error al cargar empleado:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar el empleado",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
      setLoading(false);
    }
  };

  const handleInactivate = async () => {
    const result = await Swal.fire({
      title: "¿Inactivar empleado?",
      text: "El empleado no podrá acceder al sistema",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#fddb3a",
      cancelButtonColor: "#d33",
      background: "#141414",
      color: "#fff",
      confirmButtonText: "Sí, inactivar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const response = await api.patch(`empleados-detail/${id}/inactivar/`);
        console.log("✅ Empleado inactivado:", response.data);

        Swal.fire({
          icon: "success",
          title: "Inactivado",
          text: "El empleado ha sido inactivado",
          confirmButtonColor: "#fddb3a",
          background: "#141414",
          color: "#fff",
        });

        setTimeout(() => navigate("/dashboard/empleados"), 1500);
      } catch (error) {
        console.error("❌ Error al inactivar:", error.response?.data);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.error || "No se pudo inactivar",
          confirmButtonColor: "#fddb3a",
          background: "#141414",
          color: "#fff",
        });
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="details-container">
          <p>Cargando detalles...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!empleado) {
    return (
      <DashboardLayout>
        <div className="details-container">
          <p>No se encontró el empleado</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="details-container">
        <div className="details-header">
          <button 
            className="btn-back"
            onClick={() => navigate("/dashboard/empleados")}
          >
            <ArrowLeft size={20} /> Volver
          </button>
          <h2>Detalles del Empleado</h2>
          <div className="header-actions">
            <button
              className="btn-inactivate"
              onClick={handleInactivate}
              title="Inactivar empleado"
            >
              <Power size={18} /> Inactivar
            </button>
          </div>
        </div>

        <div className="details-card">
          {/* Información de Acceso (solo lectura) */}
          <div className="section">
            <h3>Información de Acceso</h3>
            <div className="read-only-fields">
              <div className="field">
                <label>Usuario:</label>
                <input type="text" value={empleado.username} readOnly />
              </div>
              <div className="field">
                <label>Email:</label>
                <input type="email" value={empleado.email} readOnly />
              </div>
              <div className="field">
                <label>Roles:</label>
                <input 
                  type="text" 
                  value={empleado.roles?.join(", ") || "Sin rol"} 
                  readOnly 
                />
              </div>
            </div>
          </div>

          {/* Información Personal (solo lectura) */}
          <div className="section">
            <h3>Información Personal</h3>
            <div className="read-only-fields">
              <div className="field">
                <label>Nombre:</label>
                <input type="text" value={empleado.nombre || "N/A"} readOnly />
              </div>

              <div className="field">
                <label>Apellido:</label>
                <input type="text" value={empleado.apellido || "N/A"} readOnly />
              </div>

              <div className="field">
                <label>DNI:</label>
                <input type="text" value={empleado.dni || "N/A"} readOnly />
              </div>

              <div className="field">
                <label>Teléfono:</label>
                <input type="text" value={empleado.telefono || "N/A"} readOnly />
              </div>

              <div className="field">
                <label>Fecha de Ingreso:</label>
                <input type="text" value={empleado.fecha_ingreso || "N/A"} readOnly />
              </div>

              <div className="field">
                <label>Dirección:</label>
                <input type="text" value={empleado.direccion || "N/A"} readOnly />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDetailsPage;