import React, { useEffect, useState } from "react";

const Report: React.FC = () => {
  const boardId = 1;

  // Semana seleccionada (YYYY-WW)
  const [week, setWeek] = useState("");

  // Datos del backend
  const [summary, setSummary] = useState<any>(null);
  const [hoursByUser, setHoursByUser] = useState<any[]>([]);
  const [hoursByCard, setHoursByCard] = useState<any[]>([]);

  // Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ⭐ Validar semana ISO (evita semanas inexistentes)
  const isValidISOWeek = (weekStr: string) => {
    try {
      const [yearStr, weekPart] = weekStr.split("-W");
      const year = Number(yearStr);
      const week = Number(weekPart);

      const test = new Date(Date.UTC(year, 0, 4));
      const day = test.getUTCDay() || 7;
      test.setUTCDate(test.getUTCDate() - day + 1 + (week - 1) * 7);

      return test.getUTCFullYear() === year;
    } catch {
      return false;
    }
  };

  // ⭐ Calcular semana actual ISO (lunes–domingo)
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();

    const temp = new Date(now.valueOf());
    const dayNumber = (now.getDay() + 6) % 7;
    temp.setDate(temp.getDate() - dayNumber + 3);
    const firstThursday = new Date(temp.getFullYear(), 0, 4);
    const weekNumber =
      1 +
      Math.round(
        ((temp.getTime() - firstThursday.getTime()) / 86400000 - 3) / 7
      );

    const formatted = `${year}-W${String(weekNumber).padStart(2, "0")}`;

    if (isValidISOWeek(formatted)) {
      setWeek(formatted);
    }
  }, []);

  // ⭐ Cargar datos cuando cambie la semana
  useEffect(() => {
    if (!week) return;
    loadReport();
  }, [week]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const [summaryRes, usersRes, cardsRes] = await Promise.all([
        fetch(`http://localhost:8000/report/${boardId}/summary?week=${week}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `http://localhost:8000/report/${boardId}/hours-by-user?week=${week}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        fetch(
          `http://localhost:8000/report/${boardId}/hours-by-card?week=${week}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      if (!summaryRes.ok || !usersRes.ok || !cardsRes.ok) {
        const err = await summaryRes.json().catch(() => null);
        throw new Error(err?.detail || "Error en el servidor");
      }

      setSummary(await summaryRes.json());
      const usersData = await usersRes.json();
      const cardsData = await cardsRes.json();

      setHoursByUser(usersData.data || []);
      setHoursByCard(cardsData.data || []);
    } catch (err: any) {
      setError(err.message || "No se pudo cargar el informe semanal.");
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Exportación CSV genérica
  const exportToCSV = (filename: string, rows: any[]) => {
    if (!rows || rows.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const separator = ",";
    const keys = Object.keys(rows[0]);

    const csvContent =
      keys.join(separator) +
      "\n" +
      rows
        .map((row) =>
          keys
            .map((k) => {
              const value = row[k] ?? "";
              return `"${String(value).replace(/"/g, '""')}"`;
            })
            .join(separator)
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ⭐ Exportar horas por persona
  const exportUsersCSV = () => {
    exportToCSV("horas_por_persona.csv", hoursByUser);
  };

  // ⭐ Exportar horas por tarjeta
  const exportCardsCSV = () => {
    exportToCSV("horas_por_tarjeta.csv", hoursByCard);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Informe semanal</h1>

      {/* Selector de semana */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ fontWeight: "bold" }}>Seleccionar semana:</label>
        <input
          type="week"
          value={week}
          onChange={(e) => {
            const newWeek = e.target.value;

            if (!isValidISOWeek(newWeek)) {
              setError("La semana seleccionada no existe en el calendario ISO.");
              return;
            }

            setError("");
            setWeek(newWeek);
          }}
          style={{ marginLeft: "1rem", padding: "0.3rem" }}
        />
      </div>

      {/* Estados */}
      {loading && <p>Cargando datos...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ⭐ Bloque 1: Resumen */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Resumen de la semana</h2>

        {!summary ? (
          <p>Sin datos para esta semana.</p>
        ) : (
          <div style={{ display: "flex", gap: "2rem" }}>
            <div>
              <h3 style={{ color: "green" }}>Completadas</h3>
              <p>{summary.completed?.count ?? 0}</p>
            </div>

            <div>
              <h3 style={{ color: "red" }}>Vencidas</h3>
              <p>{summary.overdue?.count ?? 0}</p>
            </div>

            <div>
              <h3 style={{ color: "blue" }}>Nuevas</h3>
              <p>{summary.new?.count ?? 0}</p>
            </div>
          </div>
        )}
      </section>

      {/* ⭐ Bloque 2: Horas por persona */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Horas por persona</h2>

        {hoursByUser.length === 0 ? (
          <p>No hay horas registradas esta semana.</p>
        ) : (
          <table border={1} cellPadding={8}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Total horas</th>
                <th>Nº tareas</th>
              </tr>
            </thead>
            <tbody>
              {hoursByUser.map((u) => (
                <tr key={u.user_id}>
                  <td>{u.user_id}</td>
                  <td>{u.user_email}</td>
                  <td>{u.total_hours}</td>
                  <td>{u.tasks_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ⭐ Bloque 3: Horas por tarjeta */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Horas por tarjeta</h2>

        {hoursByCard.length === 0 ? (
          <p>No hay horas registradas esta semana.</p>
        ) : (
          <table border={1} cellPadding={8}>
            <thead>
              <tr>
                <th>Título</th>
                <th>Responsable</th>
                <th>Estado</th>
                <th>Total horas</th>
              </tr>
            </thead>
            <tbody>
              {hoursByCard.map((c) => (
                <tr key={c.card_id}>
                  <td>{c.title}</td>
                  <td>{c.responsible}</td>
                  <td>{c.status}</td>
                  <td>{c.total_hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ⭐ Bloque 4: Exportación CSV */}
      <section>
        <h2>Exportación</h2>

        <button
          onClick={exportUsersCSV}
          style={{ marginRight: "1rem" }}
        >
          Exportar horas por persona (CSV)
        </button>

        <button onClick={exportCardsCSV}>
          Exportar horas por tarjeta (CSV)
        </button>
      </section>
    </div>
  );
};

export default Report;




