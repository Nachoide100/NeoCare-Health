Informe Semanal — Resumen rápido

Este fichero resume de forma breve los endpoints disponibles para el Informe Semanal y remite a REPORT_README.md para consultas SQL y ejemplos extendidos.

Endpoints:

- `GET /report/{board_id}/summary?week=YYYY-WW`
  - Retorna contador y listas cortas de tareas completadas, vencidas y nuevas.

- `GET /report/{board_id}/hours-by-user?week=YYYY-WW`
  - Retorna `user_id`, `total_hours`, `tasks_count`.

- `GET /report/{board_id}/hours-by-card?week=YYYY-WW&order_desc=true`
  - Retorna `card_id`, `title`, `responsible`, `state`, `total_hours`.

Notas:
- El formato `week` debe ser `YYYY-WW` (ISO week). El frontend puede usar `input type="week"` y convertir `YYYY-Www` → `YYYY-WW`.
- Recomendaciones de índices y consultas completas: [REPORT_README.md](../REPORT_README.md)
