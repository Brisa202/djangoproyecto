import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import DashboardLayout from "../../components/DashboardLayout";
import { ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";

const EditIncidenteForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    producto_id: "",
    alquiler_id: "",
    estado_incidente: "pendiente",
    fecha_incidente: "",
    descripcion: "",
  });

  const [productos, setProductos] = useState([]);
  const [alquileres, setAlquileres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      const [productosRes, alquileresRes, incidenteRes] = await Promise.all([
        api.get("productos/"),
        api.get("alquileres/").catch(() => ({ data: [] })),
        api.get(`incidentes/${id}/`)
      ]);

      console.log("📦 Productos cargados:", productosRes.data);
      console.log("🏠 Alquileres cargados:", alquileresRes.data);
      console.log("📄 Incidente cargado:", incidenteRes.data);

      setProductos(productosRes.data);
      setAlquileres(alquileresRes.data);

      const incidente = incidenteRes.data;
      
      let fechaFormateada = "";
      if (incidente.fecha_incidente) {
        const fecha = new Date(incidente.fecha_incidente);
        fechaFormateada = fecha.toISOString().split('T')[0];
      }
      
      setFormData({
        producto_id: incidente.producto_id || incidente.producto?.id || "",
        alquiler_id: incidente.alquiler_id || incidente.alquiler?.id || "",
        estado_incidente: incidente.estado_incidente || "pendiente",
        fecha_incidente: fechaFormateada,
        descripcion: incidente.descripcion || "",
      });
      
      setLoadingData(false);
    } catch (error) {
      console.error("❌ Error al cargar datos:", error);
      Swal.fire({
        icon: "error",
        title: "Error al cargar datos",
        text: "No se pudieron cargar los datos necesarios.",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("📤 Datos a actualizar:", formData);

    try {
      const response = await api.put(`incidentes/${id}/`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Incidente actualizado:", response.data);

      Swal.fire({
        icon: "success",
        title: "¡Incidente actualizado exitosamente!",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      }).then(() => {
        navigate("/dashboard/incidentes");
      });
    } catch (error) {
      console.error("❌ Error completo:", error);
      console.error("❌ Response data:", error.response?.data);
      
      let errorMessage = "Hubo un problema al actualizar el incidente.";
      
      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === 'object') {
          errorMessage = Object.entries(errors)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
        } else {
          errorMessage = errors;
        }
      }
      
      Swal.fire({
        icon: "error",
        title: "Error al actualizar incidente",
        text: errorMessage,
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout>
        <div style={styles.container}>
          <p style={styles.loadingText}>Cargando incidente...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate("/dashboard/incidentes")}>
          <ArrowLeft size={20} /> Volver
        </button>

        <div style={styles.header}>
          <h2 style={styles.title}>Editar incidente</h2>
          <p style={styles.subtitle}>Modifica los datos del incidente #{id}</p>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Producto *</label>
              <select
                name="producto_id"
                value={formData.producto_id}
                onChange={handleChange}
                style={styles.select}
                required
              >
                <option value="">Seleccione un producto</option>
                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre} - {producto.codigo}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Alquiler *</label>
              <select
                name="alquiler_id"
                value={formData.alquiler_id}
                onChange={handleChange}
                style={styles.select}
                required
              >
                <option value="">Seleccione un alquiler</option>
                {alquileres.map((alquiler) => (
                  <option key={alquiler.id} value={alquiler.id}>
                    {alquiler.id_alquiler || `Alquiler #${alquiler.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Estado *</label>
              <select
                name="estado_incidente"
                value={formData.estado_incidente}
                onChange={handleChange}
                style={styles.select}
                required
              >
                <option value="pendiente">Pendiente</option>
                <option value="resuelto">Resuelto</option>
                <option value="no resuelto">No Resuelto</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Fecha del Incidente *</label>
              <input
                type="date"
                name="fecha_incidente"
                value={formData.fecha_incidente}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Descripción *</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Ingrese la descripción del incidente"
              style={styles.textarea}
              rows="4"
              required
            />
          </div>

          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar Incidente"}
          </button>
        </form>
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
  form: {
    background: "#1a1a1a",
    borderRadius: "12px",
    padding: "2rem",
    border: "1px solid #333",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
    marginBottom: "1.5rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    color: "#fff",
    fontSize: "14px",
    fontWeight: "500",
  },
  input: {
    background: "#0a0a0a",
    border: "1px solid #333",
    borderRadius: "6px",
    padding: "0.75rem",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
  },
  select: {
    background: "#0a0a0a",
    border: "1px solid #333",
    borderRadius: "6px",
    padding: "0.75rem",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
  },
  textarea: {
    background: "#0a0a0a",
    border: "1px solid #333",
    borderRadius: "6px",
    padding: "0.75rem",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical",
  },
  submitButton: {
    width: "100%",
    background: "#fddb3a",
    color: "#000",
    border: "none",
    borderRadius: "6px",
    padding: "0.875rem",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "1rem",
  },
  loadingText: {
    color: "#fff",
    fontSize: "16px",
    textAlign: "center",
    padding: "2rem",
  },
};

export default EditIncidenteForm;