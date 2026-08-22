import { useNavigate, Link, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

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
        <Link
          to="/"
          className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
        >
          Proveedores
        </Link>

        <Link
          to="/compras"
          className={`nav-item ${location.pathname.startsWith('/compras') ? 'active' : ''}`}
        >
          Compras
        </Link>

        <Link
          to="/usuarios"
          className={`nav-item ${location.pathname.startsWith('/usuarios') ? 'active' : ''}`}
        >
          Usuarios
        </Link>

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