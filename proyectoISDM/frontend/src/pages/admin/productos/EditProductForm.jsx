import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api";
import "../../../styles/employeeDetails.css";
import { ArrowLeft, Save } from "lucide-react";
import Swal from "sweetalert2";

const EditProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre_prod: "",
    descripcion: "",
    precio: "",
    stock: "",
    categoria: "",
    foto_producto: "",
  });

  const [producto, setProducto] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get(`productos/${id}/`),
        api.get("categorias/")
      ]);

      console.log("📦 Producto:", prodRes.data);
      console.log("📂 Categorías:", catRes.data);

      setProducto(prodRes.data);
      setCategorias(catRes.data);

      // Detectar el ID de categoría
      let categoriaId = "";
      if (prodRes.data.categoria) {
        if (typeof prodRes.data.categoria === 'object') {
          categoriaId = prodRes.data.categoria.id_categoria || prodRes.data.categoria.id;
        } else {
          categoriaId = prodRes.data.categoria;
        }
      } else if (prodRes.data.id_categoria) {
        categoriaId = prodRes.data.id_categoria;
      }

      setFormData({
        nombre_prod: prodRes.data.nombre_prod || "",
        descripcion: prodRes.data.descripcion || "",
        precio: prodRes.data.precio || "",
        stock: prodRes.data.stock || "",
        categoria: categoriaId,
        foto_producto: prodRes.data.foto_producto || "",
      });

      setLoading(false);
    } catch (error) {
      console.error("Error cargando datos:", error);
      Swal.fire({
        icon: "error",
        title: "Error al cargar el producto",
        text: "No se pudieron obtener los datos del producto.",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
      setLoading(false);
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
    setSaving(true);

    console.log("📤 Datos a actualizar:", formData);

    try {
      const response = await api.put(`productos/${id}/`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Producto actualizado:", response.data);

      Swal.fire({
        icon: "success",
        title: "Producto actualizado correctamente",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });

      navigate("/dashboard/productos");
    } catch (error) {
      console.error("❌ Error al actualizar:", error.response?.data);
      Swal.fire({
        icon: "error",
        title: "Error al actualizar producto",
        text: JSON.stringify(error.response?.data) || "Verifica los datos ingresados.",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
    } finally {
      setSaving(false);
    }
  };

  const getCategoriaName = () => {
    if (!producto) return "Sin categoría";
    
    if (producto.categoria_nombre) return producto.categoria_nombre;
    
    if (producto.categoria && typeof producto.categoria === 'object') {
      return producto.categoria.nombre_categoria || "Sin categoría";
    }

    const cat = categorias.find(c => c.id_categoria === formData.categoria);
    return cat?.nombre_categoria || "Sin categoría";
  };

  if (loading) {
    return (
      <div className="details-container">
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="details-container">
        <p>No se encontró el producto</p>
      </div>
    );
  }

  return (
    <div className="details-container">
      {/* HEADER CON BOTÓN VOLVER */}
      <div className="details-header">
        <button 
          className="btn-back"
          onClick={() => navigate("/dashboard/productos")}
        >
          <ArrowLeft size={20} /> Volver
        </button>
        <h2>Editar Producto</h2>
        <div style={{ width: "100px" }}></div>
      </div>

      {/* FORMULARIO */}
      <div className="details-card">
        {/* Información General (solo lectura) */}
        <div className="section">
          <h3>Información General</h3>
          <div className="read-only-fields">
            <div className="field">
              <label>ID del Producto:</label>
              <input type="text" value={producto.id_productos} readOnly />
            </div>
            <div className="field">
              <label>Categoría:</label>
              <input type="text" value={getCategoriaName()} readOnly />
            </div>
          </div>
        </div>

        {/* Preview de imagen actual */}
        {formData.foto_producto && (
          <div className="section">
            <h3>Imagen del Producto (Actual)</h3>
            <div style={{ position: 'relative' }}>
              <img 
                src={formData.foto_producto} 
                alt={formData.nombre_prod}
                style={{ 
                  maxWidth: "300px", 
                  height: "auto", 
                  borderRadius: "8px",
                  border: "1px solid #333",
                  display: "block"
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
              <p style={{ 
                display: 'none', 
                color: '#999', 
                fontSize: '14px',
                marginTop: '10px' 
              }}>
                ⚠️ No se pudo cargar la imagen desde la URL
              </p>
            </div>
          </div>
        )}

        {/* Formulario editable */}
        <form onSubmit={handleSubmit}>
          <div className="section">
            <h3>Detalles del Producto</h3>

            <div className="edit-fields">
              <div className="field">
                <label>Nombre:</label>
                <input
                  type="text"
                  name="nombre_prod"
                  value={formData.nombre_prod}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label>Descripción:</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="3"
                  style={{ resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              <div className="field">
                <label>Precio:</label>
                <input
                  type="number"
                  step="0.01"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label>Stock:</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label>Categoría:</label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre_categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>URL de la imagen:</label>
                <input
                  type="url"
                  name="foto_producto"
                  value={formData.foto_producto}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="actions">
            <button
              type="submit"
              className="btn-save"
              disabled={saving}
            >
              <Save size={18} /> {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/dashboard/productos")}
              disabled={saving}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductForm;