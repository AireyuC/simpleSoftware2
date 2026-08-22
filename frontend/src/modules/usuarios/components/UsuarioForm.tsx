import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { CREAR_USUARIO, ACTUALIZAR_USUARIO, GET_USUARIOS } from "../graphql";
import FormField from "../../../components/forms/FormField";
import type { Usuario } from "../UsuariosPage";

interface Props {
  usuarioEdit: Usuario | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function UsuarioForm({ usuarioEdit, onClose, onSuccess, onError }: Props) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    telefono: "",
    password: "",
    rol: "EMPLEADO"
  });

  const [crearUsuario, { loading: creando }] = useMutation(CREAR_USUARIO, {
    refetchQueries: [{ query: GET_USUARIOS }]
  });
  
  const [actualizarUsuario, { loading: actualizando }] = useMutation(ACTUALIZAR_USUARIO, {
    refetchQueries: [{ query: GET_USUARIOS }]
  });

  useEffect(() => {
    if (usuarioEdit) {
      setFormData({
        username: usuarioEdit.username || "",
        email: usuarioEdit.email || "",
        firstName: usuarioEdit.firstName || "",
        lastName: usuarioEdit.lastName || "",
        telefono: usuarioEdit.telefono || "",
        password: "", // Contraseña en blanco para editar
        rol: usuarioEdit.rol || "EMPLEADO"
      });
    }
  }, [usuarioEdit]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (usuarioEdit) {
        await actualizarUsuario({
          variables: {
            data: {
              usuarioId: parseInt(usuarioEdit.id),
              ...formData
            }
          }
        });
        onSuccess("Usuario actualizado correctamente.");
      } else {
        if (!formData.password) {
          throw new Error("Debe asignar una contraseña al nuevo usuario.");
        }
        await crearUsuario({
          variables: { data: formData }
        });
        onSuccess("Usuario creado correctamente.");
      }
    } catch (err: any) {
      onError(err.message || "Error al procesar la solicitud.");
    }
  };

  const isLoading = creando || actualizando;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px', width: '100%', margin: '40px auto', background: '#fff', padding: '20px', borderRadius: '8px' }}>
        <h2>{usuarioEdit ? "Editar Usuario" : "Nuevo Usuario"}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <FormField label="Nombre(s)" name="firstName" value={formData.firstName} onChange={handleChange} required />
            <FormField label="Apellidos" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <FormField label="Usuario (Login)" name="username" value={formData.username} onChange={handleChange} required />
            <div className="form-field">
              <label className="form-label">Rol</label>
              <select name="rol" className="form-input" value={formData.rol} onChange={handleChange} required>
                <option value="EMPLEADO">Empleado (Cajero)</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <FormField label="Correo (Opcional)" name="email" type="email" value={formData.email} onChange={handleChange} />
            <FormField label="Teléfono (Opcional)" name="telefono" value={formData.telefono} onChange={handleChange} />
          </div>

          <FormField 
            label={usuarioEdit ? "Nueva Contraseña (dejar en blanco para no cambiar)" : "Contraseña (Requerida)"}
            name="password" 
            type="password" 
            value={formData.password} 
            onChange={handleChange} 
            required={!usuarioEdit}
          />

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="button secondary" onClick={onClose} disabled={isLoading}>Cancelar</button>
            <button type="submit" className="button primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : (usuarioEdit ? 'Guardar Cambios' : 'Crear Usuario')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
