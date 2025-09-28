# 🤖 AI Integration Guide

**Transform your Canvas experience with AI!** This guide shows you how to connect Canvas Student MCP with popular AI tools.

## 🎯 What You Can Do

Once connected, you can ask your AI:
- 📚 "Summarize this week's readings from my Biology course"
- 📝 "What assignments are due this week?"
- 🔍 "Search for information about mitochondria in my course materials"
- 📊 "Show me my grades trend across all courses"
- ⏰ "Create a study schedule based on my upcoming deadlines"

## 🤖 Claude Desktop Integration

### Prerequisites
- Canvas Student MCP server running (`python app.py`)
- [Claude Desktop app](https://claude.ai/download) installed

### Setup Steps

1. **Locate Claude's config file:**
   - **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add Canvas MCP server:**
   ```json
   {
     "mcpServers": {
       "canvas-student": {
         "command": "python",
         "args": ["-m", "http.server", "--bind", "localhost", "8000"],
         "env": {
           "CANVAS_MCP_URL": "http://localhost:8000"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**

4. **Test the connection:**
   Ask Claude: "Can you list my Canvas courses?"

### Example Claude Conversations

```
You: "What assignments do I have due this week?"

Claude: "Let me check your Canvas assignments...
[Calls GET /courses/{id}/assignments]

You have 3 assignments due this week:
1. Technology Management Essay - Due Oct 5th
2. Programming Project Phase 2 - Due Oct 7th  
3. Database Design Assignment - Due Oct 8th

Would you like me to help you prioritize these or create a study schedule?"
```

## 💬 ChatGPT Integration

### Method 1: Custom GPT (Recommended)

1. **Go to [ChatGPT](https://chat.openai.com)**
2. **Click "Create a GPT"**
3. **Configure your GPT:**
   - **Name:** "My Canvas Assistant"
   - **Description:** "Personal Canvas course assistant"
   - **Instructions:** 
     ```
     You are a helpful Canvas course assistant. You can access the user's Canvas data through their local MCP server at http://localhost:8000. 
     
     Always be supportive and encouraging about their studies. Help them stay organized and motivated.
     
     Available endpoints:
     - GET /courses - List all courses
     - GET /courses/{id}/assignments - Get assignments
     - GET /courses/{id}/modules - Get course modules
     - POST /courses/{id}/corpus/build - Build course search index
     ```

4. **Add Actions:**
   ```yaml
   openapi: 3.0.0
   info:
     title: Canvas Student MCP
     version: 1.0.0
     description: Access student's Canvas data
   servers:
     - url: http://localhost:8000
   paths:
     /courses:
       get:
         summary: List all courses
         responses:
           '200':
             description: List of courses
     /courses/{course_id}/assignments:
       get:
         summary: Get course assignments  
         parameters:
           - name: course_id
             in: path
             required: true
             schema:
               type: integer
         responses:
           '200':
             description: List of assignments
   ```

### Method 2: API Calls in Chat

You can also manually make requests in ChatGPT:

```
You: "I'm going to paste some data from my Canvas API. Here's my current courses:
[Paste result from curl http://localhost:8000/courses]

Can you help me analyze my course load?"
```

## 🔮 Other AI Tools

### Perplexity AI
1. Start a conversation
2. Copy/paste data from your Canvas MCP endpoints
3. Ask Perplexity to analyze or help with your coursework

### GitHub Copilot Chat
1. Install the Canvas MCP VS Code extension (coming soon!)
2. Use `/canvas` commands in Copilot Chat
3. Get contextual help with your programming assignments

### Local AI Models (Ollama)

```python
# Example script to use Canvas data with Ollama
import requests
import ollama

# Get Canvas data
response = requests.get('http://localhost:8000/courses')
courses = response.json()

# Ask local AI model
result = ollama.chat(model='llama2', messages=[
    {
        'role': 'user',
        'content': f'Analyze my course load and suggest a study schedule: {courses}'
    }
])

print(result['message']['content'])
```

## 🛠️ Custom Integration Examples

### Python Script: Daily Assignment Check

```python
import requests
from datetime import datetime, timedelta

def check_upcoming_assignments():
    # Get all courses
    courses = requests.get('http://localhost:8000/courses').json()
    
    upcoming = []
    for course in courses['courses']:
        # Get assignments for each course
        assignments = requests.get(f'http://localhost:8000/courses/{course["id"]}/assignments').json()
        
        for assignment in assignments['assignments']:
            due_date = datetime.fromisoformat(assignment['due_at'].replace('Z', '+00:00'))
            if due_date <= datetime.now() + timedelta(days=7):
                upcoming.append({
                    'course': course['name'],
                    'assignment': assignment['name'],
                    'due': due_date,
                    'points': assignment['points']
                })
    
    return upcoming

if __name__ == '__main__':
    assignments = check_upcoming_assignments()
    print(f"You have {len(assignments)} assignments due in the next week:")
    for a in assignments:
        print(f"- {a['assignment']} ({a['course']}) - Due: {a['due'].strftime('%Y-%m-%d')}")
```

### JavaScript: Web Dashboard

```javascript
// Simple web app to display Canvas data
async function loadCanvasData() {
    try {
        const courses = await fetch('http://localhost:8000/courses').then(r => r.json());
        
        document.getElementById('course-count').textContent = courses.total;
        
        const courseList = document.getElementById('courses');
        courses.courses.forEach(course => {
            const div = document.createElement('div');
            div.innerHTML = `
                <h3>${course.name}</h3>
                <p>Instructor: ${course.instructor}</p>
                <p>Credits: ${course.credits}</p>
            `;
            courseList.appendChild(div);
        });
    } catch (error) {
        console.error('Failed to load Canvas data:', error);
    }
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadCanvasData);
```

## 🔒 Security Considerations

### Best Practices
- ✅ **Keep your server local** - Never expose to the internet
- ✅ **Use environment variables** - Never hardcode credentials
- ✅ **Limit API access** - Only share data you're comfortable with
- ✅ **Regular updates** - Keep the MCP server updated

### What AI Tools Can See
When you integrate with AI tools, they can access:
- Your course list and details
- Assignment names and due dates
- Module titles and structure
- Public course content

**They CANNOT see:**
- Your Canvas password (stored locally)
- Other students' data
- Private messages or grades (unless you specifically share)

## 📱 Mobile Integration

### iOS Shortcuts
1. Create a new Shortcut
2. Add "Get Contents of URL" action
3. Set URL to `http://localhost:8000/courses` (requires VPN/tunnel)
4. Add "Speak Text" to announce your assignments

### Android Tasker
1. Create HTTP Request task
2. Point to your Canvas MCP endpoints
3. Set up automation triggers (time-based, location-based, etc.)

## 🚀 Advanced Use Cases

### Study Group Coordinator
- Share assignment deadlines with study group
- Coordinate project timelines
- Track group progress

### Academic Analytics
- Analyze your course completion patterns
- Predict workload peaks
- Optimize study schedules

### Content Aggregation
- Build personal knowledge base from course materials
- Create cross-course connections
- Generate personalized study guides

## 🆘 Troubleshooting Integration

### Common Issues

**"Connection refused" errors:**
- Ensure Canvas MCP server is running
- Check the URL is `http://localhost:8000`
- Verify no firewall blocking localhost connections

**AI tool can't access data:**
- Check if the AI tool supports local API calls
- Some tools require internet-accessible endpoints
- Consider using ngrok for temporary public access

**Authentication errors:**
- Verify your `.env` file is configured correctly
- Test authentication manually with curl
- Check Canvas credentials haven't expired

### Getting Help

- 📖 [API Documentation](API.md)
- 🐛 [GitHub Issues](https://github.com/yourusername/canvas-student-mcp/issues)
- 💬 [Discord Community](https://discord.gg/canvas-student-mcp)
- 📧 Email: integrations@canvas-student-mcp.com

---

**🎓 Pro Tips:**
- Start with simple queries and gradually build complexity
- Save useful AI prompts for repeated use
- Share successful integration patterns with other students
- Always verify AI-generated information against original Canvas data
