# 🎓 Canvas Student MCP

**The first Canvas MCP server designed for students - works with regular login credentials, no API tokens required!**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-00a393.svg)](https://fastapi.tiangolo.com)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)

> **🚀 Revolutionary Approach**: While other Canvas MCP solutions require complex API tokens and admin permissions, Canvas Student MCP democratizes access by working with your everyday student login credentials!

## ✨ Why This Changes Everything

### 😤 **The Problem with Existing Solutions**
- ❌ Require Canvas API tokens (students can't get these)
- ❌ Need administrator permissions 
- ❌ Complex institutional setup
- ❌ Technical barriers for regular users

### 🌟 **Our Student-First Solution**
- ✅ **Use your regular login** - Same credentials you use every day
- ✅ **Zero admin access needed** - Works for ANY student
- ✅ **Institution agnostic** - Works with any Canvas instance  
- ✅ **3-minute setup** - No IT department required
- ✅ **AI-ready** - Perfect for Claude, ChatGPT, and other AI tools

## ⚡ Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/yourusername/canvas-student-mcp.git
cd canvas-student-mcp
pip install -r requirements.txt

# 2. Configure your credentials  
cp .env.example .env
# Edit .env with your Canvas login

# 3. Start the server
python app.py
```

**That's it!** Your Canvas MCP server is running on `http://localhost:8000` 🎉

## 🎯 Perfect for Students Who Want To

- 📚 **Auto-summarize** course content with AI
- 📝 **Track assignments** across all courses  
- 🔍 **Search** through all your course materials
- 🤖 **Ask AI questions** about your specific courses
- 📊 **Analyze** your academic progress
- 🕒 **Never miss deadlines** with smart notifications

## 🛠️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/authenticate` | Login with student credentials |
| `GET` | `/courses` | List all your courses |
| `GET` | `/courses/{id}/modules` | Get course modules |
| `GET` | `/courses/{id}/assignments` | Get assignments |
| `GET` | `/courses/{id}/modules/{module_id}/items` | Get module content |
| `POST` | `/courses/{id}/corpus/build` | Build searchable course content |

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

- 🛡️ **Local-first**: Your credentials stay on YOUR machine
- 🔒 **Encrypted sessions**: All communication secured
- 🚫 **No data collection**: We don't store or track anything
- 👤 **Privacy-focused**: Built for students, by students

## 📚 Documentation

- 📖 [Complete API Documentation](docs/API.md)
- 🎓 [Student Setup Guide](docs/STUDENT_GUIDE.md) 
- 🤖 [AI Integration Guide](docs/INTEGRATION.md)
- 🚀 [Deployment Options](docs/DEPLOYMENT.md)

## 🌟 Roadmap

- [ ] **Smart Study Assistant** - AI-powered study recommendations
- [ ] **Deadline Predictor** - Workload balancing suggestions  
- [ ] **Grade Analytics** - Performance trend analysis
- [ ] **Group Project Coordinator** - Team collaboration tools
- [ ] **Multi-LMS Support** - Blackboard, Moodle integration

## 🤝 Contributing

Built by students, for students! Contributions welcome:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎓 For Students, By Students

> "Education technology should empower students, not create barriers. Canvas Student MCP breaks down those barriers and puts the power back in students' hands." 

---

**⭐ If this helps your studies, please star the repo to help other students find it!**

## 🔥 Get Started Now

```bash
git clone https://github.com/yourusername/canvas-student-mcp.git
cd canvas-student-mcp && pip install -r requirements.txt && python app.py
```

Ready to revolutionize how you interact with Canvas? Let's go! 🚀