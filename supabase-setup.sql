-- =====================================================
-- SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS SUPABASE
-- Sistema de Perfiles Usuario y Manager
-- =====================================================

-- 1. CREAR TABLA DE PERFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre_completo TEXT NOT NULL,
  telefono TEXT,
  whatsapp_id TEXT,
  whatsapp_nombre TEXT,
  rol TEXT NOT NULL DEFAULT 'usuario' CHECK (rol IN ('usuario', 'manager')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HABILITAR ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE SEGURIDAD PARA PERFILES
-- =====================================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON public.perfiles
  FOR SELECT
  USING (auth.uid() = id);

-- Los managers pueden ver todos los perfiles
CREATE POLICY "Managers pueden ver todos los perfiles"
  ON public.perfiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'manager'
    )
  );

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON public.perfiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Los managers pueden crear nuevos perfiles
CREATE POLICY "Managers pueden crear perfiles"
  ON public.perfiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'manager'
    )
  );

-- Los managers pueden actualizar cualquier perfil
CREATE POLICY "Managers pueden actualizar perfiles"
  ON public.perfiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'manager'
    )
  );

-- Los managers pueden eliminar perfiles
CREATE POLICY "Managers pueden eliminar perfiles"
  ON public.perfiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'manager'
    )
  );

-- 4. ACTUALIZAR TABLA OPERACIONES_CAMBIO
-- =====================================================
-- Añadir campos de usuario y WhatsApp si no existen

DO $$
BEGIN
  -- Añadir user_id si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'operaciones_cambio' AND column_name = 'user_id') THEN
    ALTER TABLE public.operaciones_cambio
    ADD COLUMN user_id UUID REFERENCES public.perfiles(id);
  END IF;

  -- Añadir usuario_whatsapp_id si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'operaciones_cambio' AND column_name = 'usuario_whatsapp_id') THEN
    ALTER TABLE public.operaciones_cambio
    ADD COLUMN usuario_whatsapp_id TEXT;
  END IF;

  -- Añadir usuario_whatsapp_nombre si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'operaciones_cambio' AND column_name = 'usuario_whatsapp_nombre') THEN
    ALTER TABLE public.operaciones_cambio
    ADD COLUMN usuario_whatsapp_nombre TEXT;
  END IF;

  -- Renombrar campos de telegram a whatsapp (si existen)
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'operaciones_cambio' AND column_name = 'usuario_telegram_id') THEN
    ALTER TABLE public.operaciones_cambio
    RENAME COLUMN usuario_telegram_id TO usuario_whatsapp_id_old;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'operaciones_cambio' AND column_name = 'usuario_telegram_nombre') THEN
    ALTER TABLE public.operaciones_cambio
    RENAME COLUMN usuario_telegram_nombre TO usuario_whatsapp_nombre_old;
  END IF;
END $$;

-- 5. POLÍTICAS DE SEGURIDAD PARA OPERACIONES
-- =====================================================
ALTER TABLE public.operaciones_cambio ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver sus propias operaciones
CREATE POLICY "Usuarios pueden ver sus operaciones"
  ON public.operaciones_cambio
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'manager'
    )
  );

-- Los managers pueden ver todas las operaciones
CREATE POLICY "Managers pueden ver todas las operaciones"
  ON public.operaciones_cambio
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'manager'
    )
  );

-- Los usuarios pueden crear operaciones
CREATE POLICY "Usuarios pueden crear operaciones"
  ON public.operaciones_cambio
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus operaciones
CREATE POLICY "Usuarios pueden actualizar sus operaciones"
  ON public.operaciones_cambio
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'manager'
    )
  );

-- Los managers pueden actualizar cualquier operación
CREATE POLICY "Managers pueden actualizar cualquier operación"
  ON public.operaciones_cambio
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'manager'
    )
  );

-- 6. FUNCIÓN PARA CREAR PERFIL AUTOMÁTICAMENTE AL REGISTRAR USUARIO
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, email, nombre_completo, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'usuario')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. TRIGGER PARA CREAR PERFIL AUTOMÁTICAMENTE
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. FUNCIÓN PARA ACTUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. TRIGGER PARA ACTUALIZAR updated_at EN PERFILES
-- =====================================================
DROP TRIGGER IF EXISTS perfiles_updated_at ON public.perfiles;

CREATE TRIGGER perfiles_updated_at
  BEFORE UPDATE ON public.perfiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 10. CREAR PRIMER USUARIO MANAGER (OPCIONAL - DESCOMENTAR Y AJUSTAR)
-- =====================================================
-- NOTA: Este usuario debe crearse primero desde Supabase Auth Dashboard
-- Luego actualizar el perfil con este comando:
--
-- UPDATE public.perfiles
-- SET rol = 'manager'
-- WHERE email = 'tu-email@ejemplo.com';

-- 11. ÍNDICES PARA MEJORAR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_perfiles_email ON public.perfiles(email);
CREATE INDEX IF NOT EXISTS idx_perfiles_rol ON public.perfiles(rol);
CREATE INDEX IF NOT EXISTS idx_operaciones_user_id ON public.operaciones_cambio(user_id);
CREATE INDEX IF NOT EXISTS idx_operaciones_estado ON public.operaciones_cambio(estado);
CREATE INDEX IF NOT EXISTS idx_operaciones_created_at ON public.operaciones_cambio(created_at);

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- INSTRUCCIONES PARA EJECUTAR:
-- 1. Ve al panel de Supabase > SQL Editor
-- 2. Copia y pega todo este script
-- 3. Ejecuta el script
-- 4. Crea tu primer usuario manager desde el panel de Auth
-- 5. Actualiza el rol del usuario a 'manager' con:
--    UPDATE public.perfiles SET rol = 'manager' WHERE email = 'tu-email@ejemplo.com';
