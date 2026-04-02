# Contributing to Bobabot

Thank you for considering a contribution to Bobabot. Please read the following guidelines before submitting a pull request or an issue.

## Development Setup

1. Fork the repository and clone it to your local environment.
2. Install dependencies: `npm install`.
3. Create your configuration: `cp .env.example .env`.
4. Initialize the database: `npx prisma db push`.
5. Run the application in development mode: `npm run dev`.

## Pull Request Process

1. Create a new branch for your feature or bug fix: `git checkout -b feature/new-feature`.
2. Ensure your code follows the existing style and is properly documented with JSDoc comments.
3. Update any relevant documentation, such as the README or ARCHITECTURE files.
4. Add or update tests as necessary using Vitest.
5. Ensure all tests pass: `npm test`.
6. Submit a pull request with a clear description of the changes.

## Issue Reporting

- Use the GitHub issue tracker for bug reports and feature requests.
- Provide clear steps to reproduce the issue and include relevant log output if possible.
- Use a descriptive title and appropriate labels.

## Code Style

- Use ECMAScript Modules (ESM) exclusively.
- Use JSDoc for function and class documentation.
- Maintain consistency with the existing directory structure.
- Avoid inline comments unless absolutely necessary for complex logic.

## Questions

If you have questions about the codebase or architecture, please refer to the [ARCHITECTURE.md](ARCHITECTURE.md) or open a discussion on GitHub.
