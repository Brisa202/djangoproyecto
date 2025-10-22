import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import DashboardLayout from "../../components/DashboardLayout";
import { Eye, Pencil, Trash2, Plus, X } from "lucide-react";
import "../../styles/employeeDetails.css";
import Swal from "sweetalert2";

const ListIncidentesPage = () => {
  const navigate = useNavigate();
  const [incidentes, setIncidentes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncidente, setSelectedIncidente] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Cargar productos e incidentes en paralelo
      const [incidentesRes, productosRes] = await Promise.all([
        api.get("incidentes/"),
        api.get("productos/")
      ]);
      
      console.log("📂 Incidentes:", incidentesRes.data);
      console.log("📦 Productos:", productosRes.data);
      
      setIncidentes(incidentesRes.data);
      setProductos(productosRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      Swal.fire({
        icon: "error",
        title: "Error al cargar datos",
        text: "No se pudieron obtener los datos del servidor.",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
      setLoading(false);
    }
  };

  // Función para obtener el nombre del producto por ID
  const getProductoNombre = (incidente) => {
    // Intentar obtener el producto_id de diferentes formas
    const productoId = incidente.producto_id || incidente.producto?.id || incidente.producto;
    
    if (!productoId) {
      console.log("⚠️ No se encontró producto_id en:", incidente);
      return "Sin producto";
    }
    
    // Buscar el producto
    const producto = productos.find(p => 
      p.id === productoId || 
      p.id === Number(productoId) || 
      String(p.id) === String(productoId)
    );
    
    return producto ? producto.nombre : "Sin producto";
  };

  const handleViewDetails = (incidente) => {
    setSelectedIncidente(incidente);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedIncidente(null);
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/incidentes/editar/${id}`);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar este incidente?",
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
        await api.delete(`incidentes/${id}/delete/`);
        fetchData();

        Swal.fire({
          icon: "success",
          title: "Incidente eliminado correctamente",
          confirmButtonColor: "#fddb3a",
          background: "#141414",
          color: "#fff",
        });
      } catch (error) {
        console.error("❌ Error al eliminar incidente:", error);
        Swal.fire({
          icon: "error",
          title: "Error al eliminar incidente",
          text: "No se pudo eliminar el incidente.",
          confirmButtonColor: "#fddb3a",
          background: "#141414",
          color: "#fff",
        });
      }
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'pendiente': { bg: "#ff9800", text: "Pendiente" },
      'resuelto': { bg: "#4caf50", text: "Resuelto" },
      'no_resuelto': { bg: "#f44336", text: "No Resuelto" },
    };
    const estadoLower = estado?.toLowerCase();
    const badge = badges[estadoLower] || { bg: "#9e9e9e", text: estado };
    return (
      <span
        style={{
          background: badge.bg,
          color: "#fff",
          padding: "0.25rem 0.75rem",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="empleados-container">
        <div className="empleados-header">
          <div>
            <h2>Gestión de Incidentes</h2>
            <p className="subtitle">
              Desde aquí podrás visualizar, registrar y actualizar los incidentes ocurridos en los alquileres.
            </p>
          </div>
          <Link to="/dashboard/incidentes/crear" className="btn-agregar">
            <Plus size={18} /> Agregar un nuevo incidente
          </Link>
        </div>

        <div className="empleados-table-container">
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Listado de Incidentes</h3>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Cargando incidentes...</p>
            </div>
          ) : incidentes.length === 0 ? (
            <div className="empty-state">
              <p>No hay incidentes registrados</p>
            </div>
          ) : (
            <table className="empleados-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {incidentes.map((incidente) => (
                  <tr key={incidente.id}>
                    <td>{incidente.id}</td>
                    <td>{getProductoNombre(incidente)}</td>
                    <td>{formatDate(incidente.fecha_incidente)}</td>
                    <td>{getEstadoBadge(incidente.estado_incidente)}</td>
                    <td className="acciones">
                      <button
                        className="btn-icon ver"
                        onClick={() => handleViewDetails(incidente)}
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="btn-icon editar"
                        onClick={() => handleEdit(incidente.id)}
                        title="Editar incidente"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className="btn-icon eliminar"
                        onClick={() => handleDelete(incidente.id)}
                        title="Eliminar incidente"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal de Detalles */}
        {showModal && selectedIncidente && (
          <div style={styles.modalOverlay} onClick={handleCloseModal}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <button style={styles.closeButton} onClick={handleCloseModal}>
                <X size={24} />
              </button>

              <h2 style={styles.modalTitle}>Detalle de incidentes</h2>

              <div style={styles.modalContent}>
                <div style={styles.modalRow}>
                  <div style={styles.modalField}>
                    <label style={styles.modalLabel}>ID Producto</label>
                    <p style={styles.modalValue}>
                      {selectedIncidente.producto_id || "N/A"}
                    </p>
                  </div>
                  <div style={styles.modalField}>
                    <label style={styles.modalLabel}>Producto</label>
                    <p style={styles.modalValue}>
                      {getProductoNombre(selectedIncidente)}
                    </p>
                  </div>
                </div>

                <div style={styles.modalRow}>
                  <div style={styles.modalField}>
                    <label style={styles.modalLabel}>ID Alquiler</label>
                    <p style={styles.modalValue}>
                      {selectedIncidente.alquiler_id || "N/A"}
                    </p>
                  </div>
                  <div style={styles.modalField}>
                    <label style={styles.modalLabel}>Fecha de incidente</label>
                    <p style={styles.modalValue}>
                      {formatDate(selectedIncidente.fecha_incidente)}
                    </p>
                  </div>
                </div>

                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>Descripción</label>
                  <p style={styles.modalValue}>
                    {selectedIncidente.descripcion || "Sin descripción"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const styles = {
  tableHeader: {
    background: "#000",
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #333",
  },
  tableTitle: {
    color: "#fff",
    fontSize: "18px",
    margin: 0,
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    borderRadius: "12px",
    maxWidth: "700px",
    width: "90%",
    padding: "2rem",
    position: "relative",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  closeButton: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    background: "transparent",
    border: "2px solid #000",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  modalTitle: {
    color: "#000",
    fontSize: "24px",
    marginBottom: "1.5rem",
    paddingRight: "3rem",
  },
  modalContent: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  modalRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
  },
  modalField: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  modalLabel: {
    color: "#000",
    fontSize: "14px",
    fontWeight: "600",
  },
  modalValue: {
    color: "#555",
    fontSize: "14px",
    margin: 0,
    lineHeight: "1.5",
  },
};

export default ListIncidentesPage;