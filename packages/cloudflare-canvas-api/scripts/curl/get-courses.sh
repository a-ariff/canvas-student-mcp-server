#!/bin/bash
# Canvas API Proxy - Get Courses Script
# Retrieve all courses for authenticated user

# Configuration
API_BASE_URL="${API_BASE_URL:-https://canvas-mcp.ariff.dev}"
CANVAS_USER_ID="${CANVAS_USER_ID}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Canvas API Proxy - Get Courses${NC}"
echo "==============================="

# Check if user ID is provided
if [ -z "$CANVAS_USER_ID" ]; then
    echo -e "${RED}Error: CANVAS_USER_ID environment variable not set${NC}"
    echo ""
    echo "Usage:"
    echo "  export CANVAS_USER_ID='your_user_id'"
    echo "  ./get-courses.sh"
    echo ""
    echo "Or pass inline:"
    echo "  CANVAS_USER_ID='user_123' ./get-courses.sh"
    echo ""
    echo "Get your user ID by running: ./auth.sh"
    exit 1
fi

echo "User ID: $CANVAS_USER_ID"
echo ""

# Make request
echo -e "${YELLOW}Fetching courses...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE_URL/courses/$CANVAS_USER_ID")

# Parse response
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Courses retrieved successfully${NC}"
    echo ""

    # Pretty print JSON
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"

    # Count courses
    COURSE_COUNT=$(echo "$BODY" | grep -o '"id":[0-9]*' | wc -l | tr -d ' ')
    echo ""
    echo -e "${GREEN}Total courses found: $COURSE_COUNT${NC}"
else
    echo -e "${RED}❌ Failed to fetch courses (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "Response:"
    echo "$BODY"
    exit 1
fi
