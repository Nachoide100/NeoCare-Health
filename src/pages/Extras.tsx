import React from "react";

const Extras: React.FC = () => {
  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem" }}>Extras (Semana 6)</h1>

      <p style={{ fontSize: "17px", marginBottom: "2rem" }}>
        Aquí encontrarás funcionalidades adicionales que mejoran la productividad
        y la experiencia de usuario. Estas extensiones no forman parte del core,
        pero aportan valor real al flujo de trabajo de NeoCare.
      </p>

      {/* Bloque 1: Etiquetas */}
      <section
        style={{
          background: "#f8f9fa",
          padding: "1.5rem",
          borderRadius: "10px",
          marginBottom: "1.5rem",
          border: "1px solid #e0e0e0"
        }}
      >
        <h2 style={{ marginBottom: "0.5rem" }}>1. Etiquetas (Labels)</h2>
        <p style={{ marginBottom: "1rem" }}>
          Añade etiquetas de colores a las tarjetas para priorizar y clasificar.
        </p>

        <div style={{ display: "flex", gap: "10px" }}>
          <span
            style={{
              background: "#dc3545",
              color: "white",
              padding: "6px 12px",
              borderRadius: "6px"
            }}
          >
            Urgente
          </span>
          <span
            style={{
              background: "#ffc107",
              color: "black",
              padding: "6px 12px",
              borderRadius: "6px"
            }}
          >
            Dependencia externa
          </span>
          <span
            style={{
              background: "#0d6efd",
              color: "white",
              padding: "6px 12px",
              borderRadius: "6px"
            }}
          >
            IA
          </span>
          <span
            style={{
              background: "#198754",
              color: "white",
              padding: "6px 12px",
              borderRadius: "6px"
            }}
          >
            QA pendiente
          </span>
        </div>
      </section>

      {/* Bloque 2: Checklist */}
      <section
        style={{
          background: "#f8f9fa",
          padding: "1.5rem",
          borderRadius: "10px",
          marginBottom: "1.5rem",
          border: "1px solid #e0e0e0"
        }}
      >
        <h2 style={{ marginBottom: "0.5rem" }}>2. Checklist</h2>
        <p style={{ marginBottom: "1rem" }}>
          Convierte una tarjeta en un mini-proyecto con subtareas.
        </p>

        <ul style={{ lineHeight: "1.8" }}>
          <li>➕ Añadir ítems</li>
          <li>✔ Marcar como completado</li>
          <li>📊 Mostrar progreso (%)</li>
        </ul>
      </section>

      {/* Bloque 3: Búsqueda global */}
      <section
        style={{
          background: "#f8f9fa",
          padding: "1.5rem",
          borderRadius: "10px",
          marginBottom: "1.5rem",
          border: "1px solid #e0e0e0"
        }}
      >
        <h2 style={{ marginBottom: "0.5rem" }}>3. Búsqueda global</h2>
        <p style={{ marginBottom: "1rem" }}>
          Encuentra tarjetas por título o descripción al instante.
        </p>

        <input
          type="text"
          placeholder="Buscar tarjetas..."
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
          disabled
        />

        <p style={{ marginTop: "0.5rem", color: "#6c757d" }}>
          (UI lista — funcionalidad se activa cuando implementes el endpoint)
        </p>
      </section>

      {/* Bloque 4: Filtro por responsable */}
      <section
        style={{
          background: "#f8f9fa",
          padding: "1.5rem",
          borderRadius: "10px",
          marginBottom: "1.5rem",
          border: "1px solid #e0e0e0"
        }}
      >
        <h2 style={{ marginBottom: "0.5rem" }}>4. Filtro por responsable</h2>
        <p style={{ marginBottom: "1rem" }}>
          Filtra tarjetas por usuario del equipo.
        </p>

        <select
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
          disabled
        >
          <option>Seleccionar responsable...</option>
        </select>

        <p style={{ marginTop: "0.5rem", color: "#6c757d" }}>
          (UI lista — funcionalidad se activa cuando implementes el endpoint)
        </p>
      </section>

      {/* Bloque 5: Mejoras visuales */}
      <section
        style={{
          background: "#f8f9fa",
          padding: "1.5rem",
          borderRadius: "10px",
          border: "1px solid #e0e0e0"
        }}
      >
        <h2 style={{ marginBottom: "0.5rem" }}>5. Mejoras visuales</h2>
        <p>
          Animaciones, transiciones suaves y una experiencia más fluida en el
          tablero.
        </p>
      </section>
    </div>
  );
};

export default Extras;
