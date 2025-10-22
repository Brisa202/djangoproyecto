import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../api";
import DashboardLayout from "../../../components/DashboardLayout";
import { Pencil, Trash2, Plus, Search, Eye } from "lucide-react";
import "../../../styles/employees.css";
import Swal from "sweetalert2";

const ProductsListPage = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProductos, setFilteredProductos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productosRes, categoriasRes] = await Promise.all([
        api.get("productos/"),
        api.get("categorias/")
      ]);

      console.log("📦 Productos:", productosRes.data);
      console.log("📂 Categorías:", categoriasRes.data);

      setProductos(productosRes.data);
      setCategorias(categoriasRes.data);
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
    }
  };

  // ✅ Función para obtener nombre de categoría (con useCallback)
  const getCategoriaName = useCallback((producto) => {
    if (producto.categoria_nombre) return producto.categoria_nombre;
    
    if (producto.categoria && typeof producto.categoria === 'object') {
      return producto.categoria.nombre_categoria || producto.categoria.nombre || "Sin categoría";
    }

    if (producto.categoria && typeof producto.categoria === 'number') {
      const cat = categorias.find(c => c.id_categoria === producto.categoria);
      return cat?.nombre_categoria || "Sin categoría";
    }

    if (producto.id_categoria) {
      const cat = categorias.find(c => c.id_categoria === producto.id_categoria);
      return cat?.nombre_categoria || "Sin categoría";
    }

    return "Sin categoría";
  }, [categorias]);

  // 🔍 Filtrar productos cuando cambia el searchTerm
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProductos([]);
    } else {
      const filtered = productos.filter((p) =>
        p.nombre_prod.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoriaName(p).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProductos(filtered);
    }
  }, [searchTerm, productos, getCategoriaName]);

  const handleDelete = async (id, nombre) => {
    const result = await Swal.fire({
      title: `¿Eliminar "${nombre}"?`,
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
        await api.delete(`productos/${id}/`);
        fetchData();

        Swal.fire({
          icon: "success",
          title: "Producto eliminado correctamente",
          confirmButtonColor: "#fddb3a",
          background: "#141414",
          color: "#fff",
        });
      } catch (error) {
        console.error("Error al eliminar:", error.response?.data);
        Swal.fire({
          icon: "error",
          title: "Error al eliminar producto",
          text: error.response?.data?.detail || "Por favor, intenta nuevamente.",
          confirmButtonColor: "#fddb3a",
          background: "#141414",
          color: "#fff",
        });
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/productos/editar/${id}`);
  };

  const handleViewDetails = (id) => {
    navigate(`/dashboard/productos/detalles/${id}`);
  };

  return (
    <DashboardLayout>
      <div className="empleados-container">
        <div className="empleados-header">
          <div>
            <h2>Gestión de Productos</h2>
            <p className="subtitle">
              Aquí puedes ver, editar o eliminar los productos disponibles.
            </p>
          </div>
          <Link to="/dashboard/productos/crear" className="btn-agregar">
            <Plus size={18} /> Agregar producto
          </Link>
        </div>

        {/* 🔍 BUSCADOR */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Busca por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          {/* 📊 CONTADOR */}
          {searchTerm.trim() !== "" && (
            <div className="contador-resultados">
              <span className="contador-badge">{filteredProductos.length}</span>
              <span className="contador-texto">
                {filteredProductos.length === 1 ? "producto encontrado" : "productos encontrados"}
              </span>
            </div>
          )}
        </div>

        {/* 📋 TABLA */}
        <div className="empleados-table-container">
          {searchTerm.trim() === "" ? (
            <div className="empty-state">
              <Search size={48} className="empty-icon" />
              <p className="empty-text">Busca un producto para ver la lista</p>
            </div>
          ) : filteredProductos.length > 0 ? (
            <table className="empleados-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProductos.map((p) => (
                  <tr key={p.id_productos}>
                    <td>
                      {p.foto_producto ? (
                        <img 
                          src={p.foto_producto} 
                          alt={p.nombre_prod}
                          style={{ 
                            width: "50px", 
                            height: "50px", 
                            objectFit: "cover", 
                            borderRadius: "6px",
                            border: "1px solid #333"
                          }}
                          onLoad={() => console.log("✅ Imagen cargada:", p.foto_producto)}
                          onError={(e) => {
                            console.error("❌ Error cargando imagen:", p.foto_producto);
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'inline';
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: "12px", color: "#999" }}>Sin imagen</span>
                      )}
                      <span style={{ display: 'none', fontSize: "12px", color: "#999" }}>
                        ❌
                      </span>
                    </td>
                    <td>{p.nombre_prod}</td>
                    <td>{getCategoriaName(p)}</td>
                    <td>${p.precio}</td>
                    <td>{p.stock}</td>
                    <td className="acciones">
                      {/* 👁️ BOTÓN VER DETALLES */}
                      <button
                        className="btn-icon ver"
                        onClick={() => handleViewDetails(p.id_productos)}
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      {/* ✏️ BOTÓN EDITAR */}
                      <button
                        className="btn-icon editar"
                        onClick={() => handleEdit(p.id_productos)}
                        title="Editar producto"
                      >
                        <Pencil size={18} />
                      </button>
                      {/* 🗑️ BOTÓN ELIMINAR */}
                      <button
                        className="btn-icon eliminar"
                        onClick={() => handleDelete(p.id_productos, p.nombre_prod)}
                        title="Eliminar producto"
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
              <p>No hay productos que coincidan con tu búsqueda</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProductsListPage;

