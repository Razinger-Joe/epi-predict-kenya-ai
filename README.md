# EpiPredict Kenya AI 🇰🇪

<div align="center">

![EpiPredict Kenya](src/assets/hero-kenya-map.png)

**AI-Powered Disease Outbreak Prediction for Kenya**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

[Demo](#demo) • [Features](#features) • [Installation](#installation) • [Project Structure](#project-structure) • [Contributing](#contributing)

</div>

---

## Overview

EpiPredict Kenya AI is a disease surveillance platform designed for Kenyan healthcare organizations. It helps hospitals, pharmacies, and county health departments predict disease outbreaks **14-21 days in advance** with high accuracy, enabling proactive public health responses.

### Who Is This For?

- 🏥 **Hospitals** - Monitor patient trends and prepare for outbreaks
- 💊 **Pharmacy Chains** - Track medication demand patterns
- 🏛️ **County Health Departments** - Coordinate regional responses
- 🔬 **Research Institutions** - Analyze epidemiological data

---

## Features

| Feature | Description |
|---------|-------------|
| 📊 **Real-time Dashboard** | Monitor disease trends across all 47 Kenyan counties |
| 🔮 **Predictive Analytics** | AI-powered outbreak predictions 14-21 days ahead |
| 🚨 **Smart Alerts** | Receive notifications when risk levels change |
| 🗺️ **County Mapping** | Visualize outbreak data geographically |
| 🌙 **Dark Mode** | Full dark mode support |
| 📱 **Responsive Design** | Works on desktop, tablet, and mobile |

---

## Demo

### Landing Page
The landing page showcases the platform's capabilities with Kenya-themed design elements (green/red from the national flag).

### Dashboard
The dashboard provides:
- Active alert counts
- High-risk county identification  
- Real-time system status
- Animated statistics cards

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 18 |
| **Language** | TypeScript 5.8 |
| **Build Tool** | Vite 5.4 |
| **Styling** | TailwindCSS 3.4 |
| **Components** | shadcn/ui + Radix UI |
| **State** | TanStack Query (React Query) |
| **Routing** | React Router DOM v6 |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Icons** | Lucide React |

---

## Installation

### Prerequisites

- Node.js 18+ 
- npm or bun

### Setup

```bash
# Clone the repository
git clone https://github.com/Razinger-Joe/epi-predict-kenya-ai.git

# Navigate to project directory
cd epi-predict-kenya-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
epi-predict-kenya-ai/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images (hero-kenya-map.png)
│   ├── components/
│   │   ├── dashboard/     # Dashboard-specific components
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── DashboardSidebar.tsx
│   │   │   └── StatCards.tsx
│   │   ├── ui/            # shadcn/ui components (49 components)
│   │   ├── Features.tsx   # Landing page features section
│   │   ├── FinalCTA.tsx   # Call to action section
│   │   ├── Footer.tsx     # Footer component
│   │   ├── Header.tsx     # Navigation header
│   │   ├── Hero.tsx       # Hero section
│   │   └── SocialProof.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   └── utils.ts       # Utility functions (cn helper)
│   ├── pages/
│   │   ├── Dashboard.tsx  # Main dashboard page
│   │   ├── Index.tsx      # Landing page
│   │   ├── Login.tsx      # Login page
│   │   ├── NotFound.tsx   # 404 page
│   │   └── Signup.tsx     # Multi-step signup
│   ├── App.tsx            # Main app with routing
│   ├── index.css          # Global styles & design tokens
│   └── main.tsx           # Entry point
├── components.json         # shadcn/ui configuration
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

---

## Design System

The app uses a Kenya-inspired color scheme:

| Token | Light Mode | Dark Mode | Purpose |
|-------|------------|-----------|---------|
| `--primary` | Kenya Green | Kenya Green (brighter) | Primary actions |
| `--accent` | Medical Blue | Medical Blue | Secondary emphasis |
| `--destructive` | Kenya Red | Kenya Red | Alerts & warnings |

Custom CSS variables are defined in `src/index.css` with full dark mode support.

---

## Roadmap

- [ ] Backend integration (Supabase authentication)
- [ ] Real disease data API integration
- [ ] Dashboard sub-pages (Predictions, Alerts, Analytics, Counties, Settings)
- [ ] Export functionality (PDF reports)
- [ ] Mobile app (React Native)

---

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a PR.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [Lovable.dev](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

<div align="center">

**Made with ❤️ for Kenya's healthcare system**

</div>
