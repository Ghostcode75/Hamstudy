# Ham Radio Technician Test Prep

## Overview

A comprehensive web application for studying and preparing for the FCC Amateur Radio Technician license examination. The application provides study modes, practice tests, progress tracking, and a complete question browser covering all 411 questions from the official NCVEC 2022-2026 Technician question pool.

**Core Features:**
- Adaptive study mode with spaced repetition
- Full practice exams with FCC-realistic scoring (35 questions, 74% to pass)
- Progress tracking and performance analytics
- Question browser with search and filtering
- User authentication via Replit Auth
- Database persistence with PostgreSQL
- Material Design 3 with green earthy theme
- All 411 official questions with correct answers and FCC references

## Recent Changes

**October 30, 2025 - Database Seeding & Bug Fixes:**
- ✅ Downloaded and seeded complete official NCVEC 2022-2026 Technician question pool (411 questions)
- ✅ Questions properly distributed across all 10 subelements (T0-T9)
- ✅ Fixed QueryClientProvider context issue in App.tsx to enable React Query hooks
- ✅ Verified all features through end-to-end testing:
  - Landing page and authentication flow
  - Dashboard with statistics
  - Study mode with question answering and feedback
  - Practice test with 35-question exam format
  - Progress tracking with subelement proficiency charts
- ✅ Database verified with 411 questions correctly loaded
- ✅ Application fully functional and ready for use

**Data Source:**
- Questions sourced from russolsen/ham_radio_question_pool GitHub repository
- Valid for exams from July 1, 2022 to June 30, 2026
- All questions include correct answers and FCC regulation references

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React with TypeScript
- Single-page application (SPA) using Vite as the build tool
- Component-based architecture with shadcn/ui component library
- Routing handled by Wouter (lightweight client-side router)
- State management via TanStack Query for server state
- Material Design 3 (Material You) design system with green earthy aesthetic

**UI Component Strategy:**
- Radix UI primitives for accessible, unstyled components
- Tailwind CSS for styling with custom theme configuration
- Component composition through shadcn/ui patterns
- Responsive design with mobile-first breakpoints

**Key Design Decisions:**
- **Problem:** Need consistent, accessible UI components
- **Solution:** shadcn/ui with Radix UI primitives
- **Rationale:** Provides accessible foundations while maintaining customization flexibility
- **Pros:** Type-safe, accessible, customizable
- **Cons:** Requires manual component installation

### Backend Architecture

**Framework:** Express.js with TypeScript
- RESTful API architecture
- Session-based authentication using Replit Auth (OpenID Connect)
- ESM module system throughout

**API Structure:**
- `/api/auth/*` - Authentication endpoints (login, logout, user info)
- `/api/dashboard/*` - Dashboard statistics and progress summaries
- `/api/questions/*` - Question retrieval and filtering
- `/api/progress/*` - User progress tracking and answer submission
- `/api/practice-test/*` - Practice test session management
- `/api/bookmarks/*` - Question bookmarking

**Key Design Decisions:**
- **Problem:** Need secure user authentication in Replit environment
- **Solution:** Replit Auth with OpenID Connect via Passport.js
- **Rationale:** Native integration with Replit platform
- **Pros:** Seamless authentication, no separate user management needed
- **Cons:** Tightly coupled to Replit platform

### Data Layer

**ORM:** Drizzle ORM
- Type-safe database queries
- Schema defined in shared TypeScript files
- Migrations managed through drizzle-kit

**Database Schema:**
- `users` - User profiles and authentication data
- `questions` - Complete Technician question pool (411 questions from official NCVEC 2022-2026 pool)
- `user_progress` - Individual question mastery tracking with spaced repetition metrics
- `study_sessions` - Study and practice test session records
- `bookmarks` - User-bookmarked questions
- `sessions` - Express session storage (connect-pg-simple)

**Key Design Decisions:**
- **Problem:** Need type-safe database access with good developer experience
- **Solution:** Drizzle ORM with PostgreSQL
- **Rationale:** Provides type safety while avoiding heavy ORM abstractions
- **Pros:** Lightweight, type-safe, SQL-like syntax
- **Cons:** Less feature-rich than alternatives like Prisma

**Spaced Repetition Algorithm:**
- Tracks `timesCorrect`, `timesIncorrect`, `lastAnsweredAt`, `isMastered` per question
- Questions marked as mastered after consistent correct answers
- Study mode prioritizes non-mastered questions

### External Dependencies

**Database:**
- PostgreSQL via Neon Database (@neondatabase/serverless)
- WebSocket support for serverless connections
- Connection pooling for performance

**Authentication:**
- Replit OpenID Connect (OIDC) provider
- Passport.js strategy for OIDC integration
- Express sessions stored in PostgreSQL (connect-pg-simple)

**UI Libraries:**
- shadcn/ui component system
- Radix UI primitives for accessibility
- Tailwind CSS for styling
- Recharts for data visualization
- Lucide React for icons
- Google Fonts (Roboto, Roboto Mono)

**Development Tools:**
- TypeScript for type safety across frontend and backend
- Vite for fast development and optimized builds
- tsx for TypeScript execution in development
- esbuild for production server bundling

**Key Integration Decisions:**
- **Problem:** Need serverless-compatible PostgreSQL
- **Solution:** Neon Database with WebSocket support
- **Rationale:** Serverless architecture requires connection pooling and WebSocket support
- **Pros:** Scales automatically, Replit-compatible
- **Cons:** Vendor lock-in to Neon

**Environment Requirements:**
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Express session encryption key
- `ISSUER_URL` - OIDC issuer URL (defaults to Replit)
- `REPL_ID` - Replit environment identifier