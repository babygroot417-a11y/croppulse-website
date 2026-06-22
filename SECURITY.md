# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in CropPulse, please report it responsibly:

1. **Do not** open a public GitHub issue for security vulnerabilities.
2. Email the maintainers directly with details of the vulnerability.
3. Include steps to reproduce, potential impact, and any suggested fixes.
4. You can expect an initial response within 72 hours.

## Security Practices

- **Secrets**: Never commit API keys, credentials, or OTP data to the repository. Use environment variables and `.env` files (which are gitignored).
- **Dependencies**: Run `npm audit` regularly and update vulnerable packages promptly.
- **Authentication**: Protected pages require authentication before access. Client-side guards redirect unauthenticated users to the login page.
- **XSS Prevention**: Use safe DOM methods (`textContent`, `createElement`) instead of `innerHTML` when rendering dynamic content.
- **Git History**: If secrets are accidentally committed, rotate them immediately. Removing them from the current branch does not erase them from git history.

## Known Limitations

- The current demo uses a client-side OTP check. Production deployments should use server-side authentication (e.g., Firebase Auth with proper backend verification).
- The hardcoded demo OTP (`1234`) is for development/demo purposes only and must be replaced with real OTP verification in production.
