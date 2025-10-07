# Contributing to Canvas Student MCP Server

First off, thank you for considering contributing to Canvas Student MCP Server! It's people like you that make this project such a great tool for the community.

## 🎯 Ways to Contribute

There are many ways you can contribute to this project:

- 🐛 **Report bugs** - Found a bug? Let us know!
- ✨ **Suggest features** - Have an idea? We'd love to hear it!
- 📝 **Improve documentation** - Help make our docs better
- 🔧 **Submit pull requests** - Fix bugs or add features
- 💬 **Answer questions** - Help others in discussions
- ⭐ **Star the repo** - Show your support!

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **npm** or **pnpm** package manager
- **Git** for version control
- **Cloudflare account** (for testing Workers)
- **Wrangler CLI** (`npm install -g wrangler`)
- **Canvas LMS account** with API access (for testing)

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/canvas-student-mcp-server.git
   cd canvas-student-mcp-server
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/a-ariff/canvas-student-mcp-server.git
   ```

3. **Install dependencies**
   ```bash
   npm run install:all
   ```

4. **Set up environment**
   ```bash
   # For MCP server
   cd packages/remote-mcp-server-authless
   cp wrangler.jsonc.example wrangler.jsonc
   # Edit wrangler.jsonc with your Cloudflare settings
   
   # For API proxy
   cd ../cloudflare-canvas-api
   cp wrangler.toml.example wrangler.toml
   # Edit wrangler.toml with your settings
   ```

5. **Run locally**
   ```bash
   # MCP Server
   cd packages/remote-mcp-server-authless
   npm run dev
   
   # API Proxy (in another terminal)
   cd packages/cloudflare-canvas-api
   npm run dev
   ```

## 📋 Development Workflow

### Before You Code

1. **Check existing issues**
   - Search [open issues](https://github.com/a-ariff/canvas-student-mcp-server/issues)
   - Comment on the issue you'd like to work on
   - Wait for approval before starting significant work

2. **Create a new issue** (if needed)
   - Use our issue templates
   - Provide clear, detailed information
   - Include reproduction steps for bugs

### While Coding

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Follow our coding standards**
   - Use TypeScript for all new code
   - Follow existing code style
   - Write clear, descriptive variable names
   - Add comments for complex logic

3. **Write tests**
   ```bash
   # Run tests
   npm test
   
   # Run type checking
   npm run type-check
   ```

4. **Keep commits clean**
   ```bash
   # Use conventional commit messages
   git commit -m "feat: add new Canvas tool for file uploads"
   git commit -m "fix: resolve OAuth redirect issue"
   git commit -m "docs: update README with new examples"
   ```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(oauth): add PKCE support for mobile clients
fix(tools): resolve grade calculation rounding error
docs(readme): add deployment troubleshooting section
refactor(api): simplify error handling logic
```

### Before Submitting

1. **Test your changes**
   ```bash
   # Run all tests
   npm test
   
   # Type check
   npm run type-check
   
   # Build
   npm run build
   
   # Test locally
   npm run dev
   ```

2. **Update documentation**
   - Update README.md if needed
   - Update CHANGELOG.md
   - Add JSDoc comments for new functions
   - Update relevant package READMEs

3. **Keep your fork up to date**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

## 🔍 Pull Request Process

### Creating a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a PR on GitHub**
   - Use our PR template
   - Link related issues
   - Provide clear description
   - Add screenshots if applicable

3. **PR title format**
   ```
   feat: Add support for Canvas rubrics
   fix: Resolve OAuth token expiration issue
   docs: Improve quick start guide
   ```

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] CHANGELOG.md updated
- [ ] Linked related issues

### Review Process

1. **Automated checks** run first
   - TypeScript compilation
   - Tests (if any)
   - Code style checks

2. **Manual review** by maintainers
   - Code quality
   - Security implications
   - Performance considerations
   - Documentation completeness

3. **Feedback and iteration**
   - Address reviewer comments
   - Push updates to your branch
   - PR auto-updates

4. **Merge**
   - Once approved, a maintainer will merge
   - Your contribution will be in the next release!

## 📚 Coding Standards

### TypeScript

```typescript
// ✅ Good: Clear types, descriptive names
interface CanvasAssignment {
  id: number;
  name: string;
  dueAt: string | null;
  pointsPossible: number;
}

async function getAssignments(courseId: number): Promise<CanvasAssignment[]> {
  // Implementation
}

// ❌ Bad: Any types, unclear names
function getStuff(x: any): any {
  // Implementation
}
```

### Error Handling

```typescript
// ✅ Good: Specific errors with context
try {
  const assignments = await fetchAssignments(courseId);
  return assignments;
} catch (error) {
  throw new Error(`Failed to fetch assignments for course ${courseId}: ${error.message}`);
}

// ❌ Bad: Silent failures
try {
  const assignments = await fetchAssignments(courseId);
} catch (error) {
  // Ignoring error
}
```

### Async/Await

```typescript
// ✅ Good: Use async/await
async function getCourseData(courseId: number) {
  const course = await fetchCourse(courseId);
  const assignments = await fetchAssignments(courseId);
  return { course, assignments };
}

// ❌ Bad: Promise chains
function getCourseData(courseId: number) {
  return fetchCourse(courseId).then(course => {
    return fetchAssignments(courseId).then(assignments => {
      return { course, assignments };
    });
  });
}
```

## 🔒 Security Guidelines

### Never Commit Secrets

```bash
# ❌ Never commit these
.env
wrangler.toml (with secrets)
*.key
*.pem
config/secrets.json

# ✅ Always in .gitignore
```

### API Tokens

```typescript
// ✅ Good: Environment variables
const apiToken = env.CANVAS_API_TOKEN;

// ❌ Bad: Hardcoded
const apiToken = "12345-abc-secret";
```

### Input Validation

```typescript
// ✅ Good: Validate input
import { z } from 'zod';

const CourseIdSchema = z.number().positive();

function getCourse(courseId: unknown) {
  const validId = CourseIdSchema.parse(courseId);
  // Use validId
}

// ❌ Bad: No validation
function getCourse(courseId: any) {
  // Directly use courseId
}
```

## 🧪 Testing

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('Canvas Tools', () => {
  it('should fetch active courses', async () => {
    const courses = await getActiveCourses();
    expect(courses).toBeInstanceOf(Array);
    expect(courses.length).toBeGreaterThan(0);
  });

  it('should handle invalid course ID', async () => {
    await expect(getCourse(-1)).rejects.toThrow();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📖 Documentation

### Code Comments

```typescript
/**
 * Fetches assignments for a specific course
 * @param courseId - The Canvas course ID
 * @param includeSubmissions - Whether to include submission data
 * @returns Promise resolving to array of assignments
 * @throws Error if course not found or API request fails
 */
async function getAssignments(
  courseId: number,
  includeSubmissions = false
): Promise<Assignment[]> {
  // Implementation
}
```

### README Updates

- Keep examples up to date
- Add screenshots for UI changes
- Update configuration examples
- Document new features

## 🎨 Project Structure

```
canvas-student-mcp-server/
├── packages/
│   ├── remote-mcp-server-authless/  # Main MCP server
│   │   ├── src/
│   │   │   ├── index.ts            # Entry point
│   │   │   ├── oauth-*.ts          # OAuth implementation
│   │   │   └── types.ts            # Type definitions
│   │   ├── package.json
│   │   └── wrangler.jsonc          # Cloudflare config
│   └── cloudflare-canvas-api/       # REST API proxy
│       ├── src/
│       ├── static/
│       └── package.json
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md                  # This file
└── package.json                     # Root workspace config
```

## 🐛 Reporting Bugs

### Before Submitting

1. Check [existing issues](https://github.com/a-ariff/canvas-student-mcp-server/issues)
2. Update to latest version
3. Test with minimal configuration

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. macOS 14.0]
- Node.js: [e.g. 20.0.0]
- Browser: [e.g. Chrome 120]
- Claude Desktop version: [if applicable]

**Additional context**
Any other relevant information.
```

## 💡 Feature Requests

### Before Suggesting

1. Check if feature already requested
2. Consider if it fits project scope
3. Think about implementation complexity

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Any other relevant information, mockups, or examples.
```

## 📞 Getting Help

- **Documentation**: Check our [README](README.md) and package docs
- **Discussions**: Use [GitHub Discussions](https://github.com/a-ariff/canvas-student-mcp-server/discussions)
- **Issues**: For bugs only
- **Security**: Email security@ariff.dev for security issues

## 🏆 Recognition

Contributors will be:
- Listed in release notes
- Mentioned in CHANGELOG.md
- Credited in documentation (if significant contribution)
- Eligible for "Contributor" badge on GitHub

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Accepting constructive criticism gracefully
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable behavior:**
- Trolling, insulting comments, or personal attacks
- Public or private harassment
- Publishing others' private information
- Other unethical or unprofessional conduct

### Enforcement

Violations may be reported to contact@ariff.dev. All complaints will be reviewed and result in appropriate response.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🎉**

Every contribution, no matter how small, makes a difference. We appreciate your time and effort!
