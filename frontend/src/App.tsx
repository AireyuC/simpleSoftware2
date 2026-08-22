import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProveedoresPage from "./modules/proveedores/ProveedoresPage";
import PrivateRoute from "./components/layout/PrivateRoute";
import LoginPage from "./modules/auth/LoginPage";

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
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;