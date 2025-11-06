# API Server

Express.js API server.

## Setup

### 1. Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` to contain correct values.

### 2. MongoDB Setup

The API server expects a MongoDB Atlas connection string. Make sure your MongoDB cluster:

- Is accessible from your IP address (or 0.0.0.0/0 for development)
- Has a user with read/write permissions
- Is configured with the correct app name

### 3. Running the Server

#### Development
```bash
npm run dev
```

#### Production
```bash
npm run build
npm start
```

## Endpoints

### GET /trpc/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-09-16T21:44:06.841Z"
}
```

### GET /trpc/status
MongoDB connection status.

**Success Response:**
```json
{
  "db": {
    "mongo": {
      "status": "connected",
      "message": "MongoDB connection established successfully",
      "timestamp": "2025-09-16T21:44:09.851Z"
    }
  }
}
```

**Error Response:**
```json
{
  "db": {
    "mongo": {
      "status": "disconnected",
      "message": "MongoDB connection failed",
      "error": "Connection error details",
      "timestamp": "2025-09-16T21:44:09.851Z"
    }
  }
}
```

## Troubleshooting

### MongoDB Connection Issues

1. **Check your environment variables** - Make sure all MongoDB credentials are correct
2. **Verify network access** - Ensure your IP is whitelisted in MongoDB Atlas
3. **Check cluster status** - Verify your MongoDB cluster is running
4. **Test connection string** - Use MongoDB Compass to test your connection string

### Port Conflicts

If port 3000 is already in use, change the `API_PORT` in your `.env` file:

```env
API_PORT=3002
```

Then update the client applications to use the new port.

### Verbose debug logging

Verbose debug logging is facilitated by the [debug](https://www.npmjs.com/package/debug) package, and is turned off by default.

Many 3rd party packages utilize the debug package.

To enable verbose logging, set the `DEBUG` variable in .env to include the namespace(s) that you want verbose logging for.

#### Examples:

* Everything: `DEBUG=*` (noisy!)
* Everything except Prisma: `DEBUG=*,-prisma:*`
* Only Prisma Client: `DEBUG=prisma:client`
* Only Router: `DEBUG=router`
* Prisma client, router, express, and app: `DEBUG=prisma:client,router,express:*,app:*`

## Development

The server uses:
- **Express.js** for the web framework
- **TypeScript** for type safety
- **dotenv** for environment variable loading
- **MongoDB** for database connectivity
- **CORS** for cross-origin requests
