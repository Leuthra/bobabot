# Bobabot v2.0

An open-source, modular, and event-driven omnichannel bot engine designed for WhatsApp, Telegram, and Discord. Built with Node.js (ESM), Prisma, and a robust adapter-based architecture.

## Overview

Bobabot provides a unified interface for multiple messaging platforms. By utilizing a "Universal Context" pattern, developers can write a single plugin that functions seamlessly across WhatsApp, Telegram, and Discord.

## Key Features

- **Multi-Platform Support**: Built-in adapters for WhatsApp (Baileys), Telegram (Telegraf), and Discord (Oceanic.js).
- **Universal Context**: Abstracted message object ('m') that standardizes replies, media sending, and reactions.
- **Stateless Architecture**: Database-first approach using Prisma ORM (SQLite/PostgreSQL).
- **Event-Driven**: Centralized EventBus for cross-component communication.
- **REST API**: Built-in Hono API for broadcasting messages, checking status, and managing users.
- **Admin Tools**: Comprehensive in-chat and API-based user management (Premium, Bans, Limits).
- **Security**: Idempotency features to prevent duplicate message processing and optional API authentication.

## Prerequisites

- Node.js >= 20.0.0
- npm or yarn
- An active database (SQLite is default)

## Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Leuthra/bobabot.git
cd bobabot
npm install
```

### 2. Configuration

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Key configuration variables:
- `WA_SESSION_ID`: Unique name for your WhatsApp session.
- `TG_BOT_TOKEN`: Your Telegram Bot API token.
- `DISCORD_BOT_TOKEN`: Your Discord Bot token.
- `BOT_OWNER`: Your platform ID (e.g., your WhatsApp LID or Telegram ID).
- `API_SECRET`: Secret key for Bearer authentication on API endpoints.

### 3. Database Initialization

Run Prisma migrations to set up your database:

```bash
npx prisma db push
npx prisma generate
```

### 4. Running the Application

Start the engine:

```bash
npm start
```

For development with hot-reload:

```bash
npm run dev
```

## API Documentation

The bot exposes a REST API on the port specified in `.env` (default: 3000).

- `GET /api/status`: Health check and system status.
- `POST /api/broadcast`: Send messages to all users across all platforms.
- `GET /api/users`: Retrieve registered user list.
- `PATCH /api/users/:id`: Update user status (e.g., set premium or ban).

## Testing

The project uses Vitest for unit testing.

```bash
npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
