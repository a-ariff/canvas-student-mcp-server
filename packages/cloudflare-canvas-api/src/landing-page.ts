/**
 * Landing page HTML with dark mode support
 * This is inlined to avoid needing to bundle static assets in Cloudflare Workers
 */
export const landingPageHTML = (maxRequestsPerMinute: string, cacheTTL: string) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Canvas API Proxy - Multi-User Canvas Integration</title>
    <style>
        :root {
            --bg-primary: #f5f7fa;
            --bg-secondary: #ffffff;
            --bg-hero: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --text-primary: #333;
            --text-secondary: #555;
            --text-muted: #6c757d;
            --border-color: #e1e5e9;
            --code-bg: #f8f9fa;
            --shadow: rgba(0, 0, 0, 0.1);
            --accent-color: #667eea;
            --accent-hover: #5a6fd8;
            --success-bg: #d4edda;
            --success-text: #155724;
            --success-border: #c3e6cb;
            --error-bg: #f8d7da;
            --error-text: #721c24;
            --error-border: #f5c6cb;
        }

        [data-theme="dark"] {
            --bg-primary: #1a1d23;
            --bg-secondary: #25282e;
            --bg-hero: linear-gradient(135deg, #4c5fd5 0%, #5d3a8f 100%);
            --text-primary: #e4e6eb;
            --text-secondary: #b8bdc8;
            --text-muted: #8b92a3;
            --border-color: #3a3f4b;
            --code-bg: #2d3139;
            --shadow: rgba(0, 0, 0, 0.3);
            --accent-color: #7b8ff7;
            --accent-hover: #6a7fe6;
            --success-bg: #1e3a28;
            --success-text: #7dd87d;
            --success-border: #2d5a3d;
            --error-bg: #3a1e22;
            --error-text: #ff8e9a;
            --error-border: #5a2d31;
        }

        @media (prefers-color-scheme: dark) {
            :root:not([data-theme="light"]) {
                --bg-primary: #1a1d23;
                --bg-secondary: #25282e;
                --bg-hero: linear-gradient(135deg, #4c5fd5 0%, #5d3a8f 100%);
                --text-primary: #e4e6eb;
                --text-secondary: #b8bdc8;
                --text-muted: #8b92a3;
                --border-color: #3a3f4b;
                --code-bg: #2d3139;
                --shadow: rgba(0, 0, 0, 0.3);
                --accent-color: #7b8ff7;
                --accent-hover: #6a7fe6;
                --success-bg: #1e3a28;
                --success-text: #7dd87d;
                --success-border: #2d5a3d;
                --error-bg: #3a1e22;
                --error-text: #ff8e9a;
                --error-border: #5a2d31;
            }
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: var(--text-primary);
            background: var(--bg-primary);
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .hero {
            background: var(--bg-hero);
            color: white;
            padding: 60px 40px;
            border-radius: 15px;
            margin-bottom: 40px;
            text-align: center;
        }

        .hero h1 {
            font-size: 3rem;
            margin-bottom: 20px;
            font-weight: 700;
        }

        .hero p {
            font-size: 1.2rem;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto;
        }

        .card {
            background: var(--bg-secondary);
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px var(--shadow);
            transition: transform 0.2s, background-color 0.3s ease;
            margin-bottom: 30px;
        }

        .card:hover {
            transform: translateY(-5px);
        }

        .card h3 {
            color: var(--accent-color);
            margin-bottom: 15px;
            font-size: 1.5rem;
        }

        .endpoint {
            background: var(--code-bg);
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid var(--accent-color);
        }

        .method {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-right: 10px;
        }

        .get { background: #28a745; color: white; }
        .post { background: #007bff; color: white; }

        code {
            background: var(--code-bg);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
            color: var(--text-primary);
        }

        pre {
            background: var(--code-bg);
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 10px 0;
        }

        a {
            color: var(--accent-color);
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        .theme-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-secondary);
            border: 2px solid var(--border-color);
            border-radius: 50px;
            padding: 8px 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 2px 8px var(--shadow);
            transition: all 0.3s ease;
            z-index: 1000;
        }

        .theme-toggle:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px var(--shadow);
        }

        .theme-icon {
            font-size: 20px;
        }

        @media (max-width: 768px) {
            .theme-toggle {
                top: 10px;
                right: 10px;
                padding: 6px 12px;
            }
            .container {
                padding: 10px;
            }
            .hero {
                padding: 40px 20px;
            }
            .hero h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
        <span class="theme-icon" id="themeIcon">🌙</span>
        <span id="themeText">Dark</span>
    </button>

    <div class="container">
        <div class="hero">
            <h1>🎓 Canvas API Proxy</h1>
            <p>Multi-user Canvas LMS integration with caching, rate limiting, and global edge deployment</p>
        </div>

        <div class="card">
            <h3>🚀 Quick Start</h3>
            <ol>
                <li>Get your Canvas API token from Canvas → Account → Settings → Approved Integrations</li>
                <li>Authenticate with <code>POST /auth</code> to get your user ID</li>
                <li>Use your user ID with Canvas API endpoints</li>
            </ol>
        </div>

        <div class="card">
            <h3>📚 API Endpoints</h3>

            <div class="endpoint">
                <span class="method post">POST</span> <strong>/auth</strong>
                <p>Authenticate with Canvas credentials and get a user ID</p>
                <pre><code>{
  "canvasUrl": "https://learn.mywhitecliffe.com",
  "apiKey": "your_canvas_api_token",
  "institutionName": "Your School"
}</code></pre>
            </div>

            <div class="endpoint">
                <span class="method get">GET</span> <strong>/courses/{userId}</strong>
                <p>Get all courses for the authenticated user</p>
            </div>

            <div class="endpoint">
                <span class="method get">GET</span> <strong>/assignments/{userId}?course_id=123</strong>
                <p>Get assignments for a specific course</p>
            </div>

            <div class="endpoint">
                <span class="method get">GET</span> <strong>/upcoming/{userId}</strong>
                <p>Get upcoming assignments and events</p>
            </div>

            <div class="endpoint">
                <span class="method get">GET</span> <strong>/health</strong>
                <p>Health check endpoint for monitoring</p>
            </div>
        </div>

        <div class="card">
            <h3>🔒 Security</h3>
            <ul>
                <li>API keys encrypted using XOR encryption</li>
                <li>Rate limiting: ${maxRequestsPerMinute} requests per minute per user</li>
                <li>Sessions expire in 24 hours</li>
                <li>All requests logged for monitoring</li>
            </ul>
        </div>

        <div class="card">
            <h3>⚡ Performance</h3>
            <ul>
                <li>Intelligent caching with ${cacheTTL} second TTL</li>
                <li>Global edge deployment via Cloudflare Workers</li>
                <li>Sub-100ms response times worldwide</li>
            </ul>
        </div>

        <div class="card">
            <h3>📖 Documentation</h3>
            <p>For complete documentation, examples, and troubleshooting:</p>
            <ul>
                <li><a href="https://github.com/a-ariff/canvas-student-mcp-server">GitHub Repository</a></li>
                <li><a href="https://github.com/a-ariff/canvas-student-mcp-server/blob/main/packages/cloudflare-canvas-api/README.md">Full API Documentation</a></li>
                <li><a href="https://github.com/a-ariff/canvas-student-mcp-server/blob/main/packages/cloudflare-canvas-api/TROUBLESHOOTING.md">Troubleshooting Guide</a></li>
            </ul>
        </div>

        <p style="text-align: center; color: var(--text-muted); margin-top: 40px;">
            <em>Built with ❤️ for students and educators worldwide</em>
        </p>
    </div>

    <script>
        // Theme switching functionality
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        const themeText = document.getElementById('themeText');
        const html = document.documentElement;

        function initTheme() {
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                setTheme('dark');
            } else if (savedTheme === 'light') {
                setTheme('light');
            }
        }

        function setTheme(theme) {
            html.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);

            if (theme === 'dark') {
                themeIcon.textContent = '☀️';
                themeText.textContent = 'Light';
            } else {
                themeIcon.textContent = '🌙';
                themeText.textContent = 'Dark';
            }
        }

        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });

        initTheme();
    </script>
</body>
</html>`;
