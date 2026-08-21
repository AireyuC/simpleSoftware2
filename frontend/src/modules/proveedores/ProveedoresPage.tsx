import {
  useMutation,
  useQuery,
} from "@apollo/client/react";

import {
  useState,
} from "react";

import DataTable, {
  type Column,
} from "../../components/table/DataTable";

import ProveedorForm
  from "./components/ProveedorForm";

import {
  CREATE_PROVEEDOR,
  DESACTIVAR_PROVEEDOR,
  GET_PROVEEDORES,
  REACTIVAR_PROVEEDOR,
  UPDATE_PROVEEDOR,
} from "./graphql";

import type {
  GetProveedoresData,
  Proveedor,
  ProveedorFormData,
} from "./types";


function ProveedoresPage() {

  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false);


  const [
    proveedorEditando,
    setProveedorEditando,
  ] = useState<Proveedor | null>(
    null
  );


  const [
    mensaje,
    setMensaje,
  ] = useState("");


  const [
    errorAccion,
    setErrorAccion,
  ] = useState("");


  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery<GetProveedoresData>(
    GET_PROVEEDORES
  );


  const [
    createProveedor,
    {
      loading: creando,
    },
  ] = useMutation(
    CREATE_PROVEEDOR,
    {
      refetchQueries: [
        GET_PROVEEDORES,
      ],
      awaitRefetchQueries: true,
    }
  );


  const [
    updateProveedor,
    {
      loading: actualizando,
    },
  ] = useMutation(
    UPDATE_PROVEEDOR,
    {
      refetchQueries: [
        GET_PROVEEDORES,
      ],
      awaitRefetchQueries: true,
    }
  );


  const [
    desactivarProveedor,
    {
      loading: desactivando,
    },
  ] = useMutation(
    DESACTIVAR_PROVEEDOR,
    {
      refetchQueries: [
        GET_PROVEEDORES,
      ],
    }
  );


  const [
    reactivarProveedor,
    {
      loading: reactivando,
    },
  ] = useMutation(
    REACTIVAR_PROVEEDOR,
    {
      refetchQueries: [
        GET_PROVEEDORES,
      ],
    }
  );


  const proveedores =
    data?.getProveedores ?? [];


  const procesando =
    creando ||
    actualizando ||
    desactivando ||
    reactivando;


  const limpiarMensajes = () => {
    setMensaje("");
    setErrorAccion("");
  };


  const abrirNuevo = () => {
    limpiarMensajes();

    setProveedorEditando(null);

    setMostrarFormulario(true);
  };


  const abrirEditar = (
    proveedor: Proveedor
  ) => {
    limpiarMensajes();

    setProveedorEditando(
      proveedor
    );

    setMostrarFormulario(true);
  };


  const cerrarFormulario = () => {
    setMostrarFormulario(false);

    setProveedorEditando(null);
  };


  const guardarProveedor = async (
    form: ProveedorFormData
  ) => {

    limpiarMensajes();


    try {

      if (proveedorEditando) {

        await updateProveedor({
          variables: {
            data: {
              proveedorId:
                Number(
                  proveedorEditando.id
                ),

              ...form,
            },
          },
        });


        setMensaje(
          "Proveedor actualizado correctamente."
        );

      } else {

        await createProveedor({
          variables: {
            data: form,
          },
        });


        setMensaje(
          "Proveedor creado correctamente."
        );
      }


      cerrarFormulario();

    } catch (error) {

      if (error instanceof Error) {

        setErrorAccion(
          error.message
        );

      } else {

        setErrorAccion(
          "Ocurrió un error inesperado."
        );
      }
    }
  };


  const cambiarEstado = async (
    proveedor: Proveedor
  ) => {

    limpiarMensajes();


    try {

      if (proveedor.isActive) {

        const confirmar =
          window.confirm(
            `¿Desactivar a "${proveedor.razonSocial}"?`
          );


        if (!confirmar) {
          return;
        }


        await desactivarProveedor({
          variables: {
            proveedorId:
              Number(proveedor.id),
          },
        });


        setMensaje(
          "Proveedor desactivado correctamente."
        );

      } else {

        await reactivarProveedor({
          variables: {
            proveedorId:
              Number(proveedor.id),
          },
        });


        setMensaje(
          "Proveedor reactivado correctamente."
        );
      }

    } catch (error) {

      if (error instanceof Error) {

        setErrorAccion(
          error.message
        );
      }
    }
  };


  const columns:
    Column<Proveedor>[] = [

      {
        key: "id",
        header: "ID",

        render: (
          proveedor
        ) => proveedor.id,
      },

      {
        key: "razonSocial",
        header: "Razón social",

        render: (
          proveedor
        ) => (
          <strong>
            {
              proveedor.razonSocial
            }
          </strong>
        ),
      },

      {
        key: "nit",
        header: "NIT",

        render: (
          proveedor
        ) => proveedor.nit,
      },

      {
        key: "ubicacion",
        header: "Ubicación",

        render: (
          proveedor
        ) =>
          proveedor.ubicacion ||
          "-",
      },

      {
        key: "telefono",
        header: "Teléfono",

        render: (
          proveedor
        ) =>
          proveedor.telefono ||
          "-",
      },

      {
        key: "estado",
        header: "Estado",

        render: (
          proveedor
        ) => (

          <span
            className={
              proveedor.isActive
                ? "status active"
                : "status inactive"
            }
          >
            {
              proveedor.isActive
                ? "Activo"
                : "Inactivo"
            }
          </span>

        ),
      },

      {
        key: "acciones",
        header: "Acciones",

        render: (
          proveedor
        ) => (

          <div className="row-actions">

            <button
              type="button"
              className="action-button edit"
              onClick={() =>
                abrirEditar(
                  proveedor
                )
              }
            >
              Editar
            </button>


            <button
              type="button"
              disabled={procesando}
              className={
                proveedor.isActive
                  ? "action-button danger"
                  : "action-button success"
              }
              onClick={() =>
                cambiarEstado(
                  proveedor
                )
              }
            >
              {
                proveedor.isActive
                  ? "Desactivar"
                  : "Reactivar"
              }
            </button>

          </div>

        ),
      },

    ];


  return (
    <main
      id="proveedores"
      className="container"
    >

      <div className="page-header">

        <div>

          <span className="page-eyebrow">
            Gestión
          </span>

          <h1>
            Proveedores
          </h1>

          <p>
            Consulta, registra y administra
            los proveedores del sistema.
          </p>

        </div>


        <div className="header-actions">

          <button
            type="button"
            className="button secondary"
            onClick={() =>
              refetch()
            }
          >
            Actualizar
          </button>


          <button
            type="button"
            className="button primary"
            onClick={abrirNuevo}
          >
            + Nuevo proveedor
          </button>

        </div>

      </div>


      {mensaje && (
        <div className="alert success">
          {mensaje}
        </div>
      )}


      {errorAccion && (
        <div className="alert error">
          {errorAccion}
        </div>
      )}


      {mostrarFormulario && (

        <ProveedorForm
          editing={
            proveedorEditando !== null
          }

          initialData={
            proveedorEditando
              ? {
                  razonSocial:
                    proveedorEditando
                      .razonSocial,

                  nit:
                    proveedorEditando
                      .nit,

                  ubicacion:
                    proveedorEditando
                      .ubicacion,

                  telefono:
                    proveedorEditando
                      .telefono,

                  email:
                    proveedorEditando
                      .email,

                  descripcion:
                    proveedorEditando
                      .descripcion,
                }
              : undefined
          }

          loading={
            creando ||
            actualizando
          }

          onCancel={
            cerrarFormulario
          }

          onSubmit={
            guardarProveedor
          }
        />

      )}


      <section className="table-card">

        {error ? (

          <div className="empty-state error-text">
            Error al cargar proveedores:
            {" "}
            {error.message}
          </div>

        ) : (

          <DataTable
            data={proveedores}
            columns={columns}
            loading={loading}
            getRowKey={
              (
                proveedor
              ) => proveedor.id
            }
            emptyMessage="No existen proveedores registrados."
          />

        )}

      </section>

    </main>
  );
}


export default ProveedoresPage;