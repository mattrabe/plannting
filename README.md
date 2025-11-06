# Plannting App Monorepo

A monorepo containing both an Express API and an Expo React Native mobile application.

## Structure

```
plannting/
├── apps/
│   ├── api/          # Express.js API server
│   └── mobile/       # Expo React Native mobile application
├── packages/
│   └── shared/       # Shared types and utilities
└── package.json      # Root workspace configuration
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- For mobile development: Expo CLI and mobile device/simulator

## Getting Started

### Install Dependencies

```bash
# Install all dependencies for the entire monorepo
npm run install:all
```

### Development

#### Run All Apps Simultaneously
```bash
npm run dev
```

#### Run Individual Apps

**API Server (Express.js)**
```bash
npm run dev:api
# or
cd apps/api && npm run dev
```

**Mobile App (Expo)**
```bash
npm run dev:mobile
# or
cd apps/mobile && npm run start
```

### Building

#### Build API Server
```bash
npm run build:api
```

#### Build Mobile App
```bash
npm run build:mobile
```

### Other Commands

```bash
# Clean all node_modules
npm run clean

# Lint apps
npm run lint
```

## Applications

### API Server (`apps/api`)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB
- **Features**:
  - RESTful API endpoints
  - MongoDB connection management
  - Health check endpoint
  - CORS enabled for cross-origin requests

### Mobile App (`apps/mobile`)
- **Framework**: Expo with React Native
- **Data Fetching**: TanStack Query
- **Features**:
  - MongoDB connection status monitoring via API
  - Native mobile interface
  - Real-time updates

### Shared Package (`packages/shared`)
- **MOVED!**: This was moved into duplicate code in the separate apps for now.
- **Purpose**: Shared TypeScript types and utilities
- **Exports**: Common interfaces like `ApiStatus` and `Config`

## API Endpoints

The API server runs on `http://localhost:3000` by default.

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-09-16T21:29:07.595Z"
}
```

### GET /status
Returns the MongoDB connection status.

**Response:**
```json
{
  "db": {
    "mongo": {
      "status": "connected",
      "message": "MongoDB connection established successfully",
      "timestamp": "2025-09-16T20:48:05.028Z"
    }
  }
}
```

## Development Notes

- The API server runs on `http://localhost:3000` by default
- The mobile app connects to the API server at `http://localhost:3000`
- For testing on physical devices, you may need to use your computer's IP address instead of localhost
- All apps use TanStack Query for data fetching with automatic caching and background updates
- The shared package ensures type consistency between all applications
- The API server handles all database connections and business logic

## Deploying

This app is deployed using Vercel automatically, any time a PR is merged into the `main` branch.

See Vercel project here: https://vercel.com/matt-rabe/plannting-api

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Run all apps (API on :3000, mobile) |
| `npm run dev:api` | Run only the API server (port 3000) |
| `npm run dev:mobile` | Run only the mobile app |
| `npm run build` | Build API and apps |
| `npm run build:api` | Build the API server |
| `npm run build:mobile` | Build the mobile app |
| `npm run start` | Start production API (port 3000) server |
| `npm run start:api` | Start production API server (port 3000) |
| `npm run clean` | Clean all node_modules |
| `npm run install:all` | Install dependencies for all packages |
