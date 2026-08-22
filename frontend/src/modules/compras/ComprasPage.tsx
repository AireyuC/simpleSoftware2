import { useQuery } from "@apollo/client/react";
import { Link } from "react-router-dom";
import { GET_NOTAS_COMPRA } from "./graphql";
import DataTable from "../../components/table/DataTable";
import type { Column } from "../../components/table/DataTable";

interface NotaCompra {
  id: string;
  descripcion: string;
  total: string;
  fechaEmision: string;
  estado: string;
  usuario: {
    username: string;
  };
}

export default function ComprasPage() {
  const { data, loading, error } = useQuery<any>(GET_NOTAS_COMPRA, {
    fetchPolicy: "cache-and-network",
  });

  const columns: Column<NotaCompra>[] = [
    {
      key: "id",
      header: "ID",
      render: (item) => `#${item.id}`,
    },
    {
      key: "descripcion",
      header: "Descripción",
      render: (item) => item.descripcion,
    },
    {
      key: "fecha",
      header: "Fecha",
      render: (item) => new Date(item.fechaEmision).toLocaleDateString(),
    },
    {
      key: "usuario",
      header: "Comprador",
      render: (item) => item.usuario.username,
    },
    {
      key: "total",
      header: "Total",
      render: (item) => `$${item.total}`,
    },
    {
      key: "estado",
      header: "Estado",
      render: (item) => (
        <span className={`badge ${item.estado.toLowerCase()}`}>
          {item.estado}
        </span>
      ),
    },
  ];

  if (error) {
    return <div className="error-message">Error al cargar compras: {error.message}</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Compras</h1>
        <Link to="/compras/nueva" className="button primary">
          + Nueva Compra
        </Link>
      </div>

      <div className="card">
        <DataTable
          data={data?.notasCompra || []}
          columns={columns}
          getRowKey={(item) => item.id}
          loading={loading}
          emptyMessage="No hay compras registradas aún."
        />
      </div>
    </div>
  );
}
