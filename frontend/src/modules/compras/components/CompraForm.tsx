import { useState } from "react";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { GET_PROVEEDORES_ACTIVOS, CREAR_NOTA_CON_DETALLES, GET_NOTAS_COMPRA } from "../graphql";
import { PROVEEDOR_CREADO_SUBSCRIPTION } from "../../proveedores/graphql";
import FormField from "../../../components/forms/FormField";

interface DetalleRow {
  id: string; // id local para key
  proveedorId: string;
  cantidad: number | "";
  precioUnitario: string;
  glosa: string;
}

export default function CompraForm() {
  const navigate = useNavigate();
  const [descripcion, setDescripcion] = useState("");
  const [detalles, setDetalles] = useState<DetalleRow[]>([
    { id: Date.now().toString(), proveedorId: "", cantidad: 1, precioUnitario: "", glosa: "" }
  ]);

  const { data: provData, loading: provLoading, refetch: refetchProv } = useQuery<any>(GET_PROVEEDORES_ACTIVOS);
  const [crearNota, { loading: guardando, error: saveError }] = useMutation(CREAR_NOTA_CON_DETALLES, {
    refetchQueries: [{ query: GET_NOTAS_COMPRA }]
  });

  useSubscription(PROVEEDOR_CREADO_SUBSCRIPTION, {
    onData: () => {
      refetchProv();
    }
  });

  const proveedores = provData?.getProveedores || [];

  const handleAddRow = () => {
    setDetalles([
      ...detalles,
      { id: Date.now().toString(), proveedorId: "", cantidad: 1, precioUnitario: "", glosa: "" }
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (detalles.length > 1) {
      setDetalles(detalles.filter(d => d.id !== id));
    }
  };

  const handleChangeRow = (id: string, field: keyof DetalleRow, value: string | number) => {
    setDetalles(detalles.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) return alert("La descripción es obligatoria.");
    
    // Validación de detalles
    for (const d of detalles) {
      if (!d.proveedorId) return alert("Seleccione un proveedor en todos los detalles.");
      if (!d.cantidad || d.cantidad <= 0) return alert("La cantidad debe ser mayor a 0.");
      if (!d.precioUnitario || isNaN(Number(d.precioUnitario))) return alert("Precio unitario inválido.");
      if (!d.glosa.trim()) return alert("Debe rellenar la glosa en todos los detalles.");
    }

    try {
      // Como simplificación temporal para el form, usaremos usuario_id: 1 o lo sacaremos de algun lado. 
      // Idealmente el backend tomaría info del request.user en el middleware JWT, pero en CrearNotaConDetallesInput exige usuario_id.
      
      const detallesInput = detalles.map(d => ({
        proveedorId: parseInt(d.proveedorId),
        cantidad: Number(d.cantidad),
        precioUnitario: d.precioUnitario.toString(),
        glosa: d.glosa
      }));

      await crearNota({
        variables: {
          data: {
            descripcion,
            usuarioId: 1, // HARDCODED por ahora para demostración, se debe conectar al contexto auth.
            detalles: detallesInput
          }
        }
      });

      navigate("/compras");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Nueva Compra (Maestro-Detalle)</h1>
        <button className="button" onClick={() => navigate("/compras")}>Volver</button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <FormField
            label="Descripción General de la Compra"
            name="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            placeholder="Ej: Compra de insumos de Febrero"
          />

          <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Detalles de Compra</h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: '800px' }}>
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th>Cant.</th>
                  <th>Precio Unit.</th>
                  <th>Glosa / Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map(row => (
                  <tr key={row.id}>
                    <td>
                      <select 
                        className="form-input" 
                        value={row.proveedorId} 
                        onChange={(e) => handleChangeRow(row.id, 'proveedorId', e.target.value)}
                        required
                      >
                        <option value="">-- Seleccionar --</option>
                        {provLoading ? <option>Cargando...</option> : proveedores.map((p: any) => (
                          <option key={p.id} value={p.id}>{p.razonSocial}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={row.cantidad} 
                        onChange={(e) => handleChangeRow(row.id, 'cantidad', parseInt(e.target.value))}
                        min="1"
                        required
                        style={{ width: '80px' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="form-input" 
                        value={row.precioUnitario} 
                        onChange={(e) => handleChangeRow(row.id, 'precioUnitario', e.target.value)}
                        placeholder="0.00"
                        required
                        style={{ width: '120px' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={row.glosa} 
                        onChange={(e) => handleChangeRow(row.id, 'glosa', e.target.value)}
                        placeholder="Motivo o detalle..."
                        required
                      />
                    </td>
                    <td>
                      <button 
                        type="button" 
                        className="button secondary" 
                        onClick={() => handleRemoveRow(row.id)}
                        disabled={detalles.length === 1}
                      >
                        X
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
            <button type="button" className="button secondary" onClick={handleAddRow}>
              + Agregar Fila
            </button>
            <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
              Total Estimado: ${detalles.reduce((acc, row) => acc + (Number(row.cantidad) * Number(row.precioUnitario || 0)), 0).toFixed(2)}
            </div>
          </div>

          {saveError && (
            <div className="error-message" style={{ marginTop: '20px' }}>
              Error al guardar: {saveError.message}
            </div>
          )}

          <div style={{ marginTop: '30px', textAlign: 'right' }}>
            <button type="submit" className="button primary" disabled={guardando}>
              {guardando ? 'Guardando Transacción...' : 'Confirmar Compra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
