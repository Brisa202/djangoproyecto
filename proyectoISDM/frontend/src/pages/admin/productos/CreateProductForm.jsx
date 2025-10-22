import React, { useEffect, useState } from "react";
import api from "../../../api";
import "../../../styles/employeeForms.css";
import Swal from "sweetalert2";

const CreateProductForm = () => {
  const [formData, setFormData] = useState({
    nombre_prod: "",
    descripcion: "",
    precio: "",
    stock: "",
    categoria: "",
    foto_producto: "", // ✅ CAMBIO: string vacío en lugar de null
  });

  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    api
      .get("categorias/")
      .then((res) => {
        console.log("📂 Categorías cargadas:", res.data);
        setCategorias(res.data);
      })
      .catch((err) => console.error("Error al cargar categorías:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target; // ✅ CAMBIO: sin files
    setFormData({
      ...formData,
      [name]: value, // ✅ CAMBIO: siempre value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("📤 Datos a enviar:", formData);

    try {
      const response = await api.post("productos/", formData, {
        headers: { "Content-Type": "application/json" }, // ✅ CAMBIO: JSON en lugar de multipart
      });

      console.log("✅ Producto creado:", response.data);

      Swal.fire({
        icon: "success",
        title: "¡Producto creado exitosamente!",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });

      // ✅ Resetear formulario
      setFormData({
        nombre_prod: "",
        descripcion: "",
        precio: "",
        stock: "",
        categoria: "",
        foto_producto: "",
      });
      
      e.target.reset();
      
    } catch (error) {
      console.error("❌ Error completo:", error.response?.data);
      
      Swal.fire({
        icon: "error",
        title: "Error al crear producto",
        text: JSON.stringify(error.response?.data) || "Por favor, intenta nuevamente.",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
    }
  };

  return (
    <div className="empleado-form-page">
      <div className="empleado-form-container">
        <h2>Crear nuevo Producto</h2>
        <p className="subtitle">Complete los datos para registrar un producto.</p>

        <form className="empleado-form" onSubmit={handleSubmit}>
          <label>Nombre:</label>
          <input
            name="nombre_prod"
            value={formData.nombre_prod}
            onChange={handleChange}
            required
          />

          <label>Descripción:</label>
          <input
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
          />

          <label>Precio:</label>
          <input
            type="number"
            step="0.01"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            required
          />

          <label>Stock:</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
          />

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

          {/* ✅ CAMBIO: Input de URL en lugar de file */}
          <label>URL de la foto del producto:</label>
          <input 
            type="url" 
            name="foto_producto"
            value={formData.foto_producto}
            onChange={handleChange}
            placeholder="https://ejemplo.com/imagen.jpg"
          />

          <button type="submit" className="btn-submit">
            Crear Producto
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProductForm;