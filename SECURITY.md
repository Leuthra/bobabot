# Security Policy

At Bobabot, we take security seriously. This document provides guidelines for reporting vulnerabilities and maintaining secure deployments.

## Supported Versions

We currently provide security updates for the following versions of Bobabot:

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | Yes                |
| 1.x     | No                 |

## Reporting a Vulnerability

If you discover a security vulnerability within Bobabot, please do not open a public issue. Instead, report it via one of the following methods:

- **Email:** [romidev20@gmail.com](mailto:romidev20@gmail.com)
- **GitHub Private Reports:** Use the "Report a vulnerability" feature in the repository.

Please include as much detail as possible, including:

- Description of the vulnerability.
- Steps to reproduce the issue.
- Potential impact if the vulnerability is exploited.

We aim to acknowledge all reports within 48 hours and provide a fix or mitigation strategy within 7 days.

## Deployment Security Best Practices

To maintain a secure bot instance, we recommend the following:

### 1. Environment Variables
Never commit your `.env` file to version control. It contains sensitive tokens (WhatsApp, Telegram, Discord) and database credentials.

### 2. API Authentication
If you enable the REST API, always set a strong `API_SECRET` in your `.env` file. This prevents unauthorized users from broadcasting messages through your bot.

### 3. Database Access
Ensure your database file (e.g., `dev.db`) is not publicly accessible if hosted on a web server. Use appropriate filesystem permissions to restrict access to the bot process.

### 4. Third-Party Plugins
Be cautious when adding third-party plugins. Review the code to ensure they do not perform malicious actions or leak user data.

## Responsible Disclosure

We appreciate your help in keeping Bobabot secure for everyone. We ask that you give us reasonable time to investigate and address any reported issues before making them public.
