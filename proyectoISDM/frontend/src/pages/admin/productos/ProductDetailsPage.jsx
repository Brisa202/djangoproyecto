import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api";
import DashboardLayout from "../../../components/DashboardLayout";
import { ArrowLeft, Trash2 } from "lucide-react";
import "../../../styles/employeeDetails.css";
import Swal from "sweetalert2";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductoDetails();
  }, [id]);

  const fetchProductoDetails = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get(`productos/${id}/`),
        api.get("categorias/")
      ]);

      console.log("📦 Producto:", prodRes.data);
      console.log("📂 Categorías:", catRes.data);

      setProducto(prodRes.data);
      setCategorias(catRes.data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error al cargar producto:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar el producto",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `¿Eliminar "${producto.nombre_prod}"?`,
      text: "Esta acción no se puede deshacer",
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
        await api.delete(`productos/${id}/`);

        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El producto ha sido eliminado",
          confirmButtonColor: "#fddb3a",
          background: "#141414",
          color: "#fff",
        });

        setTimeout(() => navigate("/dashboard/productos"), 1500);
      } catch (error) {
        console.error("❌ Error al eliminar:", error.response?.data);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.error || "No se pudo eliminar",
          confirmButtonColor: "#fddb3a",
          background: "#141414",
          color: "#fff",
        });
      }
    }
  };

  const getCategoriaName = () => {
    if (!producto) return "Sin categoría";
    
    if (producto.categoria_nombre) return producto.categoria_nombre;
    
    if (producto.categoria && typeof producto.categoria === 'object') {
      return producto.categoria.nombre_categoria || "Sin categoría";
    }

    const cat = categorias.find(c => c.id_categoria === producto.categoria);
    return cat?.nombre_categoria || "Sin categoría";
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

  if (!producto) {
    return (
      <DashboardLayout>
        <div className="details-container">
          <p>No se encontró el producto</p>
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
            onClick={() => navigate("/dashboard/productos")}
          >
            <ArrowLeft size={20} /> Volver
          </button>
          <h2>Detalles del Producto</h2>
        </div>

        <div className="details-card">
          {/* Información General */}
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

          {/* Imagen del Producto */}
          {producto.foto_producto && (
            <div className="section">
              <h3>Imagen del Producto</h3>
              <div style={{ position: 'relative' }}>
                <img 
                  src={producto.foto_producto} 
                  alt={producto.nombre_prod}
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

          {/* Detalles del Producto (Solo lectura) */}
          <div className="section">
            <h3>Detalles del Producto</h3>
            <div className="read-only-fields">
              <div className="field">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={producto.nombre_prod || ""}
                  readOnly
                />
              </div>

              <div className="field">
                <label>Descripción:</label>
                <textarea
                  value={producto.descripcion || ""}
                  readOnly
                  rows="3"
                  style={{ resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              <div className="field">
                <label>Precio:</label>
                <input
                  type="text"
                  value={`$${producto.precio}`}
                  readOnly
                />
              </div>

              <div className="field">
                <label>Stock:</label>
                <input
                  type="text"
                  value={producto.stock}
                  readOnly
                />
              </div>

              <div className="field">
                <label>URL de la imagen:</label>
                <input
                  type="text"
                  value={producto.foto_producto || "No disponible"}
                  readOnly
                  style={{ fontSize: "12px", wordBreak: "break-all" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProductDetailsPage;