import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import FormField
  from "../../../components/forms/FormField";

import type {
  ProveedorFormData,
} from "../types";


interface ProveedorFormProps {
  initialData?: ProveedorFormData;

  editing?: boolean;

  loading?: boolean;

  onCancel: () => void;

  onSubmit: (
    data: ProveedorFormData
  ) => Promise<void> | void;
}


const EMPTY_FORM: ProveedorFormData = {
  razonSocial: "",
  nit: "",
  ubicacion: "",
  telefono: "",
  email: "",
  descripcion: "",
};


function ProveedorForm({
  initialData,
  editing = false,
  loading = false,
  onCancel,
  onSubmit,
}: ProveedorFormProps) {

  const [
    formulario,
    setFormulario,
  ] = useState<ProveedorFormData>(
    initialData ?? EMPTY_FORM
  );


  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    setFormulario(
      initialData ?? EMPTY_FORM
    );

    setError("");
  }, [initialData]);


  const handleChange = (
    event:
      ChangeEvent<
        HTMLInputElement |
        HTMLTextAreaElement
      >
  ) => {

    const {
      name,
      value,
    } = event.target;


    setFormulario(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };


  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setError("");


    if (
      !formulario.razonSocial.trim()
    ) {
      setError(
        "La razón social es obligatoria."
      );

      return;
    }


    if (
      !formulario.nit.trim()
    ) {
      setError(
        "El NIT es obligatorio."
      );

      return;
    }


    await onSubmit(formulario);
  };


  return (
    <section className="form-card">

      <div className="form-header">

        <div>
          <h2>
            {
              editing
                ? "Editar proveedor"
                : "Nuevo proveedor"
            }
          </h2>

          <p>
            {
              editing
                ? "Modifica la información del proveedor."
                : "Registra un nuevo proveedor."
            }
          </p>
        </div>


        <button
          type="button"
          className="close-button"
          onClick={onCancel}
        >
          ×
        </button>

      </div>


      {error && (
        <div className="alert error">
          {error}
        </div>
      )}


      <form
        onSubmit={
          handleSubmit
        }
      >

        <div className="form-grid">

          <FormField
            label="Razón social"
            name="razonSocial"
            value={
              formulario.razonSocial
            }
            onChange={handleChange}
            placeholder="Ej. Distribuidora Central"
            required
          />


          <FormField
            label="NIT"
            name="nit"
            value={
              formulario.nit
            }
            onChange={handleChange}
            placeholder="Ej. 123456789"
            required
          />


          <FormField
            label="Ubicación"
            name="ubicacion"
            value={
              formulario.ubicacion
            }
            onChange={handleChange}
            placeholder="Ej. La Paz"
          />


          <FormField
            label="Teléfono"
            name="telefono"
            value={
              formulario.telefono
            }
            onChange={handleChange}
            placeholder="Ej. 76543210"
          />


          <FormField
            label="Correo"
            name="email"
            type="email"
            value={
              formulario.email
            }
            onChange={handleChange}
            placeholder="ventas@empresa.com"
          />


          <div className="form-group full">
            <FormField
              label="Descripción"
              name="descripcion"
              type="textarea"
              value={
                formulario.descripcion
              }
              onChange={handleChange}
              placeholder="Información adicional"
            />
          </div>

        </div>


        <div className="form-actions">

          <button
            type="button"
            className="button secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>


          <button
            type="submit"
            className="button primary"
            disabled={loading}
          >
            {
              loading
                ? "Guardando..."
                : editing
                  ? "Guardar cambios"
                  : "Crear proveedor"
            }
          </button>

        </div>

      </form>

    </section>
  );
}


export default ProveedorForm;