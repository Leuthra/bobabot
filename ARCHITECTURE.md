# Architecture Overview

This document describes the high-level architecture of Bobabot v2.0 and the design patterns used to achieve its omnichannel capabilities.

## Design Philosophy

The core philosophy of Bobabot is to remain **stateless**, **modular**, and **platform-agnostic**. A single bot instance should be able to handle multiple messaging services simultaneously without duplicating business logic.

## High-Level Components

### 1. Unified Messaging Context (Universal 'm')

The most critical part of the architecture is the **Universal Message Object (`m`)**. Every incoming message from any platform is passed through a **Serializer** that transforms the raw platform-specific object into a standardized format.

Standard fields include:
- `id`: Message identifier.
- `from`: Group or Chat ID.
- `sender`: User ID.
- `body`: Message text content.
- `platform`: 'whatsapp', 'telegram', or 'discord'.

Standard methods:
- `reply(text)`: Replies to the current message.
- `react(emoji)`: Adds a reaction.
- `sendMedia(options)`: Sends images, videos, or documents.

### 2. Adapter Pattern

Each messaging platform is implemented as an **Adapter** extending the `BaseAdapter` class. This ensures a consistent interface for the `bootstrap` process and the `EventBus`.

- `WhatsAppAdapter`: Wraps @whiskeysockets/baileys.
- `TelegramAdapter`: Wraps telegraf.
- `DiscordAdapter`: Wraps oceanic.js.

### 3. Event-Driven Communication

Bobabot uses a centralized **EventBus** to facilitate communication between independent modules:
- Adapters emit `message.incoming` when a new message is received.
- The `PluginLoader` listens for these events to execute commands.
- The `API` layer can broadcast events to specific adapters.

### 4. Plugin Loader

The **Plugin Loader** dynamically loads files from the `src/plugins/` directory. Each plugin exports a structured object containing:
- `command`: Trigger keywords.
- `execute`: The async function containing business logic.
- Permission flags: `isOwner`, `isPremium`, `isAdmin`.

## Data Persistence

Bobabot uses **Prisma ORM** with **SQLite** for all data storage.
- User profiles are automatically created and synchronized upon their first interaction.
- Session states for WhatsApp are stored in the database to maintain a stateless environment for the bot process.

## API Integration

The API layer is built on **Hono**. It interacts with the `Adapter Registry` provided by the `bootstrap` process, allowing external systems to trigger messages through the bot without a direct messaging event.
