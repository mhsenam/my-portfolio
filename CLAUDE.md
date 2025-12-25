# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Mohsen Amini (mhsenam), built with Next.js 15, React 19, TypeScript, and Tailwind CSS. It features an animated hero section, project showcase, GitHub repository integration, and a community "Fan Hub" with Firebase authentication and Firestore.

## Development Commands

- `npm run dev` - Start development server with Turbo (Next.js dev mode)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run postbuild` - Automatically runs after build to generate sitemap

## Tech Stack

- **Framework**: Next.js 15 with App Router (`src/app/`)
- **UI**: React 19, shadcn/ui components, Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom animations
- **Animations**: Framer Motion, GSAP, custom CSS animations
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Image Upload**: Cloudinary via API routes
- **Icons**: Lucide React, React Icons
- **Theme**: next-themes for dark/light mode
- **SEO**: next-seo, next-sitemap with structured data (JSON-LD)
- **Fonts**: Poppins (headings), Lato (body) via next/font/google

## Architecture

### Directory Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers, fonts, SEO metadata
│   ├── page.tsx            # Homepage (async, fetches GitHub data)
│   ├── globals.css         # Global styles and Tailwind directives
│   ├── login/page.tsx      # Firebase authentication (email/Google)
│   ├── fan-hub/page.tsx    # Community posts with tabs (Explore/My Posts)
│   ├── articles/page.tsx   # Blog/articles page
│   ├── profile/page.tsx    # User profile page
│   ├── post/[postId]/      # Individual post page
│   ├── api/
│   │   ├── upload-avatar/route.ts
│   │   └── upload-post-image/route.ts
│   └── providers.tsx       # ThemeProvider wrapper
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── animated-text.tsx   # Character/word animation with scroll effects
│   ├── animated-hero.tsx   # Hero section wrapper
│   ├── animated-card.tsx   # Card entrance animations
│   ├── project-card.tsx    # Project showcase cards
│   ├── post-card.tsx       # Fan Hub post cards with like/delete
│   ├── github-repos.tsx    # Async component fetching GitHub API
│   └── create-post-dialog.tsx  # Post creation with image upload
└── lib/
    ├── firebaseConfig.ts   # Firebase initialization
    └── utils.ts            # cn() utility for class merging
```

### Key Patterns

**Async Server Components**: The homepage (`app/page.tsx`) and `GitHubRepos` component use async/await to fetch data from GitHub API at build/request time with Next.js caching (`next: { revalidate: 3600 }`).

**Client Components with "use client"**: Pages requiring interactivity (Fan Hub, Login) and components using hooks or browser APIs are marked as client components.

**Firebase Authentication**: Uses `react-firebase-hooks` for auth state management. Protected pages redirect to `/login` if user is not authenticated.

**Animation System**:
- `AnimatedText` uses Framer Motion's `useScroll`, `useTransform`, `useInView` for scroll-linked animations
- Supports character-level or word-level animation with stagger effects
- Optional colorful mode cycles through predefined colors

**Image Upload**: Images are uploaded to Cloudinary via API routes (`/api/upload-*`), with the returned URL stored in Firestore.

### Configuration Files

- `next-sitemap.config.js` - Sitemap generation, excludes API routes
- `tailwind.config.ts` - Custom theme, animations, and shadcn paths
- ESLint config uses `eslint-config-next` for Next.js rules

### Environment Variables Required

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SITE_URL=https://mhsenam.com
```

Firebase config is currently in `src/lib/firebaseConfig.ts` (consider moving to environment variables for production).

## Important Notes

- The project uses Prettier formatting - ensure consistent code style
- Components use shadcn/ui pattern with `@/components/ui/` imports
- Tailwind CSS v4 has different configuration than v3 - see `tailwind.config.ts`
- GitHub API requests include `Accept: application/vnd.github.v3+json` header
- All images in public folder (e.g., `/project_icons/`, `/fan-hub-banner.jpg`) are served statically
