# Changelog

All notable changes to this project will be documented in this file.

The format is based on
[Keep a Changelog](<https://keepachangelog.com/en/1.0.0/>), and this project
adheres to [Semantic Versioning](<https://semver.org/spec/v2.0.0.html>).

## [1.0.0] - 2025-10-08

### Major Release - Production Ready

This release marks the completion of a major repository cleanup and
architecture consolidation, transitioning to a production-ready TypeScript-only
implementation deployed on Cloudflare Workers.

### Added

- OAuth 2.1 with PKCE authentication flow
- Secure token storage using Cloudflare Durable Objects
- Global edge deployment with sub-100ms response times
- 12 comprehensive Canvas LMS tools
- Server-Sent Events (SSE) transport for real-time communication
- Complete API documentation for all endpoints
- Security features: client whitelist, redirect URI validation, rate limiting
- Health check endpoint with server status monitoring

### Changed

- Migrated to TypeScript-only codebase (removed Python implementation)
- Consolidated to 2-package monorepo structure:
  - `remote-mcp-server-authless` - Main MCP server with OAuth
  - `cloudflare-canvas-api` - REST API proxy with landing page
- Complete README rewrite with clearer structure and examples
- Updated npm scripts for better developer experience
- Enhanced security with OAuth 2.1 best practices

### Removed

- Deprecated Python MCP server implementation
- Temporary documentation and cleanup files
- Unused dependencies (Jest, Python tooling)
- Python virtual environment and artifacts

### Fixed

- Resolved duplicate content in README
- Fixed package.json scripts referencing deleted packages
- Updated dependencies and addressed security advisories
- Corrected repository structure documentation

### Technical Details

- **Runtime**: Cloudflare Workers (V8 isolates)
- **Language**: TypeScript 5.9+
- **Authentication**: OAuth 2.1 with PKCE (RFC 7636)
- **Storage**: Cloudflare Durable Objects, KV
- **Transport**: SSE, HTTP
- **Deployment**: Global edge network (99.9% uptime)

### Performance

- Response time: <100ms (global average)
- Uptime: 99.9%
- Regions: Deployed to multiple Cloudflare edge locations
- Caching: Intelligent response caching with TTL

### Security

- OAuth 2.1 compliant authentication
- Client ID whitelist enforcement
- Redirect URI validation (exact match)
- Authorization code binding (PKCE)
- State parameter validation
- Secure session management with Durable Objects
- Rate limiting per client

### Canvas Tools Available

1. `list_courses` - Get all active courses
2. `get_assignments` - Get course assignments
3. `get_upcoming_assignments` - Get upcoming deadlines
4. `get_submission_status` - Check submission status
5. `get_todo_items` - Get student todo list
6. `get_grades` - Get course grades
7. `get_modules` - Get course modules
8. `get_announcements` - Get course announcements
9. `get_discussions` - Get discussion topics
10. `get_calendar_events` - Get calendar events
11. `get_quizzes` - Get quiz information
12. `get_user_profile` - Get user profile

### Deployment

- Production: <https://canvas-mcp-sse.ariff.dev>
- Status: Live and operational
- Health: <https://canvas-mcp-sse.ariff.dev/health>

### Links

- [Production Server](<https://canvas-mcp-sse.ariff.dev>)
- [GitHub Repository](<https://github.com/a-ariff/canvas-student-mcp-server>)
- [MCP Documentation](<https://modelcontextprotocol.io>)
- [Canvas API Docs](<https://canvas.instructure.com/doc/api/>)

---

## [0.2.0] - 2025-10-05

### Changed

- Removed Python MCP server implementation
- Cleaned up documentation files
- Updated README to reflect Cloudflare Workers focus

### Fixed

- Removed hardcoded credentials
- Added proper environment variable configuration

---

## [0.1.0] - Initial Development

### Added

- Initial Canvas MCP server implementation
- Python-based server
- TypeScript Cloudflare Workers server
- Basic authentication support
- Canvas API integration

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to
this project.

## Support

For issues or questions:

1. Check the [README](README.md)
2. Review
   [MCP Server docs](packages/remote-mcp-server-authless/README.md)
3. Open an issue on
   [GitHub](<https://github.com/a-ariff/canvas-student-mcp-server/issues>)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE)
file for details.
