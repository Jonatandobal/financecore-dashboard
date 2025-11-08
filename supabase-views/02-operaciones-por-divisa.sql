-- Vista: Ganancias totales por par de divisas
-- Esta vista agrupa las ganancias por cada par de divisas operado

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

-- Comentario: Esta vista muestra ganancias por par de divisas del mes actual
COMMENT ON VIEW operaciones_por_divisa IS 'Ganancias totales agrupadas por par de divisas del mes actual';
