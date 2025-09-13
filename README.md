# TrP Tools - Roblox Management Platform

A professional web application for Roblox group management and administration, built with Next.js 15, TypeScript, and Prisma.

## Features

- 🔐 **Secure Authentication** - OAuth 2.0 with Roblox integration
- 🌍 **Internationalization** - Support for English and Russian
- 🎨 **Theme System** - Dark, light, and midnight themes
- 📱 **Responsive Design** - Works on desktop and mobile
- 🛡️ **Error Handling** - Comprehensive error boundaries and loading states
- 🔧 **Type Safety** - Full TypeScript support

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Lucia Auth with Roblox OAuth
- **Styling**: Tailwind CSS v4
- **Icons**: Tabler Icons
- **OAuth**: Arctic library

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Roblox OAuth application credentials

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd trptools-next
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/trptools"

# OAuth Configuration
ROBLOX_CLIENT_ID="your_roblox_client_id"
ROBLOX_CLIENT_SECRET="your_roblox_client_secret"

# Security
SESSION_SECRET="your_session_secret_key_here"

# Application
NODE_ENV="development"
APP_URL="http://localhost:3000"
OAUTH_CALLBACK_URL="http://localhost:3000/login/callback"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
```

### 5. Roblox OAuth Setup

1. Go to [Roblox Developer Portal](https://create.roblox.com/dashboard/credentials)
2. Create a new OAuth application
3. Set the redirect URI to `http://localhost:3000/login/callback` (development)
4. Copy the Client ID and Client Secret to your `.env.local` file

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [lang]/            # Internationalized routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── settings/          # Settings page components
│   └── topbar/            # Header components
├── lib/                   # Utility libraries
│   ├── auth/              # Authentication logic
│   ├── services/          # Business logic services
│   └── config.ts          # Environment configuration
├── middleware.ts          # Next.js middleware
└── strings/               # Internationalization strings
```

## Key Design Decisions

### Authentication
- Uses Lucia Auth patterns for secure session management
- OAuth 2.0 with PKCE for Roblox integration
- Secure cookie handling with proper flags

### Architecture
- Server/Client component separation for optimal performance
- Service layer for business logic separation
- Centralized configuration management
- Comprehensive error handling and loading states

### Security
- Environment variable validation
- Proper TypeScript types for all data
- CSRF protection through state validation
- Secure session management

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript strict mode enabled
- ESLint configuration for code quality
- Consistent naming conventions
- Proper error handling throughout

## Deployment

### Environment Variables

Ensure all required environment variables are set in production:

- `DATABASE_URL` - PostgreSQL connection string
- `ROBLOX_CLIENT_ID` - Roblox OAuth client ID
- `ROBLOX_CLIENT_SECRET` - Roblox OAuth client secret
- `SESSION_SECRET` - Secure random string for session encryption
- `NODE_ENV` - Set to "production"
- `APP_URL` - Your production domain
- `OAUTH_CALLBACK_URL` - Production OAuth callback URL

### Database

Run database migrations in production:

```bash
npx prisma db push
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
