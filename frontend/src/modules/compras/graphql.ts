import { gql } from "@apollo/client";

export const GET_NOTAS_COMPRA = gql`
  query GetNotasCompra {
    notasCompra {
      id
      descripcion
      total
      fechaEmision
      estado
      usuario {
        username
      }
    }
  }
`;

export const GET_PROVEEDORES_ACTIVOS = gql`
  query GetProveedoresActivos {
    getProveedores {
      id
      razonSocial
      nit
      isActive
    }
  }
`;

export const CREAR_NOTA_CON_DETALLES = gql`
  mutation CrearNotaConDetalles($data: CrearNotaConDetallesInput!) {
    crearNotaConDetalles(data: $data) {
      id
      descripcion
      total
      estado
    }
  }
`;
