# Notification Engine API

A Hono-based server that accepts notifications from [Monika](https://monika.hyperjump.tech).

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
cd apps/notify-api
pnpm install
```

### Development

Start the development server with hot reload:

```bash
pnpm dev
```

The server will start on `http://localhost:5001` by default. You can then use the `monika.yml` file to test the API using [Monika](https://monika.hyperjump.tech) by running `monika -c monika.yml`.

### Production (Netlify Functions)

As of September 2025, the production API is currently deployed on Netlify Functions from the `notify-api-netlify` app.

## API Endpoints

### **POST** `/api/notify`

Sends notifications to users based on the action type and forwards them to WhatsApp.

#### Query Parameters

| Parameter | Type   | Required | Description                  |
| --------- | ------ | -------- | ---------------------------- |
| `token`   | string | Yes      | Webhook authentication token |

#### Request Body

The request body uses a discriminated union based on the `type` field. Each type has different required fields:

##### 1. Start/Terminate Actions

```json
{
  "type": "start" | "terminate",
  "ip_address": "127.0.0.1"
}
```

**Fields:**

- `type`: Must be either `"start"` or `"terminate"`
- `ip_address`: The IP address associated with the action

##### 2. Incident/Recovery Actions

```json
{
  "type": "incident" | "recovery" | "incident-symon" | "recovery-symon",
  "alert": "High CPU usage detected",
  "url": "https://example.com/monitoring",
  "time": "2024-01-15T10:30:00Z",
  "monika": "production-monitor-01"
}
```

**Fields:**

- `type`: Must be one of `"incident"`, `"recovery"`, `"incident-symon"`, or `"recovery-symon"`
- `alert`: Description of the incident or recovery event
- `url`: URL to the monitoring dashboard or relevant page
- `time`: Timestamp of the event
- `monika`: Identifier for the monitoring instance

##### 3. Status Update Actions

```json
{
  "type": "status-update",
  "time": "2024-01-15T10:30:00Z",
  "monika": "production-monitor-01",
  "numberOfProbes": 150,
  "averageResponseTime": 245,
  "numberOfIncidents": 2,
  "numberOfRecoveries": 1,
  "numberOfSentNotifications": 5
}
```

**Fields:**

- `type`: Must be `"status-update"`
- `time`: Timestamp of the status update
- `monika`: Identifier for the monitoring instance
- `numberOfProbes`: Total number of probes executed
- `averageResponseTime`: Average response time in milliseconds
- `numberOfIncidents`: Number of incidents detected
- `numberOfRecoveries`: Number of recoveries detected
- `numberOfSentNotifications`: Number of notifications sent

#### Response Format

##### Success Response

```json
{
  "message": "Message sent",
  "status": 200
}
```

##### Error Responses

| Status Code | Error Code             | Description                          |
| ----------- | ---------------------- | ------------------------------------ |
| 400         | `INVALID_REQUEST_BODY` | Request body validation failed       |
| 401         | `TOKEN_NOT_FOUND`      | Token parameter missing or invalid   |
| 401         | `INVALID_TOKEN`        | Token not found in database          |
| 401         | `USER_NOT_FOUND`       | User associated with token not found |

#### Example Usage

##### cURL Example

```bash
curl -X POST "http://localhost:5001/api/notify?token=your-webhook-token" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "incident",
    "alert": "Database connection timeout",
    "url": "https://dashboard.example.com/db",
    "time": "2024-01-15T10:30:00Z",
    "monika": "db-monitor-01"
  }'
```

##### JavaScript Example

```javascript
const response = await fetch(
  "http://localhost:5001/api/notify?token=your-webhook-token",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "status-update",
      time: new Date().toISOString(),
      monika: "web-monitor-01",
      numberOfProbes: 100,
      averageResponseTime: 150,
      numberOfIncidents: 0,
      numberOfRecoveries: 0,
      numberOfSentNotifications: 0,
    }),
  }
);

const result = await response.json();
console.log(result);
```

#### Notes

- All notifications are forwarded to WhatsApp using the user's phone hash
- The `-symon` suffix in incident/recovery types is automatically stripped when processing
- Numeric fields in status updates are converted to strings when sending WhatsApp messages
- The endpoint requires a valid webhook token that maps to an existing user
