# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-04-02

### Added
- Omnichannel Support: Introduced adapters for Telegram (via Telegraf.js) and Discord (via Oceanic.js).
- Universal Context Architecture: Standardized message objects ('m') for cross-platform plugin compatibility.
- Broadcast API: New REST endpoint for sending messages to all platform users.
- User Management: Administrative tools for banning, granting premium, and setting limits.
- Automated Testing: Integrated Vitest for core engine components and helpers.
- GitHub Actions: CI pipeline for automated build and test validation.

### Changed
- Migrated legacy WhatsApp logic to event-driven adapter pattern.
- Updated Baileys to version 7.0.0-rc.9.
- Refactored plugin loader to handle platform-agnostic commands.

## [1.0.0] - 2026-04-01

### Added
- Initial project release.
- Core engine with ESM support.
- Basic WhatsApp integration via Baileys.
- Prisma ORM with SQLite support.
- Idempotency layer for message deduplication.
