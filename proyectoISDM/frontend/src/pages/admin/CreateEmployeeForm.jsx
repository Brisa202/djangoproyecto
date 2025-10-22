import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom"; 
import axios from "axios"; 
import { ArrowLeft } from "lucide-react"; 
import Swal from "sweetalert2";

const API_BASE_URL = "http://localhost:8000/api";

function CreateEmployeeForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    group_id: "",
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    direccion: "",
    fecha_ingreso: "",
    is_active: true, // ✅ AGREGADO: Campo requerido por la BD
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const headers = getAuthHeaders();
        const response = await axios.get(`${API_BASE_URL}/groups/`, { headers });
        console.log("🎭 Roles cargados:", response.data);
        setRoles(response.data);
      } catch (error) {
        console.error("❌ Error al cargar roles:", error);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("📤 Datos a enviar:", formData);

    try {
      const headers = getAuthHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/users/create/employee/`,
        formData, // Usamos directamente formData aquí
        { headers }
      );

      console.log("✅ Empleado creado:", response.data);

      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "¡Empleado registrado exitosamente!",
          text: `El usuario ${formData.username} ha sido creado correctamente`,
          confirmButtonColor: "#fddb3a",
          background: "#141414",
          color: "#fff",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/dashboard/empleados");
        });

        // Resetear formulario
        setFormData({
          username: "",
          email: "",
          password: "",
          group_id: "",
          nombre: "",
          apellido: "",
          dni: "",
          telefono: "",
          direccion: "",
          fecha_ingreso: "",
          is_active: true,
        });
      }
    } catch (error) {
      console.error("❌ Error al crear empleado:", error.response?.data);
      let errorMsg = "Error desconocido";

      if (error.response?.data) {
        const errors = error.response.data;
        if (errors.username) errorMsg = errors.username[0];
        else if (errors.email) errorMsg = errors.email[0];
        else if (errors.password) errorMsg = errors.password[0];
        else if (errors.group_id) errorMsg = errors.group_id;
        else if (errors.error) errorMsg = errors.error;
        else errorMsg = JSON.stringify(errors);
      }

      Swal.fire({
        icon: "error",
        title: "Error al crear empleado",
        text: errorMsg,
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button 
          style={styles.backButton}
          onClick={() => navigate("/dashboard/empleados")}
        >
          <ArrowLeft size={20} /> Volver
        </button>

        <h2 style={styles.title}>Crear nuevo Empleado</h2>
        <p style={styles.subtitle}>Complete los datos para registrar un nuevo empleado en el sistema.</p>

        <form style={styles.form} onSubmit={handleSubmit}>
          {/* SECCIÓN 1: Datos de Acceso */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📋 Datos de Acceso</h3>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Usuario: *</label>
                <input
                  style={styles.input}
                  type="text"
                  name="username"
                  placeholder="Ej: jperez"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Email: *</label>
                <input
                  style={styles.input}
                  type="email"
                  name="email"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Contraseña: *</label>
                <input
                  style={styles.input}
                  type="password"
                  name="password"
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Rol: *</label>
                <select
                  style={styles.select}
                  name="group_id"
                  value={formData.group_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un rol</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ✅ AGREGADO: Campo Estado Activo */}
            <div style={styles.row}>
              <div style={styles.checkboxField}>
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                <label htmlFor="is_active" style={styles.checkboxLabel}>
                  Usuario activo (puede iniciar sesión)
                </label>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Datos Personales */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>👤 Datos Personales</h3>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Nombre:</label>
                <input
                  style={styles.input}
                  type="text"
                  name="nombre"
                  placeholder="Nombre del empleado"
                  value={formData.nombre}
                  onChange={handleChange}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Apellido:</label>
                <input
                  style={styles.input}
                  type="text"
                  name="apellido"
                  placeholder="Apellido del empleado"
                  value={formData.apellido}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>DNI:</label>
                <input
                  style={styles.input}
                  type="text"
                  name="dni"
                  placeholder="Ej: 12345678"
                  value={formData.dni}
                  onChange={handleChange}
                  maxLength={20}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Teléfono:</label>
                <input
                  style={styles.input}
                  type="text"
                  name="telefono"
                  placeholder="Ej: +54 9 11 1234-5678"
                  value={formData.telefono}
                  onChange={handleChange}
                  maxLength={20}
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={{...styles.field, flex: '1 1 100%'}}>
                <label style={styles.label}>Dirección:</label>
                <input
                  style={styles.input}
                  type="text"
                  name="direccion"
                  placeholder="Calle, número, ciudad"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Fecha de Ingreso:</label>
                <input
                  style={styles.input}
                  type="date"
                  name="fecha_ingreso"
                  value={formData.fecha_ingreso}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div style={styles.actions}>
            <button type="submit" style={styles.submitButton} disabled={loading}>
              {loading ? "Creando..." : "Crear Empleado"}
            </button>
            <button 
              type="button" 
              style={styles.cancelButton}
              onClick={() => navigate("/dashboard/empleados")}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    padding: '2rem',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    background: '#1a1a1a',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'transparent',
    border: '1px solid #fddb3a',
    color: '#fddb3a',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '1.5rem',
    transition: 'all 0.2s',
  },
  title: {
    color: '#fff',
    fontSize: '28px',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#888',
    fontSize: '14px',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  section: {
    background: '#141414',
    padding: '1.5rem',
    borderRadius: '8px',
    border: '1px solid #333',
  },
  sectionTitle: {
    color: '#fddb3a',
    fontSize: '18px',
    marginBottom: '1.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #fddb3a',
  },
  row: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  field: {
    flex: '1 1 45%',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    minWidth: '250px',
  },
  label: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
  },
  input: {
    background: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '6px',
    padding: '0.75rem',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    background: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '6px',
    padding: '0.75rem',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
  },
  checkboxField: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: '#fddb3a',
  },
  checkboxLabel: {
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1rem',
  },
  submitButton: {
    background: '#fddb3a',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    padding: '0.75rem 2rem',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cancelButton: {
    background: 'transparent',
    color: '#fff',
    border: '1px solid #555',
    borderRadius: '6px',
    padding: '0.75rem 2rem',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default CreateEmployeeForm;
