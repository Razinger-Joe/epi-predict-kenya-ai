# Changelog

All notable changes to EpiPredict Kenya AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-03-11

### Added
- **Supabase Authentication**: AuthContext, ProtectedRoute, real sign-in/sign-up flows
- **Social Media Signals API**: `/api/v1/social/signals` endpoint with Pydantic models
- **PDF Export**: Analytics dashboard export via jsPDF + html2canvas
- **Frontend Component Tests**: Dashboard + Predictions tests with Vitest
- **CI Test Step**: Automated test execution on every push to main
- **User Avatar & Logout**: DashboardHeader shows authenticated user initials + logout dropdown

### Changed
- Protected all `/dashboard/*` routes behind authentication
- API service now injects Supabase auth token as Bearer header
- README roadmap updated — all 4 phases marked complete
- Signup form wired to Supabase with user metadata (org, county, name)

### Technical
- SocialHarvester class with structured signal generation
- Social router registered in FastAPI main.py
- Export button added to DashboardAnalytics page
- jsPDF + html2canvas dependencies added

## [1.0.0] - 2026-02-05

### Added
- ML/AI verification complete (3/3 tests passed)
- Enhanced chatbot intelligence (context-aware, no templates)
- Comprehensive testing documentation (Chapter 5)
- Production deployment to Vercel + Railway

## [0.2.0] - 2026-02-26

### Added
- Theme system overhaul (light/dark mode toggle)
- Mobile navigation (slide-out drawer, hamburger menu)
- Analytics page with Recharts visualizations
- Dashboard sub-pages (Predictions, Alerts, Counties, Settings)
- Comprehensive project documentation

---

## [0.1.0] - 2026-01-19

### Added
- Initial project setup with Vite + React + TypeScript
- Landing page with hero section, features, and CTA
- Login page with email/password form
- Multi-step signup flow (Organization → Contact → Account)
- Dashboard layout with sidebar navigation
- Animated statistics cards
- Kenya-themed design system (green/red colors)
- Dark mode support
- shadcn/ui component library integration
- Responsive design for all screen sizes

### Technical
- React 18.3 with TypeScript 5.8
- Vite 5.4 build tool
- TailwindCSS 3.4 for styling
- React Router DOM v6 for routing
- TanStack Query for state management
- React Hook Form + Zod for form validation

---

[Unreleased]: https://github.com/Razinger-Joe/epi-predict-kenya-ai/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Razinger-Joe/epi-predict-kenya-ai/releases/tag/v0.1.0
