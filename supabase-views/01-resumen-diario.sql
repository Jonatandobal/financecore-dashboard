-- Vista: Resumen diario de los últimos 30 días
-- Esta vista calcula las ganancias y operaciones por día

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

-- Comentario: Esta vista muestra ganancias y operaciones diarias de los últimos 30 días
COMMENT ON VIEW resumen_diario_ultimos_30_dias IS 'Resumen diario de ganancias y operaciones de los últimos 30 días';
