import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_USUARIOS, CAMBIAR_ESTADO_USUARIO } from "./graphql";
import DataTable from "../../components/table/DataTable";
import type { Column } from "../../components/table/DataTable";
import UsuarioForm from "./components/UsuarioForm";

export interface Usuario {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  telefono: string;
  rol: string;
  isActive: boolean;
  isStaff: boolean;
}

export default function UsuariosPage() {
  const { data, loading, error, refetch } = useQuery<any>(GET_USUARIOS, {
    fetchPolicy: "cache-and-network"
  });

  const [cambiarEstado, { loading: toggling }] = useMutation(CAMBIAR_ESTADO_USUARIO, {
    refetchQueries: [{ query: GET_USUARIOS }]
  });

  const [mostrarForm, setMostrarForm] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const usuarios = data?.usuarios || [];

  const abrirNuevo = () => {
    setUsuarioEditando(null);
    setMensaje("");
    setErrorMsg("");
    setMostrarForm(true);
  };

  const abrirEditar = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setMensaje("");
    setErrorMsg("");
    setMostrarForm(true);
  };

  const cerrarForm = () => {
    setMostrarForm(false);
    setUsuarioEditando(null);
  };

  const handleToggleEstado = async (usuario: Usuario) => {
    if (window.confirm(`¿Seguro que deseas ${usuario.isActive ? 'desactivar' : 'activar'} al usuario ${usuario.username}?`)) {
      try {
        await cambiarEstado({ variables: { usuarioId: parseInt(usuario.id) } });
        setMensaje(`Usuario ${usuario.isActive ? 'desactivado' : 'activado'} exitosamente.`);
      } catch (err: any) {
        setErrorMsg(err.message || 'Error al cambiar estado.');
      }
    }
  };

  const columns: Column<Usuario>[] = [
    { key: "username", header: "Usuario", render: (u) => <strong>{u.username}</strong> },
    { key: "nombre", header: "Nombre Completo", render: (u) => `${u.firstName} ${u.lastName}` },
    { key: "rol", header: "Rol", render: (u) => u.rol },
    { key: "estado", header: "Estado", render: (u) => (
        <span className={u.isActive ? "status active" : "status inactive"}>
          {u.isActive ? "Activo" : "Inactivo"}
        </span>
    )},
    {
      key: "acciones",
      header: "Acciones",
      render: (u) => (
        <div className="row-actions">
          <button className="action-button edit" onClick={() => abrirEditar(u)}>Editar</button>
          <button 
            className={`action-button ${u.isActive ? 'danger' : 'success'}`} 
            onClick={() => handleToggleEstado(u)}
            disabled={toggling}
          >
            {u.isActive ? "Desactivar" : "Activar"}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Administra los roles y accesos al sistema.</p>
        </div>
        <div className="header-actions">
          <button className="button secondary" onClick={() => refetch()}>Actualizar</button>
          <button className="button primary" onClick={abrirNuevo}>+ Nuevo Usuario</button>
        </div>
      </div>

      {mensaje && <div className="alert success">{mensaje}</div>}
      {errorMsg && <div className="alert error">{errorMsg}</div>}

      {mostrarForm && (
        <UsuarioForm 
          usuarioEdit={usuarioEditando} 
          onClose={cerrarForm} 
          onSuccess={(msg) => { setMensaje(msg); cerrarForm(); }}
          onError={(msg) => setErrorMsg(msg)}
        />
      )}

      <div className="table-card">
        {error ? (
          <div className="error-text">Error al cargar usuarios: {error.message}</div>
        ) : (
          <DataTable
            data={usuarios}
            columns={columns}
            loading={loading}
            getRowKey={(u) => u.id}
            emptyMessage="No hay usuarios registrados."
          />
        )}
      </div>
    </div>
  );
}
