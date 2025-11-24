# Configuración del Sistema de Usuarios

Este documento describe cómo configurar el sistema de autenticación y perfiles de usuario (Usuario y Manager) para el dashboard de Hemisferia.

## 📋 Características Implementadas

### ✅ Sistema de Autenticación
- Login con email y contraseña usando Supabase Auth
- Gestión de sesiones automática
- Protección de rutas (dashboard solo accesible para usuarios autenticados)

### ✅ Perfiles de Usuario
**Usuario:**
- Ver sus propias operaciones (abiertas y cerradas)
- Ver dashboard con sus KPIs personales
- Editar su perfil personal
- Ver balance de divisas

**Manager:**
- Ver todas las operaciones de todos los usuarios
- Dashboard con KPIs globales
- Gestión completa de usuarios (crear, editar, eliminar)
- Asignar roles (usuario/manager)
- Todas las funcionalidades de usuario

### ✅ Interfaz de Usuario
- Página de login con diseño moderno
- Header con información del usuario y menú desplegable
- Página de perfil de usuario
- Panel de gestión de usuarios (solo managers)
- Navegación con pestañas: Dashboard, Operaciones, Divisas, Bot, Perfil, Usuarios (managers)

### ✅ Migración Telegram → WhatsApp
- Todos los campos cambiados de Telegram a WhatsApp
- Tablas actualizadas con campos `usuario_whatsapp_id` y `usuario_whatsapp_nombre`
- Componentes actualizados para mostrar información de WhatsApp

## 🚀 Pasos para Configurar

### 1. Configurar Supabase

#### 1.1. Ejecutar Script SQL
1. Ve a tu proyecto en [Supabase](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Copia el contenido del archivo `supabase-setup.sql`
4. Pega y ejecuta el script
5. Verifica que no haya errores

Este script creará:
- Tabla `perfiles` con campos para usuario y manager
- Políticas RLS (Row Level Security) para proteger datos
- Campos en `operaciones_cambio` para vincular operaciones con usuarios
- Triggers automáticos para crear perfiles
- Índices para mejorar el rendimiento

#### 1.2. Habilitar Autenticación por Email
1. Ve a **Authentication > Providers**
2. Asegúrate de que **Email** esté habilitado
3. Configura las URLs de redirección si es necesario

### 2. Crear el Primer Usuario Manager

#### Opción A: Desde el Panel de Supabase (Recomendado)
1. Ve a **Authentication > Users**
2. Click en **Add user**
3. Ingresa:
   - Email: tu-email@ejemplo.com
   - Password: Una contraseña segura
   - Auto Confirm User: ✅ Activado
4. Click en **Create user**
5. Ve a **SQL Editor** y ejecuta:
```sql
UPDATE public.perfiles
SET rol = 'manager'
WHERE email = 'tu-email@ejemplo.com';
```

#### Opción B: Programáticamente
Después de la configuración inicial, los managers pueden crear usuarios desde el panel de gestión.

### 3. Variables de Entorno

Crea o verifica tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### 4. Instalar Dependencias y Ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### 5. Probar el Sistema

1. Abre http://localhost:3000
2. Deberías ver la página de login
3. Ingresa con el usuario manager que creaste
4. Verás el dashboard completo con todas las funcionalidades

## 📁 Estructura de Archivos Nuevos/Modificados

```
src/
├── components/
│   ├── auth/
│   │   └── LoginPage.tsx          # Página de login
│   ├── profile/
│   │   └── ProfileTab.tsx         # Perfil de usuario
│   ├── users/
│   │   └── UsersManagementTab.tsx # Gestión de usuarios (managers)
│   ├── layout/
│   │   ├── Header.tsx             # Actualizado con menú de usuario
│   │   └── TabNavigation.tsx      # Actualizado con nuevas pestañas
│   └── dashboard/
│       ├── PendingOperationsSection.tsx  # Actualizado WhatsApp
│       └── RecentOperationsTable.tsx     # Actualizado WhatsApp
├── contexts/
│   └── AuthContext.tsx            # Contexto de autenticación
├── hooks/
│   └── useData.ts                 # Actualizado con filtrado por rol
├── types/
│   └── index.ts                   # Tipos actualizados
└── app/
    ├── layout.tsx                 # Actualizado con AuthProvider
    └── page.tsx                   # Actualizado con lógica de auth

Nuevos archivos:
├── supabase-setup.sql             # Script de configuración BD
└── SETUP-USUARIOS.md              # Este archivo
```

## 🔒 Seguridad

El sistema incluye múltiples capas de seguridad:

1. **Row Level Security (RLS)**: Políticas en Supabase que controlan acceso a nivel de base de datos
2. **Autenticación de Frontend**: Verificación de sesión antes de renderizar componentes
3. **Filtrado en Queries**: Las consultas se filtran automáticamente según el rol del usuario
4. **Protección de Rutas**: Solo usuarios autenticados pueden acceder al dashboard

## 👥 Gestión de Usuarios

### Crear Nuevo Usuario (Solo Managers)
1. Click en la pestaña **Usuarios**
2. Click en **Nuevo Usuario**
3. Completa el formulario:
   - Email
   - Contraseña
   - Nombre completo
   - Teléfono (opcional)
   - WhatsApp ID y nombre (opcional)
   - Rol: Usuario o Manager
4. Click en **Crear**

### Editar Usuario
1. En la lista de usuarios, click en el ícono de editar ✏️
2. Modifica los campos necesarios
3. Click en **Actualizar**

### Eliminar Usuario
1. Click en el ícono de eliminar 🗑️
2. Confirma la eliminación

## 📊 Filtrado de Operaciones

- **Usuarios**: Solo ven sus propias operaciones en todos los dashboards
- **Managers**: Ven todas las operaciones de todos los usuarios

Los KPIs se calculan automáticamente según el rol:
- Usuario: Ganancia de hoy/mes = solo sus operaciones
- Manager: Ganancia de hoy/mes = todas las operaciones

## 🔄 Migración de Datos Existentes

Si tienes operaciones existentes con campos de Telegram:

```sql
-- Migrar datos de telegram_* a whatsapp_*
UPDATE public.operaciones_cambio
SET
  usuario_whatsapp_id = usuario_telegram_id,
  usuario_whatsapp_nombre = usuario_telegram_nombre
WHERE usuario_telegram_id IS NOT NULL;

-- Opcional: Eliminar columnas antiguas después de verificar
-- ALTER TABLE public.operaciones_cambio DROP COLUMN usuario_telegram_id_old;
-- ALTER TABLE public.operaciones_cambio DROP COLUMN usuario_telegram_nombre_old;
```

## 🐛 Troubleshooting

### Error: "No se puede iniciar sesión"
- Verifica que el usuario esté confirmado en Supabase Auth
- Verifica las variables de entorno
- Revisa la consola del navegador para errores específicos

### Error: "No se puede cargar el perfil"
- Verifica que exista un registro en la tabla `perfiles` para ese usuario
- Ejecuta el trigger manualmente si es necesario:
```sql
INSERT INTO public.perfiles (id, email, nombre_completo, rol)
SELECT id, email, email, 'usuario'
FROM auth.users
WHERE id = 'user-id-aqui';
```

### Los usuarios no ven operaciones
- Verifica que las operaciones tengan el campo `user_id` poblado
- Verifica las políticas RLS en Supabase

### Error de permisos al crear usuarios
- Verifica que el usuario actual tenga rol 'manager'
- Verifica las políticas RLS en la tabla perfiles

## 📝 Notas Adicionales

- Las contraseñas deben tener al menos 6 caracteres (configuración por defecto de Supabase)
- Los emails deben ser únicos
- El primer manager debe crearse manualmente
- Todos los usuarios reciben un perfil automáticamente al registrarse
- Los cambios en el perfil se reflejan inmediatamente en la UI

## 🆘 Soporte

Si encuentras problemas, verifica:
1. Logs de Supabase en el dashboard
2. Consola del navegador (F12)
3. Variables de entorno
4. Políticas RLS en Supabase

---

**¡Sistema listo para usar! 🎉**
