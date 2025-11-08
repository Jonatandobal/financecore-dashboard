# 📊 Vistas SQL para Supabase

Este directorio contiene las vistas SQL necesarias para que el dashboard funcione correctamente.

## 🚀 Instalación

### Paso 1: Acceder a Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** en el menú lateral

### Paso 2: Ejecutar los Scripts

Ejecuta los siguientes scripts **en orden**:

#### 1️⃣ Resumen Diario (01-resumen-diario.sql)

```sql
CREATE OR REPLACE VIEW resumen_diario_ultimos_30_dias AS
SELECT
  DATE(created_at) as dia,
  SUM(ganancia_bruta_usd) as ganancia_usd,
  COUNT(*) as operaciones
FROM
  operaciones_cambio
WHERE
  created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND estado = 'completada'
GROUP BY
  DATE(created_at)
ORDER BY
  dia ASC;
```

#### 2️⃣ Operaciones por Divisa (02-operaciones-por-divisa.sql)

```sql
CREATE OR REPLACE VIEW operaciones_por_divisa AS
SELECT
  CONCAT(divisa_entrada, '/', divisa_salida) as par_divisas,
  SUM(ganancia_bruta_usd) as ganancia_total_usd,
  COUNT(*) as total_operaciones,
  AVG(margen_porcentaje) as margen_promedio
FROM
  operaciones_cambio
WHERE
  estado = 'completada'
  AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY
  divisa_entrada,
  divisa_salida
ORDER BY
  ganancia_total_usd DESC;
```

### Paso 3: Verificar

Ejecuta estas consultas para verificar que las vistas funcionan:

```sql
-- Verificar resumen diario
SELECT * FROM resumen_diario_ultimos_30_dias LIMIT 10;

-- Verificar operaciones por divisa
SELECT * FROM operaciones_por_divisa LIMIT 10;
```

## 📋 Descripción de las Vistas

### `resumen_diario_ultimos_30_dias`

**Propósito**: Calcula ganancias y operaciones diarias de los últimos 30 días

**Columnas**:
- `dia`: Fecha del día
- `ganancia_usd`: Suma de ganancias del día
- `operaciones`: Cantidad de operaciones completadas

**Usado en**: Gráfico de línea en el Dashboard principal

---

### `operaciones_por_divisa`

**Propósito**: Agrupa ganancias por par de divisas del mes actual

**Columnas**:
- `par_divisas`: Par de divisas (ej: "USD/ARS")
- `ganancia_total_usd`: Suma de ganancias del par
- `total_operaciones`: Cantidad de operaciones
- `margen_promedio`: Margen promedio del par

**Usado en**: Gráfico de dona en el Dashboard principal

## ⚠️ Troubleshooting

### Error: "relation does not exist"

Si ves este error, verifica que:
1. La tabla `operaciones_cambio` existe
2. Tienes permisos para crear vistas
3. Ejecutaste el script completo

### Error: "column does not exist"

Verifica que la tabla `operaciones_cambio` tenga estas columnas:
- `created_at`
- `ganancia_bruta_usd`
- `estado`
- `divisa_entrada`
- `divisa_salida`
- `margen_porcentaje`

## 🔄 Actualización

Si necesitas actualizar las vistas, simplemente ejecuta los scripts nuevamente. El `CREATE OR REPLACE VIEW` reemplazará la vista existente.

## 💡 Notas

- Estas vistas se actualizan automáticamente cuando cambian los datos
- No ocupan espacio adicional en la base de datos
- Son más rápidas que hacer las agregaciones en el cliente
