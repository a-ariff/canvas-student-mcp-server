#!/bin/bash

# Canvas Student MCP Server - Smithery Submission Script
# Author: Ariff (@a-ariff)
# Date: October 30, 2025

echo "🚀 Canvas Student MCP Server - Smithery Submission Helper"
echo "========================================================="
echo ""
echo "📋 Pre-Submission Checklist:"
echo ""

# Check if smithery.yaml exists in root (required location)
if [ -f "smithery.yaml" ]; then
    echo "✅ smithery.yaml found in repository root"
else
    echo "⚠️  smithery.yaml not in root, copying from packages..."
    if [ -f "packages/remote-mcp-server-authless/smithery.yaml" ]; then
        cp packages/remote-mcp-server-authless/smithery.yaml ./smithery.yaml
        echo "✅ smithery.yaml copied to repository root"
    else
        echo "❌ smithery.yaml not found anywhere!"
        exit 1
    fi
fi

# Check git status
CURRENT_BRANCH=$(git branch --show-current)
echo "✅ Git repository ready"
echo "   Branch: $CURRENT_BRANCH"
echo "   URL: https://github.com/a-ariff/canvas-student-mcp-server"
echo ""

# Check live endpoints
echo "🔍 Checking live endpoints..."
if curl -s https://canvas-mcp-sse.ariff.dev/health | grep -q "healthy"; then
    echo "✅ MCP Server is healthy"
else
    echo "⚠️ MCP Server health check failed"
fi

if curl -s https://canvas-mcp.ariff.dev/health | grep -q "healthy"; then
    echo "✅ API Proxy is healthy"
else
    echo "⚠️ API Proxy health check failed"
fi
echo ""

echo "📝 Submission Information:"
echo "=========================="
echo "Server Name:    canvas-student-mcp"
echo "Version:        3.0.0"
echo "Author:         a-ariff"
echo "Repository:     https://github.com/a-ariff/canvas-student-mcp-server"
echo "Branch:         $CURRENT_BRANCH"
echo ""

echo "🌐 Opening Smithery submission page..."
echo ""
echo "📌 MANUAL STEPS REQUIRED:"
echo "1. Click 'Publish Server' in the navigation"
echo "2. Enter GitHub URL: https://github.com/a-ariff/canvas-student-mcp-server"
echo "3. Select branch: $CURRENT_BRANCH"
echo "4. Smithery will automatically detect smithery.yaml in the root"
echo "5. Click 'Submit' or 'Publish'"
echo ""

# Open Smithery in default browser
if command -v open &> /dev/null; then
    # macOS
    open "https://smithery.ai"
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "https://smithery.ai"
elif command -v start &> /dev/null; then
    # Windows
    start "https://smithery.ai"
else
    echo "⚠️ Could not open browser automatically"
    echo "Please visit: https://smithery.ai"
fi

echo ""
echo "⏳ After submission, verify with:"
echo "   smithery search canvas-student-mcp"
echo "   npx @smithery/cli install @a-ariff/canvas-student-mcp"
echo ""
echo "Good luck! 🎉"