#!/bin/bash

# Smithery Submission Helper Script
# This script automates the Smithery submission process for the Canvas Student MCP Server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_ROOT="$(git rev-parse --show-toplevel)"
SMITHERY_YAML="$REPO_ROOT/smithery.yaml"
REMOTE_SERVER_URL="https://canvas-mcp-sse.ariff.dev"
OAUTH_DISCOVERY_URL="https://canvas-mcp-sse.ariff.dev/.well-known/oauth-authorization-server"

echo -e "${BLUE}🚀 Smithery Submission Helper${NC}"
echo "=================================="

# Step 1: Verify smithery.yaml exists
echo -e "\n${YELLOW}Step 1: Checking smithery.yaml...${NC}"
if [ ! -f "$SMITHERY_YAML" ]; then
    echo -e "${RED}❌ Error: smithery.yaml not found in repository root${NC}"
    echo "Creating smithery.yaml from template..."

    # Check if template exists in packages
    if [ -f "$REPO_ROOT/packages/remote-mcp-server-authless/smithery.yaml" ]; then
        cp "$REPO_ROOT/packages/remote-mcp-server-authless/smithery.yaml" "$SMITHERY_YAML"
        echo -e "${GREEN}✅ smithery.yaml copied to repository root${NC}"
    else
        echo -e "${RED}❌ No template found. Please create smithery.yaml manually.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ smithery.yaml found${NC}"
fi

# Step 2: Validate YAML
echo -e "\n${YELLOW}Step 2: Validating YAML structure...${NC}"
if command -v python3 &> /dev/null; then
    python3 -c "import yaml; yaml.safe_load(open('$SMITHERY_YAML'))" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ YAML structure is valid${NC}"
    else
        echo -e "${RED}❌ Invalid YAML structure${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Python not available, skipping YAML validation${NC}"
fi

# Step 3: Check server connectivity
echo -e "\n${YELLOW}Step 3: Testing server connectivity...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "$REMOTE_SERVER_URL" | grep -q "200\|301\|302\|404"; then
    echo -e "${GREEN}✅ Server is reachable at: $REMOTE_SERVER_URL${NC}"
else
    echo -e "${YELLOW}⚠️  Server may be offline or restricted${NC}"
fi

# Step 4: Verify OAuth discovery endpoint
echo -e "\n${YELLOW}Step 4: Checking OAuth discovery endpoint...${NC}"
if curl -s "$OAUTH_DISCOVERY_URL" | grep -q "authorization_endpoint"; then
    echo -e "${GREEN}✅ OAuth discovery endpoint is configured${NC}"
else
    echo -e "${YELLOW}⚠️  OAuth discovery endpoint may not be properly configured${NC}"
fi

# Step 5: Git status check
echo -e "\n${YELLOW}Step 5: Checking Git status...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes:${NC}"
    git status --short
    echo -e "\n${YELLOW}Would you like to commit these changes? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        git add "$SMITHERY_YAML"
        git commit -m "chore: update smithery configuration for submission"
        echo -e "${GREEN}✅ Changes committed${NC}"
    fi
else
    echo -e "${GREEN}✅ Working directory clean${NC}"
fi

# Step 6: Display server information
echo -e "\n${BLUE}📊 Server Information:${NC}"
echo "=================================="
echo "Name: canvas-student-mcp"
echo "Version: 3.0.0"
echo "Repository: https://github.com/$(git config --get remote.origin.url | sed 's/.*://;s/\.git$//')"
echo "Server URL: $REMOTE_SERVER_URL"
echo "OAuth Discovery: $OAUTH_DISCOVERY_URL"
echo "Transport: SSE (Server-Sent Events)"
echo "Authentication: OAuth 2.1 with PKCE"

# Step 7: Smithery CLI check
echo -e "\n${YELLOW}Step 6: Checking Smithery CLI...${NC}"
if command -v smithery &> /dev/null; then
    echo -e "${GREEN}✅ Smithery CLI is installed${NC}"
    smithery --version

    echo -e "\n${YELLOW}Available Smithery commands:${NC}"
    echo "  smithery search canvas      - Search for existing Canvas servers"
    echo "  smithery inspect <server>   - Inspect a server from registry"
    echo "  smithery login             - Login with API key (if you have one)"
else
    echo -e "${YELLOW}⚠️  Smithery CLI not installed${NC}"
    echo "Install with: npm install -g @smithery/cli"
fi

# Step 8: Manual submission instructions
echo -e "\n${BLUE}📝 Manual Submission Steps:${NC}"
echo "=================================="
echo "1. Visit https://smithery.ai"
echo "2. Sign in or create an account"
echo "3. Click 'Submit Server' or 'Add Server'"
echo "4. Provide the repository URL:"
echo "   https://github.com/$(git config --get remote.origin.url | sed 's/.*://;s/\.git$//')"
echo "5. Smithery will automatically detect smithery.yaml"
echo "6. Follow any additional verification steps"

# Step 9: Create submission record
echo -e "\n${YELLOW}Step 9: Creating submission record...${NC}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
SUBMISSION_FILE="$REPO_ROOT/.smithery-submission-$(date +%Y%m%d-%H%M%S).json"

cat > "$SUBMISSION_FILE" <<EOF
{
  "submission_date": "$TIMESTAMP",
  "repository": "$(git config --get remote.origin.url)",
  "branch": "$(git branch --show-current)",
  "commit": "$(git rev-parse HEAD)",
  "server_name": "canvas-student-mcp",
  "server_version": "3.0.0",
  "server_url": "$REMOTE_SERVER_URL",
  "oauth_discovery": "$OAUTH_DISCOVERY_URL",
  "smithery_yaml": "smithery.yaml",
  "status": "pending_submission"
}
EOF

echo -e "${GREEN}✅ Submission record created: $SUBMISSION_FILE${NC}"

# Step 10: Open browser (optional)
echo -e "\n${YELLOW}Would you like to open Smithery.ai in your browser? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open "https://smithery.ai"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://smithery.ai"
    else
        echo "Please visit: https://smithery.ai"
    fi
fi

echo -e "\n${GREEN}✅ Smithery submission preparation complete!${NC}"
echo -e "${BLUE}Ready for manual submission to Smithery.ai${NC}"