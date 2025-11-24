-- =====================================================
-- SCRIPT PARA CREAR USUARIOS INICIALES
-- =====================================================
-- IMPORTANTE: Cambia los emails y contraseñas antes de ejecutar

-- NOTA: Este script necesita extensión pgcrypto para encriptar contraseñas
-- Asegúrate de tenerla habilitada:
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 1. CREAR USUARIO MANAGER
-- =====================================================

-- Cambia estos valores:
DO $$
DECLARE
  manager_email TEXT := 'manager@ejemplo.com';  -- CAMBIAR EMAIL
  manager_password TEXT := 'PasswordSeguro123';  -- CAMBIAR CONTRASEÑA
  manager_nombre TEXT := 'Manager Principal';     -- CAMBIAR NOMBRE
  manager_id UUID;
BEGIN
  -- Crear usuario en auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    manager_email,
    crypt(manager_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('nombre_completo', manager_nombre),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO manager_id;

  -- Crear perfil de manager
  INSERT INTO public.perfiles (
    id,
    email,
    nombre_completo,
    rol,
    created_at,
    updated_at
  ) VALUES (
    manager_id,
    manager_email,
    manager_nombre,
    'manager',
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Usuario Manager creado: % con ID: %', manager_email, manager_id;
END $$;

-- =====================================================
-- 2. CREAR USUARIO NORMAL
-- =====================================================

-- Cambia estos valores:
DO $$
DECLARE
  user_email TEXT := 'usuario@ejemplo.com';     -- CAMBIAR EMAIL
  user_password TEXT := 'PasswordSeguro456';     -- CAMBIAR CONTRASEÑA
  user_nombre TEXT := 'Usuario Demo';            -- CAMBIAR NOMBRE
  user_id UUID;
BEGIN
  -- Crear usuario en auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('nombre_completo', user_nombre),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO user_id;

  -- Crear perfil de usuario
  INSERT INTO public.perfiles (
    id,
    email,
    nombre_completo,
    rol,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_email,
    user_nombre,
    'usuario',
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Usuario Normal creado: % con ID: %', user_email, user_id;
END $$;

-- =====================================================
-- 3. VERIFICAR QUE SE CREARON CORRECTAMENTE
-- =====================================================

SELECT
  p.id,
  p.email,
  p.nombre_completo,
  p.rol,
  p.created_at
FROM public.perfiles p
ORDER BY p.created_at DESC
LIMIT 10;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- INSTRUCCIONES:
-- 1. Cambia los valores de email, contraseña y nombre arriba
-- 2. Ejecuta este script completo en Supabase SQL Editor
-- 3. Los usuarios se crearán automáticamente
-- 4. Puedes iniciar sesión con los emails y contraseñas que configuraste
