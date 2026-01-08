# Gestor de Mantenimiento - Colegio Boston

Aplicación web progresiva (PWA) para la gestión de activos, mantenimiento, inventarios y reportes de incidencias escolares. Desarrollada con React, TypeScript y Tailwind CSS, utilizando Google Sheets como base de datos en tiempo real.

## Características Principales

*   **Gestión de Sedes y Unidades:** Creación dinámica de espacios escolares.
*   **Semaforización:** Estados (Operativo, Prevención, Reparación, Solicitud) visuales.
*   **Gestión de Activos:** Inventario de materiales y herramientas (Préstamos, Devoluciones, Averías).
*   **Códigos QR:** Generación de códigos QR para cada unidad que permiten a usuarios externos enviar reportes rápidos.
*   **Sincronización Híbrida:** Funciona offline y sincroniza inteligentemente con Google Sheets cuando hay conexión.
*   **Seguridad:** Acceso protegido por contraseña según Roles (Admin, Mantenimiento, Tesorería).

## Instalación Local

1.  Clonar el repositorio.
2.  Instalar dependencias:
    ```bash
    npm install
    ```
3.  Ejecutar servidor de desarrollo:
    ```bash
    npm run dev
    ```

## Configuración del Backend (Google Sheets)

Para que la sincronización en la nube funcione:

1.  Crea una nueva hoja de cálculo en Google Sheets.
2.  Ve a **Extensiones > Apps Script**.
3.  Pega el código del archivo `google_apps_script.js` (si no lo tienes, usa el proporcionado en el historial de desarrollo).
4.  Implementa como **Aplicación Web** con acceso a "Cualquier persona".
5.  Copia la URL de la Web App.
6.  En la aplicación (React), entra como **Admin** > **Configuración** y pega la URL.

## Roles y Contraseñas por Defecto

*   **ADMIN:** `admin123`
*   **MAINTENANCE:** `1234`
*   **TREASURY:** `1234`
*   **SOLICITOR:** `1234`

(Las contraseñas se pueden cambiar desde el panel de Administración).

## Despliegue

La aplicación está lista para ser desplegada en Vercel, Netlify o cualquier host estático.

```bash
npm run build
```
