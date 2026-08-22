import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">
          M
        </div>

        <div>
          <strong>Minisoftware</strong>

          <span>
            Sistema de compras
          </span>
        </div>
      </div>

      <nav className="navbar-menu">
        <a
          href="#proveedores"
          className="nav-item active"
        >
          Proveedores
        </a>

        <span
          className="nav-item disabled"
          title="Módulo pendiente"
        >
          Compras
        </span>

        <span
          className="nav-item disabled"
          title="Módulo pendiente"
        >
          Usuarios
        </span>

        <button 
          onClick={handleLogout}
          className="button secondary"
          style={{ marginLeft: '15px' }}
        >
          Cerrar Sesión
        </button>
      </nav>
    </header>
  );
}


export default Navbar;