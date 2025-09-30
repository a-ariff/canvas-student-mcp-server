#!/bin/bash
# Canvas API Proxy - Get Assignments Script
# Retrieve assignments for a specific course

# Configuration
API_BASE_URL="${API_BASE_URL:-https://canvas-mcp.ariff.dev}"
CANVAS_USER_ID="${CANVAS_USER_ID}"
COURSE_ID="${COURSE_ID}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Canvas API Proxy - Get Assignments${NC}"
echo "==================================="

# Check if user ID is provided
if [ -z "$CANVAS_USER_ID" ]; then
    echo -e "${RED}Error: CANVAS_USER_ID environment variable not set${NC}"
    echo ""
    echo "Get your user ID by running: ./auth.sh"
    exit 1
fi

# Check if course ID is provided
if [ -z "$COURSE_ID" ]; then
    echo -e "${RED}Error: COURSE_ID environment variable not set${NC}"
    echo ""
    echo "Usage:"
    echo "  export CANVAS_USER_ID='your_user_id'"
    echo "  export COURSE_ID='123456'"
    echo "  ./get-assignments.sh"
    echo ""
    echo "Or pass inline:"
    echo "  CANVAS_USER_ID='user_123' COURSE_ID='123456' ./get-assignments.sh"
    echo ""
    echo "Get course IDs by running: ./get-courses.sh"
    exit 1
fi

echo "User ID: $CANVAS_USER_ID"
echo "Course ID: $COURSE_ID"
echo ""

# Make request
echo -e "${YELLOW}Fetching assignments...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE_URL/assignments/$CANVAS_USER_ID?course_id=$COURSE_ID")

# Parse response
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Assignments retrieved successfully${NC}"
    echo ""

    # Pretty print JSON
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"

    # Count assignments
    ASSIGNMENT_COUNT=$(echo "$BODY" | grep -o '"name":"[^"]*"' | wc -l | tr -d ' ')
    echo ""
    echo -e "${GREEN}Total assignments found: $ASSIGNMENT_COUNT${NC}"
else
    echo -e "${RED}❌ Failed to fetch assignments (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "Response:"
    echo "$BODY"
    exit 1
fi
