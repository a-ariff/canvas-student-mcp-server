# Privacy Policy

**Last Updated:** October 5, 2025

## Overview

Canvas Student MCP Server ("the Service") is an open-source Model Context Protocol (MCP) server that provides AI assistants (like Claude, ChatGPT) with access to Canvas Learning Management System data. 
We value your privacy and are committed to transparency in how we handle your information.
This privacy policy explains how your data is handled.

---

## Data Collection

### What Data We Access

When you use this Service, it accesses your Canvas LMS data through the Canvas API, including:

- **User Profile:** Your name, email, and Canvas user ID
- **Course Information:** Enrolled courses, course details, modules
- **Academic Data:** Assignments, grades, submissions, quizzes
- **Calendar Data:** Upcoming events, deadlines, to-do items
- **Communications:** Course announcements, discussion posts

### What Data We Store

**Local/Self-Hosted Deployment (Recommended):**
- ✅ **NO DATA IS STORED** - All data fetched from Canvas API is processed in-memory only
- ✅ Your Canvas API key is stored locally in your configuration file only
- ✅ No data is sent to third-party servers (except Canvas LMS itself)

**Fly.io Deployment:**
- ✅ Canvas API key stored as encrypted environment variable on Fly.io
- ✅ Request logs may be retained temporarily (standard server logs)
- ✅ No Canvas data is permanently stored in databases
- ⚠️ Server-side caching may temporarily cache API responses (expires automatically)

**Cloudflare Workers Deployment:**
- ✅ Cloudflare KV (Key-Value) storage used for caching API responses (TTL: 5 minutes)
- ✅ Rate limiting data stored temporarily
- ✅ Analytics data collected (request counts, no personal data)

---

## Data Usage

### How Your Data Is Used

Your Canvas data is used **exclusively** to:
- Respond to queries from AI assistants (Claude Desktop, ChatGPT Custom GPTs)
- Display course information, assignments, grades as requested
- Provide calendar and deadline information
- Help you manage your academic work through AI assistance

### How Your Data Is NOT Used

We do **NOT**:
- ❌ Sell your data to third parties
- ❌ Use your data for advertising
- ❌ Share your data with other users
- ❌ Train AI models on your academic data
- ❌ Store your grades, assignments, or personal information permanently

---

## Data Sharing

### Third-Party Services

**Canvas LMS (Instructure):**
- All data originates from and is fetched directly from your Canvas instance
- Subject to Canvas LMS privacy policy: https://www.instructure.com/policies/privacy

**AI Providers:**
- **Claude Desktop (Anthropic):** Data sent to Claude AI for processing your requests
  - Subject to Anthropic privacy policy: https://www.anthropic.com/privacy
- **ChatGPT Custom GPTs (OpenAI):** Data sent to ChatGPT for processing your requests
  - Subject to OpenAI privacy policy: https://openai.com/policies/privacy-policy

**Infrastructure Providers:**
- **Fly.io:** Hosting provider (if using Fly.io deployment)
  - Server logs may contain request metadata
  - Subject to Fly.io privacy policy: https://fly.io/legal/privacy-policy/
- **Cloudflare:** CDN and Workers platform (if using Cloudflare deployment)
  - Analytics and caching as described above
  - Subject to Cloudflare privacy policy: https://www.cloudflare.com/privacypolicy/

### Multi-User Considerations

**⚠️ CRITICAL SECURITY NOTICE:**

**Current Architecture (Single-User):**
- The Service uses a **single Canvas API key** configured by the deployer
- If deployed as a ChatGPT Custom GPT and shared publicly:
  - ❌ **All users will access the SAME Canvas account** (yours!)
  - ❌ **Anyone can see your courses, grades, and personal data**
  - ❌ **This is a SERIOUS privacy and security risk**

**Recommended Configuration:**
- ✅ **Use "Only me" visibility** for ChatGPT Custom GPTs
- ✅ **Self-host locally** for Claude Desktop (most private)
- ✅ **Do NOT share** your deployment publicly

**For Multi-User Deployment:**
- Requires OAuth implementation (each user brings their own Canvas credentials)
- Current codebase does NOT support multi-user safely
- See FINAL_STATUS_REPORT.md for multi-user architecture requirements

---

## Data Security

### Security Measures

**API Key Protection:**
- Canvas API keys stored as environment variables (not in code)
- Fly.io secrets are encrypted at rest and in transit
- Bearer token authentication required for HTTP endpoints
- Unauthorized access attempts are logged and blocked

**Transport Security:**
- All API requests use HTTPS/TLS encryption
- Fly.io deployment enforces HTTPS
- Cloudflare deployment uses automatic HTTPS

**Limitations:**
- ⚠️ Canvas API keys grant full access to your Canvas account
- ⚠️ If your API key is compromised, revoke it immediately in Canvas settings
- ⚠️ Server-side deployments trust the AI assistant's requests (no additional validation)

### Known Risks

**Prompt Injection:**
- Malicious AI prompts cannot access your environment variables (Fly.io secrets)
- BUT malicious prompts CAN request your Canvas data through legitimate API calls
- Recommendation: Only use with trusted AI assistants

**Shared Deployments:**
- If you share your ChatGPT GPT publicly, anyone can access YOUR Canvas data
- This is by design (single API key architecture)
- **ALWAYS use "Only me" visibility**

---

## Your Rights

### Data Access and Control

**You have the right to:**
- ✅ Access all data the Service retrieves (it's your Canvas data)
- ✅ Delete your API key from the Service at any time (revoke in Canvas settings)
- ✅ Stop using the Service at any time (no data retention)
- ✅ Self-host the Service for maximum privacy (recommended)

**To exercise these rights:**
1. **Stop the Service:** Delete configuration or stop the server
2. **Revoke API Access:** Go to Canvas → Settings → Approved Integrations → Revoke token
3. **Delete Cached Data:** (Cloudflare only) Wait 5 minutes for cache TTL expiration or manually clear KV storage

### Data Retention

**Local/Self-Hosted:**
- No data retention (all in-memory)
- API key stored in config file until you delete it

**Fly.io:**
- Server logs retained for debugging (typically 7-30 days)
- Environment variables (secrets) retained until you delete them
- No Canvas data stored beyond request processing

**Cloudflare:**
- KV cache: 5 minutes TTL (auto-expires)
- Analytics: Aggregated metrics only (no personal data)
- Rate limit data: Expires automatically

---

## Children's Privacy

This Service is intended for use by students and educators of all ages. If you are under 18:
- You should have parental/guardian consent to use Canvas LMS
- The Service does not collect any data beyond what Canvas already has
- All Canvas data policies apply

---

## Open Source and Transparency

### Code Transparency

This Service is **fully open source:**
- GitHub: https://github.com/a-ariff/canvas-instant-mcp
- You can review all code to verify privacy claims
- No hidden data collection or telemetry
- Community auditable

### Contributions and Modifications

If you modify or fork this Service:
- You are responsible for your own privacy practices
- This privacy policy applies only to the official release
- We recommend publishing your own privacy policy for modified versions

---

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be:
- Documented with "Last Updated" date at the top
- Committed to the GitHub repository with changelog
- Major changes will be announced in README.md

**Your continued use of the Service after changes constitutes acceptance of the updated policy.**

---

## Contact Information

### Questions or Concerns

For privacy-related questions:
- **GitHub Issues:** https://github.com/a-ariff/canvas-instant-mcp/issues
- **Email:** (Add your contact email if you want to provide support)

### Data Breach Notification

If we become aware of a security breach affecting your Canvas API key or data:
- We will notify affected users via GitHub issue or repository notice
- You should immediately revoke your Canvas API token
- No user contact information is stored, so direct notification may not be possible

---

## Jurisdiction and Compliance

**GDPR (European Users):**
- Data Controller: You (the person who deployed the Service)
- Data Processor: Canvas LMS, AI providers (Claude/ChatGPT)
- Legal basis: Consent (by using the Service)
- Data transfers: To US-based services (Anthropic, OpenAI, Instructure)

**FERPA (US Educational Records):**
- Canvas LMS data may include FERPA-protected educational records
- Ensure your use complies with your institution's FERPA policies
- Self-hosting recommended for maximum FERPA compliance

**CCPA (California Residents):**
- You have the right to know what data is collected (see "Data Collection" above)
- You have the right to delete your data (revoke API key)
- We do not sell your personal information

---

## Disclaimer

**This Service is provided "AS IS" without warranties:**
- ⚠️ We are not responsible for data breaches if you share your API key
- ⚠️ We are not responsible for misuse by third parties
- ⚠️ You are responsible for securing your deployment
- ⚠️ Use at your own risk

**For maximum privacy:**
1. ✅ Self-host locally (Claude Desktop)
2. ✅ Use "Only me" visibility (ChatGPT GPTs)
3. ✅ Never share your Canvas API key
4. ✅ Review code before deploying
5. ✅ Revoke API tokens when not in use

---

**By using Canvas Student MCP Server, you acknowledge that you have read and understood this Privacy Policy.**

---

**Version:** 1.0.0
**Effective Date:** October 5, 2025
**Repository:** https://github.com/a-ariff/canvas-instant-mcp
