import { gql } from "@apollo/client";


export const GET_PROVEEDORES = gql`
  query GetProveedores {
    getProveedores {
      id
      razonSocial
      nit
      ubicacion
      telefono
      email
      descripcion
      isActive
    }
  }
`;


export const CREATE_PROVEEDOR = gql`
  mutation CreateProveedor(
    $data: CrearProveedorInput!
  ) {
    createProveedor(
      data: $data
    ) {
      id
      razonSocial
      nit
      ubicacion
      telefono
      email
      descripcion
      isActive
    }
  }
`;


export const UPDATE_PROVEEDOR = gql`
  mutation UpdateProveedor(
    $data: EditarProveedorInput!
  ) {
    updateProveedor(
      data: $data
    ) {
      id
      razonSocial
      nit
      ubicacion
      telefono
      email
      descripcion
      isActive
    }
  }
`;


export const DESACTIVAR_PROVEEDOR = gql`
  mutation DesactivarProveedor(
    $proveedorId: Int!
  ) {
    desactivarProveedor(
      proveedorId: $proveedorId
    ) {
      id
      razonSocial
      isActive
    }
  }
`;


export const REACTIVAR_PROVEEDOR = gql`
  mutation ReactivarProveedor(
    $proveedorId: Int!
  ) {
    reactivarProveedor(
      proveedorId: $proveedorId
    ) {
      id
      razonSocial
      isActive
    }
  }
`;

export const PROVEEDOR_CREADO_SUBSCRIPTION = gql`
  subscription ProveedorCreado {
    proveedoresActualizados
  }
`;