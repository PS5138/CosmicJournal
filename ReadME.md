# NASA Astronomy Picture of the Day Space Journal

## Overview

This is a clean, minimalist space-themed web application that displays NASA's Astronomy Picture of the Day (APOD). You can access it here - https://cosmic-journal.replit.app/

The application serves as a meditative space diary, allowing users to view daily astronomical images/videos and explore random entries from the APOD archive. Built with a modern full-stack architecture using React, Express, and PostgreSQL.

**Status**: ✅ Fully functional with NASA API integration, seamless automatic video extraction system, beautiful space-themed UI, interactive Cosmic Time Travel Slider, and Google Analytics tracking (July 28, 2025)

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom space-themed color variables
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design (currently minimal, extensible for future features)
- **Session Management**: Ready for connect-pg-simple integration
- **Development**: Hot reload with Vite middleware integration

### Data Architecture
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: User management foundation (extensible for favorites, bookmarks, etc.)
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Neon serverless PostgreSQL support

## Key Components

### Core Pages
- **Home Page**: Main APOD display with space-themed UI
- **Not Found**: 404 error handling

### UI Components
- **CosmicBackground**: Animated starfield background with gentle pulsing stars
- **LoadingSpinner**: Space-themed loading animation with rotating cosmos elements
- **Cosmic Time Travel Slider**: Interactive year selector with smooth dragging, preview date bubble, and cosmic styling
- **Comprehensive UI Library**: Full shadcn/ui component suite for future feature expansion

### Custom Hooks
- **useApod**: NASA APOD API integration with caching and error handling
- **useToast**: Notification system for user feedback
- **useMobile**: Responsive design utilities
- **useAnalytics**: Automatic page view tracking for single-page application routing

## Data Flow

### NASA APOD Integration
1. **API Consumption**: Direct integration with NASA's APOD API
2. **Automatic Media Extraction**: When API lacks direct URLs (media_type: "other"), system automatically extracts video/image URLs from NASA's APOD HTML pages
3. **Caching Strategy**: TanStack Query provides intelligent caching with 5-minute stale time
4. **Random Image Feature**: Generates random dates between APOD start (1995-06-16) and present
5. **Error Handling**: Graceful fallbacks with retry mechanisms (2 retries with exponential backoff)
6. **Data Validation**: TypeScript interfaces ensure type safety for APOD responses with extraction tracking

### State Management
- **Server State**: TanStack Query manages API data, caching, and synchronization
- **UI State**: React hooks for local component state
- **Global State**: React Context for theme and toast notifications

## External Dependencies

### NASA API
- **Endpoint**: `https://api.nasa.gov/planetary/apod`
- **Authentication**: API key support (falls back to DEMO_KEY)
- **Rate Limiting**: Built-in retry logic with exponential backoff
- **Content Types**: Supports both images and videos from NASA's archive

### UI Dependencies
- **Radix UI**: Accessible, unstyled component primitives
- **Lucide Icons**: Consistent iconography throughout the application
- **Date-fns**: Date manipulation utilities
- **Class Variance Authority**: Type-safe CSS class composition

### Development Tools
- **ESBuild**: Fast bundling for production builds
- **TSX**: TypeScript execution for development
- **Replit Integration**: Development banner and cartographer plugin support

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite bundles React application to `dist/public`
2. **Backend Build**: ESBuild compiles TypeScript server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Development**: Hot reload with Vite dev server proxy
- **Production**: Static file serving with Express
- **Database**: PostgreSQL connection via `DATABASE_URL` environment variable
- **NASA API**: Optional `NASA_API_KEY` for increased rate limits (secure backend proxy)
- **Analytics**: `VITE_GA_MEASUREMENT_ID` for Google Analytics visitor tracking

### Hosting Requirements
- **Node.js**: ES modules support required
- **PostgreSQL**: Database with UUID extension support
- **Environment Variables**: `DATABASE_URL` for database connection
- **Static Assets**: Served from `/dist/public` directory

## Analytics & Tracking

### Google Analytics Integration
- **Automatic Initialization**: Google Analytics is initialized when the app loads
- **Page View Tracking**: Automatic tracking of route changes in the single-page application
- **Event Tracking**: Custom events for key user interactions:
  - Birthday lookup usage (with date parameter)
  - Cosmic Time Travel Slider usage (with year parameter)
  - Random image generation (with date parameter)
  - Social media sharing (platform-specific tracking)
  - Link copying to clipboard
- **Security**: Analytics measurement ID is handled via environment variables
- **Data Collection**: Tracks daily visitors, popular features, and user engagement patterns

### Future Extensibility
The architecture supports easy addition of:
- User authentication and personalized favorites
- Bookmarking and collection features
- Advanced search and filtering
- Offline support with service workers
- Enhanced accessibility features
- Advanced analytics dashboards and reporting