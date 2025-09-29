# 🎓 Canvas Student MCP

**A Model Context Protocol (MCP) server for Canvas LMS - designed for educational access and research purposes.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-00a393.svg)](https://fastapi.tiangolo.com)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)

> ⚠️ **Important Notice**: This project is designed for educational purposes and personal academic management. Users are responsible for complying with their institution's terms of service and applicable policies. Always respect rate limits and use responsibly.

## ✨ Features

### 🎓 Student-Focused Design
- 📚 Access your course information programmatically
- 📝 Retrieve assignments and due dates
- 🔍 Search through course materials
- 🤖 Compatible with AI tools for academic assistance
- 🛡️ Local-first approach for privacy

### 🌐 Universal Compatibility
- Works with standard Canvas LMS installations
- Institution-agnostic design
- No special API tokens required
- Simple credential-based authentication

## ⚡ Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/a-ariff/canvas-student-mcp-server.git
cd canvas-student-mcp-server
pip install -r requirements.txt

# 2. Configure your credentials
cp .env.example .env
# Edit .env with your Canvas URL and credentials

# 3. Start the server
python app.py
```

**Your Canvas MCP server will be running on `http://localhost:8000` 🎉**

## 🔧 Configuration

Edit your `.env` file with your Canvas information:

```env
# Your Canvas instance URL (without trailing slash)
CANVAS_URL=https://your-school.instructure.com

# Your Canvas login credentials
CANVAS_USERNAME=your_username
CANVAS_PASSWORD=your_password

# Optional: Rate limiting (requests per minute)
RATE_LIMIT=60
```

## 🛠️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/authenticate` | Authenticate with Canvas |
| GET | `/courses` | List enrolled courses |
| GET | `/courses/{id}/modules` | Get course modules |
| GET | `/courses/{id}/assignments` | Get course assignments |
| GET | `/courses/{id}/modules/{module_id}/items` | Get module content |
| POST | `/courses/{id}/corpus/build` | Build searchable course content |

## 🤖 AI Integration Examples

### With Claude Desktop

```json
{
  "mcpServers": {
    "student-canvas": {
      "command": "curl",
      "args": ["-X", "GET", "http://localhost:8000/courses"]
    }
  }
}
```

### With ChatGPT (via Actions)

```yaml
openapi: 3.0.0
info:
  title: Student Canvas MCP
  version: 1.0.0
servers:
  - url: http://localhost:8000
```

## 🔐 Security & Privacy

- 🛡️ **Local-first**: Credentials stay on your machine
- 🔒 **No data collection**: No tracking or data storage
- 🚫 **Privacy-focused**: Built with student privacy in mind
- ⚖️ **Responsible use**: Always comply with institutional policies

## ⚠️ Important Disclaimers

### Educational Use Only
This tool is designed for educational purposes and personal academic management. Users must:
- Comply with their institution's Terms of Service
- Respect Canvas API rate limits
- Use the tool responsibly and ethically
- Not use it for unauthorized access or data scraping

### Institution Compliance
- Check your school's policies before use
- Some institutions may have restrictions on automated access
- When in doubt, consult with your IT department
- Respect intellectual property and privacy rights

### Technical Considerations
- This tool simulates browser interactions with Canvas
- Performance may vary across different Canvas installations
- Some features may not work with all Canvas configurations
- Always test in a safe environment first

## 📚 Documentation

- 📖 [Complete API Documentation](docs/API.md)
- 🎓 [Student Setup Guide](docs/STUDENT_GUIDE.md)
- 🤖 [AI Integration Guide](docs/INTEGRATION.md)
- 🚀 [Deployment Options](docs/DEPLOYMENT.md)

## 🌟 Roadmap

- [ ] Enhanced security features
- [ ] Support for more Canvas features
- [ ] Integration with additional AI platforms
- [ ] Performance optimizations
- [ ] Multi-LMS support exploration

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎓 Academic Use Statement

"This tool is designed to help students better organize and interact with their academic content. It should be used in compliance with institutional policies and with respect for the educational environment."

⭐ If this helps your academic workflow, please star the repo!

---

**Made with 💙 for students everywhere**
