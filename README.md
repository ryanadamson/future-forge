# Future Forge

> Turn ideas into actionable plans, scenarios, and future possibilities.

Future Forge is an AI-powered web application built with **TanStack Start**, **React 19**, and **Supabase**. It helps users explore, generate, and refine ideas around their future through tools for career planning, CV building, budgeting, and course discovery.

---

## Why Future Forge?

Future Forge was created as a personal tool to help plan and navigate long-term career and education decisions. It brings together AI-powered utilities like career path exploration, CV/resume writing, budgeting/accounting assistance, and course discovery to help users make more informed choices about their future.

The goal is to act as a “personal strategy layer” for life planning—combining AI assistance with structured tools to support career growth and decision-making.

---

## Features

* 🤖 AI-powered career guidance and idea exploration
* 📄 CV / resume generation and improvement
* 💬 Interactive AI chat experience
* 🎓 Course and learning path discovery
* 💰 Budgeting and simple financial/accounting tools
* 📊 Structured planning and scenario building
* 🎨 Modern, responsive UI
* ⚡ Fast SSR React app with TanStack Start
* 🔐 Authentication and user sessions via Supabase
* 📝 Markdown, code, math, and diagram support

---

## Tech Stack

### Frontend

* React 19
* TypeScript
* TanStack Start
* TanStack Router
* TanStack Query
* Tailwind CSS v4
* Radix UI
* Motion

### Backend & Infrastructure

* Supabase
* Nitro
* Vite

### AI & Content

* Vercel AI SDK
* Streamdown
* React Markdown
* Mermaid
* Math rendering

### Forms & Validation

* React Hook Form
* Zod

---

## Getting Started

### Prerequisites

* Node.js 20+
* npm, pnpm, or yarn
* Supabase project

---

### Installation

```bash
git clone https://github.com/ryanadamson/future-forge.git
cd future-forge
npm install
```

---

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI API key (if required by your setup)
AI_API_KEY=your_api_key
```

---

### Development

```bash
npm run dev
```

The app will run at:

```
http://localhost:3000
```

---

## Build

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## Project Structure

```text
future-forge/
├── src/
│   ├── components/
│   ├── routes/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   └── styles/
├── public/
├── supabase/
├── package.json
└── vite.config.ts
```

---

## Code Quality

```bash
npm run lint
npm run format
```

---

## Architecture

Future Forge follows a modern full-stack React architecture:

* **TanStack Start** handles routing, SSR, and server functions
* **TanStack Query** manages client state and caching
* **Supabase** provides authentication and backend services
* **AI SDK** powers generative and conversational features
* **Tailwind + Radix UI** provide a scalable design system

---

## Deployment

You can deploy Future Forge to:

* Vercel
* Netlify
* Cloudflare Pages
* Fly.io
* Railway
* Any Node-compatible host

Build first:

```bash
npm run build
```

---

## Contributing

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/my-feature
```

3. Commit changes
4. Push branch
5. Open a Pull Request

---

## License

MIT License

---

## Author

Built by Ryan Adamson
