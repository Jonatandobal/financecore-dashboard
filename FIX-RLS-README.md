# 🔧 Corrección de Error de Recursión Infinita en Políticas RLS

## Problema
Estás viendo este error en la consola:
```
Error: infinite recursion detected in policy for relation "perfiles"
```

Este error ocurre porque las políticas RLS (Row Level Security) de Supabase están verificando permisos consultando la misma tabla que están protegiendo, causando un bucle infinito.

## Solución

### Paso 1: Ir a Supabase SQL Editor
1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor** en el menú lateral

### Paso 2: Ejecutar el Script de Corrección
1. Abre el archivo `fix-rls-policies.sql` en tu editor de código
2. **Copia todo el contenido** del archivo
3. **Pega** el contenido en el SQL Editor de Supabase
4. **Haz clic en "Run"** para ejecutar el script

### Paso 3: Verificar que se ejecutó correctamente
El script debería ejecutarse sin errores. Verás un mensaje de éxito en la parte inferior del editor.

### Paso 4: Probar el Registro de Usuarios
1. Vuelve a tu aplicación
2. Recarga la página (F5)
3. Intenta crear un nuevo usuario usando el formulario de registro
4. Deberías poder registrarte sin errores

## ¿Qué hace este script?

El script corrige el problema de recursión de la siguiente manera:

1. **Elimina todas las políticas RLS problemáticas** de las tablas `perfiles` y `operaciones_cambio`

2. **Crea funciones con `SECURITY DEFINER`** que pueden consultar la base de datos sin activar las políticas RLS:
   - `get_user_role(user_id)` - Obtiene el rol de un usuario
   - `is_manager()` - Verifica si el usuario actual es manager

3. **Recrea las políticas RLS** usando estas funciones seguras:
   - Usuarios pueden ver y editar su propio perfil
   - Managers pueden ver y editar todos los perfiles
   - Nuevos usuarios pueden crear su propio perfil
   - Managers pueden crear perfiles para otros usuarios

4. **Actualiza la función de creación automática de perfiles** para manejar conflictos correctamente

## Verificación

Después de ejecutar el script, puedes verificar que las políticas están correctas:

```sql
-- Ver las políticas de la tabla perfiles
SELECT * FROM pg_policies WHERE tablename = 'perfiles';

-- Ver las políticas de la tabla operaciones_cambio
SELECT * FROM pg_policies WHERE tablename = 'operaciones_cambio';
```

## ¿Necesitas ayuda?

Si sigues teniendo problemas:
1. Verifica los logs de Supabase en **Logs > Postgres Logs**
2. Verifica la consola del navegador (F12) para más detalles
3. Asegúrate de que las variables de entorno estén correctamente configuradas

## Reintentar Registro

Una vez aplicado el fix:
1. Recarga la aplicación
2. Ve a la página de login
3. Haz clic en "¿No tienes cuenta? Créate una"
4. Completa el formulario:
   - Email
   - Nombre completo
   - Teléfono (opcional)
   - Contraseña
5. Haz clic en "Crear cuenta"

¡Deberías poder registrarte exitosamente! 🎉
