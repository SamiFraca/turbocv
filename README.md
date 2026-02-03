# TurboCV

**Ajusta tu CV a cada oferta en 60 segundos**

Herramienta de optimización de currículums diseñada para pasar filtros ATS (Applicant Tracking Systems).

## 🚀 Características

- ✅ Optimización de CV con IA
- 🎯 Diseñado para pasar filtros ATS
- ⚡ Resultados en menos de 60 segundos
- 📄 Exportación a PDF
- 💳 Pago único por uso (8.99 €)

## 🛠️ Stack Técnico

- **Frontend**: Next.js 16 + React 19
- **Styling**: Tailwind CSS 4
- **Pagos**: Stripe
- **IA**: OpenAI GPT-4
- **PDF**: jsPDF
- **Linting**: Biome

## 📦 Instalación

```bash
# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.local.example .env.local

# Configurar las siguientes variables en .env.local:
# - OPENAI_API_KEY
# - STRIPE_SECRET_KEY
# - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

## 🔧 Desarrollo

```bash
# Ejecutar servidor de desarrollo
pnpm dev

# Verificar código
pnpm check

# Formatear código
pnpm format

# Build para producción
pnpm build
```

## 🌐 Deploy

El proyecto está optimizado para desplegar en Vercel:

```bash
vercel
```

## 📝 Configuración de Stripe

1. Crear cuenta en [Stripe](https://stripe.com)
2. Obtener las claves API (test o producción)
3. Configurar webhook para eventos de pago (opcional)

## 🔑 Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `OPENAI_API_KEY` | API key de OpenAI |
| `STRIPE_SECRET_KEY` | Secret key de Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key de Stripe |

## 📄 Licencia

MIT
