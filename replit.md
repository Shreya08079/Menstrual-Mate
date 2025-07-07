# Period Tracker Application

## Overview

This is a comprehensive period tracking application built to help users monitor their menstrual cycles, log daily symptoms, track water intake, and receive personalized health recommendations. The application provides cycle predictions, insights, journaling capabilities, an AI assistant, and exercise recommendations for period-related discomfort.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Context for authentication, TanStack Query for server state
- **Build Tool**: Vite for development and building
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Session-based with bcrypt for password hashing
- **API Design**: RESTful endpoints with structured error handling

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon
- **ORM**: Drizzle with TypeScript schema definitions
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple
- **Local Storage**: Browser localStorage for authentication token persistence

## Key Components

### Database Schema
The application uses a relational schema with the following main entities:
- **Users**: Core user information and authentication
- **Cycles**: Period cycle tracking with start/end dates and active status
- **Daily Logs**: Daily symptom tracking, mood, water intake, and notes
- **Predictions**: Calculated cycle predictions and fertile windows
- **Journal Entries**: Personal diary entries with mood tracking
- **User Settings**: Personalized preferences and notification settings

### Authentication System
- **Registration/Login**: Email and password-based authentication
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Persistent sessions with automatic token expiration
- **Protected Routes**: Route-level authentication checks

### Core Features
1. **Cycle Tracking**: Period start/end logging with automatic predictions
2. **Daily Logging**: Symptom tracking, mood monitoring, water intake
3. **Calendar View**: Visual cycle history and predictions
4. **Insights Dashboard**: Statistics and trend analysis
5. **Journal**: Personal diary with mood and tag support
6. **AI Assistant**: Health advice chatbot with predefined responses
7. **Exercise Library**: Period-relief exercises with instructions

## Data Flow

### Client-Server Communication
1. **Frontend** makes API requests using fetch with credential inclusion
2. **Express middleware** handles request logging and error catching
3. **Route handlers** process requests and interact with database
4. **Drizzle ORM** manages database queries and type safety
5. **Responses** return JSON data with consistent error handling

### State Management Flow
1. **Authentication Context** manages user state globally
2. **TanStack Query** handles server state caching and synchronization
3. **Local Storage** persists authentication tokens
4. **React Context** provides user data to components

### Data Synchronization
- Real-time updates through query invalidation
- Optimistic updates for better user experience
- Error boundaries for graceful error handling
- Automatic retry logic for failed requests

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: Neon PostgreSQL driver
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **bcrypt**: Password hashing
- **express**: Web framework
- **wouter**: Lightweight routing

### UI/UX Libraries
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Conditional styling utility

### Development Tools
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **tsx**: TypeScript execution
- **esbuild**: Fast bundling for production

## Deployment Strategy

### Development Environment
- **Vite dev server** with hot module replacement
- **Express server** running in development mode with tsx
- **Database migrations** using Drizzle Kit
- **Environment variables** for database configuration

### Production Build
1. **Frontend**: Vite builds optimized static assets
2. **Backend**: esbuild bundles server code for Node.js
3. **Database**: Migrations applied via Drizzle Kit push command
4. **Static serving**: Express serves built frontend assets

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **Session secrets**: For secure session management

The application is designed to be deployed as a single Node.js process serving both the API and static frontend files, making it suitable for platforms like Railway, Heroku, or any Node.js hosting environment.

## Changelog
```
Changelog:
- July 07, 2025. Initial setup
- July 07, 2025. Added PostgreSQL database integration with full DatabaseStorage implementation
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```