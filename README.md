# TurboCV

**Tailor your CV to each job offer in 60 seconds**

Resume optimization tool designed to pass ATS (Applicant Tracking Systems) filters.

## 🚀 Features

- ✅ AI-powered CV optimization
- 🎯 Designed to pass ATS filters
- ⚡ Results in under 60 seconds
- 📄 PDF export
- 💳 Pay-per-use (€8.99)

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 + React 19
- **Styling**: Tailwind CSS 4
- **Payments**: Stripe
- **AI**: OpenAI GPT-4
- **PDF**: jsPDF
- **Linting**: Biome

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.local.example .env.local

# Configure the following variables in .env.local:
# - OPENAI_API_KEY
# - STRIPE_SECRET_KEY
# - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

## 🔧 Development

```bash
# Run development server
pnpm dev

# Check code
pnpm check

# Format code
pnpm format

# Production build
pnpm build
```

## 🌐 Deploy

The project is optimized for deployment on Vercel:

```bash
vercel
```

## 📝 Stripe Configuration

1. Create account on [Stripe](https://stripe.com)
2. Get API keys (test or production)
3. Configure webhook for payment events (optional)

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

## 📄 License

MIT
