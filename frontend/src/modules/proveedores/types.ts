export interface Proveedor {
  id: string;

  razonSocial: string;
  nit: string;

  ubicacion: string;
  telefono: string;
  email: string;
  descripcion: string;

  isActive: boolean;
}


export interface GetProveedoresData {
  getProveedores: Proveedor[];
}


export interface ProveedorFormData {
  razonSocial: string;
  nit: string;
  ubicacion: string;
  telefono: string;
  email: string;
  descripcion: string;
}