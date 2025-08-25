# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shuttle Swaggers Badminton Club website - a Next.js application for managing badminton sessions, player statistics, and court assignments. The project includes live game tracking, player matching algorithms, and guest registration functionality.

## Development Commands

```bash
# Development server
npm run dev

# Build for production (static export)
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Architecture

### Core Technologies
- **Next.js 13.5.1** with App Router
- **TypeScript** for type safety
- **MongoDB** for data persistence
- **Tailwind CSS + shadcn/ui** for styling
- **GSAP** for animations
- **Resend** for email functionality

### Project Structure

#### App Router Structure (`/app`)
- `/` - Landing page with hero section and club information
- `/sessions` - Session booking and management
- `/games` - Live game tracking and scores
- `/contact` - Contact form
- `/api` - API routes for sessions, guest signup, and contact

#### Key Business Logic (`/lib`)
- `/lib/algos/session.ts` - Core session algorithms:
  - Court assignment and player rotation
  - Partnership matching (minimizes repeat partnerships)
  - Player statistics tracking and rankings
- `/lib/db/` - MongoDB models and connection management
- `/lib/email/` - Email service integration

#### Component Architecture (`/components`)
- `/components/global/` - Shared layout components (Navbar, Footer)
- `/components/modules/` - Feature-specific components (GuestSignupForm)
- `/components/ui/` - shadcn/ui component library

### Data Models (`/types/index.ts`)

**Session Management:**
- `Session` - Main session entity with live tracking, player data, matches
- `Player` - Player statistics, match history, and partnership tracking
- `Match` - Game results with team composition and scores
- `Court` - Individual court state and active players

**Guest System:**
- `GuestSignUp` - Guest registration with experience levels and contact info

### Key Features

#### Live Session System
- Real-time court management with player rotation
- Sophisticated partnership algorithm that avoids repeat partnerships
- Live statistics tracking (wins/losses, points, rankings)
- Queue management for waiting players

#### Algorithm Intelligence
The session algorithm (`/lib/algos/session.ts`) handles:
- Initial court assignments based on available courts
- Smart team generation prioritizing new partnerships
- Player statistics updates after each match
- Dynamic rankings based on win rate and point differentials

## Configuration Notes

- **Static Export**: Configured for static site generation (`output: 'export'`)
- **ESLint**: Disabled during builds for deployment flexibility
- **Path Aliases**: `@/*` maps to project root for clean imports
- **MongoDB**: Uses environment variables for database connection
- **Resend API**: Email service requires API key configuration

## Development Patterns

- Use TypeScript interfaces from `/types/index.ts`
- Follow shadcn/ui component patterns for new UI elements  
- Implement business logic in `/lib` directory
- API routes follow RESTful patterns with proper error handling
- Animations use GSAP with ScrollTrigger for performance