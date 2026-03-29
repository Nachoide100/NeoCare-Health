import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header
      style={{
        width: "100%",
        background: "#0d6efd",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
        position: "sticky",
        top: 0,
        zIndex: 1000
      }}
    >
      <div
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          cursor: "pointer"
        }}
        onClick={() => navigate("/board")}
      >
        NeoCare Kanban
      </div>

      <nav style={{ display: "flex", gap: "20px", fontSize: "16px" }}>
        <Link to="/board" style={{ color: "white", textDecoration: "none" }}>
          Tablero
        </Link>

        <Link to="/report" style={{ color: "white", textDecoration: "none" }}>
          Informe semanal
        </Link>

        <Link to="/extras" style={{ color: "white", textDecoration: "none" }}>
          Extras
        </Link>
      </nav>

      <button
        onClick={handleLogout}
        style={{
          background: "white",
          color: "#0d6efd",
          border: "none",
          padding: "6px 12px",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Cerrar sesión
      </button>
    </header>
  );
};

export default Header;


