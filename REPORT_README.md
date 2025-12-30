# Informe Semanal — Consultas y Guía

Este documento resume las consultas SQL usadas por los endpoints de `report`, recomendaciones de índices, y ejemplos de respuesta.

## Rango semanal
Frontend envía `week=YYYY-WW` (ISO week). Backend convierte con `date.fromisocalendar(year, week, day)`:
- inicio = lunes (day=1)
- fin = domingo (day=7)

## Índices recomendados
- `CREATE INDEX ix_worklogs_card_id ON worklogs(card_id);`
- `CREATE INDEX ix_worklogs_user_id ON worklogs(user_id);`
- `CREATE INDEX ix_cards_board_id ON cards(board_id);`
- `CREATE INDEX ix_cards_list_id ON cards(list_id);`

Estos índices aceleran las agrupaciones y filtros por tarjeta/usuario/tablero.

## Query: Summary (completadas, vencidas, nuevas)
-- Parámetros: :board_id, :start_date, :end_date (start_date = lunes, end_date = domingo)

-- Completadas (lista "Hecho", updated_at en rango)
SELECT COUNT(c.id) AS completed_count
FROM cards c
JOIN lists l ON c.list_id = l.id
WHERE l.board_id = :board_id
  AND LOWER(l.title) = 'hecho'
  AND c.updated_at BETWEEN :start_dt AND :end_dt;

-- Vencidas (due_date en rango y lista != 'Hecho')
SELECT COUNT(c.id) AS overdue_count
FROM cards c
LEFT JOIN lists l ON c.list_id = l.id
WHERE c.board_id = :board_id
  AND (l.title IS NULL OR LOWER(l.title) <> 'hecho')
  AND c.due_date BETWEEN :start_date AND :end_date;

-- Nuevas (created_at en rango)
SELECT COUNT(c.id) AS new_count
FROM cards c
WHERE c.board_id = :board_id
  AND c.created_at BETWEEN :start_dt AND :end_dt;

## Query: Hours by user
-- Agrupa worklogs por user_id dentro del board
SELECT w.user_id,
       COALESCE(SUM(w.hours),0) AS total_hours,
       COUNT(DISTINCT w.card_id) AS tasks_count
FROM worklogs w
JOIN cards c ON w.card_id = c.id
WHERE c.board_id = :board_id
  AND w.date BETWEEN :start_date AND :end_date
GROUP BY w.user_id
ORDER BY total_hours DESC;

## Query: Hours by card
SELECT c.id AS card_id,
       c.title,
       c.user_id AS responsible_id,
       l.title AS state,
       COALESCE(SUM(w.hours),0) AS total_hours
FROM cards c
LEFT JOIN worklogs w ON w.card_id = c.id AND w.date BETWEEN :start_date AND :end_date
LEFT JOIN lists l ON c.list_id = l.id
WHERE c.board_id = :board_id
GROUP BY c.id, c.title, c.user_id, l.title
ORDER BY total_hours DESC;

## Casos límite y validaciones
- Semana sin datos: devolver arrays vacíos y contadores a 0.
- Tarjetas sin responsable: `responsible` puede ser `NULL`.
- Tarjetas sin horas: `total_hours` debe ser 0.

## Ejemplo de respuesta `GET /report/{board_id}/summary?week=2025-52`
{
  "week": "2025-52",
  "start_date": "2025-12-22",
  "end_date": "2025-12-28",
  "completed": {"count": 5, "items": [...]},
  "overdue": {"count": 2, "items": [...]},
  "new": {"count": 3, "items": [...]}
}

## Cómo construir `week` en frontend
HTML `<input type="week">` devuelve `YYYY-Www` (ej. `2025-W52`). Convertir a `YYYY-52` antes de enviar.
