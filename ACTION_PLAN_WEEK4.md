# PLAN DE ACCIÓN INMEDIATO — Semana 4, Cierre

## 🎯 Prioridad 1: CRÍTICO — Frontend "Mis Horas"

### Estado actual:
- ❌ NO EXISTE (probablemente)
- 📍 Necesaria para demo viernes

### Tareas:
1. **Crear componente `MyWorklogs.tsx`**
   - Ubicación: `frontend/src/components/MyWorklogs.tsx`
   - Props: ninguna (usa context/token para user_id)
   - Estado: worklogs[], loading, error, selectedWeek

2. **Funcionalidad**:
   - GET `/users/me/worklogs?week=YYYY-WW`
   - Mostrar semana actual por defecto
   - Selector de semanas (prev/next)
   - Tabla:
     ```
     | Tarjeta | Fecha | Horas | Nota | Acciones |
     | Card#1  | 12-23 | 2.5   | ... | Edit Del |
     ```
   - Totales:
     - Por día
     - Por semana

3. **Ruta en router**:
   - `/mis-horas` → MyWorklogs component
   - Agregar en menú principal (Navbar)

**Tiempo estimado: 2 horas**

---

## 🎯 Prioridad 2: Testing — Suite worklogs.py

### Ubicación:
`app/tests/test_worklogs.py`

### Casos (usar pytest):
```python
def test_create_worklog_valid():
    # POST /worklogs/ con horas > 0 → 201
    
def test_create_worklog_hours_zero():
    # POST /worklogs/ con horas=0 → 422 (validation error)
    
def test_edit_worklog_own():
    # PATCH /worklogs/{id} (propio) → 200
    
def test_edit_worklog_others():
    # PATCH /worklogs/{id} (ajeno) → 403
    
def test_delete_worklog_own():
    # DELETE /worklogs/{id} (propio) → 200
    
def test_delete_worklog_others():
    # DELETE /worklogs/{id} (ajeno) → 403
    
def test_query_by_week():
    # GET /users/me/worklogs?week=2025-52 → 200 + lista filtrada
```

**Tiempo estimado: 1.5 horas**

---

## 🎯 Prioridad 3: Frontend — Edición/Eliminación

### Componente existente:
Probable: `WorklogForm.tsx` (crear si no existe)

### Agregar:
1. **Modal de edición**:
   - Abre al clickear "Edit" en listado
   - Pre-rellena campos
   - PATCH al guardar

2. **Confirmación de eliminación**:
   - Modal: "¿Eliminar este registro?"
   - DELETE al confirmar

3. **Mensajes de error**:
   - Toast/Snackbar en cada acción
   - Mostrar errores del backend

**Tiempo estimado: 1.5 horas**

---

## 📋 Prioridad 4: Documentación Mínima

### README:
```markdown
### Worklogs (Timesheets)

**Modelo**:
- worklogs(id, card_id, user_id, date, hours, note)

**Endpoints**:
- POST /worklogs/ → Crear
- GET /worklogs/card/{id} → Por tarjeta
- GET /users/me/worklogs?week=YYYY-WW → Por semana
- PATCH /worklogs/{id} → Editar
- DELETE /worklogs/{id} → Eliminar

**Validaciones**:
- hours > 0
- note ≤ 200 chars
- Solo autor puede editar/eliminar
```

### Acta semanal:
- QA completado ✓
- Endpoints probados ✓
- Frontend "Mis horas" implementado ✓
- Seguridad validada ✓

**Tiempo estimado: 30 min**

---

## ⏱️ TIMELINE SUGERIDO

| Cuándo | Qué | Quién |
|--------|-----|-------|
| **Hoy/Mañana (24-25 dic)** | Prioridad 1 + 2 | Frontend dev + Backend dev |
| **26 dic** | Prioridad 3 + 4 | Frontend dev |
| **27 dic (viernes)** | QA final + Demo | Todo el equipo |

---

## ✅ CHECKLIST PARA DEMO VIERNES

- [ ] "Mis horas" muestra semana actual
- [ ] Selector de semana funciona
- [ ] Totales por día y semana correctos
- [ ] Editar una hora propia → cambio visible
- [ ] Intentar editar otra → rechazado (403)
- [ ] Eliminar propia con confirmación
- [ ] Mensajes de error mostrados
- [ ] README actualizado
- [ ] Tests ejecutándose sin fallos

---
