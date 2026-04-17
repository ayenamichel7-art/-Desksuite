# Security Policy

## Supported Versions

We only support the latest version of Desksuite. Please ensure you are running the most recent commit.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities.**

If you discover a security vulnerability within Desksuite, please send an e-mail to Ayena Michel at `contact@desksuite.com`. All security vulnerabilities will be promptly addressed.

Please include the following information in your report:
- Type of issue (e.g., SQL injection, XSS, etc.)
- Steps to reproduce
- Potential impact

## Security Features in Desksuite

Desksuite is built with a "Security First" approach:
- **Data Isolation**: Multi-tenancy is enforced at the database level.
- **Service Isolation**: Each component (API, Worker, UI) runs in an isolated Docker container with zero-trust networking via Cloudflare.
- **Secure Communication**: All inter-service communication is signed with a high-entropy `INTERNAL_API_TOKEN`.
- **Sanitized Inputs**: Strong type checking via TypeScript and Laravel Data Objects.
- **Encrypted Storage**: Sensitive files are stored in S3-compatible private buckets with restricted access.
