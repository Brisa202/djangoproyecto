import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import { ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import "../../styles/employeeForms.css";

const toYMD = (dateLike) => {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const getId = (obj) => obj?.id ?? obj?.pk ?? null;

const EditEmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    group_id: "",
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    direccion: "",
    fecha_ingreso: "",
    is_active: true,
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [incompleteEmployees, setIncompleteEmployees] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Carga inicial: empleado por id + grupos + (opcional) me
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoadingData(true);

        // Pedimos empleado por :id
        const empReq = api.get(`employees/${id}/`);
        // Roles (grupos)
        const rolesReq = api.get("groups/");
        // Usuario actual (solo para excluirlo al limpiar). Si 404, lo ignoramos.
        const meReq = api.get("users/me/").catch((e) => {
          if (e?.response?.status !== 404) console.warn("users/me/ error:", e);
          return { data: null };
        });

        const [empRes, rolesRes, meRes] = await Promise.all([empReq, rolesReq, meReq]);

        if (!mounted) return;

        setRoles(rolesRes.data || []);
        if (meRes?.data) setCurrentUser(meRes.data);

        const emp = empRes.data || {};

        // Resolver group_id desde varias formas (id directo o anidado)
        const group_id_resuelto =
          emp.group_id ??
          emp.groupId ??
          getId(emp.group) ??
          getId(emp.rol) ??
          "";

        setFormData({
          username: emp.username ?? "",
          email: emp.email ?? "",
          group_id: group_id_resuelto,
          nombre: emp.nombre ?? "",
          apellido: emp.apellido ?? "",
          dni: emp.dni ?? "",
          telefono: emp.telefono ?? "",
          direccion: emp.direccion ?? "",
          fecha_ingreso: toYMD(emp.fecha_ingreso),
          is_active: emp.is_active !== undefined ? !!emp.is_active : true,
        });

      } catch (error) {
        console.error("❌ Error al cargar empleado/grupos:", error);
        Swal.fire({
          icon: "error",
          title: "Error al cargar empleado",
          text: "No se pudieron obtener los datos del empleado.",
          confirmButtonColor: "#fddb3a",
          background: "#141414",
          color: "#fff",
        });
      } finally {
        if (mounted) setLoadingData(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [id]);

  // Cargar empleados para detectar incompletos (limpieza)
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get("employees/");
        const employees = response.data || [];
        const incomplete = employees.filter(
          (e) => !e.nombre || !e.telefono || !e.direccion
        );
        setIncompleteEmployees(incomplete);
      } catch (error) {
        console.error("❌ Error al cargar empleados:", error);
      }
    };
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Payload alineado a backend (ajusta nombres si tu serializer usa otros)
      const payload = {
        username: formData.username?.trim(),
        email: formData.email?.trim(),
        group_id: formData.group_id ? Number(formData.group_id) : null,
        nombre: formData.nombre?.trim(),
        apellido: formData.apellido?.trim(),
        dni: formData.dni?.trim(),
        telefono: formData.telefono?.trim(),
        direccion: formData.direccion?.trim(),
        fecha_ingreso: formData.fecha_ingreso || null, // "YYYY-MM-DD"
        is_active: !!formData.is_active,
      };

      await api.put(`employees/${id}/`, payload);

      Swal.fire({
        icon: "success",
        title: "¡Empleado actualizado correctamente!",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      }).then(() => navigate("/dashboard/empleados"));
    } catch (error) {
      let errorMsg = "Por favor, intenta nuevamente.";
      if (error.response?.data) {
        const errors = error.response.data;
        if (errors.username) errorMsg = errors.username[0];
        else if (errors.email) errorMsg = errors.email[0];
        else if (errors.group_id) errorMsg = errors.group_id[0];
        else errorMsg = typeof errors === "string" ? errors : JSON.stringify(errors);
      }
      Swal.fire({
        icon: "error",
        title: "Error al actualizar empleado",
        text: errorMsg,
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCleanIncomplete = async () => {
    setLoading(true);
    try {
      const employeesToDelete = incompleteEmployees.filter(
        (employee) => !currentUser || employee.id !== currentUser.id
      );

      for (const employee of employeesToDelete) {
        await api.delete(`employees/${employee.id}/`);
      }

      Swal.fire({
        icon: "success",
        title: "Empleados incompletos eliminados correctamente",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      }).then(() => navigate("/dashboard/empleados"));
    } catch (error) {
      console.error("❌ Error al eliminar empleados incompletos:", error);
      Swal.fire({
        icon: "error",
        title: "Error al eliminar empleados incompletos",
        text: "Hubo un problema al eliminar los empleados.",
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
      <div className="empleado-form-page">
        <div className="empleado-form-container">
          <p className="loading">Cargando datos del empleado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="empleado-form-page">
      <div className="empleado-form-container">
        <button
          className="back-button"
          onClick={() => navigate("/dashboard/empleados")}
          type="button"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <h2 className="page-title">Editar Empleado</h2>
        <p className="subtitle">
          Modificá los datos del empleado y guardá los cambios.
        </p>

        <form className="empleado-form" onSubmit={handleSubmit}>
          <div className="grid">
            <div className="field">
              <label>Usuario</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="usuario"
              />
            </div>

            <div className="field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@dominio.com"
              />
            </div>

            <div className="field">
              <label>Rol / Grupo</label>
              <select
                name="group_id"
                value={formData.group_id ?? ""}
                onChange={handleChange}
              >
                <option value="">Seleccioná un rol</option>
                {roles.map((g) => {
                  const gid = getId(g);
                  return (
                    <option key={`grp-${gid}`} value={gid}>
                      {g.name ?? g.nombre ?? `Grupo ${gid}`}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="field">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Apellido</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>DNI</label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Fecha de ingreso</label>
              <input
                type="date"
                name="fecha_ingreso"
                value={formData.fecha_ingreso}
                onChange={handleChange}
              />
            </div>

            <div className="field inline">
              <input
                id="is_active"
                type="checkbox"
                name="is_active"
                checked={!!formData.is_active}
                onChange={handleChange}
              />
              <label htmlFor="is_active">Activo</label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/dashboard/empleados")}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>

        <button
          type="button"
          className="btn-clean"
          onClick={handleCleanIncomplete}
          disabled={loading || incompleteEmployees.length === 0}
        >
          Limpiar Empleados Incompletos
        </button>
      </div>
    </div>
  );
};

export default EditEmployeeForm;
