# Instrucciones de Deployment en Hostinger

Este proyecto TanStack Start está configurado para ejecutarse en un servidor Node.js de Hostinger.

## Requisitos

- **Node.js**: versión 22.0 o superior (configurar en Hostinger)
- **npm**: versión 10.0 o superior

## Cambios realizados para Hostinger

✅ `vite.config.ts` - Configurado con Nitro preset `node-server`  
✅ `package.json` - Agregado script `start` y `engines`  
✅ `.gitignore` - Agregado exclusión de archivos `.env`  
✅ `.env.example` - Template de variables de entorno  
✅ `.env` - Eliminado del repositorio Git  

## Pasos de deployment en Hostinger

### 1. Clonar el repositorio

```bash
git clone <tu-repo> project
cd project
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Luego edita `.env` y agrega tus valores privados:

```env
SUPABASE_URL=tu_supabase_url
SUPABASE_PUBLISHABLE_KEY=tu_supabase_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=tu_supabase_key
BOLD_SECRET_KEY=tu_bold_key
RESEND_API_KEY=tu_resend_key
MASTERCLASS_DISCOUNT_CODE=tu_discount_code
```

⚠️ **IMPORTANTE**: Nunca commits el `.env` con valores privados

### 4. Compilar para producción

```bash
npm run build
```

Esto generará la carpeta `.output/server/` con la aplicación compilada.

### 5. Iniciar la aplicación

```bash
npm start
```

O si usas un process manager como `pm2`:

```bash
pm2 start "npm start" --name "voz-estrategica"
```

### 6. Configurar en Hostinger

En el panel de Hostinger:

1. **Crear aplicación Node.js**
   - Puerto: usa el que Hostinger asigne (ej: 3000)
   - Entry point: `node .output/server/index.mjs`
   - Node version: 22+

2. **Variables de entorno**
   - Agregar todas las variables del `.env` en la configuración de Hostinger
   - NO subir el `.env` al servidor

3. **Reverse proxy / Domain**
   - Apuntar el dominio a la aplicación Node.js

## Qué se mantiene

✅ **Server Functions** - Las rutas del servidor funcionan normalmente  
✅ **SSR (Server-Side Rendering)** - Renderizado en servidor activo  
✅ **Supabase** - Integración completa funciona  
✅ **Bold** - Sistema de pagos integrado  
✅ **Resend** - Sistema de emails integrado  
✅ **Desarrollo en Lovable** - Sin cambios, sigue funcionando igual  

## Estructura de carpetas después de build

```
.output/
├── server/
│   ├── index.mjs          (punto de entrada)
│   ├── routes/
│   └── ...
└── public/
    └── (assets estáticos)
```

## Troubleshooting

**Error: "Cannot find module"**
- Ejecuta `npm install` en Hostinger después de clonar

**Error de versión de Node**
- Verifica que tienes Node.js 22+ instalado: `node --version`

**Error en variables de entorno**
- Confirma que todas las variables están configuradas en Hostinger
- Las variables deben estar en `.env` (local) o configuradas en Hostinger

## Logs en producción

Para revisar logs en tiempo real:

```bash
pm2 logs voz-estrategica
```

O en Hostinger, usa el panel de logs de la aplicación.

## Actualizaciones

Para actualizar el código:

```bash
git pull origin main
npm install
npm run build
pm2 restart voz-estrategica
```
