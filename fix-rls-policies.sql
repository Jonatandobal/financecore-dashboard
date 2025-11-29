-- =====================================================
-- FIX: Corregir políticas RLS para evitar recursión infinita
-- =====================================================
-- Este script corrige el problema de "infinite recursion detected in policy for relation perfiles"
-- Ejecutar en Supabase SQL Editor

-- 1. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES DE PERFILES
-- =====================================================
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.perfiles;
DROP POLICY IF EXISTS "Managers pueden ver todos los perfiles" ON public.perfiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.perfiles;
DROP POLICY IF EXISTS "Managers pueden crear perfiles" ON public.perfiles;
DROP POLICY IF EXISTS "Managers pueden actualizar perfiles" ON public.perfiles;
DROP POLICY IF EXISTS "Managers pueden eliminar perfiles" ON public.perfiles;

-- 2. ELIMINAR FUNCIÓN is_manager() ANTERIOR (si existe)
-- =====================================================
DROP FUNCTION IF EXISTS is_manager();

-- 3. CREAR FUNCIÓN PARA OBTENER ROL SIN RECURSIÓN RLS
-- =====================================================
-- Esta función usa SECURITY DEFINER para bypassear RLS y evitar recursión
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT rol INTO user_role
  FROM public.perfiles
  WHERE id = user_id;

  RETURN COALESCE(user_role, 'usuario');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 4. CREAR FUNCIÓN is_manager() QUE USA LA FUNCIÓN ANTERIOR
-- =====================================================
CREATE OR REPLACE FUNCTION is_manager()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role(auth.uid()) = 'manager';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 5. RECREAR POLÍTICAS DE SEGURIDAD PARA PERFILES (SIN RECURSIÓN)
-- =====================================================

-- Política SELECT: Usuarios ven su perfil, managers ven todos
-- Usa is_manager() que tiene SECURITY DEFINER y bypasea RLS
CREATE POLICY "Ver perfiles según rol"
  ON public.perfiles
  FOR SELECT
  USING (
    auth.uid() = id  -- Usuario ve su propio perfil
    OR
    is_manager()  -- O es manager (usa función SECURITY DEFINER)
  );

-- Política INSERT: Permitir a usuarios autenticados crear su propio perfil
-- y a managers crear cualquier perfil
CREATE POLICY "Crear propio perfil o manager puede crear"
  ON public.perfiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id  -- Usuario crea su propio perfil
    OR
    is_manager()  -- O es manager
  );

-- Política UPDATE: Usuarios actualizan su perfil, managers actualizan cualquiera
CREATE POLICY "Actualizar perfil según permisos"
  ON public.perfiles
  FOR UPDATE
  USING (
    auth.uid() = id  -- Usuario actualiza su propio perfil
    OR
    is_manager()  -- O es manager
  )
  WITH CHECK (
    auth.uid() = id  -- Usuario actualiza su propio perfil
    OR
    is_manager()  -- O es manager
  );

-- Política DELETE: Solo managers pueden eliminar
CREATE POLICY "Solo managers pueden eliminar perfiles"
  ON public.perfiles
  FOR DELETE
  USING (
    is_manager()  -- Solo managers
  );

-- 6. ACTUALIZAR FUNCIÓN DE CREACIÓN DE PERFIL
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, email, nombre_completo, telefono, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'telefono', NULL),
    'usuario' -- Forzar siempre el rol de 'usuario' para nuevos registros
  )
  ON CONFLICT (id) DO NOTHING;  -- Evitar error si ya existe

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. ACTUALIZAR POLÍTICAS DE OPERACIONES_CAMBIO (si es necesario)
-- =====================================================
DROP POLICY IF EXISTS "Usuarios pueden ver sus operaciones" ON public.operaciones_cambio;
DROP POLICY IF EXISTS "Managers pueden ver todas las operaciones" ON public.operaciones_cambio;
DROP POLICY IF EXISTS "Ver operaciones según permisos" ON public.operaciones_cambio;
DROP POLICY IF EXISTS "Usuarios pueden crear operaciones" ON public.operaciones_cambio;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus operaciones" ON public.operaciones_cambio;
DROP POLICY IF EXISTS "Managers pueden actualizar cualquier operación" ON public.operaciones_cambio;

-- Crear política combinada para SELECT
CREATE POLICY "Ver operaciones según permisos"
  ON public.operaciones_cambio
  FOR SELECT
  USING (
    auth.uid() = user_id  -- Usuario ve sus operaciones
    OR
    is_manager()  -- Manager ve todas (usa función SECURITY DEFINER)
  );

-- Política INSERT para operaciones
CREATE POLICY "Crear operaciones"
  ON public.operaciones_cambio
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id  -- Usuario crea sus operaciones
    OR
    is_manager()  -- Manager puede crear para cualquiera
  );

-- Política UPDATE para operaciones
CREATE POLICY "Actualizar operaciones"
  ON public.operaciones_cambio
  FOR UPDATE
  USING (
    auth.uid() = user_id  -- Usuario actualiza sus operaciones
    OR
    is_manager()  -- Manager actualiza cualquiera
  );

-- =====================================================
-- FIN DEL SCRIPT DE CORRECCIÓN
-- =====================================================

-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard > SQL Editor
-- 2. Copia y pega este script completo
-- 3. Ejecuta el script
-- 4. Verifica que no haya errores
-- 5. Prueba creando un nuevo usuario desde la aplicación
