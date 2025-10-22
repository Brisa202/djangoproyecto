import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import { Pencil, Trash2, UserPlus, Search, Eye, AlertTriangle, X } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import "../../styles/employees.css";
import Swal from "sweetalert2";

const EmpleadosListPage = () => {
  const [empleados, setEmpleados] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmpleados, setFilteredEmpleados] = useState([]);
  const [incompleteEmployees, setIncompleteEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedIncomplete, setSelectedIncomplete] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEmpleados([]);
    } else {
      const filtered = empleados.filter((e) =>
        e.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmpleados(filtered);
    }
  }, [searchTerm, empleados]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("users/me/");
      setCurrentUser(response.data);
      console.log("👤 Usuario actual:", response.data);
    } catch (error) {
      console.error("❌ Error al obtener usuario actual:", error);
    }
  };

  const fetchData = async () => {
    try {
      const [empleadosRes, rolesRes] = await Promise.all([
        api.get("employees/"),
        api.get("groups/"),
      ]);

      setEmpleados(empleadosRes.data);
      setRoles(rolesRes.data);

      // Filtrar empleados incompletos
      const incompletos = empleadosRes.data.filter((e) =>
        !e.nombre || !e.apellido || !e.dni
      );
      setIncompleteEmployees(incompletos);
    } catch (err) {
      console.error("❌ Error al cargar datos:", err);
      Swal.fire({
        icon: "error",
        title: "Error al cargar empleados",
        text: "No se pudieron cargar los empleados",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
    }
  };

  const getRoleName = (empleado) => {
    if (empleado.roles && empleado.roles.length > 0) {
      return empleado.roles.join(", ");
    }
    return "Sin rol";
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/empleados/editar/${id}`);
  };

  const handleDelete = async (id, username) => {
    // Protección: No permitir eliminar al superusuario actual
    if (currentUser && username === currentUser.username) {
      Swal.fire({
        icon: "warning",
        title: "No puedes eliminarte a ti mismo",
        text: "No puedes eliminar tu propio usuario mientras estás logueado.",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
      return;
    }

    // Protección adicional: No eliminar a briadmin
    if (username === "briadmin") {
      Swal.fire({
        icon: "warning",
        title: "Usuario protegido",
        text: "No se puede eliminar el superusuario briadmin.",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
      return;
    }

    const result = await Swal.fire({
      title: `¿Eliminar a ${username}?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#fddb3a",
      cancelButtonColor: "#d33",
      background: "#141414",
      color: "#fff",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`employees/${id}/`);
        fetchData();

        Swal.fire({
          icon: "success",
          title: "Empleado eliminado correctamente",
          confirmButtonColor: "#fddb3a",
          background: "#141414",
          color: "#fff",
        });
      } catch (error) {
        console.error("❌ Error al eliminar:", error.response?.data);
        Swal.fire({
          icon: "error",
          title: "Error al eliminar empleado",
          text: error.response?.data?.detail || "Por favor, intenta nuevamente.",
          confirmButtonColor: "#fddb3a",
          background: "#141414",
          color: "#fff",
        });
      }
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/dashboard/empleados/detalles/${id}`);
  };

  const handleSelectEmployee = (e, empleadoId, username) => {
    // No permitir seleccionar al usuario actual ni a briadmin
    if (currentUser && username === currentUser.username) {
      Swal.fire({
        icon: "info",
        title: "No puedes seleccionarte",
        text: "No puedes seleccionar tu propio usuario.",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
        timer: 2000,
      });
      e.target.checked = false;
      return;
    }

    if (username === "briadmin") {
      Swal.fire({
        icon: "info",
        title: "Usuario protegido",
        text: "No se puede seleccionar el superusuario briadmin.",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
        timer: 2000,
      });
      e.target.checked = false;
      return;
    }

    if (e.target.checked) {
      setSelectedEmployees([...selectedEmployees, empleadoId]);
    } else {
      setSelectedEmployees(selectedEmployees.filter(id => id !== empleadoId));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedEmployees.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No hay empleados seleccionados",
        text: "Selecciona al menos un empleado para eliminar.",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
      return;
    }

    const result = await Swal.fire({
      title: "¿Eliminar empleados seleccionados?",
      text: `Se eliminarán ${selectedEmployees.length} empleado(s). Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#666",
      background: "#141414",
      color: "#fff",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      let eliminados = 0;
      let errores = 0;

      for (const id of selectedEmployees) {
        try {
          await api.delete(`employees/${id}/`);
          eliminados++;
        } catch (error) {
          console.error("Error al eliminar empleado:", error);
          errores++;
        }
      }

      setSelectedEmployees([]);
      await fetchData();

      Swal.fire({
        icon: eliminados > 0 ? "success" : "error",
        title: eliminados > 0 ? "Empleados eliminados" : "Error al eliminar",
        text: `${eliminados} eliminados correctamente. ${errores > 0 ? `${errores} errores.` : ""}`,
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
    }
  };

  const handleShowIncompleteModal = () => {
    setShowModal(true);
    setSelectedIncomplete([]);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedIncomplete([]);
  };

  // ✅ FUNCIÓN CORREGIDA - Sin parámetro de evento
  const handleSelectIncomplete = (empleadoId, username) => {
    // Protección contra selección de usuario actual y briadmin
    if (currentUser && username === currentUser.username) {
      return;
    }

    if (username === "briadmin") {
      return;
    }

    console.log("🔍 Seleccionando empleado ID:", empleadoId);
    console.log("📋 Estado actual:", selectedIncomplete);

    setSelectedIncomplete(prev => {
      const newState = prev.includes(empleadoId)
        ? prev.filter(id => id !== empleadoId) // Deseleccionar
        : [...prev, empleadoId]; // Seleccionar
      
      console.log("✅ Nuevo estado:", newState);
      return newState;
    });
  };

  const handleDeleteIncomplete = async () => {
    if (selectedIncomplete.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No hay empleados seleccionados",
        text: "Selecciona al menos un empleado incompleto para eliminar.",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
      return;
    }

    const result = await Swal.fire({
      title: "¿Eliminar empleados incompletos seleccionados?",
      text: `Se eliminarán ${selectedIncomplete.length} empleado(s) incompleto(s).`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#666",
      background: "#141414",
      color: "#fff",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      let eliminados = 0;
      let errores = 0;

      for (const id of selectedIncomplete) {
        try {
          await api.delete(`employees/${id}/`);
          eliminados++;
        } catch (error) {
          console.error("Error al eliminar empleado:", error);
          errores++;
        }
      }

      setSelectedIncomplete([]);
      setShowModal(false);
      await fetchData();

      Swal.fire({
        icon: "success",
        title: "Empleados eliminados",
        text: `${eliminados} empleados incompletos eliminados. ${errores > 0 ? `${errores} errores.` : ""}`,
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
    }
  };

  const empleadosIncompletos = incompleteEmployees.length;

  return (
    <DashboardLayout>
      <div className="empleados-container">
        <div className="empleados-header">
          <div>
            <h2>Gestión de Empleados</h2>
            <p className="subtitle">
              Desde aquí podrás visualizar, editar y eliminar los datos de tus empleados.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {empleadosIncompletos > 0 && (
              <button 
                onClick={handleShowIncompleteModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#ff6b6b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem 1.25rem',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.background = '#ff5252'}
                onMouseLeave={(e) => e.target.style.background = '#ff6b6b'}
              >
                <AlertTriangle size={18} />
                Limpiar Incompletos ({empleadosIncompletos})
              </button>
            )}
            
            <Link to="/dashboard/empleados/crear" className="btn-agregar">
              <UserPlus size={18} /> Agregar un nuevo empleado
            </Link>
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Busca por usuario o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* BOTÓN ELIMINAR SELECCIONADOS */}
        {selectedEmployees.length > 0 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '1rem',
            background: '#1a1a1a',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <span style={{ color: '#fddb3a', fontWeight: '600' }}>
              {selectedEmployees.length} empleado(s) seleccionado(s)
            </span>
            <button
              onClick={handleDeleteSelected}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#d33',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              <Trash2 size={16} />
              Eliminar Seleccionados
            </button>
          </div>
        )}

        {/* TABLA */}
        <div className="empleados-table-container">
          {searchTerm.trim() === "" ? (
            <div className="empty-state">
              <Search size={48} className="empty-icon" />
              <p className="empty-text">Busca un empleado para ver la lista</p>
            </div>
          ) : filteredEmpleados.length > 0 ? (
            <table className="empleados-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          const selectableIds = filteredEmpleados
                            .filter(emp => 
                              emp.username !== "briadmin" && 
                              (!currentUser || emp.username !== currentUser.username)
                            )
                            .map(emp => emp.id_empleados);
                          setSelectedEmployees(selectableIds);
                        } else {
                          setSelectedEmployees([]);
                        }
                      }}
                      checked={
                        filteredEmpleados.length > 0 && 
                        selectedEmployees.length === filteredEmpleados.filter(emp => 
                          emp.username !== "briadmin" && 
                          (!currentUser || emp.username !== currentUser.username)
                        ).length
                      }
                    />
                  </th>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmpleados.map((e) => (
                  <tr key={e.id_empleados}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(e.id_empleados)}
                        onChange={(ev) => handleSelectEmployee(ev, e.id_empleados, e.username)}
                        disabled={
                          e.username === "briadmin" || 
                          (currentUser && e.username === currentUser.username)
                        }
                      />
                    </td>
                    <td>
                      {e.username}
                      {e.username === "briadmin" && (
                        <span style={{ 
                          marginLeft: '8px', 
                          color: '#fddb3a', 
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          🛡️ PROTEGIDO
                        </span>
                      )}
                    </td>
                    <td>{e.email}</td>
                    <td>{getRoleName(e)}</td>
                    <td className="acciones">
                      <button
                        className="btn-icon ver"
                        onClick={() => handleViewDetails(e.id_empleados)}
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="btn-icon editar"
                        onClick={() => handleEdit(e.id_empleados)}
                        title="Editar empleado"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className="btn-icon eliminar"
                        onClick={() => handleDelete(e.id_empleados, e.username)}
                        title="Eliminar empleado"
                        disabled={
                          e.username === "briadmin" || 
                          (currentUser && e.username === currentUser.username)
                        }
                        style={{
                          opacity: (e.username === "briadmin" || 
                                   (currentUser && e.username === currentUser.username)) ? 0.3 : 1,
                          cursor: (e.username === "briadmin" || 
                                  (currentUser && e.username === currentUser.username)) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-results">
              <p>No hay empleados que coincidan con tu búsqueda</p>
            </div>
          )}
        </div>

        {/* MODAL DE EMPLEADOS INCOMPLETOS CORREGIDO */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              background: '#1a1a1a',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '2px solid #fddb3a',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}>
                <h3 style={{ color: '#fddb3a', margin: 0, fontSize: '1.5rem' }}>
                  ⚠️ Empleados Incompletos
                </h3>
                <button
                  onClick={handleCloseModal}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    padding: '0.5rem',
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
                Selecciona los empleados incompletos que deseas eliminar:
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                {incompleteEmployees.map((emp) => {
                  const isProtected = emp.username === "briadmin" || 
                                     (currentUser && emp.username === currentUser.username);
                  const isSelected = selectedIncomplete.includes(emp.id_empleados);
                  
                  return (
                    <div
                      key={emp.id_empleados}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.75rem',
                        background: isSelected ? '#2a2a1a' : '#141414',
                        borderRadius: '8px',
                        marginBottom: '0.5rem',
                        border: isSelected 
                          ? '2px solid #fddb3a' 
                          : '1px solid #333',
                        transition: 'all 0.2s ease',
                        opacity: isProtected ? 0.5 : 1,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (!isProtected) {
                            handleSelectIncomplete(emp.id_empleados, emp.username);
                          }
                        }}
                        disabled={isProtected}
                        style={{
                          width: '20px',
                          height: '20px',
                          cursor: isProtected ? 'not-allowed' : 'pointer',
                          accentColor: '#fddb3a',
                        }}
                      />
                      <div 
                        onClick={() => {
                          if (!isProtected) {
                            handleSelectIncomplete(emp.id_empleados, emp.username);
                          }
                        }}
                        style={{ 
                          flex: 1,
                          cursor: isProtected ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <div style={{ color: '#fff', fontWeight: '600' }}>
                          {emp.username}
                          {isProtected && (
                            <span style={{ 
                              marginLeft: '8px', 
                              color: '#fddb3a', 
                              fontSize: '12px' 
                            }}>
                              🛡️ PROTEGIDO
                            </span>
                          )}
                        </div>
                        <div style={{ color: '#888', fontSize: '14px' }}>
                          {emp.email}
                        </div>
                      </div>
                      {isSelected && (
                        <div style={{
                          background: '#fddb3a',
                          color: '#000',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          pointerEvents: 'none',
                        }}>
                          ✓ Seleccionado
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={handleCloseModal}
                  style={{
                    background: 'transparent',
                    color: '#fff',
                    border: '1px solid #555',
                    borderRadius: '6px',
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteIncomplete}
                  disabled={selectedIncomplete.length === 0}
                  style={{
                    background: selectedIncomplete.length > 0 ? '#d33' : '#555',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.75rem 1.5rem',
                    cursor: selectedIncomplete.length > 0 ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                  }}
                >
                  Eliminar Seleccionados ({selectedIncomplete.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmpleadosListPage;
