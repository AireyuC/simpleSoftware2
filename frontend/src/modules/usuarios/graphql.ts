import { gql } from "@apollo/client";

export const GET_USUARIOS = gql`
  query GetUsuarios {
    usuarios {
      id
      username
      email
      firstName
      lastName
      telefono
      rol
      isActive
      isStaff
    }
  }
`;

export const CREAR_USUARIO = gql`
  mutation CrearUsuario($data: UsuarioInput!) {
    crearUsuario(data: $data) {
      id
      username
    }
  }
`;

export const ACTUALIZAR_USUARIO = gql`
  mutation ActualizarUsuario($data: UsuarioUpdateInput!) {
    actualizarUsuario(data: $data) {
      id
      username
    }
  }
`;

export const CAMBIAR_ESTADO_USUARIO = gql`
  mutation CambiarEstadoUsuario($usuarioId: Int!) {
    cambiarEstadoUsuario(usuarioId: $usuarioId) {
      id
      isActive
    }
  }
`;
