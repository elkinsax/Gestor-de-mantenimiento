
# Gestor de Mantenimiento SaaS - Roadmap

Este proyecto está evolucionando hacia una solución SaaS Multi-Tenant.

## Próximos Pasos para Producción

1.  **Migración a Supabase:** 
    *   Reemplazar `sheetService.ts` por `@supabase/supabase-js`.
    *   Implementar Row Level Security (RLS) para aislar datos por `organization_id`.
2.  **Gestión de Imágenes:**
    *   Activar Supabase Storage para dejar de usar Base64.
3.  **Suscripciones:**
    *   Integrar **Stripe** para cobros mensuales por colegio.
4.  **Landing Page:**
    *   Crear una página de inicio con precios y características.
5.  **Dominios Personalizados:**
    *   Permitir `colegio-boston.mantenimiento.com`.
