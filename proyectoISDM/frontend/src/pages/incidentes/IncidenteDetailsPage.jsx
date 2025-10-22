import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import DashboardLayout from "../../components/DashboardLayout"; 
import { ArrowLeft, Edit } from "lucide-react";
import Swal from "sweetalert2";

const IncidenteDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incidente, setIncidente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidenteDetails();
  }, [id]);

  const fetchIncidenteDetails = async () => {
    try {
      const res = await api.get(`incidentes/${id}/`);
      setIncidente(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar incidente:", err);
      Swal.fire({
        icon: "error",
        title: "Error al cargar incidente",
        text: "No se pudo cargar el incidente.",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'pendiente': { bg: '#ff9800', text: 'Pendiente' },
      'resuelto': { bg: '#4caf50', text: 'Resuelto' },
      'no resuelto': { bg: '#f44336', text: 'No Resuelto' }
    };
    
    const badge = badges[estado?.toLowerCase()] || { bg: '#757575', text: estado };
    
    return (
      <span style={{
        background: badge.bg,
        color: '#fff',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        display: 'inline-block'
      }}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={styles.container}>
          <p style={styles.loadingText}>Cargando incidente...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!incidente) {
    return (
      <DashboardLayout>
        <div style={styles.container}>
          <p style={styles.errorText}>No se encontró el incidente</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={styles.container}>
        <button 
          style={styles.backButton}
          onClick={() => navigate("/dashboard/incidentes")}
        >
          <ArrowLeft size={20} /> Volver
        </button>

        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Detalle de incidentes</h2>
            <p style={styles.subtitle}>Incidente #{incidente.id}</p>
          </div>
          <button 
            style={styles.editButton}
            onClick={() => navigate(`/dashboard/incidentes/editar/${id}`)}
          >
            <Edit size={18} /> Editar
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.grid}>
            <div style={styles.field}>
              <label style={styles.label}>ID Producto</label>
              <div style={styles.value}>
                {incidente.producto_id || "N/A"}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>ID Alquiler</label>
              <div style={styles.value}>
                {incidente.alquiler_id || "N/A"}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Fecha de incidente</label>
              <div style={styles.value}>
                {formatDate(incidente.fecha_incidente)}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Estado</label>
              <div style={styles.value}>
                {getEstadoBadge(incidente.estado_incidente)}
              </div>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Descripción</label>
            <div style={styles.descriptionBox}>
              {incidente.descripcion || "Sin descripción"}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "transparent",
    border: "1px solid #fddb3a",
    color: "#fddb3a",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "1.5rem",
    transition: "all 0.2s",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  title: {
    color: "#fff",
    fontSize: "28px",
    marginBottom: "0.5rem",
  },
  subtitle: {
    color: "#888",
    fontSize: "14px",
  },
  editButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "#fddb3a",
    border: "none",
    color: "#000",
    padding: "0.75rem 1.5rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  card: {
    background: "#1a1a1a",
    borderRadius: "12px",
    padding: "2rem",
    border: "1px solid #333",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "2rem",
    marginBottom: "2rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  label: {
    color: "#888",
    fontSize: "13px",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  value: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: "500",
  },
  descriptionBox: {
    background: "#0a0a0a",
    border: "1px solid #333",
    borderRadius: "6px",
    padding: "1rem",
    color: "#fff",
    fontSize: "14px",
    lineHeight: "1.6",
    minHeight: "100px",
  },
  loadingText: {
    color: "#fff",
    fontSize: "16px",
    textAlign: "center",
    padding: "2rem",
  },
  errorText: {
    color: "#f44336",
    fontSize: "16px",
    textAlign: "center",
    padding: "2rem",
  },
};

export default IncidenteDetailsPage;