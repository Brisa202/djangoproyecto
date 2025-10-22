import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import DashboardLayout from "../../components/DashboardLayout";
import { ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";

const CreateIncidenteForm = () => {
  const navigate = useNavigate();
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productosRes, alquileresRes] = await Promise.all([
        api.get("productos/"),
        api.get("alquileres/").catch(() => ({ data: [] })) // Si no existe el endpoint, retorna array vacío
      ]);

      console.log("📦 Productos cargados:", productosRes.data);
      console.log("🏠 Alquileres cargados:", alquileresRes.data);

      setProductos(productosRes.data);
      setAlquileres(alquileresRes.data);
      setLoadingData(false);
    } catch (error) {
      console.error("❌ Error al cargar datos:", error);
      
      Swal.fire({
        icon: "error",
        title: "Error al cargar datos",
        text: "No se pudieron cargar los productos y alquileres.",
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

    console.log("📤 Datos a enviar:", formData);

    try {
      const response = await api.post("incidentes/create/", formData, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Incidente creado:", response.data);

      Swal.fire({
        icon: "success",
        title: "¡Incidente creado exitosamente!",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      }).then(() => {
        navigate("/dashboard/incidentes");
      });
    } catch (error) {
      console.error("❌ Error completo:", error);
      console.error("❌ Response data:", error.response?.data);
      
      let errorMessage = "Hubo un problema al crear el incidente.";
      
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
        title: "Error al crear incidente",
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
          <p style={styles.loadingText}>Cargando datos...</p>
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
          <h2 style={styles.title}>Registra un nuevo incidente en el sistema</h2>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            {/* Selector de Producto */}
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
                    {producto.codigo} - {producto.nombre}
                  </option>
                ))}
              </select>
              {productos.length === 0 && (
                <small style={styles.helperText}>No hay productos disponibles</small>
              )}
            </div>

            {/* Selector de Alquiler */}
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
              {alquileres.length === 0 && (
                <small style={styles.helperText}>No hay alquileres disponibles</small>
              )}
            </div>
          </div>

          <div style={styles.formGrid}>
            {/* Estado */}
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

            {/* Fecha Incidente */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Fecha de incidente *</label>
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

          {/* Descripción */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Descripción *</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe qué sucedió con el producto..."
              style={styles.textarea}
              rows="4"
              required
            />
          </div>

          <button type="submit" style={styles.submitButton} disabled={loading || productos.length === 0}>
            {loading ? "Guardando..." : "Registrar incidente"}
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
    fontSize: "24px",
    marginBottom: "0.5rem",
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
  helperText: {
    color: "#888",
    fontSize: "12px",
    fontStyle: "italic",
  },
};

export default CreateIncidenteForm;