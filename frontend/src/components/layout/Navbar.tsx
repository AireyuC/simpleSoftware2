function Navbar() {
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
      </nav>
    </header>
  );
}


export default Navbar;