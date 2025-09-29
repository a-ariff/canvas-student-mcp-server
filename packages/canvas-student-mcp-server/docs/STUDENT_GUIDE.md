# 🎓 Canvas Student MCP - Student Setup Guide

**Never dealt with APIs before? No problem!** This guide will get you up and running in 10 minutes.

## 🎯 What You'll Achieve

By the end of this guide, you'll have:
- ✅ A running Canvas MCP server
- ✅ Access to all your Canvas data via API
- ✅ Ready-to-use AI integration
- ✅ Your own personal Canvas assistant!

## 🛠️ Prerequisites

You need:
- 🐍 **Python 3.9 or higher** ([Download here](https://www.python.org/downloads/))
- 💻 **A computer** (Windows, Mac, or Linux)
- 🎓 **Canvas account** with your regular login credentials
- ⏰ **10 minutes** of your time

### Check if Python is installed:
```bash
python --version
# or
python3 --version
```

If you see something like `Python 3.9.x` or higher, you're good to go! 🎉

## 📥 Step 1: Download the Code

### Option A: Download ZIP (Easiest)
1. Go to the [GitHub repository](https://github.com/yourusername/canvas-student-mcp)
2. Click the green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file to your desired location

### Option B: Clone with Git
```bash
git clone https://github.com/yourusername/canvas-student-mcp.git
cd canvas-student-mcp
```

## ⚙️ Step 2: Install Dependencies

Open your terminal/command prompt and navigate to the project folder:

```bash
cd canvas-student-mcp
pip install -r requirements.txt
```

**Windows users:** You might need to use `pip3` instead of `pip`.

**Mac/Linux users:** You might need to use `python3 -m pip` instead of `pip`.

## 🔑 Step 3: Configure Your Credentials

1. **Copy the example configuration:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file** (use any text editor like Notepad, TextEdit, or VS Code):
   ```env
   # Replace these with your actual details
   CANVAS_BASE_URL=https://your-school.instructure.com
   CANVAS_USERNAME=your.email@school.edu
   CANVAS_PASSWORD=your_actual_password
   ```

### 🏫 Finding Your Canvas URL

Your Canvas URL is usually:
- `https://[schoolname].instructure.com` 
- `https://canvas.[schoolname].edu`
- `https://lms.[schoolname].edu`

**Examples:**
- Whitecliffe: `https://learn.mywhitecliffe.com`
- University of Auckland: `https://canvas.auckland.ac.nz`
- MIT: `https://canvas.mit.edu`

**Don't know your URL?** Check your browser when you log into Canvas normally!

## 🚀 Step 4: Start Your Server

Run this command:
```bash
python app.py
```

You should see:
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

🎉 **Congratulations!** Your server is running!

## 🧪 Step 5: Test Your Setup

Open a new terminal/command prompt and test your server:

### Test 1: Server Status
```bash
curl http://localhost:8000/
```
Expected result: `{"message":"Authentication Server is running","status":"OK"}`

### Test 2: Authentication
```bash
curl -X POST http://localhost:8000/authenticate \
     -H "Content-Type: application/json" \
     -d '{"username":"your.email@school.edu","password":"your_password"}'
```
Expected result: `{"success":true,"message":"Authentication successful","token":"..."}`

### Test 3: Get Your Courses
```bash
curl http://localhost:8000/courses
```
Expected result: List of all your courses!

## 🤖 Step 6: Connect to AI Tools

Now you can use your Canvas data with AI! See our [Integration Guide](INTEGRATION.md) for:
- 🤖 Claude Desktop setup
- 💬 ChatGPT integration  
- 🔮 Custom AI workflows

## 🔧 Troubleshooting

### "Command not found: python"
**Solution:** Try `python3` instead of `python`, or install Python from [python.org](https://www.python.org/downloads/)

### "Permission denied" errors
**Solution:** Try adding `sudo` before the command (Mac/Linux) or run as Administrator (Windows)

### "Cannot connect" errors
**Solution:** 
1. Check your Canvas URL is correct
2. Verify your username/password work on Canvas website
3. Make sure you're connected to the internet

### Server won't start
**Solution:**
1. Check port 8000 isn't being used: `lsof -i :8000` (Mac/Linux) or `netstat -ano | findstr :8000` (Windows)
2. Try a different port by editing `app.py` and changing `port=8000` to `port=8001`

### "Invalid credentials" errors
**Solution:**
1. Double-check your `.env` file has the right username/password
2. Try logging into Canvas manually to verify credentials work
3. Some schools use different authentication - contact us if you need help!

## 🆘 Need Help?

- 📖 Check our [FAQ](https://github.com/yourusername/canvas-student-mcp/wiki/FAQ)
- 🐛 Report issues on [GitHub](https://github.com/yourusername/canvas-student-mcp/issues)
- 💬 Join our [Discord community](https://discord.gg/canvas-student-mcp)
- 📧 Email us: support@canvas-student-mcp.com

## 🎉 You're All Set!

Your Canvas MCP server is now running and ready to revolutionize how you interact with your coursework!

**What's next?**
- Explore the [API Documentation](API.md)
- Set up [AI Integration](INTEGRATION.md)
- Check out [Example Use Cases](../examples/)
- Share with classmates who could benefit!

---

**💡 Pro Tip:** Keep your server running in the background and bookmark `http://localhost:8000` for quick access to your Canvas data anytime!
