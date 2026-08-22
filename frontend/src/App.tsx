import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProveedoresPage from "./modules/proveedores/ProveedoresPage";
import PrivateRoute from "./components/layout/PrivateRoute";
import LoginPage from "./modules/auth/LoginPage";
import ComprasPage from "./modules/compras/ComprasPage";
import CompraForm from "./modules/compras/components/CompraForm";
import UsuariosPage from "./modules/usuarios/UsuariosPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/" element={
            <Layout>
              <ProveedoresPage />
            </Layout>
          } />
          <Route path="/compras" element={
            <Layout>
              <ComprasPage />
            </Layout>
          } />
          <Route path="/compras/nueva" element={
            <Layout>
              <CompraForm />
            </Layout>
          } />
          <Route path="/usuarios" element={
            <Layout>
              <UsuariosPage />
            </Layout>
          } />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;