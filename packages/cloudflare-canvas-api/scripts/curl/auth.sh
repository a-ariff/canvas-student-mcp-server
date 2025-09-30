#!/bin/bash
# Canvas API Proxy - Authentication Script
# Get your user ID by authenticating with Canvas credentials

# Configuration
API_BASE_URL="${API_BASE_URL:-https://canvas-mcp.ariff.dev}"
CANVAS_URL="${CANVAS_URL:-https://learn.mywhitecliffe.com}"
CANVAS_API_KEY="${CANVAS_API_KEY}"
INSTITUTION_NAME="${INSTITUTION_NAME:-My Institution}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Canvas API Proxy - Authentication${NC}"
echo "=================================="

# Check if API key is provided
if [ -z "$CANVAS_API_KEY" ]; then
    echo -e "${RED}Error: CANVAS_API_KEY environment variable not set${NC}"
    echo ""
    echo "Usage:"
    echo "  export CANVAS_API_KEY='your_canvas_api_token'"
    echo "  export CANVAS_URL='https://your-school.instructure.com'"
    echo "  export INSTITUTION_NAME='Your School'"
    echo "  ./auth.sh"
    echo ""
    echo "Or pass inline:"
    echo "  CANVAS_API_KEY='token' CANVAS_URL='url' ./auth.sh"
    exit 1
fi

echo "API Base URL: $API_BASE_URL"
echo "Canvas URL: $CANVAS_URL"
echo "Institution: $INSTITUTION_NAME"
echo ""

# Make authentication request
echo -e "${YELLOW}Authenticating...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/auth" \
  -H "Content-Type: application/json" \
  -d "{
    \"canvasUrl\": \"$CANVAS_URL\",
    \"apiKey\": \"$CANVAS_API_KEY\",
    \"institutionName\": \"$INSTITUTION_NAME\"
  }")

# Parse response
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Authentication successful!${NC}"
    echo ""

    # Extract user ID
    USER_ID=$(echo "$BODY" | grep -o '"userId":"[^"]*"' | cut -d'"' -f4)

    echo "Response:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""

    if [ -n "$USER_ID" ]; then
        echo -e "${GREEN}Your User ID: $USER_ID${NC}"
        echo ""
        echo "Save this User ID for future requests:"
        echo "  export CANVAS_USER_ID='$USER_ID'"
        echo ""
        echo "Test your connection:"
        echo "  curl $API_BASE_URL/courses/$USER_ID"
    fi
else
    echo -e "${RED}❌ Authentication failed (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    exit 1
fi
