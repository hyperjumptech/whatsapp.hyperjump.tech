# WhatsApp Mock Server

A Hono-based mock server that simulates the WhatsApp Business API for development and testing of `web` app.

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
cd apps/whatsapp-mock-server
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

- **POST** `/:phoneId/messages` - Send WhatsApp message

#### Request Format

```json
{
  "messaging_product": "whatsapp",
  "to": "+1234567890",
  "type": "template",
  "template": {
    "name": "template_name",
    "language": {
      "code": "en"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "parameter_value"
          }
        ]
      }
    ]
  }
}
```

#### Headers

```
Authorization: Bearer <your-access-token>
Content-Type: application/json
```

#### Response Format

**Success (200):**

```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "+1234567890",
      "wa_id": "+1234567890"
    }
  ],
  "messages": [
    {
      "id": "mock-message-1234567890-abc123"
    }
  ]
}
```

**Error (400/401/500):**

```json
{
  "error": {
    "message": "Error description",
    "type": "OAuthException",
    "code": 100,
    "error_subcode": 33,
    "fbtrace_id": "mock-fbtrace-id"
  }
}
```
