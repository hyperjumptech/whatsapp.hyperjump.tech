# Facebook Webhooks Server

A Hono-based mock server that handles the Facebook Webhooks events.

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
cd apps/facebook-webhooks
pnpm install
```

### Development

Start the development server with hot reload:

```bash
pnpm dev
```

The server will start on `http://localhost:5001` by default.

### Production

Build and start the production server:

```bash
pnpm build
pnpm start
```

## API Endpoints

### Root Endpoint

- **GET** `/` - Server information and available endpoints

### Health Check

- **GET** `/health` - Server health status

### WhatsApp Messages

- **GET** `/api/webhook/facebook` - This end point is used to handle the challenge request from Facebook.
- **POST** `/api/webhook/facebook` - Receives the webhook request from Facebook. We store the event to the database.

## Facebook Webhooks Documentation

- [https://developers.facebook.com/docs/graph-api/webhooks/getting-started/](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/)
